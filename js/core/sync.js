(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const CROSS_TAB_EVENTS = new Set(["logout", "owner-changed", "session-invalidated", "state-changed"]);
  const VOLATILE_ROOT_FIELDS = new Set(["_sync", "lastSyncedAt", "syncStatus"]);
  const CAS_OUTCOMES = new Set(["success", "conflict", "invalid-payload", "unauthenticated", "blocked"]);
  const SERVER_UPDATE_REQUIRED_MESSAGE = "A sincronização precisa ser atualizada no servidor. Seus dados continuam salvos neste dispositivo.";

  function finiteInteger(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
  }

  function createSyncError(category, reason = "") {
    const normalizedCategory = new Set([
      "network-error",
      "server-error",
      "unauthenticated",
      "invalid-payload",
      "blocked",
    ]).has(category) ? category : "server-error";
    const error = new Error("Sync operation failed.");
    error.syncCategory = normalizedCategory;
    error.syncReason = String(reason || "");
    error.retryable = normalizedCategory === "network-error"
      || (normalizedCategory === "server-error" && reason === "transient");
    return error;
  }

  function classifySupabaseError(error) {
    const code = String(error?.code || "").toUpperCase();
    const status = Number(error?.status || error?.statusCode || 0);
    const detail = [error?.message, error?.details, error?.hint]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");
    const migrationMissing = new Set(["PGRST202", "PGRST204", "42703", "42883"]).has(code)
      || detail.includes("could not find the function")
      || detail.includes("schema cache")
      || (detail.includes("permission denied") && detail.includes("nexio_save_user_data_cas"))
      || (detail.includes("column") && detail.includes("revision") && detail.includes("does not exist"));
    if (migrationMissing) return createSyncError("blocked", "migration-required");
    if (status === 401 || status === 403 || code === "42501" || code === "PGRST301") {
      return createSyncError("unauthenticated", "session-required");
    }
    if (
      error?.offline === true
      || error?.name === "TypeError"
      || detail.includes("failed to fetch")
      || detail.includes("network")
    ) return createSyncError("network-error", "transient");
    if (status === 429 || status >= 500 || /^(08|53|57P0)/.test(code)) {
      return createSyncError("server-error", "transient");
    }
    return createSyncError("server-error", "permanent");
  }

  function safeErrorMessage(error) {
    if (error?.syncReason === "migration-required") return SERVER_UPDATE_REQUIRED_MESSAGE;
    if (error?.syncCategory === "unauthenticated") return "A sessão expirou. Entre novamente para sincronizar.";
    if (error?.syncCategory === "invalid-payload") return "A sincronização foi bloqueada porque os dados locais não são válidos.";
    if (error?.syncCategory === "blocked") return "A sincronização foi bloqueada para proteger seus dados.";
    if (error?.offline === true || error?.syncCategory === "network-error") return "Sem conexão. Alterações pendentes.";
    return "Falha temporária de sincronização.";
  }

  function normalizedRevision(value) {
    return core.storage?.normalizeSyncRevision?.(value) ?? null;
  }

  function isValidServerTimestamp(value) {
    return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
  }

  function normalizeCasResponse(value) {
    const rows = Array.isArray(value) ? value : [value];
    if (rows.length !== 1 || !rows[0] || typeof rows[0] !== "object" || Array.isArray(rows[0])) {
      throw createSyncError("blocked", "malformed-response");
    }
    const row = rows[0];
    const outcome = typeof row.outcome === "string" ? row.outcome : "";
    if (!CAS_OUTCOMES.has(outcome)) throw createSyncError("blocked", "malformed-response");
    const revision = row.revision === null || row.revision === undefined
      ? null
      : normalizedRevision(row.revision);
    const timestampValue = row.updated_at ?? row.updatedAt;
    const updatedAt = timestampValue === null || timestampValue === undefined ? "" : timestampValue;
    if ((row.revision !== null && row.revision !== undefined && revision === null)
        || (updatedAt !== "" && !isValidServerTimestamp(updatedAt))) {
      throw createSyncError("blocked", "malformed-response");
    }
    if (outcome === "success" && (revision === null || revision === "0" || !isValidServerTimestamp(updatedAt))) {
      throw createSyncError("blocked", "malformed-response");
    }
    if (outcome === "conflict" && revision === null) {
      throw createSyncError("blocked", "malformed-response");
    }
    if (outcome === "conflict" && updatedAt !== "") {
      throw createSyncError("blocked", "malformed-response");
    }
    if ((outcome === "invalid-payload" || outcome === "unauthenticated")
        && (revision !== null || updatedAt !== "")) {
      throw createSyncError("blocked", "malformed-response");
    }
    if (outcome === "blocked" && updatedAt !== "") {
      throw createSyncError("blocked", "malformed-response");
    }
    return Object.freeze({ outcome, revision, updatedAt });
  }

  function isNextRevision(expectedRevision, nextRevision) {
    try {
      return BigInt(nextRevision) === BigInt(expectedRevision) + 1n;
    } catch (error) {
      return false;
    }
  }

  function createCoordinator(options = {}) {
    if (typeof options.save !== "function") throw new TypeError("A sync save adapter is required.");
    if (typeof options.getPayload !== "function") throw new TypeError("A sync payload provider is required.");

    const setTimer = options.setTimer || ((callback, delay) => global.setTimeout(callback, delay));
    const clearTimer = options.clearTimer || ((timerId) => global.clearTimeout(timerId));
    const now = options.now || (() => new Date().toISOString());
    const debounceMs = finiteInteger(options.debounceMs, 700);
    const retryDelays = Array.isArray(options.retryDelays) && options.retryDelays.length
      ? options.retryDelays.map((delay) => finiteInteger(delay, 0))
      : [1000, 3000, 10000];
    const maxRetries = Math.min(finiteInteger(options.maxRetries, retryDelays.length), retryDelays.length);
    const inFlightByOwner = new Map();

    let destroyed = false;
    let timerId = null;
    let timerKind = "";
    let activeRun = null;
    let state = emptyState();

    function emptyState(epoch = 0) {
      return {
        ownerId: "",
        ownerEpoch: epoch,
        dirty: false,
        syncing: false,
        scheduled: false,
        conflict: false,
        blocked: false,
        offline: false,
        guest: false,
        canSync: false,
        remoteRevision: null,
        revisionKnown: false,
        localGeneration: 0,
        lastSuccessfulGeneration: 0,
        lastAttemptAt: "",
        lastSuccessAt: "",
        lastError: "",
        retryCount: 0,
      };
    }

    function currentContext(ownerId, ownerEpoch) {
      return !destroyed && state.ownerId === ownerId && state.ownerEpoch === ownerEpoch;
    }

    function statusName() {
      if (state.conflict) return "conflict";
      if (state.blocked) return "blocked";
      if (state.offline) return "offline";
      if (state.syncing) return "syncing";
      if (state.scheduled && timerKind === "retry") return "retrying";
      if (state.scheduled) return "scheduled";
      if (state.lastError && state.retryCount >= maxRetries && state.dirty) return "error";
      if (state.dirty) return "dirty";
      if (
        state.ownerId &&
        state.revisionKnown &&
        state.localGeneration > 0 &&
        state.lastSuccessfulGeneration === state.localGeneration
      ) return "synced";
      return "idle";
    }

    function snapshot() {
      return Object.freeze({ ...state, status: statusName() });
    }

    function persistAndNotify() {
      const next = snapshot();
      if (next.ownerId && typeof options.persistMeta === "function") {
        options.persistMeta(next);
      }
      if (typeof options.onStatus === "function") options.onStatus(next);
      return next;
    }

    function cancelScheduledSave() {
      if (timerId !== null) clearTimer(timerId);
      timerId = null;
      timerKind = "";
      if (state.scheduled) {
        state.scheduled = false;
        persistAndNotify();
      }
    }

    function activateOwner(ownerId, activation = {}) {
      cancelScheduledSave();
      const nextOwnerId = String(ownerId || "").trim();
      const meta = activation.meta || {};
      const guest = Boolean(activation.guest);
      const remoteRevision = guest ? null : normalizedRevision(meta.remoteRevision);
      const revisionKnown = !guest && meta.revisionKnown === true && remoteRevision !== null;
      const missingRevisionBlocks = Boolean(nextOwnerId && !guest && activation.canSync && !revisionKnown);
      const localGeneration = finiteInteger(meta.localGeneration, 0);
      const confirmedGeneration = Math.min(
        finiteInteger(meta.lastSuccessfulGeneration, 0),
        localGeneration,
      );
      state = {
        ...emptyState(state.ownerEpoch + 1),
        ownerId: nextOwnerId,
        guest,
        canSync: Boolean(nextOwnerId && activation.canSync && !guest),
        dirty: Boolean(meta.dirty),
        conflict: Boolean(meta.conflict),
        blocked: Boolean(meta.blocked || missingRevisionBlocks),
        remoteRevision: revisionKnown ? remoteRevision : null,
        revisionKnown,
        localGeneration,
        lastSuccessfulGeneration: confirmedGeneration,
        lastAttemptAt: String(meta.lastAttemptAt || ""),
        lastSuccessAt: String(meta.lastSuccessAt || ""),
        lastError: missingRevisionBlocks
          ? SERVER_UPDATE_REQUIRED_MESSAGE
          : (meta.lastError ? "Falha de sincronizacao pendente." : ""),
        retryCount: Math.min(finiteInteger(meta.retryCount, 0), maxRetries),
      };
      activeRun = null;
      return persistAndNotify();
    }

    function invalidateOwner() {
      cancelScheduledSave();
      state = emptyState(state.ownerEpoch + 1);
      activeRun = null;
      return persistAndNotify();
    }

    function canWrite() {
      return Boolean(
        state.ownerId &&
        state.canSync &&
        !state.guest &&
        state.revisionKnown &&
        !state.conflict &&
        !state.blocked &&
        !state.offline &&
        !destroyed
      );
    }

    function markDirty(markOptions = {}) {
      if (!state.ownerId || destroyed) return snapshot();
      state.localGeneration += 1;
      state.dirty = true;
      if (!state.blocked) state.lastError = "";
      state.retryCount = 0;
      persistAndNotify();
      if (markOptions.schedule !== false) scheduleSave();
      return snapshot();
    }

    function scheduleSave(delay = debounceMs, scheduleOptions = {}) {
      if (
        state.dirty && state.ownerId && state.canSync && !state.guest
        && !state.revisionKnown
      ) {
        state.blocked = true;
        state.lastError = SERVER_UPDATE_REQUIRED_MESSAGE;
        persistAndNotify();
        return snapshot();
      }
      if (!state.dirty || !canWrite()) return snapshot();
      if (activeRun && currentContext(activeRun.ownerId, activeRun.ownerEpoch)) return snapshot();
      if (timerId !== null) clearTimer(timerId);
      const ownerId = state.ownerId;
      const ownerEpoch = state.ownerEpoch;
      timerKind = scheduleOptions.retry ? "retry" : "debounce";
      state.scheduled = true;
      timerId = setTimer(() => {
        timerId = null;
        timerKind = "";
        if (!currentContext(ownerId, ownerEpoch)) return;
        state.scheduled = false;
        flush();
      }, finiteInteger(delay, 0));
      return persistAndNotify();
    }

    async function waitForOlderOwnerRequest(ownerId, ownerEpoch) {
      const olderRequest = inFlightByOwner.get(ownerId);
      if (!olderRequest) return true;
      try {
        await olderRequest;
      } catch (error) {}
      return currentContext(ownerId, ownerEpoch);
    }

    function requestSave(context) {
      const request = Promise.resolve().then(() => options.save(context));
      inFlightByOwner.set(context.ownerId, request);
      request.finally(() => {
        if (inFlightByOwner.get(context.ownerId) === request) inFlightByOwner.delete(context.ownerId);
      }).catch(() => {});
      return request;
    }

    async function runQueue(run) {
      if (!(await waitForOlderOwnerRequest(run.ownerId, run.ownerEpoch))) return false;

      while (currentContext(run.ownerId, run.ownerEpoch) && state.dirty && canWrite()) {
        const generation = state.localGeneration;
        const expectedRevision = state.remoteRevision;
        let payload;
        try {
          payload = await options.getPayload({
            ownerId: run.ownerId,
            ownerEpoch: run.ownerEpoch,
            generation,
          });
        } catch (error) {
          if (!currentContext(run.ownerId, run.ownerEpoch)) return false;
          handleFailure(error);
          return false;
        }
        if (!currentContext(run.ownerId, run.ownerEpoch) || !canWrite()) return false;

        state.syncing = true;
        state.scheduled = false;
        state.lastAttemptAt = now();
        persistAndNotify();

        let result;
        try {
          const response = await requestSave({
            ownerId: run.ownerId,
            ownerEpoch: run.ownerEpoch,
            generation,
            expectedRevision,
            payload,
          });
          result = normalizeCasResponse(response);
        } catch (error) {
          if (!currentContext(run.ownerId, run.ownerEpoch)) return false;
          state.syncing = false;
          handleFailure(error);
          return false;
        }

        if (!currentContext(run.ownerId, run.ownerEpoch)) return false;
        if (state.conflict || state.blocked) {
          state.syncing = false;
          state.dirty = true;
          persistAndNotify();
          return false;
        }
        if (result.outcome === "conflict") {
          state.syncing = false;
          state.dirty = true;
          state.conflict = true;
          state.remoteRevision = result.revision;
          state.revisionKnown = true;
          state.lastError = "Conflito de sincronização. Revise os dados antes de continuar.";
          state.retryCount = 0;
          persistAndNotify();
          return false;
        }
        if (result.outcome !== "success") {
          state.syncing = false;
          state.dirty = true;
          state.blocked = true;
          if (result.outcome === "unauthenticated") state.canSync = false;
          state.lastError = safeErrorMessage(createSyncError(
            result.outcome === "invalid-payload" ? "invalid-payload" : result.outcome,
          ));
          state.retryCount = 0;
          persistAndNotify();
          return false;
        }
        if (!isNextRevision(expectedRevision, result.revision)) {
          state.syncing = false;
          handleFailure(createSyncError("blocked", "malformed-response"));
          return false;
        }
        state.syncing = false;
        state.remoteRevision = result.revision;
        state.revisionKnown = true;
        state.lastSuccessfulGeneration = Math.max(state.lastSuccessfulGeneration, generation);
        state.lastSuccessAt = result.updatedAt;
        state.lastError = "";
        state.retryCount = 0;
        state.dirty = state.localGeneration !== generation;
        persistAndNotify();
      }
      return !state.dirty;
    }

    function handleFailure(error) {
      const failure = error?.syncCategory ? error : createSyncError("network-error", "transient");
      state.dirty = true;
      state.lastError = (options.safeErrorMessage || safeErrorMessage)(failure);
      if (failure.retryable === true) {
        state.retryCount = Math.min(state.retryCount + 1, maxRetries);
      } else {
        state.retryCount = 0;
        state.blocked = true;
        if (failure.syncCategory === "unauthenticated") state.canSync = false;
      }
      persistAndNotify();
    }

    function flush() {
      if (
        state.dirty && state.ownerId && state.canSync && !state.guest
        && !state.revisionKnown
      ) {
        state.blocked = true;
        state.lastError = SERVER_UPDATE_REQUIRED_MESSAGE;
        persistAndNotify();
        return Promise.resolve(false);
      }
      if (!state.dirty || !canWrite()) return Promise.resolve(false);
      if (activeRun && currentContext(activeRun.ownerId, activeRun.ownerEpoch)) return activeRun.promise;
      cancelScheduledSave();
      const run = {
        ownerId: state.ownerId,
        ownerEpoch: state.ownerEpoch,
        promise: null,
      };
      run.promise = runQueue(run).finally(() => {
        if (activeRun === run) {
          activeRun = null;
          if (currentContext(run.ownerId, run.ownerEpoch)) {
            state.syncing = false;
            persistAndNotify();
            if (state.lastError && state.dirty && state.retryCount < maxRetries && canWrite()) {
              const delay = retryDelays[Math.max(0, state.retryCount - 1)] || 0;
              scheduleSave(delay, { retry: true });
            }
          }
        }
      });
      activeRun = run;
      return run.promise;
    }

    function setCanSync(value) {
      state.canSync = Boolean(value && state.ownerId && !state.guest);
      if (!state.canSync) cancelScheduledSave();
      return persistAndNotify();
    }

    function setConflict(value) {
      state.conflict = Boolean(value);
      if (state.conflict) cancelScheduledSave();
      return persistAndNotify();
    }

    function setBlocked(value, message = "") {
      state.blocked = Boolean(value);
      if (state.blocked) {
        cancelScheduledSave();
        state.lastError = message ? "Sincronizacao bloqueada. Recarregue com seguranca." : state.lastError;
      }
      return persistAndNotify();
    }

    function markStale() {
      return setBlocked(true, "stale");
    }

    function setOnline(online) {
      state.offline = !online;
      if (state.offline) cancelScheduledSave();
      persistAndNotify();
      if (online) return handleReconnect();
      return snapshot();
    }

    function handleReconnect() {
      if (!state.ownerId || destroyed) return snapshot();
      state.offline = false;
      if (state.dirty && state.canSync && !state.conflict && !state.blocked && !state.guest) {
        state.retryCount = 0;
        persistAndNotify();
        scheduleSave(0, { retry: true });
      } else {
        persistAndNotify();
      }
      return snapshot();
    }

    function destroy() {
      if (destroyed) return;
      invalidateOwner();
      destroyed = true;
      inFlightByOwner.clear();
    }

    return Object.freeze({
      activateOwner,
      cancelScheduledSave,
      destroy,
      flush,
      getStatus: snapshot,
      handleReconnect,
      invalidateOwner,
      markDirty,
      markStale,
      scheduleSave,
      setBlocked,
      setCanSync,
      setConflict,
      setOnline,
    });
  }

  function cloneSanitized(value) {
    const sanitized = core.storage?.sanitizeSensitiveData
      ? core.storage.sanitizeSensitiveData(value)
      : value;
    return JSON.parse(JSON.stringify(sanitized));
  }

  function normalizeOwnerUser(user, authUser = {}) {
    if (!user || typeof user !== "object" || Array.isArray(user)) return null;
    const clone = cloneSanitized(user);
    if (authUser.id) clone.id = String(authUser.id);
    if (authUser.email) clone.email = String(authUser.email).trim().toLowerCase();
    delete clone.localOnly;
    return clone;
  }

  function deterministicValue(value, depth = 0) {
    if (Array.isArray(value)) return value.map((item) => deterministicValue(item, depth + 1));
    if (!value || typeof value !== "object") return value;
    return Object.keys(value).sort().reduce((result, key) => {
      if (depth === 0 && VOLATILE_ROOT_FIELDS.has(key)) return result;
      result[key] = deterministicValue(value[key], depth + 1);
      return result;
    }, {});
  }

  function deterministicState(value) {
    return JSON.stringify(deterministicValue(cloneSanitized(value)));
  }

  function statesEquivalent(left, right) {
    return deterministicState(left) === deterministicState(right);
  }

  const RECONCILIATION_COLLECTIONS = Object.freeze([
    "accounts",
    "transactions",
    "goals",
    "budgets",
  ]);

  function reconciliationTimestamp(record) {
    const raw = record?.updatedAt || record?.updated_at || record?.createdAt || record?.created_at || "";
    const time = Date.parse(raw);
    return Number.isFinite(time) ? { raw: String(raw), time } : { raw: "", time: null };
  }

  function reconciliationRecords(user) {
    const records = new Map();
    const issues = [];
    const profiles = Array.isArray(user?.profiles) ? user.profiles : [];

    function add(kind, record, profileId = "") {
      const id = String(record?.id || "").trim();
      if (!id) {
        issues.push({ kind, reason: "missing-id", profileId });
        return;
      }
      const key = `${kind}:${profileId}:${id}`;
      if (records.has(key)) {
        issues.push({ kind, reason: "duplicate-id", id, profileId });
        return;
      }
      records.set(key, {
        kind,
        id,
        profileId,
        record: cloneSanitized(record),
      });
    }

    const userMetadata = cloneSanitized(user);
    delete userMetadata.profiles;
    add("user", userMetadata);

    profiles.forEach((profile) => {
      const profileId = String(profile?.id || "").trim();
      const profileMetadata = cloneSanitized(profile);
      RECONCILIATION_COLLECTIONS.forEach((collection) => delete profileMetadata[collection]);
      add("profiles", profileMetadata);
      RECONCILIATION_COLLECTIONS.forEach((collection) => {
        const values = profile?.[collection];
        if (values !== undefined && !Array.isArray(values)) {
          issues.push({ kind: collection, reason: "invalid-collection", profileId });
          return;
        }
        (values || []).forEach((record) => add(collection, record, profileId));
      });
    });

    return { issues, records };
  }

  function compareFinancialRecords(localUser, remoteUser) {
    const local = reconciliationRecords(localUser);
    const remote = reconciliationRecords(remoteUser);
    const localOnly = [];
    const remoteOnly = [];
    const divergent = [];

    local.records.forEach((entry, key) => {
      const remoteEntry = remote.records.get(key);
      if (!remoteEntry) {
        localOnly.push({ kind: entry.kind, id: entry.id, profileId: entry.profileId });
        return;
      }
      if (statesEquivalent(entry.record, remoteEntry.record)) return;
      const localUpdated = reconciliationTimestamp(entry.record);
      const remoteUpdated = reconciliationTimestamp(remoteEntry.record);
      divergent.push({
        kind: entry.kind,
        id: entry.id,
        profileId: entry.profileId,
        localUpdatedAt: localUpdated.raw,
        remoteUpdatedAt: remoteUpdated.raw,
        localNewer: localUpdated.time !== null
          && remoteUpdated.time !== null
          && localUpdated.time > remoteUpdated.time,
        remoteNewer: localUpdated.time !== null
          && remoteUpdated.time !== null
          && remoteUpdated.time > localUpdated.time,
      });
    });

    remote.records.forEach((entry, key) => {
      if (!local.records.has(key)) {
        remoteOnly.push({ kind: entry.kind, id: entry.id, profileId: entry.profileId });
      }
    });

    const issues = [...local.issues, ...remote.issues];
    const safe = issues.length === 0
      && remoteOnly.length === 0
      && divergent.every((entry) => entry.localNewer);
    return Object.freeze({
      safe,
      localOnly: Object.freeze(localOnly),
      remoteOnly: Object.freeze(remoteOnly),
      divergent: Object.freeze(divergent),
      issues: Object.freeze(issues),
    });
  }

  function isRecognizableFinancialState(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    if (!Array.isArray(value.profiles)) return false;
    return value.profiles.every((profile) => (
      profile &&
      typeof profile === "object" &&
      !Array.isArray(profile) &&
      (!Object.hasOwn(profile, "transactions") || Array.isArray(profile.transactions)) &&
      (!Object.hasOwn(profile, "goals") || Array.isArray(profile.goals))
    ));
  }

  function reconcileBootstrap(input = {}) {
    const authUser = input.authUser || {};
    const localExists = Boolean(input.localExists);
    const remoteExists = Boolean(input.remoteRowExists);
    const localUser = localExists ? normalizeOwnerUser(input.localUser, authUser) : null;
    const remoteUser = remoteExists ? normalizeOwnerUser(input.remoteData, authUser) : null;

    if (localExists && !isRecognizableFinancialState(localUser)) {
      return { status: "blocked", blocked: true, conflict: false, dirty: false, user: null, reason: "invalid-local" };
    }
    if (remoteExists && !isRecognizableFinancialState(remoteUser)) {
      return { status: "blocked", blocked: true, conflict: false, dirty: false, user: localUser, reason: "invalid-remote" };
    }
    if (remoteExists && !localExists) {
      return { status: "remote", blocked: false, conflict: false, dirty: false, user: remoteUser };
    }
    if (localExists && !remoteExists) {
      return { status: "local", blocked: false, conflict: false, dirty: true, user: localUser };
    }
    if (!localExists && !remoteExists) {
      return { status: "empty", blocked: false, conflict: false, dirty: false, user: null };
    }
    if (statesEquivalent(localUser, remoteUser)) {
      return { status: "equivalent", blocked: false, conflict: false, dirty: false, user: remoteUser };
    }
    const comparison = compareFinancialRecords(localUser, remoteUser);
    return {
      status: "conflict",
      blocked: false,
      conflict: true,
      dirty: true,
      user: localUser,
      localBackupCandidate: localUser,
      comparison,
      reason: comparison.safe ? "local-superset" : "divergent-state",
    };
  }

  function createTabChannel(options = {}) {
    const globalObject = options.globalObject || global;
    const storage = options.storage || globalObject.localStorage;
    const channelName = options.channelName || "nexio-sync-events-v1";
    const signalKey = options.signalKey || "nexio-sync-signal-v1";
    const sourceId = options.sourceId || `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const BroadcastChannelCtor = options.BroadcastChannelCtor === undefined
      ? globalObject.BroadcastChannel
      : options.BroadcastChannelCtor;
    let channel = null;
    let destroyed = false;

    function receive(message) {
      if (destroyed || !message || message.sourceId === sourceId || !CROSS_TAB_EVENTS.has(message.type)) return;
      if (typeof options.onMessage === "function") {
        options.onMessage(Object.freeze({
          type: message.type,
          ownerId: String(message.ownerId || ""),
          previousOwnerId: String(message.previousOwnerId || ""),
          at: String(message.at || ""),
        }));
      }
    }

    function onStorage(event) {
      if (event.key !== signalKey || !event.newValue) return;
      try {
        receive(JSON.parse(event.newValue));
      } catch (error) {}
    }

    if (typeof BroadcastChannelCtor === "function") {
      channel = new BroadcastChannelCtor(channelName);
      channel.onmessage = (event) => receive(event.data);
    } else if (typeof globalObject.addEventListener === "function") {
      globalObject.addEventListener("storage", onStorage);
    }

    function post(type, detail = {}) {
      if (destroyed || !CROSS_TAB_EVENTS.has(type)) return false;
      const message = {
        type,
        ownerId: String(detail.ownerId || ""),
        previousOwnerId: String(detail.previousOwnerId || ""),
        sourceId,
        at: new Date().toISOString(),
        nonce: Math.random().toString(36).slice(2),
      };
      if (channel) {
        try {
          channel.postMessage(message);
          return true;
        } catch (error) {
          return false;
        }
      }
      if (storage) {
        try {
          storage.setItem(signalKey, JSON.stringify(message));
          storage.removeItem(signalKey);
          return true;
        } catch (error) {
          return false;
        }
      }
      return false;
    }

    function destroy() {
      destroyed = true;
      channel?.close?.();
      if (!channel && typeof globalObject.removeEventListener === "function") {
        globalObject.removeEventListener("storage", onStorage);
      }
    }

    return Object.freeze({ destroy, post });
  }

  core.sync = Object.freeze({
    classifySupabaseError,
    compareFinancialRecords,
    createCoordinator,
    createSyncError,
    createTabChannel,
    deterministicState,
    isRecognizableFinancialState,
    normalizeOwnerUser,
    normalizeCasResponse,
    reconcileBootstrap,
    statesEquivalent,
  });
})(globalThis);
