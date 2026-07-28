"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
[
  "utils", "storage", "categories", "finance", "accounts", "transactions",
  "goals", "profiles", "reports",
].forEach((name) => require(path.join(__dirname, "..", "js", "core", `${name}.js`)));

const { accounts, finance, profiles, reports, storage, transactions } = global.NexioCore;
const fixedNow = new Date("2026-07-28T12:00:00.000Z");

function idFactory() {
  let index = 0;
  return (prefix) => `${prefix}-${++index}`;
}

function oldProfile(transactionsList = []) {
  return {
    id: "profile-old",
    name: "Principal",
    categories: [{ id: "cat-1", name: "Outros", icon: "•" }],
    transactions: transactionsList,
    goals: [],
    imports: [],
  };
}

function normalizedProfile() {
  const profile = oldProfile();
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  return profile;
}

function addAccount(profile, overrides = {}) {
  return accounts.add(profile, {
    name: overrides.name || "Reserva",
    type: overrides.type || "savings",
    initialBalance: overrides.initialBalance ?? 0,
    active: overrides.active !== false,
    currency: "BRL",
    makeDefault: Boolean(overrides.makeDefault),
  }, { uid: idFactory(), currency: "BRL", now: fixedNow });
}

function settled(overrides = {}) {
  return {
    id: overrides.id || "trx-1",
    type: overrides.type || "income",
    description: overrides.description || "Movimento",
    amount: overrides.amount ?? 100,
    date: overrides.date || "2026-07-28",
    categoryId: "cat-1",
    status: overrides.status || (overrides.type === "expense" ? "Pago" : "Recebido"),
    accountId: overrides.accountId,
    createdAt: "2026-07-28T10:00:00.000Z",
    updatedAt: "2026-07-28T10:00:00.000Z",
    ...overrides,
  };
}

test("01. migração cria uma única Conta principal", () => {
  const profile = oldProfile();
  accounts.normalizeProfile(profile, { uid: () => "account-main", currency: "BRL", now: fixedNow });
  assert.equal(profile.accounts.length, 1);
  assert.equal(profile.accounts[0].name, "Conta principal");
});

test("02. conta migrada usa tipo corrente e saldo inicial zero", () => {
  const profile = normalizedProfile();
  assert.equal(profile.accounts[0].type, "checking");
  assert.equal(profile.accounts[0].initialBalance, 0);
});

test("03. conta migrada herda moeda do usuário", () => {
  const profile = oldProfile();
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "EUR", now: fixedNow });
  assert.equal(profile.accounts[0].currency, "EUR");
});

test("04. migração define conta padrão válida", () => {
  const profile = normalizedProfile();
  assert.equal(profile.defaultAccountId, profile.accounts[0].id);
});

test("05. migração atribui transações antigas à conta padrão", () => {
  const profile = oldProfile([settled({ accountId: undefined })]);
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  assert.equal(profile.transactions[0].accountId, profile.defaultAccountId);
});

test("06. migração preserva campos e identidade da transação", () => {
  const transaction = settled({ accountId: undefined, futureField: { kept: true } });
  const before = JSON.parse(JSON.stringify(transaction));
  const profile = oldProfile([transaction]);
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  const { accountId, ...after } = profile.transactions[0];
  assert.deepEqual(after, before);
  assert.ok(accountId);
});

test("07. migração é idempotente", () => {
  const profile = oldProfile([settled({ accountId: undefined })]);
  const options = { uid: idFactory(), currency: "BRL", now: fixedNow };
  accounts.normalizeProfile(profile, options);
  const once = JSON.stringify(profile);
  accounts.normalizeProfile(profile, options);
  assert.equal(JSON.stringify(profile), once);
});

test("08. migração não duplica a conta principal", () => {
  const profile = normalizedProfile();
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  assert.equal(profile.accounts.filter((account) => account.name === "Conta principal").length, 1);
});

test("09. migração mantém total financeiro antigo", () => {
  const rows = [settled({ amount: 250 }), settled({ id: "trx-2", type: "expense", amount: 80 })];
  const previousTotal = finance.calculateBalance(rows);
  const profile = oldProfile(rows);
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  assert.equal(accounts.consolidatedBalance(profile), previousTotal);
});

