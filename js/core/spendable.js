(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function sum(items) {
    return items.reduce((total, item) => total + Number(item.amount || 0), 0);
  }

  function distinct(items) {
    const known = new Set();
    return items.filter((item) => {
      if (!item?.id || known.has(item.id)) return false;
      known.add(item.id);
      return true;
    });
  }

  function quality(context) {
    const included = Number(context.transactions?.includedCount || 0);
    if (!context.scope?.accountIds?.length || !included || context.quality?.state === "insufficient") {
      return {
        state: "no-data",
        reason: "Adicione uma conta e suas movimentações para calcular o valor livre.",
      };
    }
    if (context.quality?.state !== "sufficient") {
      return {
        state: "limited",
        reason: "Você possui poucos lançamentos cadastrados. O valor pode não representar todos os seus compromissos.",
      };
    }
    return {
      state: "normal",
      reason: "Baseado nas movimentações e contas cadastradas.",
    };
  }

  function compactTransaction(item) {
    return Object.freeze({
      id: item.id,
      description: item.description || "",
      amount: Number(item.amount || 0),
      date: item.date,
      status: item.status,
      type: item.type,
    });
  }

  function get(context) {
    if (!context || typeof context !== "object") {
      return freeze({ state: "no-data", available: null, shortfall: 0, commitments: [], futureIncome: [], quality: { state: "no-data", reason: "Adicione uma conta e suas movimentações para calcular o valor livre." } });
    }

    const overdue = (context.obligations?.overdue || []).filter((item) => item.type === "expense");
    const upcoming = (context.obligations?.upcoming || []).filter((item) => item.type === "expense");
    const commitments = distinct([...overdue, ...upcoming]);
    const futureIncome = distinct((context.obligations?.upcoming || []).filter((item) => item.type === "income" && item.date > context.referenceDate));
    const realizedBalance = Number(context.summary?.settledBalance?.value || 0);
    const knownCommitments = sum(commitments);
    const freeEstimated = Math.max(realizedBalance - knownCommitments, 0);
    const shortfall = Math.max(knownCommitments - realizedBalance, 0);
    const baseQuality = quality(context);
    const audit = context.audit || { includedTransactionIds: [], excludedTransactions: [] };

    return freeze({
      state: baseQuality.state,
      available: baseQuality.state === "no-data" ? null : freeEstimated,
      shortfall,
      horizon: { start: context.period?.start || "", end: context.period?.end || "", kind: context.period?.kind || "" },
      composition: {
        realizedBalance,
        knownCommitments,
        futureIncome: sum(futureIncome),
        freeEstimated,
      },
      commitments: commitments.map(compactTransaction),
      futureIncome: futureIncome.map(compactTransaction),
      quality: baseQuality,
      trace: {
        profileId: context.profile?.id || "",
        scope: { accountId: context.scope?.accountId || "all", accountIds: [...(context.scope?.accountIds || [])] },
        referenceDate: context.referenceDate || "",
        horizon: { start: context.period?.start || "", end: context.period?.end || "", kind: context.period?.kind || "" },
        realizedBalance: context.summary?.settledBalance || null,
        includedTransactionIds: audit.includedTransactionIds || [],
        commitmentTransactionIds: commitments.map((item) => item.id),
        futureIncomeTransactionIds: futureIncome.map((item) => item.id),
        excludedTransactions: audit.excludedTransactions || [],
        exclusions: [
          { concept: "future-income", reason: "Receitas futuras não entram no valor livre até serem recebidas." },
          { concept: "budgets", reason: "Orçamentos representam planejamento e não despesas comprometidas." },
          { concept: "goals", reason: "Metas não são descontadas automaticamente sem vínculo explícito com contas." },
        ],
      },
    });
  }

  core.spendable = Object.freeze({ get });
})(globalThis);
