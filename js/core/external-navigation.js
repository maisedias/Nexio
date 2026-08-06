(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const ACTIONS = Object.freeze({
    ASSISTANT: "assistant",
    VOICE_ENTRY: "voice-entry",
    NEW_TRANSACTION: "new-transaction",
    NEW_EXPENSE: "new-expense",
  });
  const VALID_ACTIONS = new Set(Object.values(ACTIONS));

  function normalizeAction(value) {
    const source = value?.action && typeof value.action === "object"
      ? value.action
      : (value?.content || value || {});
    const action = String(source.action || "").trim().toLowerCase();
    if (!VALID_ACTIONS.has(action)) return null;
    return Object.freeze({
      id: String(source.id || `${action}:${source.source || "externo"}`),
      action,
      source: String(source.source || "externo"),
    });
  }

  function createCoordinator(options = {}) {
    const handlers = options.handlers || {};
    let pending = null;
    let activeKey = "";
    let completedKey = "";

    async function flush() {
      if (!pending) return { status: "idle" };
      const key = `${pending.id}:${pending.action}`;
      if (key === activeKey || key === completedKey) {
        pending = null;
        return { status: "duplicate", action: key };
      }
      if (options.isAuthenticated?.() === false) {
        options.onAuthenticationRequired?.(pending);
        return { status: "authentication-required", action: pending.action };
      }
      if (options.hasActiveProfile?.() === false) {
        options.onProfileRequired?.(pending);
        return { status: "profile-required", action: pending.action };
      }
      const handler = handlers[pending.action];
      if (typeof handler !== "function") {
        pending = null;
        return { status: "unsupported" };
      }
      const current = pending;
      activeKey = key;
      try {
        await handler(current);
        completedKey = key;
        pending = null;
        return { status: "handled", action: current.action };
      } finally {
        activeKey = "";
      }
    }

    async function receive(value) {
      const normalized = normalizeAction(value);
      if (!normalized) return { status: "invalid" };
      const key = `${normalized.id}:${normalized.action}`;
      if (key === activeKey || key === completedKey) return { status: "duplicate", action: normalized.action };
      pending = normalized;
      return flush();
    }

    function clear() {
      pending = null;
    }

    function getPending() {
      return pending;
    }

    return Object.freeze({ receive, flush, clear, getPending });
  }

  core.externalNavigation = Object.freeze({ ACTIONS, normalizeAction, createCoordinator });
})(globalThis);