test("10. normalização corrige accountId inválido com fallback", () => {
  const profile = oldProfile([settled({ accountId: "foreign-account" })]);
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  assert.equal(profile.transactions[0].accountId, profile.defaultAccountId);
});

test("11. normalização preserva conta futura desconhecida", () => {
  const profile = oldProfile();
  profile.accounts = [{ id: "future-1", name: "Conta futura", type: "crypto-vault", initialBalance: 5, active: true, future: "kept" }];
  profile.defaultAccountId = "future-1";
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "USD", now: fixedNow });
  assert.equal(profile.accounts[0].type, "crypto-vault");
  assert.equal(profile.accounts[0].future, "kept");
});

test("12. normalização reativa uma conta quando todas estão inativas", () => {
  const profile = oldProfile();
  profile.accounts = [{ id: "a", name: "A", type: "cash", initialBalance: 0, active: false }];
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  assert.equal(profile.accounts[0].active, true);
});

test("13. criação exige nome não vazio", () => {
  const result = accounts.add(normalizedProfile(), { name: "   ", type: "cash", initialBalance: 0 });
  assert.equal(result.ok, false);
});

test("14. nome é armazenado sem espaços excedentes", () => {
  const result = accounts.add(normalizedProfile(), { name: "  Minha   conta  ", type: "cash", initialBalance: 0 }, { uid: idFactory(), currency: "BRL", now: fixedNow });
  assert.equal(result.account.name, "Minha conta");
});

test("15. nomes são únicos por comparação normalizada", () => {
  const profile = normalizedProfile();
  addAccount(profile, { name: "Poupança" });
  const duplicate = addAccount(profile, { name: "  poupanca  " });
  assert.equal(duplicate.ok, false);
});

test("16. tipo de conta precisa ser permitido", () => {
  const result = accounts.add(normalizedProfile(), { name: "Inválida", type: "crypto", initialBalance: 0 });
  assert.equal(result.ok, false);
});

test("17. saldo inicial precisa ser monetário finito", () => {
  const result = accounts.add(normalizedProfile(), { name: "Inválida", type: "cash", initialBalance: "x" });
  assert.equal(result.ok, false);
});

test("18. criação gera ID e timestamps estáveis", () => {
  const result = accounts.add(normalizedProfile(), { name: "Carteira", type: "digital-wallet", initialBalance: 10 }, { uid: () => "account-wallet", currency: "BRL", now: fixedNow });
  assert.equal(result.account.id, "account-wallet");
  assert.equal(result.account.createdAt, fixedNow.toISOString());
  assert.equal(result.account.updatedAt, fixedNow.toISOString());
});

test("19. conta criada pode se tornar padrão", () => {
  const profile = normalizedProfile();
  const result = addAccount(profile, { makeDefault: true });
  assert.equal(profile.defaultAccountId, result.account.id);
});

test("20. conta inativa não pode se tornar padrão", () => {
  const profile = normalizedProfile();
  const account = addAccount(profile).account;
  accounts.setActive(profile, account.id, false, { now: fixedNow });
  assert.equal(accounts.setDefault(profile, account.id).ok, false);
});

test("21. não é possível inativar a última conta ativa", () => {
  const profile = normalizedProfile();
  assert.equal(accounts.setActive(profile, profile.defaultAccountId, false).ok, false);
});

test("22. inativar a padrão escolhe outra conta ativa", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  accounts.setActive(profile, profile.defaultAccountId, false, { now: fixedNow });
  assert.equal(profile.defaultAccountId, second.id);
});

test("23. conta sem transações pode ser excluída", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  assert.equal(accounts.remove(profile, second.id).ok, true);
});

test("24. conta com transações não pode ser excluída", () => {
  const profile = normalizedProfile();
  profile.transactions.push(settled({ accountId: profile.defaultAccountId }));
  assert.equal(accounts.remove(profile, profile.defaultAccountId).ok, false);
});

