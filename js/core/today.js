(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const { finance, utils } = core;
  const PRIORITY_ORDER = Object.freeze({ critical: 0, important: 1, planning: 2, positive: 3, empty: 4 });

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function moneyFormatter(options) {
    return typeof options.formatMoney === "function"
      ? options.formatMoney
      : (value) => finance.formatMoney(value, options.currency || "BRL");
  }

  function dueSoonDays(value) {
    const days = Number(value);
    return new Set([1, 3, 5, 7]).has(days) ? days : 3;
  }

  function dateAfter(date, days) {
    const result = utils.parseLocalDate(date);
    result.setDate(result.getDate() + days);
    return utils.toDateInput(result);
  }

  function item(input) {
    return {
      key: input.key,
      type: input.type,
      priority: input.priority,
      severity: input.severity,
      icon: input.icon,
      title: input.title,
      message: input.message,
      value: input.value ?? null,
      reason: input.reason,
      action: input.action,
      source: input.source,
    };
  }

  function append(items, keys, next) {
    if (keys.has(next.key)) return;
    keys.add(next.key);
    items.push(next);
  }

  function get(context, options = {}) {
    if (!context || typeof context !== "object") return freeze({ items: [], totalRelevant: 0, overflowCount: 0, state: "empty" });
    const money = moneyFormatter(options);
    const referenceDate = context.referenceDate || utils.toDateInput(new Date());
    const windowDays = dueSoonDays(options.dueSoonDays);
    const dueLimit = dateAfter(referenceDate, windowDays);
    const candidates = [];
    const keys = new Set();
    const overdue = (context.obligations?.overdue || []).filter((entry) => entry.type === "expense");
    if (overdue.length) {
      const total = overdue.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      append(candidates, keys, item({
        key: `overdue:${overdue.map((entry) => entry.id).sort().join(",")}`,
        type: "overdue-obligations", priority: "critical", severity: "danger", icon: "calendar-x",
        title: overdue.length === 1 ? "Uma conta está vencida" : `${overdue.length} contas estão vencidas`,
        message: `${money(total)} aguardam pagamento.`, value: total,
        reason: overdue.length === 1
          ? "Existe uma despesa pendente com vencimento anterior a hoje."
          : `Existem ${overdue.length} despesas pendentes com vencimento anterior a hoje.`,
        action: { view: "transactions", label: "Ver contas" },
        source: { transactionIds: overdue.map((entry) => entry.id), rule: "open overdue expenses" },
      }));
    }

    const risk = context.projection?.risk;
    if (risk?.state === "negative" && (!overdue.length || risk.firstNegativeDate > referenceDate)) {
      append(candidates, keys, item({
        key: `projection:negative:${risk.firstNegativeDate}`,
        type: "negative-cashflow-risk", priority: "critical", severity: "danger", icon: "chart-no-axes-combined",
        title: "A projeção pede atenção",
        message: `Seu saldo projetado pode ficar negativo em ${risk.firstNegativeDate.split("-").reverse().join("/")}.`,
        value: context.projection?.cashflowBalance?.value ?? null,
        reason: "Os lançamentos cadastrados levam o saldo acumulado do fluxo de caixa a um valor negativo no período.",
        action: { view: "cashflow", label: "Ver fluxo de caixa" },
        source: { date: risk.firstNegativeDate, rule: context.projection?.cashflowBalance?.rule || "cashflow projection" },
      }));
    }

    const upcoming = (context.obligations?.upcoming || []).filter((entry) => (
      entry.type === "expense" && entry.date >= referenceDate && entry.date <= dueLimit
    ));
    if (upcoming.length) {
      const total = upcoming.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      append(candidates, keys, item({
        key: `due-soon:${upcoming.map((entry) => entry.id).sort().join(",")}`,
        type: "upcoming-obligations", priority: "important", severity: "warning", icon: "calendar-clock",
        title: upcoming.length === 1 ? "Uma conta vence em breve" : `${upcoming.length} contas vencem em breve`,
        message: `${money(total)} vencem nos próximos ${windowDays} dias.`, value: total,
        reason: `${upcoming.length} despesa${upcoming.length === 1 ? "" : "s"} pendente${upcoming.length === 1 ? "" : "s"} vence${upcoming.length === 1 ? "" : "m"} dentro da antecedência configurada.`,
        action: { view: "transactions", label: "Ver próximas" },
        source: { transactionIds: upcoming.map((entry) => entry.id), rule: `open expenses through ${windowDays} days` },
      }));
    }

    const problematicBudgets = [...(context.budgets?.items || [])]
      .filter((budget) => budget.status === "exceeded" || budget.status === "warning")
      .sort((left, right) => (
        (left.status === "exceeded" ? 0 : 1) - (right.status === "exceeded" ? 0 : 1)
        || Number(right.committedPercent || 0) - Number(left.committedPercent || 0)
      ));
    if (problematicBudgets.length) {
      const budget = problematicBudgets[0];
      const overage = Math.max(-Number(budget.remainingCommitted || 0), 0);
      const suffix = problematicBudgets.length > 1 ? ` + ${problematicBudgets.length - 1} orçamento${problematicBudgets.length === 2 ? "" : "s"} precisa${problematicBudgets.length === 2 ? "" : "m"} de atenção.` : "";
      append(candidates, keys, item({
        key: `budget:${budget.id}:${context.period?.start || ""}`,
        type: "budget", priority: budget.status === "exceeded" ? "important" : "important", severity: budget.status === "exceeded" ? "danger" : "warning", icon: "gauge",
        title: budget.status === "exceeded" ? `${budget.categoryName} ultrapassou o orçamento` : `${budget.categoryName} pede atenção`,
        message: budget.status === "exceeded"
          ? `${money(overage)} acima do limite comprometido.${suffix}`
          : `${Math.round(Number(budget.committedPercent || 0))}% do orçamento comprometido.${suffix}`,
        value: budget.status === "exceeded" ? overage : Number(budget.committedPercent || 0),
        reason: `O orçamento de ${budget.categoryName} está ${budget.status === "exceeded" ? "excedido" : "no nível de atenção"} considerando despesas pagas, pendentes e atrasadas.`,
        action: { view: "budgets", label: "Ver orçamento" },
        source: { budgetIds: problematicBudgets.map((entry) => entry.id), rule: "budget committed status" },
      }));
    }

    const activeGoals = (context.goals?.items || []).filter((goal) => Number(goal.target || 0) > 0);
    const completedGoal = activeGoals.find((goal) => Number(goal.saved || 0) >= Number(goal.target || 0));
    const nearDeadline = activeGoals
      .filter((goal) => Number(goal.saved || 0) < Number(goal.target || 0) && goal.deadline >= referenceDate && goal.deadline <= dateAfter(referenceDate, 7))
      .sort((left, right) => left.deadline.localeCompare(right.deadline))[0];
    if (nearDeadline) {
      const remaining = Math.max(Number(nearDeadline.target || 0) - Number(nearDeadline.saved || 0), 0);
      append(candidates, keys, item({
        key: `goal:deadline:${nearDeadline.id}`, type: "goal-deadline", priority: "planning", severity: "info", icon: "target",
        title: `${nearDeadline.name} está próxima do prazo`, message: `Faltam ${money(remaining)} até ${nearDeadline.deadline.split("-").reverse().join("/")}.`, value: remaining,
        reason: "A meta ainda não foi concluída e seu prazo está nos próximos 7 dias.",
        action: { view: "goals", label: "Ver metas" }, source: { goalIds: [nearDeadline.id], rule: "unfinished goal deadline within 7 days" },
      }));
    } else if (completedGoal) {
      append(candidates, keys, item({
        key: `goal:complete:${completedGoal.id}`, type: "goal-complete", priority: "positive", severity: "success", icon: "badge-check",
        title: `${completedGoal.name} foi atingida`, message: `${money(completedGoal.saved)} registrados nesta meta.`, value: completedGoal.saved,
        reason: "O valor guardado registrado atingiu ou superou o objetivo da meta.",
        action: { view: "goals", label: "Ver metas" }, source: { goalIds: [completedGoal.id], rule: "goal saved >= target" },
      }));
    }

    const sorted = candidates.sort((left, right) => PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority]);
    if (!sorted.length) {
      const insufficient = context.quality?.state === "insufficient" || Number(context.transactions?.includedCount || 0) < 3;
      const fallback = insufficient
        ? item({ key: "empty:insufficient-data", type: "insufficient-data", priority: "empty", severity: "info", icon: "sparkles", title: "Comece a registrar suas movimentações", message: "Adicione movimentações para o Nexio começar a analisar suas finanças.", reason: context.quality?.reason || "Ainda não há dados suficientes para uma leitura financeira.", action: { view: "transactions", label: "Adicionar movimentação" }, source: { rule: "insufficient data" } })
        : item({ key: "positive:no-priority-pending", type: "all-clear", priority: "positive", severity: "success", icon: "circle-check", title: "Está tudo em ordem por aqui", message: "Não encontramos nenhuma pendência importante para hoje.", reason: "Não há vencimentos, risco projetado, orçamento em atenção ou meta próxima do prazo.", action: null, source: { rule: "no relevant deterministic findings" } });
      return freeze({ items: [fallback], totalRelevant: 0, overflowCount: 0, state: fallback.type });
    }
    const items = sorted.slice(0, 3);
    return freeze({ items, totalRelevant: sorted.length, overflowCount: Math.max(sorted.length - items.length, 0), state: "findings" });
  }

  core.today = Object.freeze({ get });
})(globalThis);
