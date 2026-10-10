"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
[
  "utils", "storage", "categories", "finance", "accounts", "budgets", "transactions",
  "goals", "financial-context",
].forEach((name) => require(path.join(__dirname, "..", "js", "core", `${name}.js`)));

const { financialContext, finance } = global.NexioCore;
const referenceDate = "2026-10-05";

function profile(overrides = {}) {
  return {
    id: "profile-1",
    name: "Principal",
    categories: [
      { id: "food", name: "Alimentação", type: "expense" },
      { id: "home", name: "Casa", type: "expense" },
      { id: "salary", name: "Salário", type: "income" },
    ],
    accounts: [
      { id: "main", name: "Principal", initialBalance: 100, active: true },
      { id: "reserve", name: "Reserva", initialBalance: 50, active: true },
      { id: "inactive", name: "Antiga", initialBalance: 80, active: false },
    ],
    defaultAccountId: "main",
    transactions: [], budgets: [], goals: [],
    ...overrides,
  };
}

function trx(overrides = {}) {
  return {
    id: "trx-1", type: "expense", description: "Conta", amount: 50, date: "2026-10-05",
    categoryId: "home", accountId: "main", status: "Pendente", ...overrides,
  };
}

function context(subject, options = {}) {
  return financialContext.get(subject, { referenceDate, period: "current-month", ...options });
}

test("01. perfil sem transações mantém saldo inicial e informa base insuficiente", () => {
  const result = context(profile());
  assert.equal(result.summary.settledBalance.value, 150);
  assert.equal(result.summary.projectedBalance.value, 150);
  assert.equal(result.quality.state, "insufficient");
  assert.equal(Object.isFrozen(result), true);
});

test("02. somente receitas e somente despesas liquidadas preservam saldo e totais realizados", () => {
  const income = context(profile({ transactions: [trx({ id: "income", type: "income", amount: 300, status: "Recebido", categoryId: "salary" })] }));
  assert.equal(income.summary.settledBalance.value, 450);
  assert.equal(income.summary.realizedIncome.value, 300);
  const expense = context(profile({ transactions: [trx({ id: "expense", amount: 40, status: "Pago" })] }));
  assert.equal(expense.summary.settledBalance.value, 110);
  assert.equal(expense.summary.realizedExpense.value, 40);
});

test("03. realizado e projetado mantêm significados distintos", () => {
  const result = context(profile({ transactions: [
    trx({ id: "received", type: "income", amount: 200, status: "Recebido", categoryId: "salary" }),
    trx({ id: "paid", amount: 70, status: "Pago" }),
    trx({ id: "pending", amount: 30, status: "Pendente" }),
  ] }));
  assert.equal(result.summary.settledBalance.value, 280);
  assert.equal(result.summary.projectedBalance.value, 250);
  assert.equal(result.summary.committedExpense.value, 30);
});

test("04. pendências, atrasos, futuros e vencimentos são derivados sem novas entidades", () => {
  const result = context(profile({ transactions: [
    trx({ id: "late", amount: 20, date: "2026-10-02", status: "Atrasado" }),
    trx({ id: "today", amount: 30, date: "2026-10-05", status: "Pendente" }),
    trx({ id: "future", amount: 40, date: "2026-10-20", status: "Pendente" }),
  ] }));
  assert.equal(result.summary.pendingExpense.value, 50);
  assert.deepEqual(result.obligations.overdue.map((item) => item.id), ["late"]);
  assert.deepEqual(result.obligations.upcoming.map((item) => item.id), ["today", "future"]);
  assert.equal(result.summary.futureExpense.value, 40);
});

test("05. parcelas existentes entram uma vez no presente e no futuro", () => {
  const result = context(profile({ transactions: [
    trx({ id: "installment-1", amount: 100, date: "2026-10-03", status: "Pago", installmentGroupId: "group", installmentNumber: 1, installmentTotal: 2 }),
    trx({ id: "installment-2", amount: 100, date: "2026-11-03", status: "Pendente", installmentGroupId: "group", installmentNumber: 2, installmentTotal: 2 }),
  ] }));
  assert.equal(result.summary.realizedExpense.value, 100);
  assert.equal(result.summary.futureExpense.value, 100);
  assert.equal(result.summary.projectedBalance.value, -50);
});

