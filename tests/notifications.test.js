"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
[
  "utils", "storage", "categories", "finance", "accounts", "budgets", "transactions",
  "goals", "notifications", "profiles", "reports",
].forEach((name) => require(path.join(__dirname, "..", "js", "core", `${name}.js`)));

const { accounts, budgets, notifications, profiles, reports } = global.NexioCore;
const fixedToday = new Date(2026, 6, 29, 12, 0, 0, 0);
const fixedIso = "2026-07-29T12:00:00.000Z";
const options = (extra = {}) => ({
  today: fixedToday,
  money: (value) => `R$ ${Number(value).toFixed(2)}`,
  ...extra,
});

function idFactory(tag = "id") {
  let index = 0;
  return (prefix) => `${tag}-${prefix}-${++index}`;
}

function makeProfile(overrides = {}) {
  return {
    id: overrides.id || "profile-1",
    name: overrides.name || "Principal",
    categories: overrides.categories || [
      { id: "cat-food", name: "Alimentação", icon: "🍽️", type: "expense" },
      { id: "cat-home", name: "Casa", icon: "🏠", type: "expense" },
      { id: "cat-income", name: "Salário", icon: "💼", type: "income" },
      { id: "cat-transfer", name: "Transferências", icon: "↔", type: "transfer" },
    ],
    transactions: overrides.transactions || [],
    accounts: overrides.accounts || [
      { id: "account-1", name: "Conta principal", type: "checking", initialBalance: 0, currency: "BRL", active: true },
      { id: "account-2", name: "Carteira", type: "cash", initialBalance: 0, currency: "BRL", active: true },
    ],
    defaultAccountId: overrides.defaultAccountId || "account-1",
    goals: overrides.goals || [],
    imports: overrides.imports || [],
    budgets: overrides.budgets || [],
    ...(overrides.notificationState === undefined ? {} : { notificationState: overrides.notificationState }),
  };
}

function transaction(overrides = {}) {
  return {
    id: overrides.id || "trx-1",
    type: overrides.type || "expense",
    description: overrides.description || "Conta de energia",
    amount: overrides.amount ?? 100,
    date: overrides.date || "2026-07-28",
    categoryId: overrides.categoryId || (overrides.type === "income" ? "cat-income" : "cat-home"),
    accountId: overrides.accountId || "account-1",
    status: overrides.status || "Pendente",
    createdAt: overrides.createdAt || fixedIso,
    updatedAt: overrides.updatedAt || fixedIso,
    ...overrides,
  };
}

function addBudget(profile, overrides = {}) {
  return budgets.add(profile, {
    categoryId: overrides.categoryId || "cat-food",
    month: overrides.month || "2026-07",
    limit: overrides.limit ?? 100,
    alertThreshold: overrides.alertThreshold ?? 80,
    active: overrides.active ?? true,
  }, { uid: overrides.uid || idFactory("budget"), now: fixedToday });
}

function activeItems(profile, extra = {}) {
  return notifications.build(profile, options(extra));
}

test("01. perfil antigo recebe notificationState padrão", () => {
  const profile = makeProfile();
  profiles.ensureProfileShape(profile, { uid: idFactory("shape"), now: fixedToday, currency: "BRL" });
  assert.deepEqual(profile.notificationState, notifications.createState());
});

test("02. normalização é idempotente e preserva campos futuros seguros", () => {
  const profile = makeProfile({ notificationState: { future: { kept: true }, preferences: { dueSoonDays: 5 } } });
  notifications.normalizeProfile(profile);
  const once = JSON.stringify(profile.notificationState);
  notifications.normalizeProfile(profile);
  assert.equal(JSON.stringify(profile.notificationState), once);
  assert.deepEqual(profile.notificationState.future, { kept: true });
});

test("03. preferências padrão são válidas", () => {
  const state = notifications.createState();
  assert.equal(state.preferences.enabled, true);
  assert.equal(state.preferences.dueSoonDays, 3);
  assert.ok(Object.values(state.preferences).every((value) => typeof value === "boolean" || [1, 3, 5, 7].includes(value)));
});

test("04. despesa vencida gera alerta de alta prioridade", () => {
  const item = activeItems(makeProfile({ transactions: [transaction()] }))[0];
  assert.deepEqual([item.type, item.subtype, item.priority], ["due", "expense-overdue", "high"]);
});

