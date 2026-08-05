(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  function createDraft(text, parser, options = {}, metadata = {}) {
    const normalizedText = String(text || "").trim();
    const draft = normalizedText && typeof parser === "function"
      ? parser(normalizedText, options)
      : null;
    return Object.freeze({
      text: normalizedText,
      draft: draft || null,
      valid: Boolean(draft),
      source: String(metadata.source || "text"),
    });
  }

  core.financialInput = Object.freeze({ createDraft });
})(globalThis);
