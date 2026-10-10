(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const { accounts, budgets, financialContext, spendable, transactions, utils } = core;

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))
      && utils.toDateInput(utils.parseLocalDate(value)) === value;
  }

  function cents(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
  }

  function moneyFromCents(value) {
    return value / 100;
  }

  function splitAmount(value, count) {
    const total = cents(value);
    const base = Math.floor(total / count);
    const remainder = total - (base * count);
    return Array.from({ length: count }, (_, index) => moneyFromCents(base + (index === count - 1 ? remainder : 0)));
  }

  function validation(profile, purchase) {
    const amount = Number(purchase?.amount);
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Informe um valor maior que zero." };
    const category = (profile?.categories || []).find((item) => item.id === purchase?.categoryId);
    if (!category || budgets.categoryKind(profile, category) !== "expense") return { ok: false, error: "Selecione uma categoria de despesa existente." };
    const account = accounts.accountById(profile, purchase?.accountId);
    if (!account || account.active === false) return { ok: false, error: "Selecione uma conta ativa existente." };
    const date = String(purchase?.date || "");
    if (!validDate(date)) return { ok: false, error: "Informe uma data de compra válida." };
    const installmentCount = purchase?.paymentType === "installments" ? Number(purchase.installments) : 1;
    if (!Number.isInteger(installmentCount) || installmentCount < 1 || installmentCount > 120) {
      return { ok: false, error: "Informe uma quantidade de parcelas entre 2 e 120." };
    }
    if (purchase?.paymentType === "installments" && installmentCount < 2) {
      return { ok: false, error: "Uma compra parcelada precisa ter pelo menos duas parcelas." };
    }
    return { ok: true, amount, category, account, date, installmentCount };
  }

  function createHypotheticalTransactions(purchase, details, referenceDate) {
    let sequence = 0;
    const base = {
      id: "purchase-simulation-base",
      type: "expense",
      description: String(purchase.description || "Compra simulada").trim() || "Compra simulada",
      amount: details.amount,
      date: details.date,
      categoryId: details.category.id,
      accountId: details.account.id,
      status: "Pendente",
      createdAt: `${referenceDate}T00:00:00.000Z`,
      updatedAt: `${referenceDate}T00:00:00.000Z`,
      hypothetical: true,
    };
    if (details.installmentCount === 1) {
      return [{ ...base, id: "purchase-simulation-1" }];
    }
    const generated = transactions.createInstallments(base, details.installmentCount, {
      now: () => utils.parseLocalDate(referenceDate),
      uid: (prefix) => `${prefix}-purchase-simulation-${sequence++}`,
    });
    const amounts = splitAmount(details.amount, details.installmentCount);
    return generated.map((item, index) => ({ ...item, amount: amounts[index], hypothetical: true }));
  }

  function scenarioProfile(profile, hypotheticalTransactions) {
    return {
      ...(profile || {}),
      transactions: [...(Array.isArray(profile?.transactions) ? profile.transactions : []), ...hypotheticalTransactions],
      budgets: [...(Array.isArray(profile?.budgets) ? profile.budgets : [])],
    };
  }

  function monthImpact(transactions) {
    const byMonth = new Map();
    transactions.forEach((transaction) => {
      const month = transaction.date.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) || 0) + Number(transaction.amount || 0));
    });
    return [...byMonth.entries()].map(([month, amount]) => ({ month, amount }));
  }

  function budgetImpact(beforeProfile, afterProfile, details) {
    const month = details.date.slice(0, 7);
    const before = financialContext.get(beforeProfile, { referenceDate: details.date, period: { type: "month", month }, accountId: details.account.id });
    const after = financialContext.get(afterProfile, { referenceDate: details.date, period: { type: "month", month }, accountId: details.account.id });
    const beforeItem = before.budgets.items.find((item) => item.categoryId === details.category.id);
    const afterItem = after.budgets.items.find((item) => item.categoryId === details.category.id);
    if (!beforeItem || !afterItem) return null;
    return {
      categoryId: details.category.id,
      categoryName: details.category.name || "Categoria",
      month,
      limit: afterItem.limit,
      before: { committed: beforeItem.committed, percent: beforeItem.committedPercent, status: beforeItem.status, remaining: beforeItem.remainingCommitted },
      after: { committed: afterItem.committed, percent: afterItem.committedPercent, status: afterItem.status, remaining: afterItem.remainingCommitted, exceededBy: Math.max(-afterItem.remainingCommitted, 0) },
    };
  }

  function riskChange(beforeRisk, afterRisk) {
    if (beforeRisk.state !== "negative" && afterRisk.state !== "negative") return { state: "none", message: "Nenhum saldo negativo é projetado no período analisado." };
    if (beforeRisk.state !== "negative") return { state: "created", message: `Neste cenário, o saldo projetado ficaria negativo em ${afterRisk.firstNegativeDate}.` };
    if (afterRisk.state !== "negative") return { state: "resolved", message: "Neste cenário, não há saldo negativo projetado no período analisado." };
    if (afterRisk.firstNegativeDate < beforeRisk.firstNegativeDate) return { state: "anticipated", message: `Neste cenário, o primeiro saldo negativo seria antecipado de ${beforeRisk.firstNegativeDate} para ${afterRisk.firstNegativeDate}.` };
    if (afterRisk.firstNegativeDate > beforeRisk.firstNegativeDate) return { state: "delayed", message: `Neste cenário, o primeiro saldo negativo passaria de ${beforeRisk.firstNegativeDate} para ${afterRisk.firstNegativeDate}.` };
    return { state: "unchanged", message: "O risco de saldo negativo já existia e não muda de data neste cenário." };
  }

  function conclusion(result) {
    if (result.quality?.state !== "normal") return "Esta análise é limitada porque há poucos dados financeiros cadastrados.";
    if (result.risk.change.state === "created") return "Neste cenário, a compra criaria risco de saldo projetado negativo.";
    if (result.risk.change.state === "anticipated") return "Neste cenário, a compra anteciparia o risco de saldo negativo.";
    if (result.budget?.after.status === "exceeded") return `Neste cenário, ${result.budget.categoryName} ultrapassaria o orçamento.`;
    if (result.purchase.installmentCount > 1) return `Essa compra criaria ${result.purchase.installmentCount} compromissos mensais.`;
    return "Essa compra reduziria seu valor livre deste mês.";
  }

  function simulate(profile, purchase, options = {}) {
    const referenceDate = validDate(options.referenceDate) ? options.referenceDate : utils.toDateInput(new Date());
    const details = validation(profile, purchase);
    if (!details.ok) return freeze({ ok: false, error: details.error, trace: { persisted: false } });
    const beforeSnapshot = financialContext.get(profile, { referenceDate, period: "current-month", accountId: purchase.accountId, includeAudit: true });
    const beforeSpendable = spendable.get(beforeSnapshot);
    const hypotheticalTransactions = createHypotheticalTransactions(purchase, details, referenceDate);
    const afterProfile = scenarioProfile(profile, hypotheticalTransactions);
    const afterSnapshot = financialContext.get(afterProfile, { referenceDate, period: "current-month", accountId: purchase.accountId, includeAudit: true });
    const afterSpendable = spendable.get(afterSnapshot);
    const lastDate = hypotheticalTransactions[hypotheticalTransactions.length - 1].date;
    const currentMonth = financialContext.createPeriod("current-month", { referenceDate });
    const projectionDates = [currentMonth.end, lastDate, referenceDate].sort();
    const projectionEnd = projectionDates[projectionDates.length - 1];
    const projectionPeriod = { type: "custom", start: referenceDate, end: projectionEnd };
    const beforeProjection = financialContext.get(profile, { referenceDate, period: projectionPeriod, accountId: purchase.accountId, includeAudit: true });
    const afterProjection = financialContext.get(afterProfile, { referenceDate, period: projectionPeriod, accountId: purchase.accountId, includeAudit: true });
    const budget = budgetImpact(profile, afterProfile, details);
    const purchaseSummary = {
      amount: details.amount,
      categoryId: details.category.id,
      categoryName: details.category.name || "Categoria",
      accountId: details.account.id,
      accountName: details.account.name || "Conta",
      date: details.date,
      installmentCount: details.installmentCount,
      installmentAmount: hypotheticalTransactions[0].amount,
      totalCommitment: hypotheticalTransactions.reduce((total, item) => total + Number(item.amount || 0), 0),
    };
    const result = {
      ok: true,
      purchase: purchaseSummary,
      before: {
        spendable: beforeSpendable.available,
        projectedBalance: beforeSnapshot.summary.projectedBalance.value,
        cashflowBalance: beforeProjection.projection.cashflowBalance.value,
        risk: beforeProjection.projection.risk,
      },
      after: {
        spendable: afterSpendable.available,
        projectedBalance: afterSnapshot.summary.projectedBalance.value,
        cashflowBalance: afterProjection.projection.cashflowBalance.value,
        risk: afterProjection.projection.risk,
      },
      impact: {
        spendable: beforeSpendable.available === null || afterSpendable.available === null ? null : afterSpendable.available - beforeSpendable.available,
        projectedBalance: afterSnapshot.summary.projectedBalance.value - beforeSnapshot.summary.projectedBalance.value,
        cashflowBalance: afterProjection.projection.cashflowBalance.value - beforeProjection.projection.cashflowBalance.value,
      },
      budget,
      risk: { change: riskChange(beforeProjection.projection.risk, afterProjection.projection.risk) },
      installments: hypotheticalTransactions.map((item) => ({ date: item.date, month: item.date.slice(0, 7), amount: Number(item.amount || 0), number: item.installmentNumber || 1, total: item.installmentTotal || 1 })),
      monthlyImpact: monthImpact(hypotheticalTransactions),
      quality: beforeSpendable.quality,
      trace: {
        persisted: false,
        referenceDate,
        accountId: details.account.id,
        period: beforeSpendable.horizon,
        projectionPeriod: beforeProjection.period,
        hypotheticalTransactionIds: hypotheticalTransactions.map((item) => item.id),
        before: beforeSpendable.trace,
        after: afterSpendable.trace,
        policy: ["Receitas futuras não aumentam o valor livre.", "Metas não são descontadas automaticamente.", "A simulação existe somente em memória."],
      },
    };
    result.conclusion = conclusion(result);
    return freeze(result);
  }

  core.purchaseSimulator = Object.freeze({ simulate, splitAmount });
})(globalThis);
