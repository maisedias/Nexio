(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const utils = core.utils;
  const finance = core.finance;
  const defaultIncomeCategoryNames = new Set(["salario", "freelance"]);
  const statusLabels = Object.freeze({
    healthy: "Saudável",
    warning: "Atenção",
    exceeded: "Excedido",
  });

  function nowValue(options = {}) {
    const value = typeof options.now === "function" ? options.now() : options.now;
    return value instanceof Date ? value : new Date();
  }

  function isValidMonth(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})$/);
    return Boolean(match && Number(match[2]) >= 1 && Number(match[2]) <= 12);
  }

  function nextMonth(value) {
    if (!isValidMonth(value)) return "";
    const date = utils.parseLocalDate(`${value}-01`);
    date.setMonth(date.getMonth() + 1);
    return utils.toMonthInput(date);
  }

  function budgetById(profile, budgetId) {
    return (profile?.budgets || []).find((budget) => budget.id === budgetId) || null;
  }

  function categoryById(profile, categoryId) {
    return (profile?.categories || []).find((category) => category.id === categoryId) || null;
  }

  function categoryKind(profile, categoryOrId) {
    const category = typeof categoryOrId === "object" ? categoryOrId : categoryById(profile, categoryOrId);
    if (!category) return "unknown";
    const explicit = utils.normalizeText(category.type || category.kind || "");
    if (["expense", "despesa", "saida"].includes(explicit)) return "expense";
    if (["income", "receita", "entrada"].includes(explicit)) return "income";
    const transactions = (profile?.transactions || []).filter((transaction) => (
      transaction.categoryId === category.id && !transaction.transferId
    ));
    if (transactions.some((transaction) => transaction.type === "expense")) return "expense";
    if (transactions.some((transaction) => transaction.type === "income")) return "income";
    return defaultIncomeCategoryNames.has(utils.normalizeText(category.name)) ? "income" : "expense";
  }

  function expenseCategories(profile) {
    return (profile?.categories || []).filter((category) => categoryKind(profile, category) === "expense");
  }

  function normalizeProfile(profile) {
    if (!profile || typeof profile !== "object") return profile;
    if (!Array.isArray(profile.budgets)) profile.budgets = [];
    return profile;
  }

  function cloneSafeBudget(value) {
    const source = value && typeof value === "object" ? value : {};
    const sanitized = core.storage?.sanitizeSensitiveData
      ? core.storage.sanitizeSensitiveData(source)
      : source;
    try {
      return JSON.parse(JSON.stringify(sanitized));
    } catch (error) {
      return {};
    }
  }

  function positiveFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function finiteTotal(items, valueOf) {
    return items.reduce((total, item) => {
      const next = total + positiveFiniteNumber(valueOf(item));
      return Number.isFinite(next) ? next : Number.MAX_VALUE;
    }, 0);
  }

  function finitePercent(value, limit) {
    if (!(limit > 0)) return 0;
    return Math.min((value / limit) * 100, Number.MAX_VALUE);
  }

  function uniqueId(profile, options = {}, prefix = "budget") {
    const createId = options.uid || utils.uid;
    const used = new Set((profile?.budgets || []).map((budget) => budget.id).filter(Boolean));
    const base = createId(prefix);
    let candidate = base;
    let suffix = 2;
    while (!candidate || used.has(candidate)) {
      candidate = `${base || prefix}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  function validate(profile, input, excludedId = "") {
    normalizeProfile(profile);
    const category = categoryById(profile, input?.categoryId);
    if (!category) return { ok: false, error: "Selecione uma categoria existente." };
    if (categoryKind(profile, category) !== "expense") {
      return { ok: false, error: "Use somente uma categoria de despesa." };
    }
    const month = String(input?.month || "").trim();
    if (!isValidMonth(month)) return { ok: false, error: "Informe um mês válido." };
    const limit = Number(input?.limit);
    if (!Number.isFinite(limit) || limit <= 0) {
      return { ok: false, error: "Informe um limite mensal maior que zero." };
    }
    const rawThreshold = input?.alertThreshold === undefined || input?.alertThreshold === ""
      ? 80
      : Number(input.alertThreshold);
    if (!Number.isFinite(rawThreshold) || rawThreshold < 1 || rawThreshold > 100) {
      return { ok: false, error: "O alerta deve ficar entre 1% e 100%." };
    }
    if (input?.active !== undefined && typeof input.active !== "boolean") {
      return { ok: false, error: "O estado do orçamento não é válido." };
    }
    const active = input?.active !== false;
    const duplicate = (profile.budgets || []).some((budget) => (
      budget.id !== excludedId && budget.active !== false && active &&
      budget.categoryId === category.id && budget.month === month
    ));
    if (duplicate) {
      return { ok: false, error: "Já existe um orçamento ativo para esta categoria e mês." };
    }
    return { ok: true, category, month, limit, alertThreshold: rawThreshold, active };
  }

  function add(profile, input, options = {}) {
    const validation = validate(profile, input);
    if (!validation.ok) return validation;
    const timestamp = nowValue(options).toISOString();
    const budget = {
      id: uniqueId(profile, options),
      categoryId: validation.category.id,
      month: validation.month,
      limit: validation.limit,
      alertThreshold: validation.alertThreshold,
      active: validation.active,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    profile.budgets.push(budget);
    return { ok: true, budget };
  }

  function update(profile, budgetId, input, options = {}) {
    const budget = budgetById(profile, budgetId);
    if (!budget) return { ok: false, error: "Orçamento não encontrado." };
    const validation = validate(profile, input, budgetId);
    if (!validation.ok) return validation;
    budget.categoryId = validation.category.id;
    budget.month = validation.month;
    budget.limit = validation.limit;
    budget.alertThreshold = validation.alertThreshold;
    budget.active = validation.active;
    budget.updatedAt = nowValue(options).toISOString();
    return { ok: true, budget };
  }

  function setActive(profile, budgetId, active, options = {}) {
    const budget = budgetById(profile, budgetId);
    if (!budget) return { ok: false, error: "Orçamento não encontrado." };
    if (typeof active !== "boolean") return { ok: false, error: "O estado do orçamento não é válido." };
    return update(profile, budgetId, { ...budget, active }, options);
  }

  function remove(profile, budgetId) {
    normalizeProfile(profile);
    if (!budgetById(profile, budgetId)) return { ok: false, error: "Orçamento não encontrado." };
    profile.budgets = profile.budgets.filter((budget) => budget.id !== budgetId);
    return { ok: true };
  }

  function accountFilter(profile, accountId = "all") {
    if (!accountId || accountId === "all") return { ok: true, accountId: "all" };
    if (!(profile?.accounts || []).some((account) => account.id === accountId)) {
      return { ok: false, error: "A conta selecionada não pertence a este perfil." };
    }
    return { ok: true, accountId };
  }

  function calculation(profile, budget, options = {}) {
    const filter = accountFilter(profile, options.accountId || "all");
    if (!filter.ok) return filter;
    const limit = positiveFiniteNumber(budget?.limit);
    const transactions = (profile?.transactions || []).filter((transaction) => (
      transaction.type === "expense" &&
      !transaction.transferId &&
      transaction.categoryId === budget.categoryId &&
      String(transaction.date || "").slice(0, 7) === budget.month &&
      (filter.accountId === "all" || transaction.accountId === filter.accountId)
    ));
    const spent = finiteTotal(
      transactions.filter((transaction) => finance.isSettledTransaction(transaction)),
      (transaction) => transaction.amount,
    );
    const committed = finiteTotal(
      transactions.filter((transaction) => finance.isSettledTransaction(transaction) || finance.isOpenTransaction(transaction)),
      (transaction) => transaction.amount,
    );
    const spentPercent = finitePercent(spent, limit);
    const committedPercent = finitePercent(committed, limit);
    const rawThreshold = Number(budget?.alertThreshold);
    const threshold = Number.isFinite(rawThreshold) && rawThreshold >= 1 && rawThreshold <= 100
      ? rawThreshold
      : 80;
    const status = committedPercent >= 100 ? "exceeded" : committedPercent >= threshold ? "warning" : "healthy";
    const remainingSpent = limit - spent;
    const remainingCommitted = limit - committed;
    return {
      ok: true,
      budget,
      category: categoryById(profile, budget.categoryId),
      transactions,
      limit,
      spent,
      committed,
      remainingSpent,
      remainingCommitted,
      exceededBy: Math.max(-remainingCommitted, 0),
      spentPercent,
      committedPercent,
      status,
      statusLabel: statusLabels[status],
    };
  }

  function summary(profile, month, options = {}) {
    const filter = accountFilter(profile, options.accountId || "all");
    if (!filter.ok) return { ...filter, items: [] };
    normalizeProfile(profile);
    const items = profile.budgets
      .filter((budget) => budget.month === month && (options.includeInactive || budget.active !== false))
      .map((budget) => calculation(profile, budget, { accountId: filter.accountId }))
      .filter((item) => item.ok);
    return {
      ok: true,
      month,
      accountId: filter.accountId,
      items,
      planned: finiteTotal(items, (item) => item.limit),
      spent: finiteTotal(items, (item) => item.spent),
      committed: finiteTotal(items, (item) => item.committed),
    };
  }

  function dashboard(profile, month, options = {}) {
    const priority = { exceeded: 0, warning: 1, healthy: 2 };
    const result = summary(profile, month, options);
    if (!result.ok) return result;
    return {
      ...result,
      items: [...result.items]
        .sort((a, b) => priority[a.status] - priority[b.status] || b.committedPercent - a.committedPercent)
        .slice(0, options.limit || 4),
    };
  }

  function copyToMonth(profile, budgetId, targetMonth, options = {}) {
    const budget = budgetById(profile, budgetId);
    if (!budget) return { ok: false, error: "Orçamento não encontrado.", copied: 0, ignored: 0 };
    if (!isValidMonth(targetMonth)) return { ok: false, error: "O mês de destino não é válido.", copied: 0, ignored: 0 };
    const duplicate = profile.budgets.some((item) => item.categoryId === budget.categoryId && item.month === targetMonth);
    if (duplicate) return { ok: true, copied: 0, ignored: 1, budgets: [] };
    const source = cloneSafeBudget(budget);
    const result = add(profile, {
      categoryId: budget.categoryId,
      month: targetMonth,
      limit: budget.limit,
      alertThreshold: budget.alertThreshold,
      active: budget.active !== false,
    }, options);
    if (!result.ok) return { ...result, copied: 0, ignored: 1, budgets: [] };
    const copiedBudget = { ...source, ...result.budget };
    const index = profile.budgets.indexOf(result.budget);
    profile.budgets[index] = copiedBudget;
    return { ok: true, copied: 1, ignored: 0, budgets: [copiedBudget] };
  }

  function copyNextMonth(profile, budgetId, options = {}) {
    const budget = budgetById(profile, budgetId);
    if (!budget) return { ok: false, error: "Orçamento não encontrado.", copied: 0, ignored: 0 };
    return copyToMonth(profile, budgetId, nextMonth(budget.month), options);
  }

  function copyAllNextMonth(profile, month, options = {}) {
    if (!isValidMonth(month)) return { ok: false, error: "O mês de origem não é válido.", copied: 0, ignored: 0, budgets: [] };
    const source = (profile?.budgets || []).filter((budget) => budget.month === month);
    const target = nextMonth(month);
    const result = { ok: true, copied: 0, ignored: 0, budgets: [], targetMonth: target };
    source.forEach((budget) => {
      const copied = copyToMonth(profile, budget.id, target, options);
      result.copied += copied.copied || 0;
      result.ignored += copied.ignored || 0;
      result.budgets.push(...(copied.budgets || []));
    });
    return result;
  }

  function importInto(profile, sourceBudgets, options = {}) {
    normalizeProfile(profile);
    const source = Array.isArray(sourceBudgets) ? sourceBudgets : [];
    const categoryIdMap = options.categoryIdMap || new Map();
    const result = { imported: 0, ignored: 0, budgets: [] };
    source.forEach((rawBudget) => {
      const originalCategoryId = rawBudget?.categoryId;
      const mappedCategoryId = categoryIdMap.get(originalCategoryId) || originalCategoryId;
      const candidate = { ...cloneSafeBudget(rawBudget), categoryId: mappedCategoryId };
      const duplicateShape = profile.budgets.some((budget) => (
        budget.categoryId === candidate.categoryId && budget.month === candidate.month
      ));
      if (duplicateShape) {
        result.ignored += 1;
        return;
      }
      const validation = validate(profile, candidate);
      if (!validation.ok) {
        result.ignored += 1;
        return;
      }
      const sameId = candidate.id && budgetById(profile, candidate.id);
      const timestamp = nowValue(options).toISOString();
      const importedBudget = {
        ...candidate,
        id: sameId || !candidate.id ? uniqueId(profile, options) : candidate.id,
        categoryId: validation.category.id,
        month: validation.month,
        limit: validation.limit,
        alertThreshold: validation.alertThreshold,
        active: validation.active,
        createdAt: candidate.createdAt || timestamp,
        updatedAt: candidate.updatedAt || timestamp,
      };
      profile.budgets.push(importedBudget);
      result.imported += 1;
      result.budgets.push(importedBudget);
    });
    return result;
  }

  function sanitizeImportedProfile(profile, options = {}) {
    const source = Array.isArray(profile?.budgets) ? profile.budgets : [];
    profile.budgets = [];
    return importInto(profile, source, options);
  }

  core.budgets = Object.freeze({
    accountFilter,
    add,
    budgetById,
    calculation,
    categoryKind,
    copyAllNextMonth,
    copyNextMonth,
    copyToMonth,
    dashboard,
    expenseCategories,
    importInto,
    isValidMonth,
    nextMonth,
    normalizeProfile,
    remove,
    sanitizeImportedProfile,
    setActive,
    statusLabels,
    summary,
    update,
    validate,
  });
})(globalThis);
