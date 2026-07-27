(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  function build(profile, options = {}) {
    const today = options.today || new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const money = options.money || ((value) => String(value));
    const sameDay = (value, reference) => {
      const date = core.utils.parseLocalDate(String(value || "").slice(0, 10));
      return !Number.isNaN(date.valueOf()) && date.toDateString() === reference.toDateString();
    };
    const notifications = [];
    const openTransactions = core.finance.currentMonthOpenTransactions(profile, today)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    openTransactions.slice(0, 3).forEach((transaction) => {
      const days = core.utils.daysUntil(transaction.date, today);
      notifications.push({
        group: days <= 1 ? "Hoje" : "Esta semana",
        tone: days < 0 ? "danger" : "warning",
        icon: days < 0 ? "circle-alert" : "calendar-clock",
        title: days < 0 ? "Conta em atraso" : days === 1 ? "Conta vence amanhã" : "Vencimento próximo",
        description: `${transaction.description} · ${money(Math.abs(Number(transaction.amount || 0)))}`,
        time: days < 0 ? `${Math.abs(days)}d em atraso` : days === 0 ? "Hoje" : `em ${days}d`,
        action: "pendencies",
        actionLabel: "Revisar",
      });
    });
    [...profile.transactions]
      .sort((a, b) => String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date)))
      .slice(0, 4)
      .forEach((transaction) => {
        const created = transaction.createdAt || transaction.date;
        const isIncome = transaction.type === "income";
        const isSettledIncome = isIncome && transaction.status === "Recebido";
        notifications.push({
          group: sameDay(created, today) ? "Hoje" : sameDay(created, yesterday) ? "Ontem" : "Esta semana",
          tone: isIncome ? "income" : "neutral",
          icon: isIncome ? "circle-dollar-sign" : "receipt-text",
          title: isSettledIncome ? "Receita recebida" : isIncome ? "Receita registrada" : "Movimentação registrada",
          description: `${transaction.description} · ${money(Math.abs(Number(transaction.amount || 0)))}`,
          time: sameDay(created, today) ? "agora" : sameDay(created, yesterday) ? "ontem" : "recente",
          action: "transactions",
          actionLabel: "Ver",
        });
      });
    const mainGoal = [...profile.goals]
      .filter((goal) => Number(goal.target || 0) > 0)
      .sort((a, b) => (Number(b.saved || 0) / Number(b.target || 1)) - (Number(a.saved || 0) / Number(a.target || 1)))[0];
    if (mainGoal) {
      const progress = Math.min(Math.round((Number(mainGoal.saved || 0) / Number(mainGoal.target || 1)) * 100), 100);
      notifications.push({ group: "Esta semana", tone: "goal", icon: "target", title: "Meta atualizada", description: `${mainGoal.name} chegou a ${progress}% do objetivo.`, time: "esta semana", action: "goals", actionLabel: "Acompanhar" });
    }
    const cloudReady = Boolean(options.cloudReady);
    notifications.push({ group: "Esta semana", tone: "system", icon: "cloud-check", title: cloudReady ? "Backup realizado" : "Dados salvos neste dispositivo", description: cloudReady ? "Suas informações foram sincronizadas com segurança." : "A Nexio mantém uma cópia local atualizada.", time: cloudReady ? "sincronizado" : "local", action: "settings", actionLabel: "Detalhes" });
    return notifications;
  }

  core.notifications = Object.freeze({ build });
})(globalThis);