test("05. despesa paga não gera alerta", () => {
  assert.equal(activeItems(makeProfile({ transactions: [transaction({ status: "Pago" })] })).length, 0);
});

test("06. despesa vencendo hoje gera alerta", () => {
  const item = activeItems(makeProfile({ transactions: [transaction({ date: "2026-07-29" })] }))[0];
  assert.equal(item.subtype, "expense-due-today");
});

test("07. despesa dentro da antecedência gera alerta", () => {
  const item = activeItems(makeProfile({ transactions: [transaction({ date: "2026-08-01" })] }))[0];
  assert.deepEqual([item.subtype, item.priority], ["expense-due-soon", "medium"]);
});

test("08. despesa fora da antecedência não gera alerta", () => {
  assert.equal(activeItems(makeProfile({ transactions: [transaction({ date: "2026-08-02" })] })).length, 0);
});

test("09. receita vencida gera alerta", () => {
  const item = activeItems(makeProfile({ transactions: [transaction({ type: "income", status: "Atrasado" })] }))[0];
  assert.equal(item.subtype, "income-overdue");
});

test("10. receita recebida não gera alerta", () => {
  assert.equal(activeItems(makeProfile({ transactions: [transaction({ type: "income", status: "Recebido" })] })).length, 0);
});

test("11. transferência não gera alerta", () => {
  assert.equal(activeItems(makeProfile({ transactions: [transaction({ transferId: "transfer-1" })] })).length, 0);
});

test("12. data inválida não quebra o sistema", () => {
  assert.doesNotThrow(() => activeItems(makeProfile({ transactions: [transaction({ date: "2026-02-30" })] })));
  assert.equal(activeItems(makeProfile({ transactions: [transaction({ date: "inválida" })] })).length, 0);
});

test("13. valor inválido não gera NaN ou Infinity", () => {
  const items = activeItems(makeProfile({ transactions: [
    transaction({ id: "nan", amount: "inválido" }),
    transaction({ id: "infinity", amount: Infinity }),
  ] }));
  assert.equal(items.length, 2);
  items.forEach((item) => {
    assert.equal(Number.isFinite(item.amount), true);
    assert.doesNotMatch(item.description, /NaN|Infinity/);
  });
});

test("14. orçamento em Atenção gera alerta", () => {
  const profile = makeProfile({ transactions: [transaction({ id: "budget-spend", amount: 80, date: "2026-07-15", categoryId: "cat-food", status: "Pago" })] });
  addBudget(profile);
  const item = activeItems(profile).find((entry) => entry.type === "budget");
  assert.deepEqual([item.subtype, item.percent], ["warning", 80]);
});

test("15. orçamento Excedido gera alerta", () => {
  const profile = makeProfile({ transactions: [transaction({ amount: 100, date: "2026-07-15", categoryId: "cat-food", status: "Pago" })] });
  addBudget(profile);
  assert.equal(activeItems(profile).find((item) => item.type === "budget").subtype, "exceeded");
});

test("16. orçamento saudável não gera alerta", () => {
  const profile = makeProfile({ transactions: [transaction({ amount: 79, date: "2026-07-15", categoryId: "cat-food", status: "Pago" })] });
  addBudget(profile);
  assert.equal(activeItems(profile).filter((item) => item.type === "budget").length, 0);
});

test("17. orçamento inativo não gera alerta", () => {
  const profile = makeProfile({ transactions: [transaction({ amount: 100, date: "2026-07-15", categoryId: "cat-food", status: "Pago" })] });
  addBudget(profile, { active: false });
  assert.equal(activeItems(profile).filter((item) => item.type === "budget").length, 0);
});

test("18. mudança de Atenção para Excedido troca a condição", () => {
  const row = transaction({ amount: 80, date: "2026-07-15", categoryId: "cat-food", status: "Pago" });
  const profile = makeProfile({ transactions: [row] });
  addBudget(profile, { uid: () => "budget-fixed" });
  const first = activeItems(profile).find((item) => item.type === "budget");
  row.amount = 101;
  const second = activeItems(profile).find((item) => item.type === "budget");
  assert.notEqual(first.key, second.key);
  assert.match(second.key, /:exceeded:/);
});

