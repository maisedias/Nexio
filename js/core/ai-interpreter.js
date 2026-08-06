(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const MAX_INPUT_LENGTH = 600;
  const MAX_DESCRIPTION_LENGTH = 120;
  const DEFAULT_TIMEOUT_MS = 9000;
  const categories = Object.freeze([
    "Salário", "Freelance", "Alimentação", "Casa", "Transporte", "Saúde", "Lazer",
  ]);
  const localCategories = Object.freeze([
    "Market", "Fuel", "Pharmacy", "Restaurant", "Bakery", "Store", "Transfer",
    "Salary", "Freelance", "Income", "Other", "Home", "Transport", "Health", "Leisure",
  ]);
  const paymentMethods = Object.freeze([
    "Credit Card", "Debit Card", "Pix", "Cash", "Bank Transfer", "Boleto",
  ]);
  const resultKeys = new Set([
    "type", "amount", "currency", "category", "description", "paymentMethod",
    "account", "date", "installments",
  ]);

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function dateInputValue(value) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function validDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function validateDraft(candidate, options = {}) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    if (Object.keys(candidate).some((key) => !resultKeys.has(key))) return null;
    const allowedCategories = Array.isArray(options.categories) && options.categories.length
      ? options.categories
      : categories;
    if (!(["expense", "income"].includes(candidate.type))) return null;
    if (!Number.isFinite(candidate.amount) || candidate.amount <= 0 || candidate.amount > 999999999999) return null;
    if (candidate.currency !== "BRL") return null;
    if (!allowedCategories.includes(candidate.category)) return null;
    const description = String(candidate.description || "").trim();
    if (!description || description.length > MAX_DESCRIPTION_LENGTH) return null;
    if (candidate.paymentMethod !== null && !paymentMethods.includes(candidate.paymentMethod)) return null;
    if (candidate.account !== null && candidate.account !== undefined) return null;
    if (!validDate(candidate.date)) return null;
    const installments = candidate.installments;
    if (installments !== null && installments !== undefined
      && (!Number.isInteger(installments) || installments < 2 || installments > 60)) return null;
    const draft = {
      type: candidate.type,
      amount: candidate.amount,
      currency: "BRL",
      category: candidate.category,
      description,
      paymentMethod: candidate.paymentMethod || null,
      account: null,
      date: candidate.date,
    };
    if (Number.isInteger(installments)) draft.installments = installments;
    return Object.freeze(draft);
  }

  function assessLocalDraft(text, draft) {
    const normalized = normalizeText(text);
    const relativeDate = /\b(ontem|anteontem|segunda-feira|terca-feira|quarta-feira|quinta-feira|sexta-feira|sabado|domingo|semana passada|dia \d{1,2})\b/.test(normalized);
    const amountInWords = /\b(um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|mil)\b/.test(normalized)
      && /\breais?\b/.test(normalized);
    const valid = validateDraft(draft, { categories: [...categories, ...localCategories] });
    const genericCategory = ["Other", "Income"].includes(draft?.category);
    const reasons = [];
    if (!valid) reasons.push("campos-obrigatorios");
    if (relativeDate) reasons.push("data-relativa");
    if (amountInWords) reasons.push("valor-por-extenso");
    if (genericCategory) reasons.push("categoria-generica");
    return Object.freeze({
      sufficient: Boolean(valid && !relativeDate && !amountInWords && !genericCategory),
      reasons: Object.freeze(reasons),
    });
  }

  function manualDraft(text, localDraft, options = {}) {
    const partial = typeof options.partialParser === "function"
      ? options.partialParser(text, { now: options.now })
      : null;
    const source = partial || localDraft || {};
    const description = String(source.description || "").trim().slice(0, MAX_DESCRIPTION_LENGTH);
    const draft = {
      type: ["expense", "income"].includes(source.type) ? source.type : "expense",
      amount: Number.isFinite(source.amount) && source.amount > 0 ? source.amount : null,
      currency: "BRL",
      category: [...categories, ...localCategories].includes(source.category) ? source.category : "Casa",
      description,
      paymentMethod: paymentMethods.includes(source.paymentMethod) ? source.paymentMethod : null,
      account: null,
      date: validDate(source.date) ? source.date : dateInputValue(options.now || new Date()),
    };
    if (Number.isInteger(source.installments) && source.installments >= 2 && source.installments <= 60) {
      draft.installments = source.installments;
    }
    return Object.freeze(draft);
  }

  function interpreterError(code, message) {
    const error = new Error(message || code);
    error.code = code;
    return error;
  }

  function normalizeError(error) {
    if (error?.code) return error;
    if (error?.name === "AbortError") return interpreterError("cancelled", "Interpretação cancelada.");
    if (error?.status === 429) return interpreterError("rate-limit", "Limite temporário atingido.");
    if (error?.status >= 500) return interpreterError("server-error", "Serviço temporariamente indisponível.");
    if (global.navigator && global.navigator.onLine === false) return interpreterError("offline", "Sem conexão com a internet.");
    return interpreterError("unavailable", "Interpretação remota indisponível.");
  }

  function createService(options = {}) {
    if (typeof options.invoke !== "function") throw new TypeError("AI interpreter invoke adapter is required.");
    const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
      ? options.timeoutMs
      : DEFAULT_TIMEOUT_MS;
    let generation = 0;
    let active = null;

    function cancel() {
      generation += 1;
      active?.controller.abort();
      active = null;
    }

    function interpret(request = {}) {
      const text = String(request.text || "").trim();
      if (!text || text.length > MAX_INPUT_LENGTH) {
        return Promise.reject(interpreterError("invalid-input", "Texto financeiro inválido."));
      }
      const referenceDate = validDate(request.referenceDate)
        ? request.referenceDate
        : dateInputValue(request.now || new Date());
      const key = `${referenceDate}:${normalizeText(text)}`;
      if (active?.key === key) return active.promise;
      if (active) cancel();
      const requestGeneration = ++generation;
      const controller = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
      const promise = Promise.resolve()
        .then(() => options.invoke({ text, referenceDate, locale: "pt-BR" }, { signal: controller.signal }))
        .then((response) => {
          if (requestGeneration !== generation) throw interpreterError("stale", "Resultado obsoleto descartado.");
          const validated = validateDraft(response?.draft || response, request);
          if (!validated) throw interpreterError("invalid-response", "Resposta de interpretação inválida.");
          return validated;
        })
        .catch((error) => {
          if (timedOut && error?.name === "AbortError") {
            throw interpreterError("timeout", "A interpretação demorou mais do que o esperado.");
          }
          throw normalizeError(error);
        })
        .finally(() => {
          clearTimeout(timer);
          if (active?.generation === requestGeneration) active = null;
        });
      active = { key, promise, controller, generation: requestGeneration };
      return promise;
    }

    return Object.freeze({ cancel, interpret });
  }

  core.aiInterpreter = Object.freeze({
    MAX_INPUT_LENGTH,
    assessLocalDraft,
    categories,
    createService,
    manualDraft,
    normalizeError,
    paymentMethods,
    validateDraft,
  });
})(globalThis);