test("25. saldo da conta soma saldo inicial e liquidados", () => {
  const profile = normalizedProfile();
  profile.accounts[0].initialBalance = 50;
  profile.transactions.push(settled({ amount: 100, accountId: profile.defaultAccountId }));
  profile.transactions.push(settled({ id: "trx-2", type: "expense", amount: 30, accountId: profile.defaultAccountId }));
  assert.equal(accounts.balance(profile, profile.defaultAccountId), 120);
});

test("26. pendências não alteram saldo atual da conta", () => {
  const profile = normalizedProfile();
  profile.transactions.push(settled({ type: "expense", status: "Pendente", amount: 30, accountId: profile.defaultAccountId }));
  assert.equal(accounts.balance(profile, profile.defaultAccountId), 0);
});

test("27. consolidado ativo ignora conta inativa", () => {
  const profile = normalizedProfile();
  const inactive = addAccount(profile, { initialBalance: 90 }).account;
  accounts.setActive(profile, inactive.id, false, { now: fixedNow });
  assert.equal(accounts.consolidatedBalance(profile), 0);
  assert.equal(accounts.consolidatedBalance(profile, { includeInactive: true }), 90);
});

test("28. contagem é separada por conta", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  profile.transactions.push(settled({ accountId: second.id }));
  assert.equal(accounts.transactionCount(profile, second.id), 1);
  assert.equal(accounts.transactionCount(profile, profile.defaultAccountId), 0);
});

test("29. filtro de transações aceita conta individual", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  profile.transactions.push(settled({ id: "one", accountId: profile.defaultAccountId }));
  profile.transactions.push(settled({ id: "two", accountId: second.id }));
  const rows = transactions.filterAndSort(profile, { account: second.id, category: "all", status: "all", sort: "date-desc" });
  assert.deepEqual(rows.map((row) => row.id), ["two"]);
});

test("30. transferência cria despesa e receita ligadas", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const result = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  assert.equal(result.ok, true);
  assert.equal(result.transactions.length, 2);
  assert.equal(new Set(result.transactions.map((row) => row.transferId)).size, 1);
});

test("31. transferência debita origem e credita destino", () => {
  const profile = normalizedProfile();
  profile.accounts[0].initialBalance = 100;
  const second = addAccount(profile).account;
  accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  assert.equal(accounts.balance(profile, profile.defaultAccountId), 75);
  assert.equal(accounts.balance(profile, second.id), 25);
});

test("32. transferência não altera saldo consolidado", () => {
  const profile = normalizedProfile();
  profile.accounts[0].initialBalance = 100;
  const second = addAccount(profile).account;
  const before = accounts.consolidatedBalance(profile);
  accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  assert.equal(accounts.consolidatedBalance(profile), before);
});

test("33. transferência não infla totais mensais", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  assert.equal(finance.monthlyTotal(profile.transactions, "2026-07", "income"), 0);
  assert.equal(finance.monthlyTotal(profile.transactions, "2026-07", "expense"), 0);
});

test("34. transferência rejeita origem e destino iguais", () => {
  const profile = normalizedProfile();
  const result = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: profile.defaultAccountId, amount: 25, date: "2026-07-28" });
  assert.equal(result.ok, false);
});

test("35. transferência rejeita conta inativa", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  accounts.setActive(profile, second.id, false, { now: fixedNow });
  const result = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" });
  assert.equal(result.ok, false);
});

test("36. transferência rejeita conta de outro perfil", () => {
  const profile = normalizedProfile();
  const foreign = normalizedProfile();
  const result = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: foreign.defaultAccountId, amount: 25, date: "2026-07-28" });
  assert.equal(result.ok, false);
});

test("37. edição de transferência preserva IDs do par", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  const ids = created.transactions.map((row) => row.id).sort();
  const updated = accounts.updateTransfer(profile, created.transferId, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 40, date: "2026-07-29" }, { uid: idFactory(), now: new Date("2026-07-29T12:00:00Z") });
  assert.equal(updated.ok, true);
  assert.deepEqual(accounts.transferPair(profile, created.transferId).map((row) => row.id).sort(), ids);
});

