"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
[
  "utils", "storage", "categories", "finance", "accounts", "budgets", "transactions",
  "goals", "financial-context", "spendable",
].forEach((name) => require(path.join(__dirname, "..", "js", "core", `${name}.js`)));

const { financialContext, spendable } = global.NexioCore;
const referenceDate = "2026-10-05";

function profile(overrides = {}) {
  return {
    id: "profile", name: "Principal",
    categories: [{ id: "home", name: "Casa", type: "expense" }, { id: "food", name: "Alimentação", type: "expense" }, { id: "income", name: "Salário", type: "income" }],
    accounts: [{ id: "main", name: "Principal", initialBalance: 1000, active: true }, { id: "reserve", name: "Reserva", initialBalance: 500, active: true }, { id: "inactive", name: "Antiga", initialBalance: 900, active: false }],
    defaultAccountId: "main", transactions: [], budgets: [], goals: [], ...overrides,
  };
}

function trx(overrides = {}) {
  return { id: "trx", type: "expense", description: "Conta", amount: 100, date: "2026-10-05", categoryId: "home", accountId: "main", status: "Pendente", ...overrides };
}

function get(subject, options = {}) {
  const context = financialContext.get(subject, { referenceDate, period: "current-month", includeAudit: true, ...options });
  return spendable.get(context);
}

function sufficientRows() {
  return [
    trx({ id: "paid-a", amount: 20, status: "Pago" }),
    trx({ id: "paid-b", amount: 30, status: "Pago", date: "2026-10-03" }),
    trx({ id: "income", type: "income", amount: 100, status: "Recebido", categoryId: "income", date: "2026-10-04" }),
  ];
}

