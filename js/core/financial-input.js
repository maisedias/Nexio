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

  async function interpret(text, parser, interpreter, options = {}, metadata = {}) {
    const local = metadata.localDraft
      ? Object.freeze({
        text: String(text || "").trim(),
        draft: metadata.localDraft,
        valid: Boolean(metadata.localDraft),
        source: String(metadata.source || "text"),
      })
      : createDraft(text, parser, options, metadata);
    const assessment = core.aiInterpreter?.assessLocalDraft?.(local.text, local.draft)
      || { sufficient: Boolean(local.draft), reasons: [] };
    if (assessment.sufficient) {
      return Object.freeze({ ...local, strategy: "local", assessment });
    }
    if (interpreter?.interpret) {
      try {
        const draft = await interpreter.interpret({
          text: local.text,
          referenceDate: options.referenceDate,
          now: options.now,
          categories: options.categories,
        });
        return Object.freeze({
          ...local,
          draft,
          valid: true,
          strategy: "ai",
          assessment,
        });
      } catch (error) {
        const normalized = core.aiInterpreter?.normalizeError?.(error) || error;
        if (["cancelled", "stale"].includes(normalized?.code)) {
          return Object.freeze({ ...local, draft: null, valid: false, strategy: "cancelled", assessment });
        }
      }
    }
    const draft = core.aiInterpreter?.manualDraft?.(local.text, local.draft, options) || local.draft || null;
    return Object.freeze({
      ...local,
      draft,
      valid: Boolean(draft && Number.isFinite(draft.amount) && draft.amount > 0),
      strategy: "fallback",
      assessment,
      message: "Não foi possível interpretar todos os detalhes. Revise o lançamento antes de continuar.",
    });
  }

  core.financialInput = Object.freeze({ createDraft, interpret });
})(globalThis);