test("19. chaves são estáveis entre reconstruções", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  assert.deepEqual(activeItems(profile).map((item) => item.key), activeItems(profile).map((item) => item.key));
});

test("20. perfis diferentes não compartilham alertas nem leitura", () => {
  const first = makeProfile({ id: "p-1", transactions: [transaction()] });
  const second = makeProfile({ id: "p-2", transactions: [transaction()] });
  const key = activeItems(first)[0].key;
  notifications.setRead(first, key, true);
  assert.equal(activeItems(first)[0].isRead, true);
  assert.equal(activeItems(second)[0].isRead, false);
});

test("21. filtro de preferência desativa somente um tipo", () => {
  const profile = makeProfile({ transactions: [transaction(), transaction({ id: "income", type: "income", status: "Atrasado" })] });
  notifications.setPreferences(profile, { overdueExpenses: false });
  const items = activeItems(profile);
  assert.equal(items.some((item) => item.subtype === "expense-overdue"), false);
  assert.equal(items.some((item) => item.subtype === "income-overdue"), true);
});

test("22. desativação global oculta alertas", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  notifications.setPreferences(profile, { enabled: false });
  assert.equal(activeItems(profile).length, 0);
});

test("23. marcar como lida persiste a chave", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  const key = activeItems(profile)[0].key;
  assert.equal(notifications.setRead(profile, key, true), true);
  assert.equal(activeItems(profile)[0].isRead, true);
});

test("24. marcar como não lida funciona", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  const key = activeItems(profile)[0].key;
  notifications.setRead(profile, key, true);
  notifications.setRead(profile, key, false);
  assert.equal(activeItems(profile)[0].isRead, false);
});

test("25. marcar todas como lidas funciona", () => {
  const profile = makeProfile({ transactions: [transaction(), transaction({ id: "trx-2", date: "2026-07-29" })] });
  const items = activeItems(profile);
  notifications.markAllRead(profile, items);
  assert.ok(activeItems(profile).every((item) => item.isRead));
});

test("26. dispensar oculta a condição atual", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  notifications.dismiss(profile, activeItems(profile)[0].key);
  assert.equal(activeItems(profile).length, 0);
  assert.equal(profile.transactions.length, 1);
});

test("27. nova condição relevante pode reaparecer", () => {
  const row = transaction();
  const profile = makeProfile({ transactions: [row] });
  const firstKey = activeItems(profile)[0].key;
  notifications.dismiss(profile, firstKey);
  row.date = "2026-07-29";
  const items = activeItems(profile);
  assert.equal(items.length, 1);
  assert.notEqual(items[0].key, firstKey);
});

test("28. adiar por um dia oculta a notificação", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  const key = activeItems(profile)[0].key;
  notifications.snooze(profile, key, 1, { today: fixedToday });
  assert.equal(activeItems(profile).length, 0);
});

test("29. adiamento expirado reaparece se a condição continuar", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  const key = activeItems(profile)[0].key;
  notifications.snooze(profile, key, 1, { today: fixedToday });
  const later = new Date(2026, 6, 31, 12, 0, 0, 0);
  assert.equal(activeItems(profile, { today: later }).length, 1);
});

test("30. adiar não altera a transação", () => {
  const row = transaction();
  const profile = makeProfile({ transactions: [row] });
  const before = JSON.stringify(row);
  notifications.snooze(profile, activeItems(profile)[0].key, 3, { today: fixedToday });
  assert.equal(JSON.stringify(row), before);
});

test("31. badge conta somente não lidas ativas", () => {
  const profile = makeProfile({ transactions: [transaction(), transaction({ id: "trx-2", date: "2026-07-29" })] });
  const first = activeItems(profile)[0];
  notifications.setRead(profile, first.key, true);
  assert.deepEqual(notifications.badge(profile, options()), { count: 1, label: "1" });
});

test("32. badge usa 99+", () => {
  const rows = Array.from({ length: 100 }, (_, index) => transaction({ id: `trx-${index}` }));
  const profile = makeProfile({ transactions: rows });
  assert.deepEqual(notifications.badge(profile, options()), { count: 100, label: "99+" });
});