test("38. exclusão de transferência remove os dois lados", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  assert.equal(accounts.deleteTransfer(profile, created.transferId).deleted, 2);
  assert.equal(profile.transactions.length, 0);
});

test("39. duplicação de perfil remapeia contas e accountId", () => {
  const profile = normalizedProfile();
  profile.transactions.push(settled({ accountId: profile.defaultAccountId }));
  const clone = profiles.duplicate(profile, { uid: idFactory() });
  assert.notEqual(clone.accounts[0].id, profile.accounts[0].id);
  assert.equal(clone.transactions[0].accountId, clone.accounts[0].id);
});

test("40. merge JSON importa conta válida e preserva accountId", () => {
  const targetProfile = normalizedProfile();
  const target = { email: "a@example.com", currency: "BRL", activeProfileId: targetProfile.id, profiles: [targetProfile] };
  const incomingProfile = oldProfile([settled({ id: "imported", accountId: "foreign" })]);
  incomingProfile.id = targetProfile.id;
  incomingProfile.accounts = [{ id: "foreign", name: "Estrangeira", type: "cash", initialBalance: 0, active: true }];
  incomingProfile.defaultAccountId = "foreign";
  const imported = { email: "a@example.com", currency: "BRL", activeProfileId: incomingProfile.id, profiles: [incomingProfile] };
  profiles.mergeImportedUser(target, imported, { uid: idFactory() });
  const row = targetProfile.transactions.find((transaction) => transaction.id === "imported");
  assert.equal(row.accountId, "foreign");
  assert.equal(targetProfile.accounts.some((account) => account.id === "foreign"), true);
});

test("41. exportação inclui contas e accountId e remove segredos", () => {
  const profile = normalizedProfile();
  profile.transactions.push(settled({ accountId: profile.defaultAccountId, token: "secret" }));
  const user = { email: "a@example.com", currency: "BRL", activeProfileId: profile.id, profiles: [profile], password: "secret" };
  const exported = reports.buildExportUser(user, {
    ensureUserShape: (value) => profiles.ensureUserShape(value, { uid: idFactory() }),
    ensureProfileShape: (value) => profiles.ensureProfileShape(value, { uid: idFactory(), currency: "BRL" }),
    ensureGoalShape: () => {},
    goalHistoryStats: () => ({}),
    goalHistoryEntries: () => [],
    now: fixedNow,
  });
  assert.equal(exported.profiles[0].accounts.length, 1);
  assert.equal(exported.profiles[0].transactions[0].accountId, profile.defaultAccountId);
  assert.equal(storage.isSensitiveField("password"), true);
  assert.equal("password" in exported, false);
  assert.equal("token" in exported.profiles[0].transactions[0], false);
});

test("42. perfis mantêm contas isoladas", () => {
  const first = normalizedProfile();
  const second = normalizedProfile();
  addAccount(first, { name: "Só no primeiro" });
  assert.equal(second.accounts.some((account) => account.name === "Só no primeiro"), false);
});

test("43. finance cashflow consolidado neutraliza transferências", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  assert.deepEqual(finance.cashflowTotalsForMonth(profile, "2026-07", fixedNow), { income: 0, expense: 0 });
});

test("44. relatório de maior despesa ignora transferência", () => {
  const rows = [settled({ type: "expense", amount: 10 }), settled({ id: "transfer", type: "expense", amount: 999, transferId: "transfer-1" })];
  assert.equal(reports.highestTransaction(rows).id, "trx-1");
});

test("45. todos os seis tipos de conta são oferecidos", () => {
  assert.deepEqual(accounts.types, ["checking", "savings", "cash", "digital-wallet", "investment", "other"]);
});

test("46. conta inativa não é selecionável em nova transação", () => {
  const profile = normalizedProfile();
  const inactive = addAccount(profile).account;
  accounts.setActive(profile, inactive.id, false, { now: fixedNow });
  assert.equal(accounts.selectableAccounts(profile).some((account) => account.id === inactive.id), false);
});

