"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");

global.window = global;
[
  "utils", "storage", "categories", "finance", "accounts", "transactions",
  "goals", "profiles", "reports", "notifications",
].forEach((name) => require(path.join(__dirname, "..", "js", "core", `${name}.js`)));

const { finance, goals, notifications, profiles, reports, storage, transactions, utils } = global.NexioCore;

assert.equal(finance.calculateBalance([
  { type: "income", status: "Recebido", amount: 100 },
  { type: "expense", status: "Pago", amount: 30 },
  { type: "expense", status: "Pendente", amount: 50 },
]), 70);
assert.equal(finance.calculateProjectedBalance([
  { type: "income", amount: 100 },
  { type: "expense", amount: 30 },
]), 70);

const overdue = { type: "expense", status: "Pendente", date: "2026-07-20" };
assert.equal(transactions.applyAutomaticOverdueStatus(overdue, new Date(2026, 6, 22)), true);
assert.equal(overdue.status, "Atrasado");
assert.equal(utils.addMonthsToDate("2026-01-31", 1), "2026-02-28");

const rows = reports.parseDelimitedRows("Data;Descrição;Valor;Tipo\n22/07/2026;Salário;1.234,56;Receita");
const imported = reports.transactionsFromTableRows(rows);
assert.equal(imported.length, 1);
assert.equal(imported[0].amount, 1234.56);
assert.equal(imported[0].date, "2026-07-22");
assert.equal(imported[0].type, "income");

const goal = { id: "goal-1", name: "Reserva", target: 1000, saved: 100, history: [], reminders: [] };
goals.ensureShape(goal, { name: "Principal" }, { uid: (prefix) => `${prefix}-fixed`, locale: "pt-BR" });
assert.equal(goal.history.length, 1);
assert.equal(goals.historyStats(goal, { name: "Principal" }, { uid: (prefix) => `${prefix}-fixed`, locale: "pt-BR" }).saldoHistorico, 100);
const goalProfile = { name: "Principal", goals: [goal], categories: [], transactions: [] };
assert.equal(goals.contribute(goal, goalProfile, 50, { uid: (prefix) => `${prefix}-contribution`, locale: "pt-BR" }).ok, true);
assert.equal(goal.saved, 150);
assert.equal(goals.withdraw(goal, goalProfile, { amount: 25, destination: "Conta", justification: "Uso planejado" }, { uid: (prefix) => `${prefix}-withdrawal`, locale: "pt-BR" }).ok, true);
assert.equal(goal.saved, 125);

const targetGoal = { id: "goal-2", name: "Viagem", target: 500, saved: 50, history: [], reminders: [] };
goals.ensureShape(targetGoal, goalProfile, { uid: (prefix) => `${prefix}-target`, locale: "pt-BR" });
goalProfile.goals.push(targetGoal);
const goalUser = { profiles: [goalProfile] };
const transferResult = goals.transfer({ user: goalUser, profile: goalProfile, goal, amount: 20, targetType: "goal", targetId: targetGoal.id, justification: "Rebalancear" }, { uid: (prefix) => `${prefix}-transfer`, locale: "pt-BR" });
assert.equal(transferResult.ok, true);
assert.equal(goal.saved, 105);
assert.equal(targetGoal.saved, 70);

const profile = profiles.create("Principal", { uid: (prefix) => `${prefix}-fixed` });
assert.equal(profile.categories.length, 7);
profile.transactions.push({ type: "expense", status: "Pendente", amount: 25, date: "2026-07-22", description: "Conta" });
const notices = notifications.build(profile, { today: new Date(2026, 6, 22), money: (value) => `R$ ${value}`, cloudReady: false });
assert.ok(notices.some((notice) => notice.action === "pendencies"));

const memory = new Map();
const adapter = {
  getItem: (key) => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
storage.saveStore(adapter, "store", { users: [{ email: "user@example.com" }] });
assert.equal(storage.loadStore(adapter, "store").users.length, 1);

console.log("Core architecture tests passed.");