test("33. ordenação respeita prioridade", () => {
  const sorted = notifications.sortItems([
    { key: "low", priority: "low", sortAt: fixedIso },
    { key: "high", priority: "high", sortAt: "2020-01-01T00:00:00.000Z" },
    { key: "medium", priority: "medium", sortAt: "2030-01-01T00:00:00.000Z" },
  ]);
  assert.deepEqual(sorted.map((item) => item.key), ["high", "medium", "low"]);
});

test("34. ordenação respeita recência na mesma prioridade", () => {
  const sorted = notifications.sortItems([
    { key: "old", priority: "medium", sortAt: "2026-01-01T00:00:00.000Z" },
    { key: "new", priority: "medium", sortAt: "2026-02-01T00:00:00.000Z" },
  ]);
  assert.deepEqual(sorted.map((item) => item.key), ["new", "old"]);
});

test("35. limite do painel é oito", () => {
  const rows = Array.from({ length: 12 }, (_, index) => transaction({ id: `trx-${index}` }));
  assert.equal(notifications.panelItems(makeProfile({ transactions: rows }), options()).length, 8);
});

test("36. filtro Todas funciona", () => {
  const items = [{ type: "due" }, { type: "budget" }];
  assert.deepEqual(notifications.filterItems(items, "all"), items);
});

test("37. filtro Não lidas funciona", () => {
  assert.deepEqual(notifications.filterItems([{ key: "a", isRead: false }, { key: "b", isRead: true }], "unread").map((item) => item.key), ["a"]);
});

test("38. filtro Vencimentos funciona", () => {
  assert.deepEqual(notifications.filterItems([{ key: "a", type: "due" }, { key: "b", type: "budget" }], "due").map((item) => item.key), ["a"]);
});

test("39. filtro Orçamentos funciona", () => {
  assert.deepEqual(notifications.filterItems([{ key: "a", type: "due" }, { key: "b", type: "budget" }], "budget").map((item) => item.key), ["b"]);
});

test("40. ação referencia a transação correta", () => {
  const item = activeItems(makeProfile({ transactions: [transaction({ id: "trx-correct" })] }))[0];
  assert.deepEqual([item.action, item.actionId, item.transactionId], ["transactions", "trx-correct", "trx-correct"]);
});

test("41. ação referencia o orçamento correto", () => {
  const profile = makeProfile({ transactions: [transaction({ amount: 100, date: "2026-07-15", categoryId: "cat-food", status: "Pago" })] });
  addBudget(profile, { uid: () => "budget-correct" });
  const item = activeItems(profile).find((entry) => entry.type === "budget");
  assert.deepEqual([item.action, item.actionId, item.budgetId], ["budgets", "budget-correct", "budget-correct"]);
});

test("42. exclusão de transação remove o alerta derivado", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  assert.equal(activeItems(profile).length, 1);
  profile.transactions = [];
  assert.equal(activeItems(profile).length, 0);
});

test("43. pagamento remove o alerta vencido", () => {
  const row = transaction();
  const profile = makeProfile({ transactions: [row] });
  row.status = "Pago";
  assert.equal(activeItems(profile).length, 0);
});

test("44. alteração de data recalcula a condição", () => {
  const row = transaction();
  const profile = makeProfile({ transactions: [row] });
  const oldKey = activeItems(profile)[0].key;
  row.date = "2026-07-29";
  const current = activeItems(profile)[0];
  assert.notEqual(current.key, oldKey);
  assert.equal(current.subtype, "expense-due-today");
});

test("45. troca de perfil troca o estado visual", () => {
  const first = makeProfile({ id: "first", name: "Primeiro", transactions: [transaction()] });
  const second = makeProfile({ id: "second", name: "Segundo", transactions: [transaction()] });
  notifications.setRead(first, activeItems(first)[0].key, true);
  assert.deepEqual([activeItems(first)[0].profileName, activeItems(first)[0].isRead], ["Primeiro", true]);
  assert.deepEqual([activeItems(second)[0].profileName, activeItems(second)[0].isRead], ["Segundo", false]);
});

test("46. limpeza limita readKeys", () => {
  const state = notifications.createState({ readKeys: Array.from({ length: 550 }, (_, index) => `key-${index}`) });
  assert.equal(state.readKeys.length, notifications.MAX_STATE_KEYS);
  assert.equal(state.readKeys[0], "key-50");
});