test("47. conta inativa vinculada continua selecionável na edição", () => {
  const profile = normalizedProfile();
  const inactive = addAccount(profile).account;
  accounts.setActive(profile, inactive.id, false, { now: fixedNow });
  assert.equal(accounts.selectableAccounts(profile, inactive.id).some((account) => account.id === inactive.id), true);
});

test("48. conta padrão resolve o vínculo de uma nova transação", () => {
  const profile = normalizedProfile();
  assert.equal(accounts.resolveAccountId(profile), profile.defaultAccountId);
});

test("49. entrada altera somente a conta vinculada", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  profile.transactions.push(settled({ accountId: second.id, amount: 75 }));
  assert.equal(accounts.balance(profile, profile.defaultAccountId), 0);
  assert.equal(accounts.balance(profile, second.id), 75);
});

test("50. saída altera somente a conta vinculada", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile, { initialBalance: 100 }).account;
  profile.transactions.push(settled({ type: "expense", accountId: second.id, amount: 35 }));
  assert.equal(accounts.balance(profile, profile.defaultAccountId), 0);
  assert.equal(accounts.balance(profile, second.id), 65);
});

test("51. troca de conta preserva identidade e quantidade", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const transaction = settled({ accountId: profile.defaultAccountId });
  profile.transactions.push(transaction);
  accounts.assignTransactionAccount(profile, transaction, second.id);
  assert.equal(profile.transactions.length, 1);
  assert.equal(profile.transactions[0].id, "trx-1");
  assert.equal(profile.transactions[0].accountId, second.id);
});

test("52. importação tabular sem conta usa a conta padrão", () => {
  const profile = normalizedProfile();
  const rows = reports.transactionsFromTableRows(reports.parseDelimitedRows("Data;Descrição;Valor;Tipo\n28/07/2026;Importada;10,00;Receita"));
  const imported = { ...rows[0], id: "imported", categoryId: "cat-1", status: "Recebido" };
  accounts.assignTransactionAccount(profile, imported);
  assert.equal(imported.accountId, profile.defaultAccountId);
});

test("53. moeda inválida é rejeitada", () => {
  const profile = normalizedProfile();
  const result = accounts.add(profile, { name: "Moeda inválida", type: "cash", initialBalance: 0, currency: "XXX" });
  assert.equal(result.ok, false);
});

test("54. moeda da conta não pode divergir da moeda do perfil", () => {
  const profile = normalizedProfile();
  const result = accounts.add(profile, { name: "Dólar", type: "cash", initialBalance: 0, currency: "USD" });
  assert.equal(result.ok, false);
  assert.equal(profile.accounts.length, 1);
});

test("55. moeda inválida do usuário recebe fallback seguro", () => {
  const profile = oldProfile();
  const user = { email: "a@example.com", currency: "moeda-invalida", activeProfileId: profile.id, profiles: [profile] };
  profiles.ensureUserShape(user, { uid: idFactory(), now: fixedNow });
  assert.equal(user.currency, "BRL");
  assert.equal(profile.accounts[0].currency, "BRL");
});

test("56. saldo inicial aceita zero e valor negativo", () => {
  const profile = normalizedProfile();
  const zero = accounts.add(profile, { name: "Zero", type: "cash", initialBalance: 0, currency: "BRL" }, { uid: idFactory() });
  const negative = accounts.add(profile, { name: "Negativa", type: "cash", initialBalance: -50, currency: "BRL" }, { uid: idFactory() });
  assert.equal(zero.account.initialBalance, 0);
  assert.equal(negative.account.initialBalance, -50);
});

test("57. saldo inicial rejeita NaN e infinito", () => {
  const profile = normalizedProfile();
  assert.equal(accounts.add(profile, { name: "NaN", type: "cash", initialBalance: NaN, currency: "BRL" }).ok, false);
  assert.equal(accounts.add(profile, { name: "Infinita", type: "cash", initialBalance: Infinity, currency: "BRL" }).ok, false);
});

