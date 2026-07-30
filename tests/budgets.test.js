"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
[
  "utils", "storage", "categories", "finance", "accounts", "budgets", "transactions",
  "goals", "profiles", "reports", "notifications",
].forEach((name) => require(path.join(__dirname, "..", "js", "core", `${name}.js`)));

const { accounts, budgets, finance, notifications, profiles, reports, storage, transactions } = global.NexioCore;
const fixedNow = new Date("2026-07-28T12:00:00.000Z");

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
    ],
    transactions: overrides.transactions || [],
    accounts: overrides.accounts || [
      { id: "account-1", name: "Conta principal", type: "checking", initialBalance: 0, currency: "BRL", active: true },
      { id: "account-2", name: "Carteira", type: "cash", initialBalance: 0, currency: "BRL", active: true },
    ],
    defaultAccountId: "account-1",
    goals: [],
    imports: [],
    budgets: overrides.budgets || [],
    ...overrides,
  };
}

function addBudget(profile, overrides = {}, options = {}) {
  return budgets.add(profile, {
    categoryId: overrides.categoryId || "cat-food",
    month: overrides.month || "2026-07",
    limit: overrides.limit ?? 1000,
    alertThreshold: overrides.alertThreshold ?? 80,
    active: overrides.active ?? true,
  }, { uid: options.uid || idFactory("budget"), now: options.now || fixedNow });
}

function expense(overrides = {}) {
  return {
    id: overrides.id || "trx-1",
    type: "expense",
    description: overrides.description || "Compra",
    amount: overrides.amount ?? 100,
    date: overrides.date || "2026-07-15",
    categoryId: overrides.categoryId || "cat-food",
    accountId: overrides.accountId || "account-1",
    status: overrides.status || "Pago",
    createdAt: fixedNow.toISOString(),
    updatedAt: fixedNow.toISOString(),
    ...overrides,
  };
}

test("01. perfil antigo recebe budgets vazio", () => {
  const profile = makeProfile();
  delete profile.budgets;
  profiles.ensureProfileShape(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  assert.deepEqual(profile.budgets, []);
});

test("02. normalização é idempotente e preserva campos futuros", () => {
  const profile = makeProfile({ budgets: [{ id: "b-1", categoryId: "cat-food", month: "2026-07", limit: 100, alertThreshold: 80, active: true, future: { kept: true } }] });
  budgets.normalizeProfile(profile);
  const once = JSON.stringify(profile);
  budgets.normalizeProfile(profile);
  assert.equal(JSON.stringify(profile), once);
  assert.deepEqual(profile.budgets[0].future, { kept: true });
});

test("03. criação de orçamento válido", () => {
  const result = addBudget(makeProfile(), {}, { uid: () => "budget-fixed" });
  assert.equal(result.ok, true);
  assert.equal(result.budget.id, "budget-fixed");
  assert.equal(result.budget.alertThreshold, 80);
  assert.equal(result.budget.createdAt, fixedNow.toISOString());
});

test("04. limite zero é rejeitado", () => {
  assert.equal(addBudget(makeProfile(), { limit: 0 }).ok, false);
});

test("05. limite negativo é rejeitado", () => {
  assert.equal(addBudget(makeProfile(), { limit: -1 }).ok, false);
});

test("06. NaN é rejeitado", () => {
  assert.equal(addBudget(makeProfile(), { limit: NaN }).ok, false);
});

test("07. infinito é rejeitado", () => {
  assert.equal(addBudget(makeProfile(), { limit: Infinity }).ok, false);
});

test("08. alerta abaixo de 1 é rejeitado", () => {
  assert.equal(addBudget(makeProfile(), { alertThreshold: 0 }).ok, false);
});

test("09. alerta acima de 100 é rejeitado", () => {
  assert.equal(addBudget(makeProfile(), { alertThreshold: 101 }).ok, false);
});

test("10. categoria inexistente é rejeitada", () => {
  assert.equal(addBudget(makeProfile(), { categoryId: "missing" }).ok, false);
});

test("11. categoria de receita é rejeitada", () => {
  assert.equal(addBudget(makeProfile(), { categoryId: "cat-income" }).ok, false);
});

test("12. categoria duplicada no mesmo mês é rejeitada", () => {
  const profile = makeProfile();
  addBudget(profile);
  assert.equal(addBudget(profile).ok, false);
});

test("13. mesma categoria em meses diferentes é permitida", () => {
  const profile = makeProfile();
  addBudget(profile);
  assert.equal(addBudget(profile, { month: "2026-08" }).ok, true);
});

test("14. gasto realizado considera somente despesas pagas", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 100 }), expense({ id: "trx-2", amount: 50, status: "Pendente" })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).spent, 100);
});

