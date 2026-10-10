"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
[
  "utils", "storage", "categories", "finance", "accounts", "budgets", "transactions",
  "goals", "financial-context", "spendable", "purchase-simulator",
].forEach((name) => require(path.join(__dirname, "..", "js", "core", `${name}.js`)));

const { purchaseSimulator } = global.NexioCore;
const referenceDate = "2026-10-05";

function profile(overrides = {}) {
  return {
    id: "profile", name: "Principal",
    categories: [{ id: "food", name: "Alimentação", type: "expense" }, { id: "leisure", name: "Lazer", type: "expense" }, { id: "income", name: "Salário", type: "income" }],
    accounts: [{ id: "main", name: "Principal", initialBalance: 1000, active: true }, { id: "second", name: "Reserva", initialBalance: 500, active: true }, { id: "inactive", name: "Antiga", initialBalance: 900, active: false }],
    defaultAccountId: "main", transactions: [], budgets: [], goals: [], ...overrides,
  };
}

function trx(overrides = {}) {
  return { id: "trx", type: "expense", description: "Conta", amount: 100, date: "2026-10-05", categoryId: "food", accountId: "main", status: "Pendente", ...overrides };
}

function rows() {
  return [
    trx({ id: "paid-a", amount: 20, status: "Pago", date: "2026-10-02" }),
    trx({ id: "paid-b", amount: 30, status: "Pago", date: "2026-10-03" }),
    trx({ id: "income-a", type: "income", amount: 200, status: "Recebido", categoryId: "income", date: "2026-10-04" }),
  ];
}

function simulate(subject, overrides = {}, options = {}) {
  return purchaseSimulator.simulate(subject, {
    amount: 300, categoryId: "food", accountId: "main", date: referenceDate, paymentType: "cash", ...overrides,
  }, { referenceDate, ...options });
}

test("01. compra à vista reduz valor livre, projeção e não grava nada", () => {
  const subject = profile({ transactions: rows() });
  const before = JSON.stringify(subject);
  const result = simulate(subject, { amount: 300 });
  assert.equal(result.ok, true); assert.equal(result.impact.spendable, -300); assert.equal(result.impact.projectedBalance, -300);
  assert.equal(result.trace.persisted, false); assert.equal(JSON.stringify(subject), before);
});

test("02. compra parcelada cria parcelas equivalentes e soma exata", () => {
  const result = simulate(profile({ transactions: rows() }), { amount: 1200, paymentType: "installments", installments: 6 });
  assert.equal(result.installments.length, 6); assert.equal(result.purchase.totalCommitment, 1200);
  assert.equal(result.installments.reduce((sum, item) => sum + item.amount, 0), 1200);
  assert.deepEqual(result.monthlyImpact.map((item) => item.amount), [200, 200, 200, 200, 200, 200]);
});

test("03. R$ 100 em 3x preserva centavos e ajusta a última parcela", () => {
  const result = simulate(profile({ transactions: rows() }), { amount: 100, paymentType: "installments", installments: 3 });
  assert.deepEqual(result.installments.map((item) => item.amount), [33.33, 33.33, 33.34]);
  assert.equal(result.purchase.totalCommitment, 100);
});

test("04. somente a parcela do horizonte atual reduz o valor livre", () => {
  const result = simulate(profile({ transactions: rows() }), { amount: 1200, paymentType: "installments", installments: 12 });
  assert.equal(result.impact.spendable, -100); assert.equal(result.purchase.totalCommitment, 1200);
});

test("05. projeção e risco comparam cenário antes e depois", () => {
  const result = simulate(profile({ accounts: [{ id: "main", initialBalance: 50, active: true }], transactions: rows() }), { amount: 500 });
  assert.equal(result.after.projectedBalance, result.before.projectedBalance - 500);
  assert.equal(result.risk.change.state, "created");
});

test("06. risco já existente não é atribuído à compra", () => {
  const subject = profile({ accounts: [{ id: "main", initialBalance: 10, active: true }], transactions: [...rows(), trx({ id: "already-risk", amount: 500, date: "2026-10-20" })] });
  const result = simulate(subject, { amount: 10, date: "2026-10-10" });
  assert.notEqual(result.risk.change.state, "created");
});