test("58. excluir conta padrão vazia redefine a conta padrão", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  assert.equal(accounts.remove(profile, profile.defaultAccountId).ok, true);
  assert.equal(profile.defaultAccountId, second.id);
  assert.ok(accounts.accountById(profile, profile.defaultAccountId));
});

test("59. normalização preserva transferência válida sem alterar o par", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28", description: "Reserva mensal" }, { uid: idFactory(), now: fixedNow });
  const before = JSON.stringify(profile.transactions);
  accounts.normalizeProfile(profile, { uid: idFactory(), currency: "BRL", now: fixedNow });
  assert.equal(JSON.stringify(profile.transactions), before);
});

test("60. par válido tem lados, valores e descrição sincronizados", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  const validation = accounts.validateTransferPair(profile, created.transferId);
  assert.equal(validation.ok, true);
  assert.equal(validation.outgoing.description, validation.incoming.description);
  assert.equal(validation.outgoing.amount, validation.incoming.amount);
  assert.notEqual(validation.outgoing.id, validation.incoming.id);
});

test("61. transferência incompleta é detectada e não é editada", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  profile.transactions.pop();
  const before = JSON.stringify(profile.transactions);
  const result = accounts.updateTransfer(profile, created.transferId, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 40, date: "2026-07-29" });
  assert.equal(result.ok, false);
  assert.equal(JSON.stringify(profile.transactions), before);
});

test("62. transferência com direções corrompidas é detectada", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  created.transactions[1].transferDirection = "out";
  assert.equal(accounts.validateTransferPair(profile, created.transferId).ok, false);
  assert.equal(accounts.deleteTransfer(profile, created.transferId).ok, false);
});

test("63. transferência com valores divergentes é detectada", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  created.transactions[1].amount = 30;
  assert.equal(accounts.validateTransferPair(profile, created.transferId).ok, false);
});

test("64. transferência rejeita contas com moedas incompatíveis", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  second.currency = "USD";
  assert.equal(accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }).ok, false);
});

test("65. IDs das duas movimentações permanecem exclusivos", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: () => "repetido", now: fixedNow });
  assert.equal(new Set(created.transactions.map((transaction) => transaction.id)).size, 2);
});

test("66. duplicação de perfil remapeia par e vínculos da transferência", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  const clone = profiles.duplicate(profile, { uid: idFactory() });
  const cloneTransferId = clone.transactions[0].transferId;
  assert.notEqual(cloneTransferId, created.transferId);
  assert.equal(accounts.validateTransferPair(clone, cloneTransferId).ok, true);
});

test("67. merge por nome não duplica Conta principal", () => {
  const targetProfile = normalizedProfile();
  const incomingProfile = normalizedProfile();
  incomingProfile.id = targetProfile.id;
  incomingProfile.accounts[0].id = "main-imported";
  incomingProfile.defaultAccountId = "main-imported";
  incomingProfile.transactions.push(settled({ id: "imported-main", accountId: "main-imported" }));
  const target = { email: "a@example.com", currency: "BRL", activeProfileId: targetProfile.id, profiles: [targetProfile] };
  const imported = { email: "a@example.com", currency: "BRL", activeProfileId: incomingProfile.id, profiles: [incomingProfile] };
  profiles.mergeImportedUser(target, imported, { uid: idFactory() });
  assert.equal(targetProfile.accounts.filter((account) => accounts.accountName(account.name) === "Conta principal").length, 1);
  assert.equal(targetProfile.transactions.find((transaction) => transaction.id === "imported-main").accountId, targetProfile.defaultAccountId);
});

test("68. JSON com accountId inexistente usa a conta padrão", () => {
  const targetProfile = normalizedProfile();
  const incomingProfile = normalizedProfile();
  incomingProfile.id = targetProfile.id;
  incomingProfile.transactions.push(settled({ id: "invalid-account", accountId: "missing" }));
  const target = { email: "a@example.com", currency: "BRL", activeProfileId: targetProfile.id, profiles: [targetProfile] };
  const imported = { email: "a@example.com", currency: "BRL", activeProfileId: incomingProfile.id, profiles: [incomingProfile] };
  profiles.mergeImportedUser(target, imported, { uid: idFactory() });
  assert.equal(targetProfile.transactions.find((transaction) => transaction.id === "invalid-account").accountId, targetProfile.defaultAccountId);
});