test("15. comprometido considera pagas, pendentes e atrasadas", () => {
  const profile = makeProfile({ transactions: [
    expense({ amount: 100 }),
    expense({ id: "trx-2", amount: 50, status: "Pendente" }),
    expense({ id: "trx-3", amount: 25, status: "Atrasado" }),
  ] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).committed, 175);
});

test("16. receita não afeta orçamento", () => {
  const profile = makeProfile({ transactions: [{ ...expense(), type: "income", status: "Recebido", amount: 500 }] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).committed, 0);
});

test("17. transferência não afeta orçamento", () => {
  const profile = makeProfile({ transactions: [expense({ transferId: "transfer-1", amount: 300 })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).committed, 0);
});

test("18. despesa de outra categoria não afeta orçamento", () => {
  const profile = makeProfile({ transactions: [expense({ categoryId: "cat-home" })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).committed, 0);
});

test("19. despesa de outro mês não afeta orçamento", () => {
  const profile = makeProfile({ transactions: [expense({ date: "2026-08-01" })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).committed, 0);
});

test("20. despesa de outro perfil não afeta orçamento", () => {
  const first = makeProfile();
  const second = makeProfile({ id: "profile-2", transactions: [expense({ amount: 900 })] });
  const budget = addBudget(first).budget;
  assert.equal(budgets.calculation(first, budget).committed, 0);
  assert.equal(second.transactions.length, 1);
});

test("21. filtro por conta funciona", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 100 }), expense({ id: "trx-2", amount: 40, accountId: "account-2" })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget, { accountId: "account-2" }).committed, 40);
  assert.equal(budgets.calculation(profile, budget).committed, 140);
});

test("22. conta de outro perfil é rejeitada", () => {
  const profile = makeProfile();
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget, { accountId: "foreign-account" }).ok, false);
});

test("23. alterar categoria atualiza os dois orçamentos", () => {
  const row = expense({ amount: 120 });
  const profile = makeProfile({ transactions: [row] });
  const food = addBudget(profile).budget;
  const home = addBudget(profile, { categoryId: "cat-home" }).budget;
  assert.equal(budgets.calculation(profile, food).committed, 120);
  row.categoryId = "cat-home";
  assert.equal(budgets.calculation(profile, food).committed, 0);
  assert.equal(budgets.calculation(profile, home).committed, 120);
});

test("24. alterar data move impacto entre meses", () => {
  const row = expense({ amount: 120 });
  const profile = makeProfile({ transactions: [row] });
  const july = addBudget(profile).budget;
  const august = addBudget(profile, { month: "2026-08" }).budget;
  row.date = "2026-08-15";
  assert.equal(budgets.calculation(profile, july).committed, 0);
  assert.equal(budgets.calculation(profile, august).committed, 120);
});

test("25. alterar status atualiza realizado e comprometido", () => {
  const row = expense({ status: "Pendente" });
  const profile = makeProfile({ transactions: [row] });
  const budget = addBudget(profile).budget;
  assert.deepEqual([budgets.calculation(profile, budget).spent, budgets.calculation(profile, budget).committed], [0, 100]);
  row.status = "Pago";
  assert.deepEqual([budgets.calculation(profile, budget).spent, budgets.calculation(profile, budget).committed], [100, 100]);
});

test("26. excluir transação remove impacto", () => {
  const profile = makeProfile({ transactions: [expense()] });
  const budget = addBudget(profile).budget;
  profile.transactions = [];
  assert.equal(budgets.calculation(profile, budget).committed, 0);
});

