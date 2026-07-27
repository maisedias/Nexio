(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  function loadStore(storage, key) {
    try {
      const parsed = JSON.parse(storage.getItem(key) || "{}");
      return { users: Array.isArray(parsed.users) ? parsed.users : [] };
    } catch (error) {
      return { users: [] };
    }
  }

  function saveStore(storage, key, store) {
    storage.setItem(key, JSON.stringify(store));
    return store;
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
    const clone = JSON.parse(JSON.stringify(user));
    delete clone.password;
    return normalize ? normalize(clone) : clone;
  }

  core.storage = Object.freeze({
    buildCloudPayload,
    clearSession,
    getSession,
    getValue,
    loadStore,
    saveStore,
    setValue,
    setSession,
    removeValue,
  });
})(globalThis);
