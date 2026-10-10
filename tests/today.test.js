"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
[
  "utils", "storage", "categories", "finance", "accounts", "budgets", "transactions",
  "goals", "financial-context", "today",
].forEach((name) => require(path.join(__dirname, "..", "js", "core", `${name}.js`)));

const { financialContext, today } = global.NexioCore;
const referenceDate = "2026-10-05";
const options = { referenceDate, period: "current-month" };

function profile(overrides = {}) {
  return {
    id: "profile", name: "Principal",
    categories: [{ id: "food", name: "Alimentação", type: "expense" }, { id: "home", name: "Casa", type: "expense" }, { id: "income", name: "Salário", type: "income" }],
    accounts: [{ id: "main", name: "Principal", initialBalance: 300, active: true }, { id: "inactive", name: "Antiga", initialBalance: 100, active: false }],
    defaultAccountId: "main", transactions: [], budgets: [], goals: [], ...overrides,
  };
}

function trx(overrides = {}) {
  return { id: "trx", type: "expense", description: "Conta", amount: 50, date: "2026-10-05", categoryId: "home", accountId: "main", status: "Pendente", ...overrides };
}

function get(subject, extra = {}) {
  return today.get(financialContext.get(subject, options), { formatMoney: (value) => `R$ ${Number(value).toFixed(2)}`, ...extra });
}