test("27. parcelas entram no mês correto", () => {
  const profile = makeProfile();
  profile.transactions.push(...transactions.createInstallments(expense({ date: "2026-07-15", amount: 90 }), 3, { uid: idFactory("installment"), now: () => fixedNow }));
  const july = addBudget(profile).budget;
  const august = addBudget(profile, { month: "2026-08" }).budget;
  assert.equal(budgets.calculation(profile, july).spent, 90);
  assert.equal(budgets.calculation(profile, august).spent, 90);
});

test("28. percentual realizado é calculado corretamente", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 250 })] });
  const budget = addBudget(profile, { limit: 1000 }).budget;
  assert.equal(budgets.calculation(profile, budget).spentPercent, 25);
});

test("29. percentual comprometido é calculado corretamente", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 400, status: "Pendente" })] });
  const budget = addBudget(profile, { limit: 1000 }).budget;
  assert.equal(budgets.calculation(profile, budget).committedPercent, 40);
});

test("30. status Saudável funciona", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 700 })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).statusLabel, "Saudável");
});

test("31. status Atenção funciona no limite do alerta", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 800 })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).statusLabel, "Atenção");
});

test("32. status Excedido funciona", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 1200 })] });
  const budget = addBudget(profile).budget;
  assert.equal(budgets.calculation(profile, budget).statusLabel, "Excedido");
});

test("33. restante negativo gera excedente", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 1200 })] });
  const budget = addBudget(profile).budget;
  const result = budgets.calculation(profile, budget);
  assert.equal(result.remainingCommitted, -200);
  assert.equal(result.exceededBy, 200);
});

test("34. editar orçamento preserva ID e createdAt", () => {
  const profile = makeProfile();
  const original = addBudget(profile, {}, { uid: () => "budget-fixed" }).budget;
  const updateTime = new Date("2026-07-29T12:00:00Z");
  const updated = budgets.update(profile, original.id, { ...original, limit: 1500, alertThreshold: 75 }, { now: updateTime });
  assert.equal(updated.budget.id, "budget-fixed");
  assert.equal(updated.budget.createdAt, fixedNow.toISOString());
  assert.equal(updated.budget.updatedAt, updateTime.toISOString());
  assert.equal(updated.budget.limit, 1500);
});

test("35. desativar orçamento remove da visão ativa", () => {
  const profile = makeProfile();
  const budget = addBudget(profile).budget;
  budgets.setActive(profile, budget.id, false, { now: fixedNow });
  assert.equal(budgets.summary(profile, "2026-07").items.length, 0);
  assert.equal(budgets.summary(profile, "2026-07", { includeInactive: true }).items.length, 1);
});

test("36. reativar orçamento funciona", () => {
  const profile = makeProfile();
  const budget = addBudget(profile, { active: false }).budget;
  assert.equal(budgets.setActive(profile, budget.id, true, { now: fixedNow }).ok, true);
  assert.equal(budget.active, true);
});

test("37. excluir orçamento funciona", () => {
  const profile = makeProfile();
  const budget = addBudget(profile).budget;
  assert.equal(budgets.remove(profile, budget.id).ok, true);
  assert.equal(profile.budgets.length, 0);
});

test("38. copiar para mês seguinte gera novo ID", () => {
  const profile = makeProfile();
  const original = addBudget(profile, { limit: 725, alertThreshold: 65 }).budget;
  const result = budgets.copyNextMonth(profile, original.id, { uid: idFactory("copy"), now: fixedNow });
  assert.equal(result.copied, 1);
  assert.notEqual(result.budgets[0].id, original.id);
  assert.equal(result.budgets[0].month, "2026-08");
  assert.deepEqual(
    [result.budgets[0].categoryId, result.budgets[0].limit, result.budgets[0].alertThreshold],
    [original.categoryId, 725, 65],
  );
});

test("39. cópia não altera mês original", () => {
  const profile = makeProfile();
  const original = addBudget(profile).budget;
  budgets.copyNextMonth(profile, original.id, { uid: idFactory("copy"), now: fixedNow });
  assert.equal(original.month, "2026-07");
});

test("40. cópia ignora duplicados", () => {
  const profile = makeProfile();
  const original = addBudget(profile).budget;
  addBudget(profile, { month: "2026-08" });
  const result = budgets.copyNextMonth(profile, original.id, { uid: idFactory("copy"), now: fixedNow });
  assert.deepEqual([result.copied, result.ignored], [0, 1]);
});