test("07. compra pode antecipar risco existente", () => {
  const subject = profile({ accounts: [{ id: "main", initialBalance: 100, active: true }], transactions: [...rows(), trx({ id: "later-risk", amount: 500, date: "2026-10-20" })] });
  const result = simulate(subject, { amount: 400, date: "2026-10-10" });
  assert.equal(result.risk.change.state, "anticipated");
});

test("08. orçamento saudável, atenção e excedido usam o cálculo existente", () => {
  const budgets = [{ id: "budget", categoryId: "food", month: "2026-10", limit: 500, alertThreshold: 80, active: true }];
  const healthy = simulate(profile({ transactions: [...rows(), trx({ id: "small", amount: 50, status: "Pago" })], budgets }), { amount: 100 });
  const warning = simulate(profile({ transactions: [...rows(), trx({ id: "large", amount: 300, status: "Pago" })], budgets }), { amount: 50 });
  const exceeded = simulate(profile({ transactions: [...rows(), trx({ id: "near", amount: 450, status: "Pago" })], budgets }), { amount: 100 });
  assert.equal(healthy.budget.after.status, "healthy"); assert.equal(warning.budget.after.status, "warning"); assert.equal(exceeded.budget.after.status, "exceeded");
});

test("09. categoria sem orçamento não inventa limite", () => {
  const result = simulate(profile({ transactions: rows() }), { categoryId: "leisure" });
  assert.equal(result.budget, null);
});

test("10. receita futura não aumenta valor livre, obrigação atrasada entra e transferência é neutra", () => {
  const base = profile({ transactions: [...rows(), trx({ id: "future-income", type: "income", amount: 900, status: "Pendente", categoryId: "income", date: "2026-10-20" }), trx({ id: "late", amount: 200, status: "Atrasado", date: "2026-10-01" }), trx({ id: "transfer", amount: 999, transferId: "x", status: "Pendente" })] });
  const result = simulate(base, { amount: 100 });
  assert.equal(result.before.spendable, 950); assert.equal(result.impact.spendable, -100);
});

test("11. escopo respeita conta específica, múltiplas contas e rejeita inativa", () => {
  const secondRows = rows().map((item) => ({ ...item, accountId: "second" }));
  const multi = simulate(profile({ transactions: secondRows }), { accountId: "second", amount: 200 });
  assert.equal(multi.purchase.accountId, "second"); assert.equal(multi.before.spendable, 650);
  const inactive = simulate(profile({ transactions: rows() }), { accountId: "inactive" });
  assert.equal(inactive.ok, false);
});

test("12. perfil vazio, sem conta e entradas inválidas são recusados", () => {
  assert.equal(simulate(profile({ accounts: [], transactions: [] })).ok, false);
  assert.equal(simulate(profile({ transactions: rows() }), { amount: 0 }).ok, false);
  assert.equal(simulate(profile({ transactions: rows() }), { amount: -1 }).ok, false);
  assert.equal(simulate(profile({ transactions: rows() }), { categoryId: "income" }).ok, false);
  assert.equal(simulate(profile({ transactions: rows() }), { paymentType: "installments", installments: 1 }).ok, false);
});

test("13. simulação é repetível, imutável e rastreável", () => {
  const subject = profile({ transactions: rows() });
  const first = simulate(subject, { amount: 100 });
  const second = simulate(subject, { amount: 100 });
  const changed = simulate(subject, { amount: 200 });
  assert.deepEqual(first, second); assert.notEqual(first.impact.spendable, changed.impact.spendable);
  assert.ok(Object.isFrozen(first)); assert.equal(first.trace.hypotheticalTransactionIds.length, 1);
});

test("14. base insuficiente permanece explicitamente limitada", () => {
  const result = simulate(profile({ transactions: [trx({ id: "only", status: "Pago" })] }), { amount: 10 });
  assert.equal(result.quality.state, "limited"); assert.match(result.conclusion, /análise é limitada/);
});

test("15. o motor não possui efeitos de persistência", () => {
  const source = require("node:fs").readFileSync(path.join(__dirname, "..", "js", "core", "purchase-simulator.js"), "utf8");
  assert.doesNotMatch(source, /localStorage|saveStore|syncCoordinator|supabase/i);
});