test("06. transferência é neutra no consolidado e permanece na conta individual", () => {
  const transfer = [
    trx({ id: "out", amount: 500, status: "Pago", accountId: "main", transferId: "transfer-1", type: "expense" }),
    trx({ id: "in", amount: 500, status: "Recebido", accountId: "reserve", transferId: "transfer-1", type: "income", categoryId: "salary" }),
  ];
  const all = context(profile({ transactions: transfer }));
  const one = context(profile({ transactions: transfer }), { accountId: "main" });
  assert.equal(all.summary.settledBalance.value, 150);
  assert.equal(all.summary.realizedIncome.value, 0);
  assert.equal(all.summary.realizedExpense.value, 0);
  assert.equal(one.summary.settledBalance.value, -400);
});

test("07. orçamento é exposto sem virar reserva de saldo", () => {
  const result = context(profile({
    transactions: [trx({ id: "food-paid", categoryId: "food", amount: 400, status: "Pago" })],
    budgets: [{ id: "food-budget", categoryId: "food", month: "2026-10", limit: 1000, alertThreshold: 80, active: true }],
  }));
  assert.equal(result.budgets.items[0].limit, 1000);
  assert.equal(result.budgets.items[0].spent, 400);
  assert.equal(result.summary.settledBalance.value, -250);
});

test("08. meta sem vínculo com conta não reduz saldo", () => {
  const result = context(profile({ goals: [{ id: "goal", name: "Viagem", target: 1000, saved: 700, history: [], reminders: [] }] }));
  assert.equal(result.goals.saved, 700);
  assert.equal(result.summary.settledBalance.value, 150);
});

test("09. contas ativas definem o consolidado padrão e escopo pode incluir inativa", () => {
  const subject = profile({ transactions: [trx({ id: "old", accountId: "inactive", amount: 20, status: "Pago" })] });
  assert.equal(context(subject).summary.settledBalance.value, 150);
  assert.equal(context(subject, { includeInactive: true }).summary.settledBalance.value, 210);
});

test("10. períodos atual, anterior e equivalente preservam limites de data", () => {
  const current = financialContext.createPeriod("current-month", { referenceDate });
  const previous = financialContext.createPeriod("previous-month", { referenceDate });
  const equivalent = financialContext.equivalentPeriod({ kind: "custom", start: "2026-10-01", end: "2026-10-05" });
  assert.deepEqual(current, { kind: "month", start: "2026-10-01", end: "2026-10-31" });
  assert.deepEqual(previous, { kind: "month", start: "2026-09-01", end: "2026-09-30" });
  assert.deepEqual(equivalent, { kind: "equivalent-previous", start: "2026-09-01", end: "2026-09-05" });
});

test("11. projeção identifica saldo negativo usando a regra de fluxo de caixa existente", () => {
  const result = context(profile({ transactions: [trx({ id: "risk", amount: 200, date: "2026-10-10", status: "Pendente" })] }));
  assert.equal(result.projection.risk.state, "negative");
  assert.equal(result.projection.risk.firstNegativeDate, "2026-10-10");
});

test("12. auditoria é opcional, rastreia inclusões e a consulta não altera o perfil", () => {
  const subject = profile({ transactions: [trx({ id: "main-paid", status: "Pago" }), trx({ id: "old-paid", accountId: "inactive", status: "Pago" })] });
  const before = JSON.stringify(subject);
  const result = context(subject, { includeAudit: true });
  assert.equal(JSON.stringify(subject), before);
  assert.deepEqual(result.audit.includedTransactionIds, ["main-paid"]);
  assert.deepEqual(result.audit.excludedTransactions, [{ id: "old-paid", reason: "outside-account-scope" }]);
  assert.equal(result.summary.settledBalance.includedCount, 1);
  assert.equal(result.transactions.excludedCount, 1);
});

test("13. movimentos liquidados com data passada não recebem prioridade de vencimento", () => {
  assert.deepEqual(finance.cashflowPriority(trx({ status: "Pago", date: "2026-09-01", amount: 999 } ), new Date(2026, 9, 5)), { level: "low", label: "Baixa" });
  assert.deepEqual(finance.cashflowPriority(trx({ type: "income", status: "Recebido", date: "2026-09-01", amount: 999 }), new Date(2026, 9, 5)), { level: "low", label: "Baixa" });
  assert.deepEqual(finance.cashflowPriority(trx({ status: "Pendente", date: "2026-09-01" }), new Date(2026, 9, 5)), { level: "high", label: "Alta" });
});
