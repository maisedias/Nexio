(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const MAX_STATE_KEYS = 500;
  const PRIORITY_ORDER = Object.freeze({ high: 0, medium: 1, low: 2 });
  const DEFAULT_PREFERENCES = Object.freeze({
    enabled: true,
    dueSoonDays: 3,
    overdueExpenses: true,
    dueSoonExpenses: true,
    overdueIncome: true,
    dueSoonIncome: true,
    budgetAttention: true,
    budgetExceeded: true,
    goals: true,
    syncIssues: true,
  });
  const BOOLEAN_PREFERENCES = Object.freeze([
    "enabled",
    "overdueExpenses",
    "dueSoonExpenses",
    "overdueIncome",
    "dueSoonIncome",
    "budgetAttention",
    "budgetExceeded",
    "goals",
    "syncIssues",
  ]);
  const DUE_SOON_OPTIONS = new Set([1, 3, 5, 7]);
  const FORBIDDEN_STATE_FIELDS = new Set([
    "alerts",
    "auth",
    "authentication",
    "claim",
    "claims",
    "notifications",
    "session",
    "sessions",
  ]);

  function safeObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function safeClone(value) {
    const sanitized = core.storage?.sanitizeSensitiveData
      ? core.storage.sanitizeSensitiveData(value)
      : value;
    try {
      return stripUnsafeStateFields(JSON.parse(JSON.stringify(sanitized)));
    } catch (error) {
      return {};
    }
  }

  function canonicalFieldName(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function unsafeStateField(value) {
    const field = canonicalFieldName(value);
    return FORBIDDEN_STATE_FIELDS.has(field)
      || field.includes("password")
      || field.includes("passwd")
      || field.includes("passcode")
      || field.includes("senha")
      || field.includes("token")
      || field.includes("credential")
      || field.includes("credencial");
  }

  function stripUnsafeStateFields(value) {
    if (Array.isArray(value)) return value.map(stripUnsafeStateFields);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !unsafeStateField(key))
      .map(([key, entry]) => [key, stripUnsafeStateFields(entry)]));
  }

  function validKey(value) {
    const key = String(value || "").trim();
    return /^[a-z0-9][a-z0-9:._-]{0,299}$/i.test(key) ? key : "";
  }

  function normalizeKeyList(value) {
    const keys = [];
    const seen = new Set();
    (Array.isArray(value) ? value : []).forEach((entry) => {
      const key = validKey(entry);
      if (!key || seen.has(key)) return;
      seen.add(key);
      keys.push(key);
    });
    return keys.slice(-MAX_STATE_KEYS);
  }

  function validTimestamp(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const timestamp = new Date(value);
    return Number.isNaN(timestamp.valueOf()) ? "" : timestamp.toISOString();
  }

  function normalizeSnoozedUntil(value) {
    const entries = Object.entries(safeObject(value))
      .map(([rawKey, rawUntil]) => [validKey(rawKey), validTimestamp(rawUntil)])
      .filter(([key, until]) => key && until)
      .slice(-MAX_STATE_KEYS);
    return Object.fromEntries(entries);
  }

  function preferencePatch(value) {
    const source = safeObject(value);
    const patch = {};
    BOOLEAN_PREFERENCES.forEach((key) => {
      if (typeof source[key] === "boolean") patch[key] = source[key];
    });
    const dueSoonDays = Number(source.dueSoonDays);
    if (DUE_SOON_OPTIONS.has(dueSoonDays)) patch.dueSoonDays = dueSoonDays;
    return patch;
  }

  function createState(value = {}) {
    const source = safeObject(safeClone(value));
    const preferences = safeObject(source.preferences);
    return {
      ...source,
      readKeys: normalizeKeyList(source.readKeys),
      dismissedKeys: normalizeKeyList(source.dismissedKeys),
      snoozedUntil: normalizeSnoozedUntil(source.snoozedUntil),
      preferences: {
        ...preferences,
        ...DEFAULT_PREFERENCES,
        ...preferencePatch(preferences),
      },
      lastOpenedAt: validTimestamp(source.lastOpenedAt) || null,
    };
  }

  function normalizeProfile(profile) {
    if (!profile || typeof profile !== "object") return profile;
    profile.notificationState = createState(profile.notificationState);
    return profile;
  }

  function importState(profile, incomingState) {
    normalizeProfile(profile);
    const target = profile.notificationState;
    const rawIncoming = safeObject(safeClone(incomingState));
    const incoming = createState(rawIncoming);
    const rawPreferences = safeObject(rawIncoming.preferences);
    profile.notificationState = createState({
      ...target,
      ...incoming,
      readKeys: [...target.readKeys, ...incoming.readKeys],
      dismissedKeys: [...target.dismissedKeys, ...incoming.dismissedKeys],
      snoozedUntil: { ...target.snoozedUntil, ...incoming.snoozedUntil },
      preferences: {
        ...target.preferences,
        ...rawPreferences,
        ...preferencePatch(rawPreferences),
      },
      lastOpenedAt: validTimestamp(rawIncoming.lastOpenedAt) || target.lastOpenedAt,
    });
    return profile.notificationState;
  }

  function validDateInput(value) {
    const text = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
    const date = core.utils.parseLocalDate(text);
    return !Number.isNaN(date.valueOf()) && core.utils.toDateInput(date) === text;
  }

  function todayValue(options = {}) {
    const value = typeof options.today === "function" ? options.today() : options.today;
    const date = value instanceof Date ? new Date(value) : new Date();
    return Number.isNaN(date.valueOf()) ? new Date() : date;
  }

  function safeAmount(value) {
    const amount = Math.abs(Number(value));
    return Number.isFinite(amount) ? amount : 0;
  }

  function entityTimestamp(value, fallback) {
    return validTimestamp(value) || validTimestamp(fallback) || new Date(0).toISOString();
  }

  function categoryFor(profile, categoryId) {
    return (profile?.categories || []).find((category) => category.id === categoryId) || null;
  }

  function accountFor(profile, accountId) {
    return (profile?.accounts || []).find((account) => account.id === accountId) || null;
  }

  function priorityLabel(priority) {
    return priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa";
  }

  function dueText(days) {
    if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? "dia" : "dias"} em atraso`;
    if (days === 0) return "Vence hoje";
    if (days === 1) return "Vence amanhã";
    return `Vence em ${days} dias`;
  }

  function transactionNotifications(profile, today, money) {
    const notifications = [];
    const dueSoonDays = profile.notificationState.preferences.dueSoonDays;
    (profile.transactions || []).forEach((transaction) => {
      if (!transaction?.id || transaction.transferId) return;
      if (!new Set(["expense", "income"]).has(transaction.type)) return;
      if (!core.finance.isOpenTransaction(transaction)) return;
      if (!validDateInput(transaction.date)) return;
      const days = core.utils.daysUntil(transaction.date, today);
      if (!Number.isFinite(days) || days > dueSoonDays) return;
      const condition = days < 0 ? "overdue" : days === 0 ? "due-today" : "due-soon";
      const isExpense = transaction.type === "expense";
      const overdue = days < 0;
      const preferenceKey = isExpense
        ? (overdue ? "overdueExpenses" : "dueSoonExpenses")
        : (overdue ? "overdueIncome" : "dueSoonIncome");
      const category = categoryFor(profile, transaction.categoryId);
      const account = accountFor(profile, transaction.accountId);
      const amount = safeAmount(transaction.amount);
      const subject = isExpense ? "Conta a pagar" : "Conta a receber";
      const title = overdue
        ? `${subject} vencida`
        : days === 0
          ? `${subject} vence hoje`
          : `${subject} próxima do vencimento`;
      notifications.push({
        key: `transaction:${transaction.id}:${transaction.type}:${condition}:${transaction.date}`,
        type: "due",
        subtype: `${transaction.type}-${condition}`,
        preferenceKey,
        priority: overdue || days === 0 ? "high" : "medium",
        priorityLabel: priorityLabel(overdue || days === 0 ? "high" : "medium"),
        tone: overdue || days === 0 ? "danger" : isExpense ? "warning" : "income",
        icon: overdue ? "circle-alert" : days === 0 ? "calendar-check" : "calendar-clock",
        title,
        description: `${transaction.description || subject} · ${money(amount)}`,
        amount,
        date: transaction.date,
        time: dueText(days),
        categoryId: transaction.categoryId || "",
        categoryName: category?.name || "Sem categoria",
        accountId: transaction.accountId || "",
        accountName: account?.name || "Conta não informada",
        profileId: profile.id || "",
        profileName: profile.name || "Perfil",
        transactionId: transaction.id,
        action: "transactions",
        actionId: transaction.id,
        actionLabel: "Abrir",
        sortAt: entityTimestamp(transaction.updatedAt, `${transaction.date}T12:00:00`),
      });
    });
    return notifications;
  }

  function budgetNotifications(profile, today, money) {
    const month = core.utils.toMonthInput(today);
    const summary = core.budgets.summary(profile, month);
    if (!summary.ok) return [];
    return summary.items
      .filter((item) => item.budget?.active !== false && item.status !== "healthy")
      .map((item) => {
        const exceeded = item.status === "exceeded";
        const priority = exceeded ? "high" : "medium";
        return {
          key: `budget:${item.budget.id}:${item.status}:${item.budget.month}`,
          type: "budget",
          subtype: item.status,
          preferenceKey: exceeded ? "budgetExceeded" : "budgetAttention",
          priority,
          priorityLabel: priorityLabel(priority),
          tone: exceeded ? "danger" : "warning",
          icon: exceeded ? "badge-alert" : "gauge",
          title: exceeded ? "Orçamento excedido" : "Orçamento em atenção",
          description: exceeded
            ? `${item.category?.name || "Categoria"} excedeu o limite em ${money(item.exceededBy)}.`
            : `${item.category?.name || "Categoria"} atingiu ${Math.round(item.committedPercent)}% do limite.`,
          amount: item.committed,
          limit: item.limit,
          percent: item.committedPercent,
          remaining: item.remainingCommitted,
          exceededBy: item.exceededBy,
          date: `${item.budget.month}-01`,
          time: `${Math.round(item.committedPercent)}% comprometido`,
          categoryId: item.budget.categoryId,
          categoryName: item.category?.name || "Categoria",
          profileId: profile.id || "",
          profileName: profile.name || "Perfil",
          budgetId: item.budget.id,
          action: "budgets",
          actionId: item.budget.id,
          actionLabel: "Abrir",
          sortAt: entityTimestamp(item.budget.updatedAt, `${item.budget.month}-01T12:00:00`),
        };
      });
  }

  function goalNotifications(profile, today, money) {
    const dueSoonDays = profile.notificationState.preferences.dueSoonDays;
    return (profile.goals || []).flatMap((goal) => {
      const target = Number(goal?.target);
      const saved = Number(goal?.saved);
      if (!goal?.id || !validDateInput(goal.deadline)) return [];
      if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(saved) || saved >= target) return [];
      const days = core.utils.daysUntil(goal.deadline, today);
      if (!Number.isFinite(days) || days > dueSoonDays) return [];
      const condition = days < 0 ? "overdue" : days === 0 ? "due-today" : "due-soon";
      const priority = days <= 0 ? "high" : "medium";
      return [{
        key: `goal:${goal.id}:${condition}:${goal.deadline}`,
        type: "goal",
        subtype: condition,
        preferenceKey: "goals",
        priority,
        priorityLabel: priorityLabel(priority),
        tone: days < 0 ? "danger" : "goal",
        icon: days < 0 ? "circle-alert" : "target",
        title: days < 0 ? "Meta com prazo vencido" : days === 0 ? "Meta vence hoje" : "Meta próxima do prazo",
        description: `${goal.name || "Meta"} · faltam ${money(Math.max(target - saved, 0))}.`,
        amount: Math.max(target - saved, 0),
        date: goal.deadline,
        time: dueText(days),
        profileId: profile.id || "",
        profileName: profile.name || "Perfil",
        goalId: goal.id,
        action: "goals",
        actionId: goal.id,
        actionLabel: "Abrir",
        sortAt: entityTimestamp(goal.updatedAt, `${goal.deadline}T12:00:00`),
      }];
    });
  }

  function syncNotifications(profile, syncStatus) {
    const status = safeObject(syncStatus);
    if (!status.ownerId || status.guest) return [];
    let condition = "";
    let title = "";
    let description = "";
    let priority = "high";
    if (status.status === "conflict" || status.conflict) {
      condition = "conflict";
      title = "Conflito de sincronização";
      description = "Existem versões diferentes dos seus dados e a sincronização aguarda revisão.";
    } else if (status.status === "blocked" || status.blocked) {
      condition = status.canSync === false ? "session-or-server-review" : "blocked";
      title = status.canSync === false ? "Sincronização requer revisão" : "Sincronização bloqueada";
      description = "Seus dados locais estão preservados. Revise o status antes de continuar.";
    } else if (status.status === "error" && status.dirty && status.lastError) {
      condition = "persistent-error";
      title = "Alterações aguardando sincronização";
      description = "Uma falha persistente impediu a confirmação das alterações locais.";
      priority = "medium";
    } else {
      return [];
    }
    const revision = validKey(status.remoteRevision) || String(Number(status.localGeneration) || 0);
    return [{
      key: `sync:${condition}:${revision}`,
      type: "sync",
      subtype: condition,
      preferenceKey: "syncIssues",
      priority,
      priorityLabel: priorityLabel(priority),
      tone: priority === "high" ? "danger" : "warning",
      icon: condition === "conflict" ? "git-compare-arrows" : "cloud-alert",
      title,
      description,
      amount: null,
      date: "",
      time: "Requer atenção",
      profileId: profile.id || "",
      profileName: profile.name || "Perfil",
      action: "settings",
      actionId: condition,
      actionLabel: "Revisar",
      sortAt: entityTimestamp(status.lastAttemptAt, new Date().toISOString()),
    }];
  }

  function sortItems(items) {
    return [...items].sort((a, b) => (
      (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
      || String(b.sortAt || "").localeCompare(String(a.sortAt || ""))
      || String(a.key).localeCompare(String(b.key))
    ));
  }

  function derive(profile, options = {}) {
    normalizeProfile(profile);
    const today = todayValue(options);
    const money = options.money || ((value) => String(value));
    return sortItems([
      ...transactionNotifications(profile, today, money),
      ...budgetNotifications(profile, today, money),
      ...goalNotifications(profile, today, money),
      ...syncNotifications(profile, options.syncStatus),
    ]);
  }

  function cleanupState(profile, activeKeys, now = new Date()) {
    normalizeProfile(profile);
    const state = profile.notificationState;
    const active = activeKeys instanceof Set ? activeKeys : new Set(activeKeys || []);
    state.readKeys = normalizeKeyList(state.readKeys.filter((key) => active.has(key)));
    state.dismissedKeys = normalizeKeyList(state.dismissedKeys.filter((key) => active.has(key)));
    state.snoozedUntil = Object.fromEntries(Object.entries(normalizeSnoozedUntil(state.snoozedUntil))
      .filter(([key, until]) => active.has(key) && new Date(until) > now));
    return state;
  }

  function build(profile, options = {}) {
    normalizeProfile(profile);
    const today = todayValue(options);
    const all = derive(profile, { ...options, today });
    cleanupState(profile, new Set(all.map((item) => item.key)), today);
    const state = profile.notificationState;
    const preferences = state.preferences;
    if (!preferences.enabled) return [];
    const read = new Set(state.readKeys);
    const dismissed = new Set(state.dismissedKeys);
    return all
      .filter((item) => preferences[item.preferenceKey] !== false)
      .filter((item) => !dismissed.has(item.key))
      .filter((item) => !state.snoozedUntil[item.key] || new Date(state.snoozedUntil[item.key]) <= today)
      .map((item) => ({ ...item, isRead: read.has(item.key) }));
  }

  function filterItems(items, filter = "all") {
    const source = Array.isArray(items) ? items : [];
    if (filter === "unread") return source.filter((item) => !item.isRead);
    if (filter === "due") return source.filter((item) => item.type === "due");
    if (filter === "budget") return source.filter((item) => item.type === "budget");
    if (filter === "goal") return source.filter((item) => item.type === "goal");
    if (filter === "sync") return source.filter((item) => item.type === "sync");
    return source;
  }

  function panelItems(profile, options = {}) {
    return build(profile, options).slice(0, 8);
  }

  function badge(profile, options = {}) {
    const count = build(profile, options).filter((item) => !item.isRead).length;
    return { count, label: count > 99 ? "99+" : String(count) };
  }

  function addStateKey(list, key) {
    const normalized = validKey(key);
    if (!normalized) return normalizeKeyList(list);
    return normalizeKeyList([...(list || []).filter((item) => item !== normalized), normalized]);
  }

  function setRead(profile, key, read = true) {
    normalizeProfile(profile);
    const normalized = validKey(key);
    if (!normalized) return false;
    const before = profile.notificationState.readKeys.join("|");
    profile.notificationState.readKeys = read
      ? addStateKey(profile.notificationState.readKeys, normalized)
      : profile.notificationState.readKeys.filter((item) => item !== normalized);
    return before !== profile.notificationState.readKeys.join("|");
  }

  function markAllRead(profile, items) {
    normalizeProfile(profile);
    const before = profile.notificationState.readKeys.join("|");
    (Array.isArray(items) ? items : []).forEach((item) => {
      profile.notificationState.readKeys = addStateKey(profile.notificationState.readKeys, item?.key);
    });
    return before !== profile.notificationState.readKeys.join("|");
  }

  function dismiss(profile, key) {
    normalizeProfile(profile);
    const before = profile.notificationState.dismissedKeys.join("|");
    profile.notificationState.dismissedKeys = addStateKey(profile.notificationState.dismissedKeys, key);
    return before !== profile.notificationState.dismissedKeys.join("|");
  }

  function snooze(profile, key, days, options = {}) {
    normalizeProfile(profile);
    const normalized = validKey(key);
    const duration = Number(days);
    if (!normalized || !new Set([1, 3]).has(duration)) return false;
    const now = todayValue(options);
    const until = new Date(now);
    until.setDate(until.getDate() + duration);
    profile.notificationState.snoozedUntil[normalized] = until.toISOString();
    profile.notificationState.snoozedUntil = normalizeSnoozedUntil(profile.notificationState.snoozedUntil);
    return true;
  }

  function markOpened(profile, options = {}) {
    normalizeProfile(profile);
    const timestamp = todayValue(options).toISOString();
    if (profile.notificationState.lastOpenedAt === timestamp) return false;
    profile.notificationState.lastOpenedAt = timestamp;
    return true;
  }

  function setPreferences(profile, patch) {
    normalizeProfile(profile);
    const validPatch = preferencePatch(patch);
    const before = JSON.stringify(profile.notificationState.preferences);
    profile.notificationState.preferences = {
      ...profile.notificationState.preferences,
      ...validPatch,
    };
    return before !== JSON.stringify(profile.notificationState.preferences);
  }

  core.notifications = Object.freeze({
    DEFAULT_PREFERENCES,
    MAX_STATE_KEYS,
    badge,
    build,
    cleanupState,
    createState,
    derive,
    dismiss,
    filterItems,
    importState,
    markAllRead,
    markOpened,
    normalizeProfile,
    panelItems,
    setPreferences,
    setRead,
    snooze,
    sortItems,
    validDateInput,
  });
})(globalThis);
