(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const { accounts, budgets, finance, goals, utils } = core;

  function dateInput(value, fallback) {
    if (typeof value === "string" && validDate(value)) return value;
    const date = value instanceof Date ? new Date(value) : new Date(value || fallback);
    return Number.isNaN(date.valueOf()) ? utils.toDateInput(new Date(fallback)) : utils.toDateInput(date);
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))
      && utils.toDateInput(utils.parseLocalDate(value)) === value;
  }

  function monthPeriod(month) {
    const start = `${month}-01`;
    return { kind: "month", start, end: utils.toDateInput(new Date(utils.parseLocalDate(start).getFullYear(), utils.parseLocalDate(start).getMonth() + 1, 0)) };
  }

  function createPeriod(input = {}, options = {}) {
    const referenceDate = dateInput(options.referenceDate, new Date());
    const reference = utils.parseLocalDate(referenceDate);
    const source = typeof input === "string" ? { type: input } : (input || {});
    const type = source.type || "current-month";
    if (type === "today") return { kind: "today", start: referenceDate, end: referenceDate };
    if (type === "week") {
      const start = new Date(reference);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { kind: "week", start: utils.toDateInput(start), end: utils.toDateInput(end) };
    }
    if (type === "previous-month") return monthPeriod(utils.shiftMonthValue(utils.toMonthInput(reference), -1));
    if (type === "month") return monthPeriod(source.month || utils.toMonthInput(reference));
    if (type === "custom" && validDate(source.start) && validDate(source.end) && source.start <= source.end) {
      return { kind: "custom", start: source.start, end: source.end };
    }
    return monthPeriod(utils.toMonthInput(reference));
  }

  function equivalentPeriod(period) {
    const startDate = utils.parseLocalDate(period.start);
    const endDate = utils.parseLocalDate(period.end);
    const priorStart = utils.addMonthsToDate(period.start, -1);
    const priorMonthEnd = utils.toDateInput(new Date(startDate.getFullYear(), startDate.getMonth(), 0));
    const span = Math.round((endDate - startDate) / 86400000);
    const candidateEnd = utils.toDateInput(new Date(utils.parseLocalDate(priorStart).getFullYear(), utils.parseLocalDate(priorStart).getMonth(), utils.parseLocalDate(priorStart).getDate() + span));
    return {
      kind: "equivalent-previous",
      start: priorStart,
      end: candidateEnd > priorMonthEnd ? priorMonthEnd : candidateEnd,
    };
  }

  function scopeFor(profile, requestedAccountId, includeInactive) {
    const allAccounts = Array.isArray(profile?.accounts) ? profile.accounts : [];
    const requested = requestedAccountId || "all";
    const selected = requested === "all"
      ? allAccounts.filter((account) => includeInactive || account.active !== false)
      : allAccounts.filter((account) => account.id === requested);
    return {
      accountId: requested,
      accountIds: selected.map((account) => account.id),
      includesInactive: includeInactive === true,
      accounts: selected.map((account) => ({ id: account.id, name: account.name, active: account.active !== false })),
    };
  }

  function sum(items) {
    return items.reduce((total, item) => total + Number(item.amount || 0), 0);
  }

  function categoryName(profile, categoryId) {
    return (profile?.categories || []).find((category) => category.id === categoryId)?.name || "Categoria";
  }

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function trace(value, meaning, scope, period, referenceDate, ids, rule) {
    return {
      value,
      meaning,
      referenceDate,
      period: { start: period.start, end: period.end, kind: period.kind },
      scope: { accountId: scope.accountId, accountIds: [...scope.accountIds] },
      includedCount: ids.length,
      rule,
    };
  }

  function quality(transactions, period) {
    const periodItems = transactions.filter((transaction) => transaction.date >= period.start && transaction.date <= period.end);
    if (!periodItems.length) return { state: "insufficient", reason: "Nenhuma movimentação no período analisado." };
    if (periodItems.length < 3) return { state: "partial", reason: "Há poucas movimentações no período analisado." };
    return { state: "sufficient", reason: "Há movimentações suficientes para leituras descritivas do período." };
  }

  function get(profile, options = {}) {
    const referenceDate = dateInput(options.referenceDate, new Date());
    const reference = utils.parseLocalDate(referenceDate);
    const period = createPeriod(options.period, { referenceDate });
    const scope = scopeFor(profile, options.accountId, options.includeInactive === true);
    const allowed = new Set(scope.accountIds);
    const auditEnabled = options.includeAudit === true;
    const excluded = [];
    let excludedCount = 0;
    const included = [];
    const transactions = (Array.isArray(profile?.transactions) ? profile.transactions : []).filter((transaction) => {
      const valid = transaction && transaction.id && validDate(transaction.date) && ["income", "expense"].includes(transaction.type);
      if (!valid) {
        excludedCount += 1;
        if (auditEnabled) excluded.push({ id: transaction?.id || "", reason: "invalid-transaction" });
        return false;
      }
      if (!allowed.has(transaction.accountId)) {
        excludedCount += 1;
        if (auditEnabled) excluded.push({ id: transaction.id, reason: "outside-account-scope" });
        return false;
      }
      included.push(transaction);
      return true;
    });

    const initialBalance = scope.accountIds.reduce((total, accountId) => (
      total + Number(accounts.accountById(profile, accountId)?.initialBalance || 0)
    ), 0);
    const settled = transactions.filter(finance.isSettledTransaction);
    const open = transactions.filter(finance.isOpenTransaction);
    const nonTransfers = transactions.filter((transaction) => !transaction.transferId);
    const periodTransactions = transactions.filter((transaction) => transaction.date >= period.start && transaction.date <= period.end);
    const periodSettled = periodTransactions.filter((transaction) => finance.isSettledTransaction(transaction) && !transaction.transferId);
    const periodOpen = periodTransactions.filter((transaction) => finance.isOpenTransaction(transaction) && !transaction.transferId);
    const pending = open.filter((transaction) => transaction.date <= referenceDate && !transaction.transferId);
    const overdue = pending.filter((transaction) => transaction.date < referenceDate);
    const upcoming = open.filter((transaction) => transaction.date >= referenceDate && transaction.date <= period.end && !transaction.transferId)
      .sort((a, b) => a.date.localeCompare(b.date));
    const future = transactions.filter((transaction) => transaction.date > referenceDate && !transaction.transferId);
    const cashflowTransactions = transactions.filter((transaction) => transaction.date <= period.end);
    const cashflowStart = initialBalance + finance.calculateCashflowBalance(transactions.filter((transaction) => transaction.date < period.start), reference);
    let runningCashflow = cashflowStart;
    let firstNegativeDate = "";
    cashflowTransactions
      .filter((transaction) => transaction.date >= period.start && finance.isCashflowTransactionIncluded(transaction, reference))
      .sort((a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)))
      .forEach((transaction) => {
        runningCashflow += transaction.type === "income" ? Number(transaction.amount || 0) : -Number(transaction.amount || 0);
        if (!firstNegativeDate && runningCashflow < 0) firstNegativeDate = transaction.date;
      });

    const settledBalanceIds = settled.map((transaction) => transaction.id);
    const projectedIds = transactions.map((transaction) => transaction.id);
    const periodIncome = periodSettled.filter((transaction) => transaction.type === "income");
    const periodExpense = periodSettled.filter((transaction) => transaction.type === "expense");
    const budgetProfile = Array.isArray(profile?.budgets) ? profile : { ...(profile || {}), budgets: [] };
    const budgetSummary = budgets.summary(budgetProfile, period.start.slice(0, 7), { accountId: scope.accountId });
    const budgetItems = (budgetSummary.items || []).map((item) => ({
      id: item.budget.id,
      categoryId: item.budget.categoryId,
      categoryName: categoryName(profile, item.budget.categoryId),
      limit: item.limit,
      spent: item.spent,
      committed: item.committed,
      committedPercent: item.committedPercent,
      remainingSpent: item.remainingSpent,
      remainingCommitted: item.remainingCommitted,
      status: item.status,
    }));
    const goalItems = (profile?.goals || []).map((goal) => ({
      id: goal.id,
      name: goal.name,
      target: Number(goal.target || 0),
      saved: Number(goal.saved || 0),
      progress: goals.progressPercent(goal),
      deadline: goal.deadline || "",
    }));
    const summary = {
      settledBalance: trace(initialBalance + finance.calculateBalance(transactions), "Saldo das contas no escopo após receitas recebidas e despesas pagas.", scope, period, referenceDate, settledBalanceIds, "accounts.initialBalance + finance.calculateBalance"),
      projectedBalance: trace(initialBalance + finance.calculateProjectedBalance(transactions), "Saldo das contas no escopo considerando todas as movimentações já registradas.", scope, period, referenceDate, projectedIds, "accounts.initialBalance + finance.calculateProjectedBalance"),
      realizedIncome: trace(sum(periodIncome), "Receitas recebidas no período, sem transferências internas.", scope, period, referenceDate, periodIncome.map((transaction) => transaction.id), "settled income in period, excluding transfers"),
      realizedExpense: trace(sum(periodExpense), "Despesas pagas no período, sem transferências internas.", scope, period, referenceDate, periodExpense.map((transaction) => transaction.id), "settled expense in period, excluding transfers"),
      committedExpense: trace(sum(periodOpen.filter((transaction) => transaction.type === "expense")), "Despesas pendentes ou atrasadas registradas no período, sem transferências internas.", scope, period, referenceDate, periodOpen.filter((transaction) => transaction.type === "expense").map((transaction) => transaction.id), "open expense in period, excluding transfers"),
      pendingIncome: trace(sum(pending.filter((transaction) => transaction.type === "income")), "Receitas pendentes ou atrasadas até a data de referência, sem transferências internas.", scope, period, referenceDate, pending.filter((transaction) => transaction.type === "income").map((transaction) => transaction.id), "open income through reference date, excluding transfers"),
      pendingExpense: trace(sum(pending.filter((transaction) => transaction.type === "expense")), "Despesas pendentes ou atrasadas até a data de referência, sem transferências internas.", scope, period, referenceDate, pending.filter((transaction) => transaction.type === "expense").map((transaction) => transaction.id), "open expense through reference date, excluding transfers"),
      futureIncome: trace(sum(future.filter((transaction) => transaction.type === "income")), "Receitas futuras já registradas, sem transferências internas.", scope, period, referenceDate, future.filter((transaction) => transaction.type === "income").map((transaction) => transaction.id), "future income, excluding transfers"),
      futureExpense: trace(sum(future.filter((transaction) => transaction.type === "expense")), "Despesas futuras já registradas, sem transferências internas.", scope, period, referenceDate, future.filter((transaction) => transaction.type === "expense").map((transaction) => transaction.id), "future expense, excluding transfers"),
    };
    const context = {
      profile: { id: profile?.id || "", name: profile?.name || "" },
      referenceDate,
      period: { ...period, equivalentPrevious: equivalentPeriod(period) },
      scope,
      quality: quality(nonTransfers, period),
      summary,
      obligations: {
        overdue: overdue.map((transaction) => ({ id: transaction.id, type: transaction.type, description: transaction.description || "", amount: Number(transaction.amount || 0), date: transaction.date, status: transaction.status })),
        upcoming: upcoming.map((transaction) => ({ id: transaction.id, type: transaction.type, description: transaction.description || "", amount: Number(transaction.amount || 0), date: transaction.date, status: transaction.status })),
      },
      budgets: { planned: budgetSummary.planned || 0, spent: budgetSummary.spent || 0, committed: budgetSummary.committed || 0, items: budgetItems },
      goals: { count: goalItems.length, saved: goalItems.reduce((total, goal) => total + goal.saved, 0), target: goalItems.reduce((total, goal) => total + goal.target, 0), items: goalItems },
      projection: {
        cashflowBalance: trace(runningCashflow, "Saldo de fluxo de caixa até o fim do período, seguindo a regra existente de inclusão por mês.", scope, period, referenceDate, cashflowTransactions.filter((transaction) => finance.isCashflowTransactionIncluded(transaction, reference)).map((transaction) => transaction.id), "accounts.initialBalance + finance.calculateCashflowBalance"),
        risk: firstNegativeDate ? { state: "negative", firstNegativeDate, reason: "O saldo acumulado do fluxo de caixa fica negativo no período." } : { state: "none", firstNegativeDate: "", reason: "Não há saldo acumulado negativo no período analisado." },
      },
      transactions: { includedCount: included.length, excludedCount },
    };
    if (auditEnabled) context.audit = { includedTransactionIds: included.map((transaction) => transaction.id), excludedTransactions: excluded };
    return freeze(context);
  }

  core.financialContext = Object.freeze({ createPeriod, equivalentPeriod, get });
})(globalThis);
