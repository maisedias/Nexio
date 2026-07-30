(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const utils = core.utils;
  const finance = core.finance;

  const types = Object.freeze([
    "checking",
    "savings",
    "cash",
    "digital-wallet",
    "investment",
    "other",
  ]);

  const typeLabels = Object.freeze({
    checking: "Conta corrente",
    savings: "Poupança",
    cash: "Dinheiro",
    "digital-wallet": "Carteira digital",
    investment: "Investimento",
    other: "Outra",
  });

  function timestamp(options = {}) {
    const value = typeof options.now === "function" ? options.now() : (options.now || new Date());
    return new Date(value).toISOString();
  }

  function finiteMoney(value, fallback = 0) {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : fallback;
  }

  function safeCurrency(value, fallback = "BRL") {
    const currency = String(value || "").trim().toUpperCase();
    if (finance.currencyLocales[currency]) return currency;
    const safeFallback = String(fallback || "BRL").trim().toUpperCase();
    return finance.currencyLocales[safeFallback] ? safeFallback : "BRL";
  }

  function accountName(value) {
    return utils.cleanImportedText(value);
  }

  function accountById(profile, accountId) {
    return (profile?.accounts || []).find((account) => account.id === accountId) || null;
  }

  function resolveAccountId(profile, accountId = "") {
    return accountById(profile, accountId)?.id || profile?.defaultAccountId || "";
  }

  function assignTransactionAccount(profile, transaction, accountId = transaction?.accountId) {
    if (!transaction || typeof transaction !== "object") return null;
    transaction.accountId = resolveAccountId(profile, accountId);
    return transaction;
  }

  function activeAccounts(profile) {
    return (profile?.accounts || []).filter((account) => account.active !== false);
  }

  function selectableAccounts(profile, currentAccountId = "") {
    return (profile?.accounts || []).filter((account) => account.active !== false || account.id === currentAccountId);
  }

  function uniqueAccountName(profile, name, excludedId = "") {
    const normalized = utils.normalizeText(name);
    return Boolean(normalized) && !(profile?.accounts || []).some((account) => (
      account.id !== excludedId && utils.normalizeText(account.name) === normalized
    ));
  }

  function create(input = {}, options = {}) {
    const createId = options.uid || utils.uid;
    const now = timestamp(options);
    return {
      id: input.id || createId("account"),
      name: accountName(input.name),
      type: types.includes(input.type) ? input.type : "checking",
      initialBalance: finiteMoney(input.initialBalance),
      currency: String(input.currency || options.currency || "BRL").trim().toUpperCase(),
      active: input.active !== false,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
    };
  }

  function validateInput(profile, input, excludedId = "") {
    const name = accountName(input?.name);
    if (!name) return { ok: false, error: "Informe o nome da conta." };
    if (!uniqueAccountName(profile, name, excludedId)) {
      return { ok: false, error: "Já existe uma conta com esse nome." };
    }
    if (!types.includes(input?.type)) return { ok: false, error: "Selecione um tipo de conta válido." };
    if (!Number.isFinite(Number(input?.initialBalance))) {
      return { ok: false, error: "Informe um saldo inicial válido." };
    }
    const requestedCurrency = String(input?.currency || "").trim().toUpperCase();
    if (requestedCurrency && !finance.currencyLocales[requestedCurrency]) {
      return { ok: false, error: "A moeda da conta não é válida." };
    }
    const profileCurrency = safeCurrency(profile?.accounts?.[0]?.currency || profile?.currency || requestedCurrency);
    if (requestedCurrency && requestedCurrency !== profileCurrency) {
      return { ok: false, error: "A moeda da conta deve seguir a moeda do perfil." };
    }
    return { ok: true, name };
  }

  function add(profile, input, options = {}) {
    const validation = validateInput(profile, input);
    if (!validation.ok) return validation;
    const account = create({
      ...input,
      name: validation.name,
      currency: safeCurrency(profile?.accounts?.[0]?.currency || options.currency || input.currency),
    }, { ...options, currency: safeCurrency(profile?.accounts?.[0]?.currency || options.currency || input.currency) });
    if (accountById(profile, account.id)) {
      const baseId = account.id;
      let suffix = 2;
      while (accountById(profile, `${baseId}-${suffix}`)) suffix += 1;
      account.id = `${baseId}-${suffix}`;
    }
    profile.accounts.push(account);
    if (!accountById(profile, profile.defaultAccountId) || (input.makeDefault && account.active)) {
      profile.defaultAccountId = account.id;
    }
    return { ok: true, account };
  }

  function update(profile, accountId, input, options = {}) {
    const account = accountById(profile, accountId);
    if (!account) return { ok: false, error: "Conta não encontrada." };
    const validation = validateInput(profile, input, accountId);
    if (!validation.ok) return validation;
    const active = input.active !== false;
    if (!active && account.active !== false && activeAccounts(profile).length === 1) {
      return { ok: false, error: "Mantenha pelo menos uma conta ativa." };
    }
    account.name = validation.name;
    account.type = input.type;
    account.initialBalance = finiteMoney(input.initialBalance);
    account.currency = safeCurrency(profile?.accounts?.[0]?.currency || options.currency || account.currency);
    account.active = active;
    account.updatedAt = timestamp(options);
    if (input.makeDefault && active) profile.defaultAccountId = account.id;
    if (profile.defaultAccountId === account.id && !active) {
      profile.defaultAccountId = activeAccounts(profile)[0]?.id || "";
    }
    return { ok: true, account };
  }

  function setActive(profile, accountId, active, options = {}) {
    const account = accountById(profile, accountId);
    if (!account) return { ok: false, error: "Conta não encontrada." };
    if (!active && account.active !== false && activeAccounts(profile).length === 1) {
      return { ok: false, error: "Mantenha pelo menos uma conta ativa." };
    }
    account.active = Boolean(active);
    account.updatedAt = timestamp(options);
    if (!account.active && profile.defaultAccountId === account.id) {
      profile.defaultAccountId = activeAccounts(profile)[0]?.id || "";
    }
    if (account.active && !accountById(profile, profile.defaultAccountId)) profile.defaultAccountId = account.id;
    return { ok: true, account };
  }

  function setDefault(profile, accountId, options = {}) {
    const account = accountById(profile, accountId);
    if (!account || account.active === false) {
      return { ok: false, error: "A conta padrão precisa estar ativa." };
    }
    profile.defaultAccountId = account.id;
    account.updatedAt = timestamp(options);
    return { ok: true, account };
  }

  function transactionCount(profile, accountId) {
    return (profile?.transactions || []).filter((transaction) => transaction.accountId === accountId).length;
  }

  function remove(profile, accountId) {
    const account = accountById(profile, accountId);
    if (!account) return { ok: false, error: "Conta não encontrada." };
    if (transactionCount(profile, accountId)) {
      return { ok: false, error: "Esta conta possui transações e não pode ser excluída." };
    }
    if ((profile.accounts || []).length === 1) {
      return { ok: false, error: "Mantenha pelo menos uma conta no perfil." };
    }
    profile.accounts = profile.accounts.filter((item) => item.id !== accountId);
    if (profile.defaultAccountId === accountId) {
      profile.defaultAccountId = activeAccounts(profile)[0]?.id || profile.accounts[0]?.id || "";
    }
    return { ok: true, account };
  }

  function nextUniqueNormalizedName(accounts, desired) {
    const base = accountName(desired) || "Conta";
    const used = new Set(accounts.map((account) => utils.normalizeText(account.name)).filter(Boolean));
    if (!used.has(utils.normalizeText(base))) return base;
    let suffix = 2;
    while (used.has(utils.normalizeText(`${base} (${suffix})`))) suffix += 1;
    return `${base} (${suffix})`;
  }

  function normalizeProfile(profile, options = {}) {
    const createId = options.uid || utils.uid;
    const currency = safeCurrency(options.currency || profile.currency);
    const sourceAccounts = Array.isArray(profile.accounts)
      ? profile.accounts.filter((account) => account && typeof account === "object" && !Array.isArray(account))
      : [];
    const normalized = [];
    const ids = new Set();
    sourceAccounts.forEach((source) => {
      const account = source;
      if (!account.id || ids.has(account.id)) {
        const baseId = createId("account");
        let candidate = baseId;
        let suffix = 2;
        while (ids.has(candidate)) {
          candidate = `${baseId}-${suffix}`;
          suffix += 1;
        }
        account.id = candidate;
      }
      ids.add(account.id);
      account.name = nextUniqueNormalizedName(normalized, account.name || "Conta");
      if (!account.type) account.type = "other";
      account.initialBalance = finiteMoney(account.initialBalance);
      account.currency = safeCurrency(options.currency || account.currency, currency);
      account.active = account.active !== false;
      const now = timestamp(options);
      account.createdAt = account.createdAt || now;
      account.updatedAt = account.updatedAt || account.createdAt;
      normalized.push(account);
    });

    if (!normalized.length) {
      normalized.push(create({
        name: "Conta principal",
        type: "checking",
        initialBalance: 0,
        currency,
        active: true,
      }, { ...options, uid: createId, currency }));
    }
    profile.accounts = normalized;

    if (!activeAccounts(profile).length) normalized[0].active = true;
    const requestedDefault = accountById(profile, profile.defaultAccountId);
    if (!requestedDefault || requestedDefault.active === false) {
      profile.defaultAccountId = activeAccounts(profile)[0]?.id || normalized[0].id;
    }

    (profile.transactions || []).forEach((transaction) => {
      assignTransactionAccount(profile, transaction);
    });
    return profile;
  }

  function transactionsFor(profile, accountId = "all") {
    const transactions = Array.isArray(profile?.transactions) ? profile.transactions : [];
    if (!accountId || accountId === "all") return transactions;
    return transactions.filter((transaction) => transaction.accountId === accountId);
  }

  function balance(profile, accountId) {
    const account = accountById(profile, accountId);
    if (!account) return 0;
    return finiteMoney(account.initialBalance) + finance.calculateBalance(transactionsFor(profile, account.id));
  }

  function consolidatedBalance(profile, options = {}) {
    const includeInactive = options.includeInactive === true;
    return (profile?.accounts || [])
      .filter((account) => includeInactive || account.active !== false)
      .reduce((total, account) => total + balance(profile, account.id), 0);
  }

  function balances(profile, options = {}) {
    const includeInactive = options.includeInactive !== false;
    return (profile?.accounts || [])
      .filter((account) => includeInactive || account.active !== false)
      .map((account) => ({
        account,
        balance: balance(profile, account.id),
        transactionCount: transactionCount(profile, account.id),
      }));
  }

  function isTransfer(transaction) {
    return Boolean(transaction?.transferId);
  }

  function transferPair(profile, transferId) {
    return (profile?.transactions || []).filter((transaction) => transaction.transferId === transferId);
  }

  function validateTransfer(profile, input) {
    const from = accountById(profile, input?.fromAccountId);
    const to = accountById(profile, input?.toAccountId);
    if (!from || !to) return { ok: false, error: "Selecione contas válidas do perfil atual." };
    if (from.id === to.id) return { ok: false, error: "Escolha contas de origem e destino diferentes." };
    if (from.active === false || to.active === false) return { ok: false, error: "Transferências exigem contas ativas." };
    const fromCurrency = String(from.currency || "").trim().toUpperCase();
    const toCurrency = String(to.currency || "").trim().toUpperCase();
    if (!finance.currencyLocales[fromCurrency] || !finance.currencyLocales[toCurrency] || fromCurrency !== toCurrency) {
      return { ok: false, error: "As contas da transferência precisam usar a mesma moeda." };
    }
    const amount = Number(input?.amount);
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Informe um valor de transferência válido." };
    if (!String(input?.date || "").trim()) return { ok: false, error: "Informe a data da transferência." };
    return { ok: true, from, to, amount };
  }

  function validateTransferPair(profile, transferId) {
    const pair = transferPair(profile, transferId);
    if (pair.length !== 2) return { ok: false, error: "O par da transferência está incompleto.", pair };
    const outgoing = pair.find((transaction) => transaction.transferDirection === "out");
    const incoming = pair.find((transaction) => transaction.transferDirection === "in");
    if (!outgoing || !incoming || outgoing === incoming) {
      return { ok: false, error: "O par da transferência está corrompido.", pair };
    }
    const from = accountById(profile, outgoing.accountId);
    const to = accountById(profile, incoming.accountId);
    const amount = Number(outgoing.amount);
    const consistent = outgoing.id && incoming.id && outgoing.id !== incoming.id &&
      from && to && from.id !== to.id &&
      outgoing.type === "expense" && incoming.type === "income" &&
      outgoing.status === "Pago" && incoming.status === "Recebido" &&
      outgoing.transferAccountId === incoming.accountId && incoming.transferAccountId === outgoing.accountId &&
      Number.isFinite(amount) && amount > 0 && amount === Number(incoming.amount) &&
      outgoing.date === incoming.date && outgoing.description === incoming.description &&
      finance.currencyLocales[String(from.currency || "").trim().toUpperCase()] &&
      String(from.currency || "").trim().toUpperCase() === String(to.currency || "").trim().toUpperCase();
    if (!consistent) return { ok: false, error: "O par da transferência está corrompido.", pair };
    return { ok: true, pair, outgoing, incoming, from, to, amount };
  }

  function uniqueGeneratedId(createId, prefix, used) {
    const baseId = createId(prefix);
    let candidate = baseId;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${baseId}-${suffix}`;
      suffix += 1;
    }
    used.add(candidate);
    return candidate;
  }

  function transferTransactions(profile, input, options = {}) {
    const validation = validateTransfer(profile, input);
    if (!validation.ok) return validation;
    const createId = options.uid || utils.uid;
    let transferId = input.transferId || createId("transfer");
    if (!input.transferId) {
      const baseId = transferId;
      let suffix = 2;
      const used = new Set((profile.transactions || []).map((transaction) => transaction.transferId).filter(Boolean));
      while (used.has(transferId)) {
        transferId = `${baseId}-${suffix}`;
        suffix += 1;
      }
    }
    const now = timestamp(options);
    const description = accountName(input.description) || `Transferência: ${validation.from.name} → ${validation.to.name}`;
    const usedTransactionIds = new Set((profile.transactions || []).map((transaction) => transaction.id).filter(Boolean));
    const shared = {
      amount: validation.amount,
      date: input.date,
      categoryId: input.categoryId || "",
      transferId,
      createdAt: now,
      updatedAt: now,
    };
    const expense = {
      ...shared,
      id: uniqueGeneratedId(createId, "trx", usedTransactionIds),
      type: "expense",
      description,
      status: "Pago",
      accountId: validation.from.id,
      transferDirection: "out",
      transferAccountId: validation.to.id,
    };
    const income = {
      ...shared,
      id: uniqueGeneratedId(createId, "trx", usedTransactionIds),
      type: "income",
      description,
      status: "Recebido",
      accountId: validation.to.id,
      transferDirection: "in",
      transferAccountId: validation.from.id,
    };
    return { ok: true, transferId, transactions: [expense, income] };
  }

  function createTransfer(profile, input, options = {}) {
    const result = transferTransactions(profile, input, options);
    if (!result.ok) return result;
    profile.transactions.push(...result.transactions);
    return result;
  }

  function updateTransfer(profile, transferId, input, options = {}) {
    const pairValidation = validateTransferPair(profile, transferId);
    if (!pairValidation.ok) return pairValidation;
    const existing = pairValidation.pair;
    const next = transferTransactions(profile, { ...input, transferId }, options);
    if (!next.ok) return next;
    const existingByDirection = new Map(existing.map((transaction) => [transaction.transferDirection, transaction]));
    next.transactions.forEach((transaction) => {
      const previous = existingByDirection.get(transaction.transferDirection);
      if (!previous) return;
      transaction.id = previous.id;
      transaction.createdAt = previous.createdAt;
    });
    const ids = new Set(existing.map((transaction) => transaction.id));
    profile.transactions = profile.transactions.map((transaction) => {
      if (!ids.has(transaction.id)) return transaction;
      return next.transactions.find((item) => item.id === transaction.id) || transaction;
    });
    return next;
  }

  function deleteTransfer(profile, transferId) {
    const validation = validateTransferPair(profile, transferId);
    if (!validation.ok) return validation;
    const pair = validation.pair;
    profile.transactions = profile.transactions.filter((transaction) => transaction.transferId !== transferId);
    return { ok: true, deleted: pair.length };
  }

  core.accounts = Object.freeze({
    accountById,
    accountName,
    activeAccounts,
    add,
    assignTransactionAccount,
    balance,
    balances,
    consolidatedBalance,
    create,
    createTransfer,
    deleteTransfer,
    isTransfer,
    normalizeProfile,
    remove,
    resolveAccountId,
    selectableAccounts,
    setActive,
    setDefault,
    transactionCount,
    transactionsFor,
    transferPair,
    typeLabels,
    types,
    uniqueAccountName,
    update,
    updateTransfer,
    validateInput,
    validateTransfer,
    validateTransferPair,
  });
})(globalThis);