test("41. copiar todos retorna contagens corretas", () => {
  const profile = makeProfile();
  addBudget(profile);
  addBudget(profile, { categoryId: "cat-home" });
  addBudget(profile, { categoryId: "cat-food", month: "2026-08" });
  const result = budgets.copyAllNextMonth(profile, "2026-07", { uid: idFactory("copy"), now: fixedNow });
  assert.deepEqual([result.copied, result.ignored], [1, 1]);
});

test("42. dashboard prioriza excedidos, atenção e saudáveis", () => {
  const profile = makeProfile({
    categories: [
      { id: "cat-a", name: "A", type: "expense" },
      { id: "cat-b", name: "B", type: "expense" },
      { id: "cat-c", name: "C", type: "expense" },
    ],
    transactions: [expense({ id: "a", categoryId: "cat-a", amount: 20 }), expense({ id: "b", categoryId: "cat-b", amount: 85 }), expense({ id: "c", categoryId: "cat-c", amount: 120 })],
  });
  addBudget(profile, { categoryId: "cat-a", limit: 100 });
  addBudget(profile, { categoryId: "cat-b", limit: 100 });
  addBudget(profile, { categoryId: "cat-c", limit: 100 });
  assert.deepEqual(budgets.dashboard(profile, "2026-07").items.map((item) => item.status), ["exceeded", "warning", "healthy"]);
});

test("43. dashboard limita a quatro itens", () => {
  const categories = Array.from({ length: 5 }, (_, index) => ({ id: `cat-${index}`, name: `Categoria ${index}`, type: "expense" }));
  const profile = makeProfile({ categories });
  categories.forEach((category) => addBudget(profile, { categoryId: category.id }));
  assert.equal(budgets.dashboard(profile, "2026-07").items.length, 4);
});

test("44. exportação inclui budgets", () => {
  const profile = makeProfile();
  const budget = addBudget(profile, { limit: 825, alertThreshold: 72, active: false }).budget;
  const exported = reports.buildExportProfile(profile, { now: fixedNow });
  assert.equal(exported.profile.budgets.length, 1);
  assert.deepEqual(exported.profile.budgets[0], budget);
});

test("45. exportação continua sanitizada", () => {
  const profile = makeProfile();
  const budget = addBudget(profile).budget;
  budget.future = { password: "segredo", safe: true };
  const exported = reports.buildExportProfile(profile, { now: fixedNow });
  assert.equal(JSON.stringify(exported).includes("segredo"), false);
  assert.equal(exported.profile.budgets[0].future.safe, true);
});

test("46. importação válida preserva orçamento", () => {
  const targetProfile = makeProfile();
  const incomingProfile = makeProfile();
  addBudget(incomingProfile, {}, { uid: () => "budget-imported" });
  const target = { email: "user@nexio.local", currency: "BRL", profiles: [targetProfile], activeProfileId: targetProfile.id };
  const incoming = { email: "user@nexio.local", currency: "BRL", profiles: [incomingProfile], activeProfileId: incomingProfile.id };
  profiles.mergeImportedUser(target, incoming, { uid: idFactory("merge"), now: fixedNow });
  assert.equal(targetProfile.budgets.length, 1);
  assert.equal(targetProfile.budgets[0].id, "budget-imported");
});

test("47. importação com categoria inválida ignora com segurança", () => {
  const targetProfile = makeProfile();
  const incomingProfile = makeProfile({ budgets: [{ id: "bad", categoryId: "missing", month: "2026-07", limit: 100, alertThreshold: 80, active: true }] });
  const target = { email: "user@nexio.local", currency: "BRL", profiles: [targetProfile], activeProfileId: targetProfile.id };
  const incoming = { email: "user@nexio.local", currency: "BRL", profiles: [incomingProfile], activeProfileId: incomingProfile.id };
  profiles.mergeImportedUser(target, incoming, { uid: idFactory("merge"), now: fixedNow });
  assert.equal(targetProfile.budgets.length, 0);
});