test("01. perfil vazio mostra estado de dados insuficientes", () => assert.equal(get(profile()).items[0].type, "insufficient-data"));
test("02. perfil com poucos dados não recebe elogio artificial", () => assert.equal(get(profile({ transactions: [trx({ status: "Pago" })] })).items[0].type, "insufficient-data"));
test("03. sem pendências e com base suficiente mostra estado positivo", () => {
  const rows = [trx({ id: "a", status: "Pago" }), trx({ id: "b", status: "Pago", amount: 30 }), trx({ id: "c", type: "income", status: "Recebido", amount: 100, categoryId: "income" })];
  assert.equal(get(profile({ transactions: rows })).items[0].type, "all-clear");
});
test("04. uma obrigação vencida é agrupada", () => assert.equal(get(profile({ transactions: [trx({ status: "Atrasado", date: "2026-10-04" })] })).items[0].title, "Uma conta está vencida"));
test("05. várias obrigações vencidas somam o valor", () => {
  const item = get(profile({ transactions: [trx({ id: "a", status: "Atrasado", date: "2026-10-03", amount: 20 }), trx({ id: "b", status: "Atrasado", date: "2026-10-04", amount: 30 })] })).items[0];
  assert.equal(item.value, 50); assert.equal(item.source.transactionIds.length, 2);
});
test("06. conta paga com data histórica não é vencida", () => assert.notEqual(get(profile({ transactions: [trx({ status: "Pago", date: "2026-09-01" })] })).items[0].type, "overdue-obligations"));
test("07. conta vencendo usa antecedência configurável", () => assert.equal(get(profile({ transactions: [trx({ date: "2026-10-08" })] }), { dueSoonDays: 3 }).items[0].type, "upcoming-obligations"));
test("08. vencida e vencendo geram itens distintos", () => {
  const result = get(profile({ transactions: [trx({ id: "late", status: "Atrasado", date: "2026-10-02" }), trx({ id: "soon", date: "2026-10-06" })] }));
  assert.deepEqual(result.items.map((entry) => entry.type), ["overdue-obligations", "upcoming-obligations"]);
});
test("09. risco negativo projetado aparece", () => assert.equal(get(profile({ transactions: [trx({ amount: 400, date: "2026-10-10" })] })).items[0].type, "negative-cashflow-risk"));
test("10. sem risco negativo não gera risco", () => assert.ok(!get(profile({ transactions: [trx({ amount: 20, date: "2026-10-10" })] })).items.some((entry) => entry.type === "negative-cashflow-risk")));
test("11. orçamento saudável não gera item", () => assert.ok(!get(profile({ transactions: [trx({ categoryId: "food", status: "Pago", amount: 20 })], budgets: [{ id: "budget", categoryId: "food", month: "2026-10", limit: 1000, alertThreshold: 80, active: true }] })).items.some((entry) => entry.type === "budget")));
test("12. orçamento em atenção gera item", () => assert.equal(get(profile({ accounts: [{ id: "main", name: "Principal", initialBalance: 2000, active: true }], transactions: [trx({ categoryId: "food", status: "Pago", amount: 850 })], budgets: [{ id: "budget", categoryId: "food", month: "2026-10", limit: 1000, alertThreshold: 80, active: true }] })).items[0].type, "budget"));
test("13. orçamento excedido informa excesso", () => {
  const item = get(profile({ accounts: [{ id: "main", name: "Principal", initialBalance: 2000, active: true }], transactions: [trx({ categoryId: "food", status: "Pago", amount: 1100 })], budgets: [{ id: "budget", categoryId: "food", month: "2026-10", limit: 1000, alertThreshold: 80, active: true }] })).items[0];
  assert.match(item.message, /R\$ 100\.00 acima/);
});
test("14. vários orçamentos problemáticos geram um item agregado", () => {
  const result = get(profile({ transactions: [trx({ id: "food", categoryId: "food", status: "Pago", amount: 900 }), trx({ id: "home", categoryId: "home", status: "Pago", amount: 900 })], budgets: [{ id: "food-budget", categoryId: "food", month: "2026-10", limit: 1000, alertThreshold: 80, active: true }, { id: "home-budget", categoryId: "home", month: "2026-10", limit: 1000, alertThreshold: 80, active: true }] }));
  assert.equal(result.items.filter((entry) => entry.type === "budget").length, 1);
});
test("15. meta atingida é positiva quando não há itens mais urgentes", () => assert.equal(get(profile({ goals: [{ id: "goal", name: "Reserva", target: 100, saved: 100, history: [], reminders: [] }] })).items[0].type, "goal-complete"));
test("16. meta próxima do prazo tem prioridade de planejamento", () => assert.equal(get(profile({ goals: [{ id: "goal", name: "Viagem", target: 100, saved: 30, deadline: "2026-10-10", history: [], reminders: [] }] })).items[0].type, "goal-deadline"));
test("17. regras simultâneas preservam a prioridade", () => {
  const result = get(profile({ transactions: [trx({ id: "late", status: "Atrasado", date: "2026-10-01" }), trx({ id: "soon", date: "2026-10-06" })], budgets: [{ id: "budget", categoryId: "home", month: "2026-10", limit: 40, alertThreshold: 80, active: true }] }));
  assert.equal(result.items[0].type, "overdue-obligations");
});
test("18. resultado limita os itens principais a três", () => {
  const result = get(profile({ transactions: [trx({ id: "late", status: "Atrasado", date: "2026-10-01" }), trx({ id: "soon", date: "2026-10-06" })], budgets: [{ id: "budget", categoryId: "home", month: "2026-10", limit: 40, alertThreshold: 80, active: true }], goals: [{ id: "goal", name: "Viagem", target: 100, saved: 10, deadline: "2026-10-10", history: [], reminders: [] }] }));
  assert.equal(result.items.length, 3); assert.equal(result.overflowCount, 1);
});
test("19. chaves deduplicam cada situação", () => {
  const result = get(profile({ transactions: [trx({ id: "a", status: "Atrasado", date: "2026-10-01" }), trx({ id: "b", status: "Atrasado", date: "2026-10-02" })] }));
  assert.equal(new Set(result.items.map((entry) => entry.key)).size, result.items.length);
});
test("20. transferência não vira obrigação ou gasto", () => assert.equal(get(profile({ transactions: [trx({ transferId: "transfer", status: "Atrasado", date: "2026-10-01" })] })).items[0].type, "insufficient-data"));
test("21. conta inativa não afeta resultado padrão", () => assert.equal(get(profile({ transactions: [trx({ accountId: "inactive", status: "Atrasado", date: "2026-10-01" })] })).items[0].type, "insufficient-data"));
test("22. resultado inclui razão e ação contextual", () => {
  const item = get(profile({ transactions: [trx({ status: "Atrasado", date: "2026-10-01" })] })).items[0];
  assert.match(item.reason, /vencimento anterior/); assert.deepEqual(item.action, { view: "transactions", label: "Ver contas" });
});
test("23. resultado é imutável", () => assert.equal(Object.isFrozen(get(profile())), true));
test("24. motor não altera o perfil", () => {
  const subject = profile({ transactions: [trx({ status: "Atrasado", date: "2026-10-01" })] }); const before = JSON.stringify(subject); get(subject); assert.equal(JSON.stringify(subject), before);
});
test("25. contexto é calculado uma vez e entregue ao motor", () => {
  const context = financialContext.get(profile({ transactions: [trx({ status: "Atrasado", date: "2026-10-01" })] }), options); assert.equal(today.get(context).items.length, 1);
});
