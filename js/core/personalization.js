(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const STORAGE_PREFIX = "nexio-assistant-personalization-v1";
  const MAX_RECORDS = 300;
  const MIN_OCCURRENCES = 3;
  const MIN_CONFIDENCE = 0.75;
  const paymentMethods = new Set([
    "Credit Card", "Debit Card", "Pix", "Cash", "Bank Transfer", "Boleto",
  ]);

  function normalizeMerchant(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function baseMerchant(value) {
    return normalizeMerchant(value)
      .replace(/\s+(?:loja|filial|unidade)\s+\d{1,5}$/i, "")
      .trim();
  }

  function merchantsMatch(first, second) {
    const left = normalizeMerchant(first);
    const right = normalizeMerchant(second);
    if (!left || !right) return false;
    if (left === right) return true;
    const leftBase = baseMerchant(left);
    const rightBase = baseMerchant(right);
    return leftBase.length >= 5 && leftBase === rightBase;
  }

  function storageKey(ownerId, profileId) {
    const owner = encodeURIComponent(String(ownerId || "").trim()).slice(0, 180);
    const profile = encodeURIComponent(String(profileId || "").trim()).slice(0, 180);
    if (!owner || !profile) return "";
    return `${STORAGE_PREFIX}:${owner}:${profile}`;
  }

  function isoDate(value) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function validProfileCategory(profile, categoryId) {
    return (profile?.categories || []).some((category) => category.id === categoryId);
  }

  function validProfileAccount(profile, accountId) {
    return (profile?.accounts || []).some((account) => account.id === accountId && account.active !== false);
  }

  function normalizeRecord(record) {
    const merchant = normalizeMerchant(record?.merchant);
    const type = ["expense", "income"].includes(record?.type) ? record.type : null;
    if (!merchant || !type) return null;
    return {
      merchant,
      type,
      categoryId: typeof record.categoryId === "string" && record.categoryId ? record.categoryId : null,
      paymentMethod: paymentMethods.has(record.paymentMethod) ? record.paymentMethod : null,
      accountId: typeof record.accountId === "string" && record.accountId ? record.accountId : null,
      confirmedAt: isoDate(record.confirmedAt),
    };
  }

  function normalizeState(value) {
    const records = Array.isArray(value?.records)
      ? value.records.map(normalizeRecord).filter(Boolean).slice(-MAX_RECORDS)
      : [];
    return {
      version: 1,
      enabled: value?.enabled !== false,
      seeded: value?.seeded === true,
      clearedAt: typeof value?.clearedAt === "string" ? value.clearedAt : null,
      records,
    };
  }

  function recordFromTransaction(transaction, profile, metadata = {}) {
    const merchant = normalizeMerchant(transaction?.description);
    const type = ["expense", "income"].includes(transaction?.type) ? transaction.type : null;
    if (!merchant || !type) return null;
    const categoryId = validProfileCategory(profile, transaction.categoryId) ? transaction.categoryId : null;
    const accountId = validProfileAccount(profile, transaction.accountId) ? transaction.accountId : null;
    const paymentMethod = paymentMethods.has(metadata.paymentMethod) ? metadata.paymentMethod : null;
    return normalizeRecord({
      merchant,
      type,
      categoryId,
      paymentMethod,
      accountId,
      confirmedAt: metadata.confirmedAt || transaction.updatedAt || transaction.createdAt,
    });
  }

  function strongestPreference(records, field, validator = () => true) {
    const valid = records.map((record) => record[field]).filter((value) => value && validator(value));
    if (valid.length < MIN_OCCURRENCES) return null;
    const counts = new Map();
    valid.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    const ranked = [...counts.entries()].sort((left, right) => right[1] - left[1]);
    if (!ranked.length || ranked[0][1] < MIN_OCCURRENCES) return null;
    if (ranked[1]?.[1] === ranked[0][1]) return null;
    const confidence = ranked[0][1] / valid.length;
    if (confidence < MIN_CONFIDENCE) return null;
    return Object.freeze({ value: ranked[0][0], occurrences: ranked[0][1], confidence });
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function explicitFields(text, draft, profile) {
    const normalized = normalizeMerchant(text);
    const merchant = normalizeMerchant(draft?.description);
    const withoutMerchant = merchant ? normalized.replace(merchant, " ").replace(/\s+/g, " ").trim() : normalized;
    const categoryNames = (profile?.categories || []).map((category) => normalizeMerchant(category.name)).filter(Boolean);
    const draftCategory = normalizeMerchant(draft?.category);
    const explicitCategory = Boolean(draftCategory && !["other", "outros", "nao identificada"].includes(draftCategory))
      || /\b(?:categoria|mercado|supermercado|combustivel|gasolina|posto|farmacia|restaurante|padaria|salario|freelance|transporte|saude|lazer)\b/.test(withoutMerchant)
      || categoryNames.some((name) => new RegExp(`(?:^|\\s)${escapeRegExp(name).replace(/\s+/g, "\\s+")}(?:$|\\s)`).test(withoutMerchant));
    return Object.freeze({
      type: Boolean(draft?.type),
      category: explicitCategory,
      paymentMethod: Boolean(draft?.paymentMethod) || /\b(?:pix|credito|debito|dinheiro|especie|boleto|ted|doc|transferencia)\b/.test(normalized),
      account: Boolean(draft?.account || draft?.accountId) || /\b(?:conta|banco)\b/.test(withoutMerchant),
    });
  }

  function createEngine(options = {}) {
    const storage = options.storage;
    const key = storageKey(options.ownerId, options.profileId);
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function" || !key) {
      throw new TypeError("Personalization storage and scoped owner/profile identifiers are required.");
    }
    let state;
    try {
      state = normalizeState(JSON.parse(storage.getItem(key) || "{}"));
    } catch {
      state = normalizeState({});
    }

    function persist(nextState) {
      try {
        storage.setItem(key, JSON.stringify(nextState));
        state = nextState;
        return true;
      } catch {
        return false;
      }
    }

    function seed(transactions, profile) {
      if (state.seeded) return Object.freeze({ ok: true, added: 0 });
      const source = Array.isArray(transactions) ? transactions.slice(-MAX_RECORDS) : [];
      const records = source.map((transaction) => recordFromTransaction(transaction, profile)).filter(Boolean);
      const next = normalizeState({ ...state, seeded: true, records });
      return Object.freeze({ ok: persist(next), added: records.length });
    }

    function record(transaction, profile, metadata = {}) {
      const learned = recordFromTransaction(transaction, profile, metadata);
      if (!learned) return Object.freeze({ ok: false, reason: "invalid-confirmed-transaction" });
      const next = normalizeState({ ...state, records: [...state.records, learned] });
      return Object.freeze({ ok: persist(next), record: learned });
    }

    function setEnabled(enabled) {
      const next = normalizeState({ ...state, enabled: Boolean(enabled) });
      return persist(next);
    }

    function clear() {
      const next = normalizeState({
        ...state,
        records: [],
        seeded: true,
        clearedAt: isoDate(typeof options.now === "function" ? options.now() : options.now),
      });
      return persist(next);
    }

    function suggest(draft, profile, metadata = {}) {
      const original = draft && typeof draft === "object" ? draft : {};
      const result = { ...original };
      const suggestedFields = {};
      if (!state.enabled) return Object.freeze({ draft: Object.freeze(result), suggestedFields: Object.freeze(suggestedFields), applied: false });
      const merchant = normalizeMerchant(original.description);
      if (!merchant) return Object.freeze({ draft: Object.freeze(result), suggestedFields: Object.freeze(suggestedFields), applied: false });
      const matching = state.records.filter((record) => merchantsMatch(record.merchant, merchant));
      const typed = original.type ? matching.filter((record) => record.type === original.type) : matching;
      const explicit = { ...explicitFields(metadata.text, original, profile), ...(metadata.explicitFields || {}) };

      if (!original.type) {
        const type = strongestPreference(matching, "type", (value) => ["expense", "income"].includes(value));
        if (type) {
          result.type = type.value;
          suggestedFields.type = type;
        }
      }
      if (!explicit.category) {
        const category = strongestPreference(typed, "categoryId", (value) => validProfileCategory(profile, value));
        if (category) {
          const current = profile.categories.find((item) => item.id === category.value);
          result.categoryId = category.value;
          result.category = current.name;
          suggestedFields.category = category;
        }
      }
      if (!explicit.paymentMethod && !original.paymentMethod) {
        const payment = strongestPreference(typed, "paymentMethod", (value) => paymentMethods.has(value));
        if (payment) {
          result.paymentMethod = payment.value;
          suggestedFields.paymentMethod = payment;
        }
      }
      if (!explicit.account && !original.account && !original.accountId) {
        const account = strongestPreference(typed, "accountId", (value) => validProfileAccount(profile, value));
        if (account) {
          result.accountId = account.value;
          suggestedFields.account = account;
        }
      }
      return Object.freeze({
        draft: Object.freeze(result),
        suggestedFields: Object.freeze(suggestedFields),
        applied: Object.keys(suggestedFields).length > 0,
      });
    }

    function snapshot() {
      return Object.freeze({ ...state, records: Object.freeze(state.records.map((record) => Object.freeze({ ...record }))) });
    }

    return Object.freeze({ clear, key, record, seed, setEnabled, snapshot, suggest });
  }

  function learnAfterConfirmation(engine, transaction, profile, metadata = {}) {
    if (!engine || metadata.confirmed !== true || metadata.saved !== true) {
      return Object.freeze({ ok: false, reason: "not-confirmed-and-saved" });
    }
    return engine.record(transaction, profile, metadata);
  }

  core.personalization = Object.freeze({
    MAX_RECORDS,
    MIN_CONFIDENCE,
    MIN_OCCURRENCES,
    createEngine,
    explicitFields,
    learnAfterConfirmation,
    merchantsMatch,
    normalizeMerchant,
    storageKey,
    strongestPreference,
  });
})(globalThis);