test("47. limpeza limita dismissedKeys", () => {
  const state = notifications.createState({ dismissedKeys: Array.from({ length: 550 }, (_, index) => `key-${index}`) });
  assert.equal(state.dismissedKeys.length, notifications.MAX_STATE_KEYS);
  assert.equal(state.dismissedKeys[0], "key-50");
});

test("48. snoozedUntil inválido é ignorado", () => {
  const state = notifications.createState({ snoozedUntil: { valid: "2026-08-01T00:00:00.000Z", badDate: "nunca", "chave inválida": fixedIso } });
  assert.deepEqual(state.snoozedUntil, { valid: "2026-08-01T00:00:00.000Z" });
});

test("49. exportação inclui notificationState sem alertas derivados", () => {
  const profile = makeProfile({ transactions: [transaction()] });
  notifications.normalizeProfile(profile);
  notifications.setRead(profile, activeItems(profile)[0].key, true);
  const exported = reports.buildExportProfile(profile, { now: fixedToday });
  assert.ok(exported.profile.notificationState);
  assert.equal(Object.hasOwn(exported.profile.notificationState, "notifications"), false);
});

test("50. exportação continua sanitizada", () => {
  const profile = makeProfile({ notificationState: { future: { password: "segredo", safe: "ok" }, preferences: {} } });
  notifications.normalizeProfile(profile);
  const exported = reports.buildExportProfile(profile, { now: fixedToday });
  assert.equal(JSON.stringify(exported).includes("segredo"), false);
  assert.deepEqual(exported.profile.notificationState.future, { safe: "ok" });
});

test("51. importação válida preserva preferências", () => {
  const profile = makeProfile({ notificationState: { preferences: { goals: true, dueSoonDays: 3 } } });
  notifications.importState(profile, { preferences: { goals: false, dueSoonDays: 7 } });
  assert.deepEqual([profile.notificationState.preferences.goals, profile.notificationState.preferences.dueSoonDays], [false, 7]);
});

test("52. importação limita listas e valida datas", () => {
  const profile = makeProfile();
  notifications.importState(profile, {
    readKeys: Array.from({ length: 550 }, (_, index) => `read-${index}`),
    dismissedKeys: Array.from({ length: 550 }, (_, index) => `dismiss-${index}`),
    snoozedUntil: { good: "2026-08-03T00:00:00.000Z", bad: "inválida" },
  });
  assert.deepEqual([profile.notificationState.readKeys.length, profile.notificationState.dismissedKeys.length], [500, 500]);
  assert.deepEqual(profile.notificationState.snoozedUntil, { good: "2026-08-03T00:00:00.000Z" });
});

test("53. metas sem dados suficientes não geram alerta falso", () => {
  const profile = makeProfile({ goals: [{ id: "goal-1", name: "Reserva", target: 1000, saved: 100 }] });
  assert.equal(activeItems(profile).filter((item) => item.type === "goal").length, 0);
});

test("54. estado de sincronização seguro gera alerta quando aplicável", () => {
  const syncStatus = { ownerId: "user-1", status: "conflict", conflict: true, remoteRevision: "12", lastAttemptAt: fixedIso, token: "não-expor" };
  const item = activeItems(makeProfile(), { syncStatus }).find((entry) => entry.type === "sync");
  assert.equal(item.subtype, "conflict");
  assert.equal(JSON.stringify(item).includes("não-expor"), false);
});

test("55. erro transitório não gera alerta permanente", () => {
  const syncStatus = { ownerId: "user-1", status: "retrying", dirty: true, lastError: "rede indisponível" };
  assert.equal(activeItems(makeProfile(), { syncStatus }).filter((item) => item.type === "sync").length, 0);
});

test("56. sanitização de segurança remove credenciais do estado", () => {
  const state = notifications.createState({ future: { token: "abc", refresh_token: "def", nested: { safe: true } } });
  assert.equal(JSON.stringify(state).includes("abc"), false);
  assert.deepEqual(state.future, { nested: { safe: true } });
});

