(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  const SENSITIVE_FIELD_NAMES = new Set([
    "password",
    "senha",
    "passwd",
    "passcode",
    "passwordhash",
    "pwd",
    "token",
    "authtoken",
    "authenticationtoken",
    "accesstoken",
    "refreshtoken",
    "idtoken",
    "sessionkey",
    "sessiontoken",
    "chavedesessao",
    "chavesessao",
    "secret",
    "segredo",
    "secretkey",
    "clientsecret",
    "apisecret",
    "privatekey",
    "chaveprivada",
    "credential",
    "credentials",
    "credencial",
    "credenciais",
    "authcredential",
    "authcredentials",
    "authenticationcredentials",
    "clientcredentials",
    "internalcredentials",
  ]);
  const LEGACY_STATE_KEY = "nexio-finance-state-v1";
  const OWNER_STATE_PREFIX = "nexio-finance-state-v2";
  const SYNC_META_PREFIX = "nexio-sync-meta-v1";
  const MIGRATION_MARKER_PREFIX = "nexio-migration-v1-to-v2";
  const MIGRATION_REVIEW_PREFIX = "nexio-migration-v1-review";
  const LEGACY_BACKUP_MARKER_PREFIX = "nexio-migration-v1-backup-created";
  const BACKUP_PREFIX = "nexio-local-backup-v1";
  const BACKUP_INDEX_PREFIX = "nexio-local-backup-index-v1";

  function canonicalFieldName(name) {
    return String(name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function isSensitiveField(name) {
    return SENSITIVE_FIELD_NAMES.has(canonicalFieldName(name));
  }

  function isTraversable(value) {
    if (!value || typeof value !== "object") return false;
    if (Array.isArray(value)) return true;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function containsSensitiveField(value, visited = new WeakSet()) {
    if (!isTraversable(value) || visited.has(value)) return false;
    visited.add(value);
    return Object.keys(value).some((field) => (
      isSensitiveField(field) || containsSensitiveField(value[field], visited)
    ));
  }

  function cloneWithoutSensitiveFields(value, clones = new WeakMap()) {
    if (!isTraversable(value)) return value;
    if (clones.has(value)) return clones.get(value);

    const clone = Array.isArray(value)
      ? new Array(value.length)
      : Object.create(Object.getPrototypeOf(value));
    clones.set(value, clone);
    Object.keys(value).forEach((field) => {
      if (isSensitiveField(field)) return;
      Object.defineProperty(clone, field, {
        configurable: true,
        enumerable: true,
        value: cloneWithoutSensitiveFields(value[field], clones),
        writable: true,
      });
    });
    return clone;
  }

  function sanitizeValue(value) {
    const changed = containsSensitiveField(value);
    return {
      value: changed ? cloneWithoutSensitiveFields(value) : value,
      changed,
    };
  }

  function sanitizeSensitiveData(value) {
    return sanitizeValue(value).value;
  }

  function loadStore(storage, key) {
    let parsed;
    try {
      parsed = JSON.parse(storage.getItem(key) || "{}");
    } catch (error) {
      return { users: [] };
    }
    const result = sanitizeValue(parsed);
    const sanitized = result.value && typeof result.value === "object" && !Array.isArray(result.value)
      ? result.value
      : {};
    const store = { ...sanitized, users: Array.isArray(sanitized.users) ? sanitized.users : [] };
    if (result.changed) {
      try {
        storage.setItem(key, JSON.stringify(store));
      } catch (error) {}
    }
    return store;
  }

  function saveStore(storage, key, store) {
    const sanitized = sanitizeSensitiveData(store);
    storage.setItem(key, JSON.stringify(sanitized));
    return sanitized;
  }

  function ownerScope(ownerId, options = {}) {
    if (options.guest) return "guest";
    const normalizedOwnerId = String(ownerId || "").trim();
    if (!normalizedOwnerId) throw new TypeError("ownerId is required for authenticated storage.");
    if (normalizedOwnerId.length > 256) throw new TypeError("ownerId is too long for local storage.");
    let encodedOwnerId;
    try {
      encodedOwnerId = encodeURIComponent(normalizedOwnerId);
    } catch (error) {
      throw new TypeError("ownerId contains invalid characters.");
    }
    return `user:${encodedOwnerId}`;
  }

  function ownerStateKey(ownerId, options = {}) {
    return `${OWNER_STATE_PREFIX}:${ownerScope(ownerId, options)}`;
  }

  function syncMetaKey(ownerId, options = {}) {
    return `${SYNC_META_PREFIX}:${ownerScope(ownerId, options)}`;
  }

  function parseSanitizedValue(storage, key) {
    const raw = storage.getItem(key);
    if (raw === null) return { exists: false, malformed: false, value: null };
    try {
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeValue(parsed);
      if (sanitized.changed) storage.setItem(key, JSON.stringify(sanitized.value));
      return { exists: true, malformed: false, value: sanitized.value };
    } catch (error) {
      return { exists: true, malformed: true, value: null };
    }
  }

  function loadOwnerUser(storage, ownerId, options = {}) {
    const key = ownerStateKey(ownerId, options);
    const stored = parseSanitizedValue(storage, key);
    const user = stored.value && typeof stored.value === "object" && !Array.isArray(stored.value)
      ? stored.value
      : null;
    return { key, exists: stored.exists, malformed: stored.malformed || (stored.exists && !user), user };
  }

  function saveOwnerUser(storage, ownerId, user, options = {}) {
    const key = ownerStateKey(ownerId, options);
    const sanitized = sanitizeSensitiveData(user);
    storage.setItem(key, JSON.stringify(sanitized));
    return sanitized;
  }

  function safeTimestamp(value) {
    const resolved = typeof value === "function" ? value() : value;
    const date = resolved instanceof Date ? resolved : new Date(resolved || Date.now());
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function backupIndex(storage, scope) {
    const key = `${BACKUP_INDEX_PREFIX}:${scope}`;
    try {
      const parsed = JSON.parse(storage.getItem(key) || "[]");
      return { key, entries: Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [] };
    } catch (error) {
      return { key, entries: [] };
    }
  }

  function createLocalBackup(storage, scope, value, options = {}) {
    const sanitized = sanitizeSensitiveData(value);
    const timestamp = safeTimestamp(options.now);
    const maxBackups = Math.max(1, Math.min(Number(options.maxBackups) || 3, 10));
    const index = backupIndex(storage, scope);
    let key = `${BACKUP_PREFIX}:${scope}:${timestamp}`;
    let collision = 1;
    while (storage.getItem(key) !== null) {
      collision += 1;
      key = `${BACKUP_PREFIX}:${scope}:${timestamp}:${collision}`;
    }

    storage.setItem(key, JSON.stringify(sanitized));
    const entries = [...index.entries.filter((entry) => entry !== key), key];
    storage.setItem(index.key, JSON.stringify(entries));
    while (entries.length > maxBackups) {
      const oldest = entries.shift();
      if (oldest && oldest !== key) storage.removeItem(oldest);
    }
    storage.setItem(index.key, JSON.stringify(entries));
    return key;
  }

  function backupOwnerUser(storage, ownerId, user, options = {}) {
    return createLocalBackup(storage, ownerScope(ownerId, options), user, options);
  }

  function createLegacyBackupOnce(storage, ownerId, legacyUser, options = {}) {
    const scope = ownerScope(ownerId, options);
    const markerKey = `${LEGACY_BACKUP_MARKER_PREFIX}:${scope}`;
    const existing = storage.getItem(markerKey);
    if (existing) return { created: false, key: "" };
    const key = createLocalBackup(storage, `legacy:${scope}`, { users: [legacyUser] }, options);
    storage.setItem(markerKey, JSON.stringify({
      version: 1,
      created: true,
      at: safeTimestamp(options.now),
      sourceRetained: true,
    }));
    return { created: true, key };
  }

  function migrationMarkerKey(ownerId, options = {}) {
    return `${MIGRATION_MARKER_PREFIX}:${ownerScope(ownerId, options)}`;
  }

  function migrationReviewKey(ownerId, options = {}) {
    return `${MIGRATION_REVIEW_PREFIX}:${ownerScope(ownerId, options)}`;
  }

  function writeMigrationMarker(storage, key, status, options = {}) {
    const marker = {
      version: 1,
      status,
      ownerType: options.guest ? "guest" : "authenticated",
      reviewRequired: status === "review-required",
      sourceRetained: true,
      at: safeTimestamp(options.now),
    };
    storage.setItem(key, JSON.stringify(marker));
    return marker;
  }

  function writeMigrationReview(storage, key, status, options = {}) {
    const marker = {
      version: 1,
      status,
      ownerType: options.guest ? "guest" : "authenticated",
      reviewRequired: status !== "no-match",
      sourceRetained: true,
      at: safeTimestamp(options.now),
    };
    storage.setItem(key, JSON.stringify(marker));
    return marker;
  }

  function migrateLegacyOwner(storage, ownerId, options = {}) {
    const markerKey = migrationMarkerKey(ownerId, options);
    const reviewKey = migrationReviewKey(ownerId, options);
    const priorReview = parseSanitizedValue(storage, reviewKey);
    const existing = loadOwnerUser(storage, ownerId, options);
    if (existing.exists) {
      const reviewRequired = priorReview.value?.reviewRequired === true;
      return {
        ...existing,
        migrated: false,
        reviewRequired,
        status: reviewRequired ? "review-required" : "existing",
      };
    }

    const priorMarker = parseSanitizedValue(storage, markerKey);
    if (priorMarker.exists) {
      return {
        ...existing,
        migrated: false,
        reviewRequired: true,
        status: "review-required",
      };
    }
    if (priorReview.exists) {
      return {
        ...existing,
        migrated: false,
        reviewRequired: priorReview.value?.reviewRequired === true,
        status: String(priorReview.value?.status || "already-reviewed"),
      };
    }

    const legacy = parseSanitizedValue(storage, options.legacyKey || LEGACY_STATE_KEY);
    if (!legacy.exists) return { ...existing, migrated: false, reviewRequired: false, status: "no-legacy" };
    if (legacy.malformed || !legacy.value || !Array.isArray(legacy.value.users)) {
      writeMigrationReview(storage, reviewKey, "review-required", options);
      return { ...existing, migrated: false, reviewRequired: true, status: "review-required" };
    }

    const localOnlyEmail = String(options.localOnlyEmail || "sem-login@nexio.local").trim().toLowerCase();
    const email = String(options.email || "").trim().toLowerCase();
    const candidates = legacy.value.users.filter((user) => {
      if (!user || typeof user !== "object" || Array.isArray(user)) return false;
      const userEmail = String(user.email || "").trim().toLowerCase();
      if (options.guest) return user.localOnly === true || userEmail === localOnlyEmail;
      return Boolean(email && userEmail === email);
    });

    if (candidates.length > 1) {
      writeMigrationReview(storage, reviewKey, "review-required", options);
      return {
        ...existing,
        backupCreated: false,
        backupKey: "",
        migrated: false,
        reviewRequired: true,
        status: "review-required",
      };
    }
    if (candidates.length === 0) {
      writeMigrationReview(storage, reviewKey, "no-match", options);
      return {
        ...existing,
        backupCreated: false,
        backupKey: "",
        migrated: false,
        reviewRequired: false,
        status: "no-match",
      };
    }

    let legacyBackup;
    try {
      legacyBackup = createLegacyBackupOnce(storage, ownerId, candidates[0], options);
    } catch (error) {
      try {
        writeMigrationReview(storage, reviewKey, "backup-failed", options);
      } catch (markerError) {}
      return {
        ...existing,
        backupCreated: false,
        backupKey: "",
        migrated: false,
        reviewRequired: true,
        status: "backup-failed",
      };
    }
    const user = saveOwnerUser(storage, ownerId, candidates[0], options);
    writeMigrationMarker(storage, markerKey, "migrated", options);
    return {
      key: ownerStateKey(ownerId, options),
      exists: true,
      malformed: false,
      user,
      backupCreated: legacyBackup.created,
      backupKey: legacyBackup.key,
      migrated: true,
      reviewRequired: false,
      status: "migrated",
    };
  }

  function loadSyncMeta(storage, ownerId, options = {}) {
    const parsed = parseSanitizedValue(storage, syncMetaKey(ownerId, options));
    if (!parsed.exists || parsed.malformed || !parsed.value || typeof parsed.value !== "object") return {};
    return {
      dirty: parsed.value.dirty === true,
      conflict: parsed.value.conflict === true,
      blocked: parsed.value.blocked === true,
      localGeneration: Math.max(0, Number(parsed.value.localGeneration) || 0),
      lastSuccessfulGeneration: Math.max(0, Number(parsed.value.lastSuccessfulGeneration) || 0),
      retryCount: Math.max(0, Math.min(Number(parsed.value.retryCount) || 0, 10)),
      lastError: parsed.value.lastError ? "Falha de sincronizacao pendente." : "",
      updatedAt: String(parsed.value.updatedAt || ""),
    };
  }

  function saveSyncMeta(storage, ownerId, meta, options = {}) {
    const safeMeta = {
      dirty: meta?.dirty === true,
      conflict: meta?.conflict === true,
      blocked: meta?.blocked === true,
      localGeneration: Math.max(0, Number(meta?.localGeneration) || 0),
      lastSuccessfulGeneration: Math.max(0, Number(meta?.lastSuccessfulGeneration) || 0),
      retryCount: Math.max(0, Math.min(Number(meta?.retryCount) || 0, 10)),
      lastError: meta?.lastError ? "Falha de sincronizacao pendente." : "",
      updatedAt: safeTimestamp(options.now),
    };
    storage.setItem(syncMetaKey(ownerId, options), JSON.stringify(safeMeta));
    return safeMeta;
  }

  function getSession(storage, key) {
    return storage.getItem(key) || "";
  }

  function setSession(storage, key, email) {
    storage.setItem(key, email);
    return email;
  }

  function clearSession(storage, key) {
    storage.removeItem(key);
  }

  async function signOutAndClearSession(storage, key, remoteSignOut) {
    let remoteSignOutSucceeded = true;
    try {
      if (typeof remoteSignOut === "function") {
        const result = await remoteSignOut();
        if (result?.error) remoteSignOutSucceeded = false;
      }
    } catch (error) {
      remoteSignOutSucceeded = false;
    } finally {
      clearSession(storage, key);
    }
    return remoteSignOutSucceeded;
  }

  function getAuthenticatedSession(storage, key, authenticatedEmail) {
    const marker = String(getSession(storage, key)).trim().toLowerCase();
    const verifiedEmail = String(authenticatedEmail || "").trim().toLowerCase();
    return verifiedEmail && marker === verifiedEmail ? marker : "";
  }

  function clearUnverifiedSession(storage, key, options = {}) {
    const marker = String(getSession(storage, key)).trim().toLowerCase();
    const authenticated = getAuthenticatedSession(storage, key, options.authenticatedEmail);
    const localOnlyEmail = String(options.localOnlyEmail || "").trim().toLowerCase();
    const localOnly = localOnlyEmail && marker === localOnlyEmail ? marker : "";
    const validMarker = authenticated || localOnly;
    if (marker && !validMarker) clearSession(storage, key);
    return validMarker;
  }

  function getValue(storage, key, fallback = "") {
    const value = storage.getItem(key);
    return value === null ? fallback : value;
  }

  function setValue(storage, key, value) {
    storage.setItem(key, value);
    return value;
  }

  function removeValue(storage, key) {
    storage.removeItem(key);
  }

  function buildCloudPayload(user, normalize) {
    const sanitized = sanitizeSensitiveData(user);
    const clone = JSON.parse(JSON.stringify(sanitized));
    const normalized = normalize ? normalize(clone) : clone;
    return sanitizeSensitiveData(normalized);
  }

  core.storage = Object.freeze({
    backupOwnerUser,
    buildCloudPayload,
    clearSession,
    clearUnverifiedSession,
    getAuthenticatedSession,
    getSession,
    getValue,
    isSensitiveField,
    loadOwnerUser,
    loadStore,
    loadSyncMeta,
    migrateLegacyOwner,
    ownerStateKey,
    sanitizeSensitiveData,
    saveOwnerUser,
    saveStore,
    saveSyncMeta,
    signOutAndClearSession,
    setValue,
    setSession,
    syncMetaKey,
    removeValue,
  });
})(globalThis);
