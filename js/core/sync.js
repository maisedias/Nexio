(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const CROSS_TAB_EVENTS = new Set(["logout", "owner-changed", "session-invalidated", "state-changed"]);
  const VOLATILE_ROOT_FIELDS = new Set(["_sync", "lastSyncedAt", "syncStatus"]);

  function finiteInteger(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
  }

  function safeErrorMessage(error) {
    if (error?.offline === true) return "Sem conexao. Alteracoes pendentes.";
    return "Falha temporaria de sincronizacao.";
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
      const localGeneration = finiteInteger(meta.localGeneration, 0);
      const confirmedGeneration = Math.min(
        finiteInteger(meta.lastSuccessfulGeneration, 0),
        localGeneration,
      );
      state = {
        ...emptyState(state.ownerEpoch + 1),
        ownerId: nextOwnerId,
        guest: Boolean(activation.guest),
        canSync: Boolean(nextOwnerId && activation.canSync && !activation.guest),
        dirty: Boolean(meta.dirty),
        conflict: Boolean(meta.conflict),
        blocked: Boolean(meta.blocked),
        localGeneration,
        lastSuccessfulGeneration: confirmedGeneration,
        lastAttemptAt: String(meta.lastAttemptAt || ""),
        lastSuccessAt: String(meta.lastSuccessAt || ""),
        lastError: meta.lastError ? "Falha de sincronizacao pendente." : "",
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
      state.lastError = "";
      state.retryCount = 0;
      persistAndNotify();
      if (markOptions.schedule !== false) scheduleSave();
      return snapshot();
    }

    function scheduleSave(delay = debounceMs, scheduleOptions = {}) {
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

        try {
          await requestSave({
            ownerId: run.ownerId,
            ownerEpoch: run.ownerEpoch,
            generation,
            payload,
          });
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
        state.syncing = false;
        state.lastSuccessfulGeneration = Math.max(state.lastSuccessfulGeneration, generation);
        state.lastSuccessAt = now();
        state.lastError = "";
        state.retryCount = 0;
        state.dirty = state.localGeneration !== generation;
        persistAndNotify();
      }
      return !state.dirty;
    }

    function handleFailure(error) {
      state.dirty = true;
      state.lastError = (options.safeErrorMessage || safeErrorMessage)(error);
      state.retryCount = Math.min(state.retryCount + 1, maxRetries);
      persistAndNotify();
    }

    function flush() {
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
    return {
      status: "conflict",
      blocked: false,
      conflict: true,
      dirty: true,
      user: remoteUser,
      localBackupCandidate: localUser,
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
    createCoordinator,
    createTabChannel,
    deterministicState,
    isRecognizableFinancialState,
    normalizeOwnerUser,
    reconcileBootstrap,
    statesEquivalent,
  });
})(globalThis);