test("57. integração não cria upsert e preserva a referência CAS", () => {
  const root = path.join(__dirname, "..");
  const source = fs.readFileSync(path.join(root, "js", "core", "sync.js"), "utf8");
  assert.doesNotMatch(source, /\.upsert\s*\(/);
  assert.match(source, /nexio_save_user_data_cas/);
});

test("58. contas e transferências continuam isoladas dos alertas", () => {
  const profile = makeProfile();
  const result = accounts.createTransfer(profile, {
    fromAccountId: "account-1",
    toAccountId: "account-2",
    amount: 75,
    date: "2026-07-28",
    categoryId: "cat-transfer",
  }, { uid: idFactory("transfer"), now: fixedToday });
  assert.equal(result.ok, true);
  assert.equal(activeItems(profile).length, 0);
  assert.equal(accounts.consolidatedBalance(profile), 0);
});

test("59. orçamentos continuam excluindo transferências", () => {
  const profile = makeProfile({ transactions: [transaction({ transferId: "transfer-1", amount: 500, date: "2026-07-15", categoryId: "cat-food", status: "Pago" })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).committed, 0);
  assert.equal(activeItems(profile).filter((item) => item.type === "budget").length, 0);
});

test("60. meta confiável próxima ou vencida gera alerta", () => {
  const profile = makeProfile({ goals: [{ id: "goal-safe", name: "Reserva", target: 1000, saved: 250, deadline: "2026-08-01", updatedAt: fixedIso }] });
  const item = activeItems(profile).find((entry) => entry.type === "goal");
  assert.deepEqual([item.subtype, item.actionId], ["due-soon", "goal-safe"]);
});

test("61. normalização remove autenticação e coleções derivadas sem perder campos futuros seguros", () => {
  const state = notifications.createState({
    future: {
      safe: { kept: true },
      claims: { role: "authenticated" },
      auth: { user: "hidden" },
      tokens: ["secret"],
      credentials: { password: "secret" },
    },
    notifications: [{ key: "derived" }],
    alerts: [{ key: "derived-alert" }],
  });
  assert.deepEqual(state.future, { safe: { kept: true } });
  assert.equal(Object.hasOwn(state, "notifications"), false);
  assert.equal(Object.hasOwn(state, "alerts"), false);
});

test("62. listas normalizadas removem duplicadas, vazias e chaves excessivas sem alterar dados financeiros", () => {
  const profile = makeProfile({
    transactions: [transaction()],
    goals: [{ id: "goal-1", target: 100, saved: 10, deadline: "2026-08-01" }],
    notificationState: { readKeys: ["", "valid", "valid", "x".repeat(301)] },
  });
  const before = JSON.stringify({
    transactions: profile.transactions,
    accounts: profile.accounts,
    budgets: profile.budgets,
    goals: profile.goals,
  });
  notifications.normalizeProfile(profile);
  assert.deepEqual(profile.notificationState.readKeys, ["valid"]);
  assert.equal(JSON.stringify({
    transactions: profile.transactions,
    accounts: profile.accounts,
    budgets: profile.budgets,
    goals: profile.goals,
  }), before);
});

test("63. data de abertura e antecedência inválidas recebem padrões seguros", () => {
  const state = notifications.createState({
    lastOpenedAt: "inválida",
    preferences: { dueSoonDays: 2, enabled: "sim" },
  });
  assert.equal(state.lastOpenedAt, null);
  assert.deepEqual([state.preferences.dueSoonDays, state.preferences.enabled], [3, true]);
});

test("64. limites de amanhã, fim da antecedência e virada de ano são determinísticos", () => {
  const yearEnd = new Date(2026, 11, 30, 12, 0, 0, 0);
  const profile = makeProfile({ transactions: [
    transaction({ id: "tomorrow", date: "2026-12-31" }),
    transaction({ id: "limit", date: "2027-01-02" }),
    transaction({ id: "outside", date: "2027-01-03" }),
  ] });
  const items = notifications.build(profile, options({ today: yearEnd }));
  assert.deepEqual(items.map((item) => [item.transactionId, item.subtype]).sort(), [
    ["limit", "expense-due-soon"],
    ["tomorrow", "expense-due-soon"],
  ]);
});

test("65. redução abaixo do limite remove o alerta de orçamento excedido", () => {
  const row = transaction({ amount: 110, date: "2026-07-15", categoryId: "cat-food", status: "Pago" });
  const profile = makeProfile({ transactions: [row] });
  addBudget(profile, { uid: () => "budget-reduced" });
  assert.equal(activeItems(profile).find((item) => item.type === "budget").subtype, "exceeded");
  row.amount = 79;
  assert.equal(activeItems(profile).some((item) => item.type === "budget"), false);
});

test("66. metas concluídas ou inválidas não alertam e meta vencida incompleta tem prioridade alta", () => {
  const profile = makeProfile({ goals: [
    { id: "completed", name: "Concluída", target: 100, saved: 100, deadline: "2026-07-28" },
    { id: "invalid", name: "Inválida", target: 100, saved: "inválido", deadline: "2026-07-28" },
    { id: "overdue", name: "Atrasada", target: 100, saved: 10, deadline: "2026-07-28" },
  ] });
  const goals = activeItems(profile).filter((item) => item.type === "goal");
  assert.deepEqual(goals.map((item) => [item.goalId, item.subtype, item.priority]), [
    ["overdue", "overdue", "high"],
  ]);
});

test("67. sincronização alerta só estados persistentes ou bloqueantes e desaparece quando resolvida", () => {
  const profile = makeProfile();
  const persistent = activeItems(profile, {
    syncStatus: { ownerId: "user-1", status: "error", dirty: true, lastError: "safe", localGeneration: 4 },
  }).filter((item) => item.type === "sync");
  const blocked = activeItems(profile, {
    syncStatus: { ownerId: "user-1", status: "blocked", blocked: true, lastError: "stack trace hidden" },
  }).filter((item) => item.type === "sync");
  const resolved = activeItems(profile, {
    syncStatus: { ownerId: "user-1", status: "synced", dirty: false },
  }).filter((item) => item.type === "sync");
  const guest = activeItems(profile, {
    syncStatus: { ownerId: "guest", guest: true, status: "blocked", blocked: true },
  }).filter((item) => item.type === "sync");
  assert.deepEqual([persistent[0].priority, blocked[0].priority, resolved.length, guest.length], ["medium", "high", 0, 0]);
  assert.doesNotMatch(JSON.stringify(blocked[0]), /stack trace hidden/);
});

test("68. preferências recalculam imediatamente sem apagar leitura ou dispensa", () => {
  const profile = makeProfile({ transactions: [transaction({ date: "2026-08-03" })] });
  assert.equal(activeItems(profile).length, 0);
  notifications.setPreferences(profile, { dueSoonDays: 5 });
  const key = activeItems(profile)[0].key;
  notifications.setRead(profile, key, true);
  notifications.dismiss(profile, key);
  notifications.setPreferences(profile, { enabled: false });
  assert.equal(activeItems(profile).length, 0);
  assert.deepEqual(profile.notificationState.readKeys, [key]);
  assert.deepEqual(profile.notificationState.dismissedKeys, [key]);
});

test("69. importação não compartilha referências e permanece idempotente", () => {
  const source = {
    readKeys: ["safe-key"],
    preferences: { dueSoonDays: 7 },
    future: { safe: { kept: true } },
  };
  const profile = makeProfile();
  notifications.importState(profile, source);
  source.readKeys.push("later");
  source.future.safe.kept = false;
  const once = JSON.stringify(profile.notificationState);
  notifications.normalizeProfile(profile);
  assert.equal(JSON.stringify(profile.notificationState), once);
  assert.deepEqual(profile.notificationState.readKeys, ["safe-key"]);
  assert.deepEqual(profile.notificationState.future, { safe: { kept: true } });
});

test("70. filtros de Metas e Sincronização selecionam somente o tipo correto", () => {
  const items = [
    { key: "goal", type: "goal" },
    { key: "sync", type: "sync" },
    { key: "due", type: "due" },
  ];
  assert.deepEqual(notifications.filterItems(items, "goal").map((item) => item.key), ["goal"]);
  assert.deepEqual(notifications.filterItems(items, "sync").map((item) => item.key), ["sync"]);
});

test("71. categoria e conta ausentes usam apresentação segura e a chave não contém dados visíveis", () => {
  const profile = makeProfile({ transactions: [transaction({
    id: "trx-safe",
    description: "Segredo financeiro 123,45",
    categoryId: "missing-category",
    accountId: "missing-account",
  })] });
  const item = activeItems(profile)[0];
  assert.deepEqual([item.categoryName, item.accountName], ["Sem categoria", "Conta não informada"]);
  assert.doesNotMatch(item.key, /Segredo|123|missing-category|missing-account/);
});