test("48. colisão de ID gera novo ID", () => {
  const targetProfile = makeProfile();
  addBudget(targetProfile, {}, { uid: () => "budget-collision" });
  const incomingProfile = makeProfile({ budgets: [{ id: "budget-collision", categoryId: "cat-home", month: "2026-08", limit: 200, alertThreshold: 70, active: true }] });
  const target = { email: "user@nexio.local", currency: "BRL", profiles: [targetProfile], activeProfileId: targetProfile.id };
  const incoming = { email: "user@nexio.local", currency: "BRL", profiles: [incomingProfile], activeProfileId: incomingProfile.id };
  profiles.mergeImportedUser(target, incoming, { uid: idFactory("merge"), now: fixedNow });
  assert.equal(targetProfile.budgets.length, 2);
  assert.equal(new Set(targetProfile.budgets.map((budget) => budget.id)).size, 2);
});

test("49. orçamentos não alteram saldo financeiro", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 100 })] });
  const before = accounts.consolidatedBalance(profile);
  addBudget(profile, { limit: 500 });
  assert.equal(accounts.consolidatedBalance(profile), before);
  assert.equal(finance.calculateBalance(profile.transactions), -100);
});

test("50. contas e transferências existentes continuam funcionando", () => {
  const profile = makeProfile();
  const budget = addBudget(profile).budget;
  const transfer = accounts.createTransfer(profile, {
    fromAccountId: "account-1",
    toAccountId: "account-2",
    amount: 150,
    date: "2026-07-20",
    categoryId: "cat-food",
  }, { uid: idFactory("transfer"), now: fixedNow });
  assert.equal(transfer.ok, true);
  assert.equal(accounts.validateTransferPair(profile, transfer.transferId).ok, true);
  assert.equal(budgets.calculation(profile, budget).committed, 0);
});

test("51. alerta interno não duplica o mesmo orçamento", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 900 })] });
  addBudget(profile);
  const items = notifications.build(profile, { today: fixedNow, money: (value) => `R$ ${value}` });
  assert.equal(items.filter((item) => item.action === "budgets").length, 1);
});

test("52. relatório mensal expõe valores derivados sem alterar o orçamento", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 250 })] });
  const budget = addBudget(profile, { limit: 1000 }).budget;
  const before = JSON.stringify(budget);
  const report = reports.monthlyBudgetReport(profile, "2026-07");
  assert.deepEqual(report.rows[0], { categoryId: "cat-food", category: "Alimentação", limit: 1000, spent: 250, committed: 250, remaining: 750, percent: 25, status: "Saudável" });
  assert.equal(JSON.stringify(budget), before);
});

test("53. duplicação de perfil gera IDs de orçamento seguros", () => {
  const profile = makeProfile();
  const first = addBudget(profile, {}, { uid: () => "budget-original-1" }).budget;
  addBudget(profile, { categoryId: "cat-home" }, { uid: () => "budget-original-2" });
  let index = 0;
  const clone = profiles.duplicate(profile, {
    uid: (prefix) => prefix === "budget" ? "budget-repeated" : `clone-${prefix}-${++index}`,
  });
  assert.equal(clone.budgets.length, 2);
  assert.equal(new Set(clone.budgets.map((budget) => budget.id)).size, 2);
  assert.ok(clone.budgets.every((budget) => !profile.budgets.some((source) => source.id === budget.id)));
  assert.equal(clone.budgets[0].categoryId, first.categoryId);
});

test("54. mês inválido e estado não booleano são rejeitados", () => {
  assert.equal(addBudget(makeProfile(), { month: "2026-13" }).ok, false);
  assert.equal(addBudget(makeProfile(), { active: "true" }).ok, false);
});

test("55. valores legados inválidos não geram NaN ou Infinity", () => {
  const profile = makeProfile({ transactions: [
    expense({ id: "valid", amount: 25 }),
    expense({ id: "nan", amount: "inválido" }),
    expense({ id: "infinite", amount: Infinity }),
  ] });
  const budget = addBudget(profile, { limit: 100 }).budget;
  const result = budgets.calculation(profile, budget);
  assert.deepEqual([result.spent, result.committed, result.spentPercent, result.committedPercent], [25, 25, 25, 25]);
  [result.spent, result.committed, result.spentPercent, result.committedPercent].forEach((value) => {
    assert.equal(Number.isFinite(value), true);
  });
  budget.limit = Infinity;
  assert.deepEqual(
    [budgets.calculation(profile, budget).spentPercent, budgets.calculation(profile, budget).committedPercent],
    [0, 0],
  );
});