test("01. perfil vazio não apresenta valor livre como zero", () => {
  const result = get(profile({ accounts: [], transactions: [] }));
  assert.equal(result.state, "no-data"); assert.equal(result.available, null);
});
test("02. saldo positivo sem compromissos permanece livre", () => assert.equal(get(profile({ transactions: sufficientRows() })).available, 1550));
test("03. saldo positivo desconta compromisso aberto", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "open", amount: 300, date: "2026-10-20" })] })).available, 1250));
test("04. compromisso maior que saldo zera valor livre", () => {
  const result = get(profile({ accounts: [{ id: "main", initialBalance: 100, active: true }], transactions: [...sufficientRows(), trx({ id: "open", amount: 500, date: "2026-10-20" })] }));
  assert.equal(result.available, 0); assert.equal(result.shortfall, 350);
});
test("05. saldo real zero é diferente de ausência de dados", () => {
  const result = get(profile({ accounts: [{ id: "main", initialBalance: 0, active: true }], transactions: [trx({ id: "income", type: "income", amount: 100, status: "Recebido", categoryId: "income" }), trx({ id: "paid-a", amount: 50, status: "Pago", date: "2026-10-03" }), trx({ id: "paid-b", amount: 50, status: "Pago", date: "2026-10-04" })] }));
  assert.equal(result.state, "normal"); assert.equal(result.available, 0);
});
test("06. receita futura não aumenta valor livre", () => {
  const base = get(profile({ transactions: sufficientRows() }));
  const result = get(profile({ transactions: [...sufficientRows(), trx({ id: "future-income", type: "income", amount: 800, status: "Pendente", categoryId: "income", date: "2026-10-20" })] }));
  assert.equal(result.available, base.available); assert.equal(result.composition.futureIncome, 800);
});
test("07. despesa futura aberta entra como compromisso", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "future-expense", amount: 200, date: "2026-10-20" })] })).composition.knownCommitments, 200));
test("08. receita e despesa futuras conservam apenas a despesa no livre", () => {
  const result = get(profile({ transactions: [...sufficientRows(), trx({ id: "income", type: "income", amount: 900, status: "Pendente", categoryId: "income", date: "2026-10-20" }), trx({ id: "expense", amount: 200, date: "2026-10-20" })] }));
  assert.equal(result.available, 1350); assert.equal(result.composition.futureIncome, 900);
});
test("09. obrigação atrasada é considerada", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "late", amount: 200, status: "Atrasado", date: "2026-10-01" })] })).composition.knownCommitments, 200));
test("10. obrigação paga não é descontada novamente", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "paid", amount: 200, status: "Pago", date: "2026-10-20" })] })).composition.knownCommitments, 0));
test("11. obrigação recebida não é compromisso", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "received", type: "income", amount: 200, status: "Recebido", categoryId: "income", date: "2026-10-20" })] })).composition.knownCommitments, 0));
test("12. parcelas abertas entram somente uma vez", () => {
  const result = get(profile({ transactions: [...sufficientRows(), trx({ id: "installment-paid", amount: 100, status: "Pago", installmentGroupId: "group", installmentNumber: 1, installmentTotal: 3 }), trx({ id: "installment-open", amount: 100, date: "2026-10-20", installmentGroupId: "group", installmentNumber: 2, installmentTotal: 3 }), trx({ id: "installment-next", amount: 100, date: "2026-11-20", installmentGroupId: "group", installmentNumber: 3, installmentTotal: 3 })] }));
  assert.equal(result.composition.knownCommitments, 100);
});
test("13. parcela fora do horizonte não é descontada", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "later", amount: 120, date: "2026-11-01" })] })).composition.knownCommitments, 0));
test("14. transferência é neutra no consolidado", () => {
  const transfers = [trx({ id: "out", amount: 400, status: "Pago", transferId: "move" }), trx({ id: "in", type: "income", amount: 400, status: "Recebido", categoryId: "income", accountId: "reserve", transferId: "move" })];
  assert.equal(get(profile({ transactions: [...sufficientRows(), ...transfers] })).available, 1550);
});
test("15. cálculo por conta respeita saldo e obrigações do escopo", () => {
  const result = get(profile({ transactions: [...sufficientRows(), trx({ id: "reserve-open", amount: 100, accountId: "reserve", date: "2026-10-20" })] }), { accountId: "main" });
  assert.equal(result.composition.realizedBalance, 1050); assert.equal(result.composition.knownCommitments, 0);
});
test("16. conta inativa não entra no consolidado padrão", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "old", accountId: "inactive", amount: 800, date: "2026-10-20" })] })).composition.knownCommitments, 0));
test("17. orçamento existente não reduz livre estimado", () => {
  const base = get(profile({ transactions: sufficientRows() }));
  const result = get(profile({ transactions: sufficientRows(), budgets: [{ id: "budget", categoryId: "food", month: "2026-10", limit: 900, alertThreshold: 80, active: true }] }));
  assert.equal(result.available, base.available);
});
test("18. meta existente não reduz livre estimado", () => {
  const base = get(profile({ transactions: sufficientRows() }));
  const result = get(profile({ transactions: sufficientRows(), goals: [{ id: "goal", name: "Viagem", target: 2000, saved: 600, history: [], reminders: [] }] }));
  assert.equal(result.available, base.available);
});
test("19. orçamento e meta continuam apenas contextuais", () => {
  const result = get(profile({ transactions: sufficientRows(), budgets: [{ id: "budget", categoryId: "food", month: "2026-10", limit: 900, alertThreshold: 80, active: true }], goals: [{ id: "goal", name: "Viagem", target: 2000, saved: 600, history: [], reminders: [] }] }));
  assert.equal(result.composition.knownCommitments, 0); assert.equal(result.trace.exclusions.length, 3);
});
test("20. múltiplas contas ativas entram no consolidado", () => assert.equal(get(profile({ transactions: sufficientRows() })).composition.realizedBalance, 1550));
test("21. horizonte padrão é o fim do mês", () => assert.equal(get(profile({ transactions: sufficientRows() })).horizon.end, "2026-10-31"));
test("22. virada de mês exclui obrigação do mês seguinte", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "november", amount: 400, date: "2026-11-01" })] })).available, 1550));
test("23. resultado mantém rastreabilidade do contexto", () => {
  const result = get(profile({ transactions: [...sufficientRows(), trx({ id: "open", amount: 100, date: "2026-10-20" })] }));
  assert.deepEqual(result.trace.commitmentTransactionIds, ["open"]); assert.ok(result.trace.includedTransactionIds.includes("open")); assert.equal(result.trace.referenceDate, referenceDate);
});
test("24. poucos lançamentos geram base limitada", () => assert.equal(get(profile({ transactions: [trx({ id: "one", status: "Pago" })] })).quality.state, "limited"));
test("25. histórico fora do período não apresenta zero como disponibilidade", () => {
  const result = get(profile({ transactions: [trx({ id: "old", status: "Pago", date: "2026-09-30" })] }));
  assert.equal(result.state, "no-data"); assert.equal(result.available, null);
});
test("26. resultado é imutável", () => assert.equal(Object.isFrozen(get(profile({ transactions: sufficientRows() }))), true));
test("27. perfil não é alterado", () => {
  const subject = profile({ transactions: sufficientRows() }); const before = JSON.stringify(subject); get(subject); assert.equal(JSON.stringify(subject), before);
});
test("28. valor exibível nunca é negativo", () => assert.ok(get(profile({ transactions: [...sufficientRows(), trx({ id: "large", amount: 9999, date: "2026-10-20" })] })).available >= 0));
test("29. shortfall é preservado separadamente", () => assert.equal(get(profile({ transactions: [...sufficientRows(), trx({ id: "large", amount: 2000, date: "2026-10-20" })] })).shortfall, 450));
test("30. receitas futuras ficam fora dos compromissos", () => {
  const result = get(profile({ transactions: [...sufficientRows(), trx({ id: "future", type: "income", amount: 500, categoryId: "income", date: "2026-10-20" })] }));
  assert.equal(result.composition.knownCommitments, 0); assert.deepEqual(result.trace.futureIncomeTransactionIds, ["future"]);
});
test("31. pagamento de obrigação atualiza o valor livre", () => {
  const open = get(profile({ transactions: [...sufficientRows(), trx({ id: "bill", amount: 200, date: "2026-10-20" })] }));
  const paid = get(profile({ transactions: [...sufficientRows(), trx({ id: "bill", amount: 200, date: "2026-10-20", status: "Pago" })] }));
  assert.equal(open.available, 1350); assert.equal(paid.available, 1350);
});
