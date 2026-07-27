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
    buildCloudPayload,
    clearSession,
    clearUnverifiedSession,
    getAuthenticatedSession,
    getSession,
    getValue,
    isSensitiveField,
    loadStore,
    sanitizeSensitiveData,
    saveStore,
    signOutAndClearSession,
    setValue,
    setSession,
    removeValue,
  });
})(globalThis);