test("56. exatamente 100% é classificado como Excedido", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 1000 })] });
  const budget = addBudget(profile, { limit: 1000 }).budget;
  const result = budgets.calculation(profile, budget);
  assert.equal(result.committedPercent, 100);
  assert.equal(result.status, "exceeded");
});

test("57. filtro aceita conta inativa e não altera o limite", () => {
  const profile = makeProfile({ transactions: [expense({ accountId: "account-2", amount: 40 })] });
  profile.accounts[1].active = false;
  const budget = addBudget(profile, { limit: 500 }).budget;
  const all = budgets.calculation(profile, budget);
  const inactive = budgets.calculation(profile, budget, { accountId: "account-2" });
  assert.deepEqual([all.limit, inactive.limit, inactive.committed], [500, 500, 40]);
});

test("58. reativação é bloqueada quando já existe orçamento ativo equivalente", () => {
  const profile = makeProfile();
  const inactive = addBudget(profile, { active: false }).budget;
  addBudget(profile);
  const result = budgets.setActive(profile, inactive.id, true, { now: fixedNow });
  assert.equal(result.ok, false);
  assert.equal(inactive.active, false);
});

test("59. cópia de dezembro avança para janeiro do ano seguinte", () => {
  const profile = makeProfile();
  const original = addBudget(profile, { month: "2026-12" }).budget;
  const result = budgets.copyNextMonth(profile, original.id, { uid: idFactory("copy"), now: fixedNow });
  assert.equal(result.budgets[0].month, "2027-01");
});

test("60. cópia preserva campos futuros seguros sem compartilhar referências", () => {
  const profile = makeProfile();
  const original = addBudget(profile, { active: false }).budget;
  original.future = { nested: { kept: true }, password: "segredo" };
  const result = budgets.copyNextMonth(profile, original.id, { uid: idFactory("copy"), now: fixedNow });
  const copied = result.budgets[0];
  assert.equal(copied.active, false);
  assert.deepEqual(copied.future, { nested: { kept: true } });
  assert.notStrictEqual(copied.future, original.future);
  assert.notStrictEqual(copied.future.nested, original.future.nested);
  copied.future.nested.kept = false;
  assert.equal(original.future.nested.kept, true);
});

test("61. importação clona campos seguros e remove campos sensíveis", () => {
  const profile = makeProfile();
  const source = {
    id: "import-safe",
    categoryId: "cat-food",
    month: "2026-07",
    limit: 500,
    alertThreshold: 70,
    active: true,
    future: { nested: { kept: true }, token: "segredo" },
  };
  const result = budgets.importInto(profile, [source], { uid: idFactory("import"), now: fixedNow });
  assert.equal(result.imported, 1);
  assert.deepEqual(result.budgets[0].future, { nested: { kept: true } });
  assert.notStrictEqual(result.budgets[0].future.nested, source.future.nested);
  result.budgets[0].future.nested.kept = false;
  assert.equal(source.future.nested.kept, true);
});

test("62. importação ignora categoria de receita e duplicidade categoria/mês", () => {
  const profile = makeProfile();
  addBudget(profile);
  const result = budgets.importInto(profile, [
    { id: "income", categoryId: "cat-income", month: "2026-08", limit: 100, alertThreshold: 80, active: true },
    { id: "duplicate", categoryId: "cat-food", month: "2026-07", limit: 200, alertThreshold: 80, active: true },
  ], { uid: idFactory("import"), now: fixedNow });
  assert.deepEqual([result.imported, result.ignored, profile.budgets.length], [0, 2, 1]);
});

test("63. reconstruir notificações não acumula alertas duplicados", () => {
  const profile = makeProfile({ transactions: [expense({ amount: 900 })] });
  addBudget(profile);
  const options = { today: fixedNow, money: (value) => `R$ ${value}` };
  const first = notifications.build(profile, options);
  const second = notifications.build(profile, options);
  assert.equal(first.filter((item) => item.action === "budgets").length, 1);
  assert.equal(second.filter((item) => item.action === "budgets").length, 1);
});
