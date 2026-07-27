(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const utils = core.utils;

  function normalizeMovementType(type) {
    const value = utils.normalizeText(type).replace(/\s+/g, "_");
    if (["withdraw", "saida", "saída", "retirada"].includes(value)) return "retirada";
    if (["transfer_out", "transferencia", "transferência", "transferencia_enviada", "transferência_enviada"].includes(value)) return "transferencia_enviada";
    if (["transfer_in", "transferencia_recebida", "transferência_recebida"].includes(value)) return "transferencia_recebida";
    return "entrada";
  }

  function movementTypeLabel(type) {
    const labels = {
      entrada: "Entrada",
      retirada: "Retirada",
      transferencia_enviada: "Transferencia enviada",
      transferencia_recebida: "Transferencia recebida",
    };
    return labels[normalizeMovementType(type)] || "Movimentacao";
  }

  function createMovement(input, options = {}) {
    const locale = options.locale || "pt-BR";
    const createId = options.uid || utils.uid;
    const now = input.data ? utils.parseLocalDate(input.data) : (options.now || new Date());
    const timestamp = Number.isNaN(now.valueOf()) ? new Date() : now;
    const movementType = normalizeMovementType(input.tipo);
    const signedAmount = movementType === "entrada" || movementType === "transferencia_recebida"
      ? Number(input.valor || 0)
      : -Number(input.valor || 0);
    return {
      id: createId("goal-move"),
      tipo: movementType,
      valor: Number(input.valor || 0),
      data: utils.toDateInput(timestamp),
      hora: timestamp.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
      meta_origem: input.goal?.id || "",
      meta_destino: input.metaDestino || "",
      perfil_destino: input.perfilDestino || "",
      destino: input.destino || "",
      justificativa: input.justificativa || "",
      observacao: input.observacao || movementTypeLabel(movementType),
      usuario_perfil: input.profile?.name || "",
      criado_em: timestamp.toISOString(),
      atualizado_em: (options.updatedAt || new Date()).toISOString(),
      amount: signedAmount,
      date: timestamp.toISOString(),
      note: input.observacao || movementTypeLabel(movementType),
    };
  }

  function normalizeMovement(entry, goal, profile, options = {}) {
    const locale = options.locale || "pt-BR";
    const createId = options.uid || utils.uid;
    const signedAmount = Number(entry.amount ?? entry.valor ?? 0);
    const valor = Math.abs(Number(entry.valor ?? entry.amount ?? 0));
    const tipo = normalizeMovementType(entry.tipo || entry.type || (signedAmount < 0 ? "retirada" : "entrada"));
    const createdAt = entry.criado_em || entry.updatedAt || entry.createdAt || entry.date || new Date().toISOString();
    const createdDate = new Date(createdAt);
    const safeDate = Number.isNaN(createdDate.valueOf()) ? new Date() : createdDate;
    return {
      id: entry.id || createId("goal-move"),
      tipo,
      valor,
      data: entry.data || utils.toDateInput(safeDate),
      hora: entry.hora || safeDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
      meta_origem: entry.meta_origem || goal.id,
      meta_destino: entry.meta_destino || "",
      perfil_destino: entry.perfil_destino || "",
      destino: entry.destino || "",
      justificativa: entry.justificativa || "",
      observacao: entry.observacao || entry.note || "Depósito manual",
      usuario_perfil: entry.usuario_perfil || profile?.name || "",
      criado_em: createdAt,
      atualizado_em: entry.atualizado_em || entry.updatedAt || createdAt,
      amount: entry.amount ?? (tipo === "entrada" || tipo === "transferencia_recebida" ? valor : -valor),
      date: entry.date || createdAt,
      note: entry.note || entry.observacao || movementTypeLabel(tipo),
    };
  }

  function normalizeHistory(goal, profile, options = {}) {
    const rawHistory = Array.isArray(goal.history) ? goal.history : [];
    const normalized = rawHistory
      .filter((entry) => entry && (entry.tipo || entry.type || Number(entry.valor ?? entry.amount ?? 0) !== 0))
      .map((entry) => normalizeMovement(entry, goal, profile, options));
    if (!normalized.length && Number(goal.saved || 0) > 0) {
      normalized.push(createMovement({
        tipo: "entrada",
        valor: Number(goal.saved || 0),
        goal,
        profile,
        observacao: "Saldo inicial",
        destino: "Meta",
      }, options));
    }
    return normalized;
  }

  function ensureShape(goal, profile, options = {}) {
    goal.id = goal.id || (options.uid || utils.uid)("goal");
    goal.name = goal.name || "Meta";
    goal.target = Number(goal.target || 0);
    goal.saved = Number(goal.saved || 0);
    goal.history = normalizeHistory(goal, profile, options);
    goal.reminders = Array.isArray(goal.reminders) ? goal.reminders : [];
    return goal;
  }

  function historyEntries(goal, profile, options = {}) {
    return (goal.history || [])
      .map((entry) => normalizeMovement(entry, goal, profile, options))
      .sort((a, b) => new Date(b.criado_em || b.date) - new Date(a.criado_em || a.date));
  }

  function historyStats(goal, profile, options = {}) {
    const stats = {
      entradas: 0, retiradas: 0, transferenciasEnviadas: 0, transferenciasRecebidas: 0,
      saldoHistorico: 0, saldoAtual: Number(goal.saved || 0), count: 0, ultimaMovimentacao: "",
    };
    historyEntries(goal, profile, options).forEach((entry) => {
      const value = Number(entry.valor || Math.abs(entry.amount || 0));
      stats.count += 1;
      if (!stats.ultimaMovimentacao) stats.ultimaMovimentacao = entry.criado_em || entry.date || "";
      if (entry.tipo === "entrada") stats.entradas += value;
      if (entry.tipo === "retirada") stats.retiradas += value;
      if (entry.tipo === "transferencia_enviada") stats.transferenciasEnviadas += value;
      if (entry.tipo === "transferencia_recebida") stats.transferenciasRecebidas += value;
      stats.saldoHistorico += entry.tipo === "entrada" || entry.tipo === "transferencia_recebida" ? value : -value;
    });
    stats.saldoHistorico = Number(stats.saldoHistorico.toFixed(2));
    return stats;
  }

  function progressPercent(goal) {
    return goal.target ? Math.min(Math.round((Number(goal.saved || 0) / Number(goal.target || 1)) * 100), 100) : 0;
  }

  function monthlyNeed(goal, daysRemaining) {
    const remaining = Math.max(Number(goal.target || 0) - Number(goal.saved || 0), 0);
    return remaining / Math.max(daysRemaining / 30, 1);
  }

  function visualStatus(goal, daysRemaining, forecast = null) {
    if (Number(goal.saved || 0) >= Number(goal.target || 0)) return "is-complete";
    if (daysRemaining < 0) return "is-late";
    if (forecast?.status === "is-on-track") return "is-on-track";
    return "is-risk";
  }

  function movementClass(type) {
    const movementType = normalizeMovementType(type);
    return movementType === "entrada" || movementType === "transferencia_recebida" ? "is-positive" : "is-negative";
  }

  function insight(goal, amount, money) {
    const progress = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
    const contributions = (goal.history || [])
      .filter((entry) => Number(entry.amount || 0) > 0 && utils.normalizeText(entry.note || "") !== "saldo inicial");
    const previous = contributions.slice(0, -1);
    const average = previous.length ? utils.sum(previous, "amount") / previous.length : 0;
    if (average && amount > average) return `🚀 Você guardou ${money(amount)} em ${goal.name}, acima da sua média de ${money(average)}. Continue nesse ritmo.`;
    if (progress >= 100) return `🎉 Meta concluída. Você adicionou ${money(amount)} e fechou ${goal.name}.`;
    if (progress >= 75) return `🚀 Ótimo avanço: ${goal.name} chegou a ${progress}%. Falta pouco.`;
    if (progress >= 40) return `📈 ${goal.name} ganhou força: ${progress}% da meta já está guardado.`;
    return `💰 ${money(amount)} adicionados em ${goal.name}. O progresso agora está em ${progress}%.`;
  }

  function validateContribution(amount) {
    return !amount || amount <= 0 ? "Digite um valor para adicionar." : "";
  }

  function contribute(goal, profile, amount, options = {}) {
    const error = validateContribution(amount);
    if (error) return { ok: false, error };
    const wasComplete = Number(goal.saved || 0) >= Number(goal.target || 0);
    goal.saved = Number((goal.saved + amount).toFixed(2));
    goal.updatedAt = new Date().toISOString();
    goal.history = normalizeHistory(goal, profile, options);
    goal.history.push(createMovement({ tipo: "entrada", valor: amount, goal, profile, destino: "Meta", observacao: "Aporte" }, options));
    return { ok: true, wasComplete, completed: !wasComplete && Number(goal.saved || 0) >= Number(goal.target || 0) };
  }

  function validateWithdrawal(goal, input) {
    const finalDestination = input.destination === "custom" ? input.customDestination : input.destination;
    if (!input.amount || input.amount <= 0) return "Digite um valor valido para retirar.";
    if (input.amount > Number(goal.saved || 0)) return "A retirada nao pode ultrapassar o saldo da meta.";
    if (!finalDestination) return "Informe o destino do dinheiro.";
    if (!input.justification) return "Informe uma justificativa para a retirada.";
    return "";
  }

  function withdraw(goal, profile, input, options = {}) {
    const error = validateWithdrawal(goal, input);
    if (error) return { ok: false, error };
    const finalDestination = input.destination === "custom" ? input.customDestination : input.destination;
    goal.saved = Number((Number(goal.saved || 0) - input.amount).toFixed(2));
    goal.updatedAt = new Date().toISOString();
    goal.history = normalizeHistory(goal, profile, options);
    goal.history.push(createMovement({
      tipo: "retirada",
      valor: input.amount,
      goal,
      profile,
      destino: finalDestination,
      justificativa: input.justification,
      observacao: input.observation || "Retirada",
      data: input.date || utils.toDateInput(new Date()),
    }, options));
    return { ok: true };
  }

  function transfer(input, options = {}) {
    const { user, profile, goal, amount, targetType, targetId, justification } = input;
    if (!amount || amount <= 0) return { ok: false, error: "Digite um valor valido para transferir." };
    if (amount > Number(goal.saved || 0)) return { ok: false, error: "A transferencia nao pode ultrapassar o saldo da meta." };
    if (!targetId) return { ok: false, error: "Escolha um destino para a transferencia." };
    if (!justification) return { ok: false, error: "Informe uma justificativa para a transferencia." };

    let targetGoal = null;
    let targetProfile = null;
    if (targetType === "goal") {
      targetGoal = profile.goals.find((item) => item.id === targetId && item.id !== goal.id);
      if (!targetGoal) return { ok: false, error: "Meta de destino nao encontrada." };
    } else {
      targetProfile = user?.profiles.find((item) => item.id === targetId);
      if (!targetProfile) return { ok: false, error: "Perfil de destino nao encontrado." };
    }
    const targetGoalWasComplete = targetGoal ? Number(targetGoal.saved || 0) >= Number(targetGoal.target || 0) : false;
    goal.saved = Number((Number(goal.saved || 0) - amount).toFixed(2));
    goal.updatedAt = new Date().toISOString();
    goal.history = normalizeHistory(goal, profile, options);

    if (targetGoal) {
      targetGoal.saved = Number((Number(targetGoal.saved || 0) + amount).toFixed(2));
      targetGoal.updatedAt = new Date().toISOString();
      targetGoal.history = normalizeHistory(targetGoal, profile, options);
      goal.history.push(createMovement({ tipo: "transferencia_enviada", valor: amount, goal, profile, destino: `Meta: ${targetGoal.name}`, justificativa: justification, observacao: "Transferencia para meta", metaDestino: targetGoal.id }, options));
      const received = createMovement({ tipo: "transferencia_recebida", valor: amount, goal: targetGoal, profile, destino: `Origem: ${goal.name}`, justificativa: justification, observacao: "Transferencia recebida", metaDestino: targetGoal.id }, options);
      received.meta_origem = goal.id;
      targetGoal.history.push(received);
      return { ok: true, message: "Transferencia entre metas concluida.", targetGoal, targetGoalWasComplete };
    }

    options.ensureProfileShape(targetProfile);
    const movement = createMovement({ tipo: "transferencia_enviada", valor: amount, goal, profile, destino: `Perfil: ${targetProfile.name}`, justificativa: justification, observacao: "Transferencia para perfil", perfilDestino: targetProfile.id }, options);
    goal.history.push(movement);
    const category = options.ensureGoalTransferCategory(targetProfile);
    targetProfile.transactions.push({
      id: (options.uid || utils.uid)("trx"),
      type: "income",
      description: `Transferencia da meta ${goal.name}`,
      amount: Number(amount),
      date: utils.toDateInput(new Date()),
      categoryId: category.id,
      status: "Recebido",
      goalMovementId: movement.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { ok: true, message: "Transferencia para perfil registrada.", targetGoal: null, targetGoalWasComplete: false };
  }

  core.goals = Object.freeze({
    createMovement,
    ensureShape,
    historyEntries,
    historyStats,
    insight,
    monthlyNeed,
    movementClass,
    movementTypeLabel,
    normalizeHistory,
    normalizeMovement,
    normalizeMovementType,
    progressPercent,
    contribute,
    transfer,
    validateContribution,
    validateWithdrawal,
    visualStatus,
    withdraw,
  });
})(globalThis);