test("69. colisão de transferId na importação não cruza os pares", () => {
  const taggedFactory = (tag) => { let index = 0; return (prefix) => `${prefix}-${tag}-${++index}`; };
  const targetProfile = normalizedProfile();
  const second = addAccount(targetProfile).account;
  const first = accounts.createTransfer(targetProfile, { transferId: "collision", fromAccountId: targetProfile.defaultAccountId, toAccountId: second.id, amount: 10, date: "2026-07-28", description: "Primeira" }, { uid: taggedFactory("target"), now: fixedNow });
  const incomingProfile = JSON.parse(JSON.stringify(targetProfile));
  incomingProfile.transactions = [];
  accounts.createTransfer(incomingProfile, { transferId: "collision", fromAccountId: incomingProfile.defaultAccountId, toAccountId: second.id, amount: 20, date: "2026-07-29", description: "Segunda" }, { uid: taggedFactory("import"), now: fixedNow });
  const target = { email: "a@example.com", currency: "BRL", activeProfileId: targetProfile.id, profiles: [targetProfile] };
  const imported = { email: "a@example.com", currency: "BRL", activeProfileId: incomingProfile.id, profiles: [incomingProfile] };
  profiles.mergeImportedUser(target, imported, { uid: taggedFactory("merge") });
  const transferIds = [...new Set(targetProfile.transactions.map((transaction) => transaction.transferId))];
  assert.equal(transferIds.length, 2);
  assert.equal(accounts.validateTransferPair(targetProfile, first.transferId).ok, true);
  assert.equal(accounts.validateTransferPair(targetProfile, transferIds.find((id) => id !== first.transferId)).ok, true);
});

test("70. exportação filtrada preserva os dois lados e contas da transferência", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28", description: "Reserva" }, { uid: idFactory(), now: fixedNow });
  const exported = JSON.parse(JSON.stringify(profile));
  reports.filterExportProfileByAccount(exported, profile.defaultAccountId);
  assert.equal(exported.accounts.length, 2);
  assert.equal(exported.transactions.length, 2);
  assert.equal(accounts.validateTransferPair(exported, created.transferId).ok, true);
});

test("71. duplicar uma movimentação não preserva metadados de transferência", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const created = accounts.createTransfer(profile, { fromAccountId: profile.defaultAccountId, toAccountId: second.id, amount: 25, date: "2026-07-28" }, { uid: idFactory(), now: fixedNow });
  const duplicate = transactions.createDuplicate(created.transactions[0], {}, { uid: idFactory(), now: fixedNow });
  assert.equal(duplicate.transferId, undefined);
  assert.equal(duplicate.transferDirection, undefined);
  assert.equal(duplicate.transferAccountId, undefined);
});

test("72. parcelas preservam a conta do lançamento original", () => {
  const profile = normalizedProfile();
  const second = addAccount(profile).account;
  const installments = transactions.createInstallments(settled({ accountId: second.id }), 3, { uid: idFactory(), now: () => fixedNow });
  assert.equal(installments.length, 3);
  assert.deepEqual(installments.map((transaction) => transaction.accountId), [second.id, second.id, second.id]);
});

test("73. conta inativa preserva saldo e histórico próprios", () => {
  const profile = normalizedProfile();
  const inactive = addAccount(profile, { initialBalance: 100 }).account;
  profile.transactions.push(settled({ type: "expense", amount: 30, accountId: inactive.id }));
  accounts.setActive(profile, inactive.id, false, { now: fixedNow });
  assert.equal(accounts.balance(profile, inactive.id), 70);
  assert.equal(accounts.transactionsFor(profile, inactive.id).length, 1);
  assert.equal(accounts.consolidatedBalance(profile), 0);
  assert.equal(accounts.consolidatedBalance(profile, { includeInactive: true }), 70);
});
