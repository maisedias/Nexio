"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "ai-assistant.js"));
require(path.join(__dirname, "..", "js", "core", "ai-interpreter.js"));
require(path.join(__dirname, "..", "js", "core", "financial-input.js"));
require(path.join(__dirname, "..", "js", "core", "personalization.js"));

const core = global.NexioCore;

function memoryStorage(options = {}) {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (options.failWrites) throw new Error("storage unavailable");
      values.set(key, String(value));
    },
    removeItem: (key) => values.delete(key),
    values,
  };
}

function profile(id = "profile-a") {
  return {
    id,
    categories: [
      { id: "cat-food", name: "Alimentação" },
      { id: "cat-market", name: "Mercado" },
      { id: "cat-fuel", name: "Combustível" },
      { id: "cat-other", name: "Outros" },
    ],
    accounts: [
      { id: "account-main", name: "Conta Principal", active: true },
      { id: "account-card", name: "Nubank", active: true },
      { id: "account-old", name: "Conta antiga", active: false },
    ],
    transactions: [],
  };
}

function transaction(overrides = {}) {
  return {
    id: `trx-${Math.random()}`,
    type: "expense",
    description: "Supermercado BH",
    amount: 58,
    date: "2026-08-07",
    categoryId: "cat-market",
    accountId: "account-card",
    createdAt: "2026-08-07T12:00:00.000Z",
    updatedAt: "2026-08-07T12:00:00.000Z",
    ...overrides,
  };
}

function engine(storage = memoryStorage(), ownerId = "owner-a", profileId = "profile-a") {
  return core.personalization.createEngine({
    storage,
    ownerId,
    profileId,
    now: new Date("2026-08-07T15:00:00.000Z"),
  });
}

function train(target, currentProfile, count = 3, overrides = {}, metadata = {}) {
  for (let index = 0; index < count; index += 1) {
    target.record(transaction({ id: `trx-${index}`, ...overrides }), currentProfile, metadata);
  }
}

function suggest(target, currentProfile, overrides = {}, text = "Gastei 72 reais no Supermercado BH.") {
  return target.suggest({
    type: "expense",
    amount: 72,
    currency: "BRL",
    category: "Other",
    description: "Supermercado BH",
    paymentMethod: null,
    account: null,
    date: "2026-08-07",
    ...overrides,
  }, currentProfile, { text });
}

test("01. mesmo estabelecimento e categoria repetida geram sugestão", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  assert.equal(suggest(target, current).draft.categoryId, "cat-market");
});

test("02. mesmo estabelecimento e forma de pagamento repetida geram sugestão", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, {}, { paymentMethod: "Credit Card" });
  assert.equal(suggest(target, current).draft.paymentMethod, "Credit Card");
});

test("03. mesma conta repetida gera sugestão", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  assert.equal(suggest(target, current).draft.accountId, "account-card");
});

test("04. limite mínimo exige três confirmações", () => {
  const current = profile();
  const target = engine();
  train(target, current, 2);
  assert.equal(suggest(target, current).applied, false);
});

test("05. histórico vazio não altera o rascunho", () => {
  const result = suggest(engine(), profile());
  assert.equal(result.applied, false);
  assert.equal(result.draft.amount, 72);
});

test("06. histórico conflitante não consolida preferência", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, { categoryId: "cat-market" });
  train(target, current, 3, { categoryId: "cat-food" });
  assert.equal(suggest(target, current).suggestedFields.category, undefined);
});

test("07. alta confiança de 75% é aplicada", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, { categoryId: "cat-market" });
  train(target, current, 1, { categoryId: "cat-other" });
  assert.equal(suggest(target, current).suggestedFields.category.confidence, 0.75);
});

test("08. baixa confiança abaixo de 75% é ignorada", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, { categoryId: "cat-market" });
  train(target, current, 2, { categoryId: "cat-other" });
  assert.equal(suggest(target, current).suggestedFields.category, undefined);
});

test("09. dados explícitos da entrada vencem o histórico", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, {}, { paymentMethod: "Credit Card" });
  const result = suggest(target, current, { paymentMethod: "Pix" }, "Paguei 72 reais no Supermercado BH pelo Pix.");
  assert.equal(result.draft.paymentMethod, "Pix");
});

test("10. categoria explícita vence a categoria histórica", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, { categoryId: "cat-market" });
  const result = suggest(target, current, { category: "Alimentação" }, "Gastei 72 reais no Supermercado BH na categoria Alimentação.");
  assert.equal(result.suggestedFields.category, undefined);
});

test("11. Pix explícito vence cartão histórico", () => {
  const current = profile();
  const target = engine();
  train(target, current, 4, {}, { paymentMethod: "Credit Card" });
  assert.equal(suggest(target, current, { paymentMethod: "Pix" }, "Supermercado BH no Pix").draft.paymentMethod, "Pix");
});

test("12. conta explícita vence conta histórica", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  const result = suggest(target, current, { accountId: "account-main" }, "Paguei pela conta Conta Principal.");
  assert.equal(result.draft.accountId, "account-main");
});

test("13. conta inexistente é ignorada", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  current.accounts = current.accounts.filter((account) => account.id !== "account-card");
  assert.equal(suggest(target, current).suggestedFields.account, undefined);
});

test("14. categoria inexistente é ignorada", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  current.categories = current.categories.filter((category) => category.id !== "cat-market");
  assert.equal(suggest(target, current).suggestedFields.category, undefined);
});

test("15. forma de pagamento inválida não entra no histórico", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, {}, { paymentMethod: "Criptomoeda" });
  assert.equal(suggest(target, current).suggestedFields.paymentMethod, undefined);
});

test("16. estabelecimento é comparado sem diferenciar maiúsculas", () => {
  assert.equal(core.personalization.merchantsMatch("SUPERMERCADO BH", "supermercado bh"), true);
});

test("17. espaços duplicados são normalizados", () => {
  assert.equal(core.personalization.normalizeMerchant("Supermercado   BH"), "supermercado bh");
});

test("18. pontuação irrelevante é normalizada", () => {
  assert.equal(core.personalization.merchantsMatch("Supermercado BH!", "Supermercado BH"), true);
});

test("19. variação simples de loja é reconhecida", () => {
  assert.equal(core.personalization.merchantsMatch("Supermercado BH - Loja 123", "Supermercado BH"), true);
});

test("20. perfis diferentes usam chaves e padrões isolados", () => {
  const storage = memoryStorage();
  const firstProfile = profile("profile-a");
  const secondProfile = profile("profile-b");
  const first = engine(storage, "owner-a", firstProfile.id);
  const second = engine(storage, "owner-a", secondProfile.id);
  train(first, firstProfile);
  train(second, secondProfile, 3, { categoryId: "cat-food", accountId: "account-main" });
  assert.notEqual(first.key, second.key);
  assert.equal(suggest(first, firstProfile).draft.categoryId, "cat-market");
  assert.equal(suggest(second, secondProfile).draft.categoryId, "cat-food");
});

test("21. personalização desativada não aplica sugestões", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  target.setEnabled(false);
  assert.equal(suggest(target, current).applied, false);
});

test("22. personalização pode ser reativada", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  target.setEnabled(false);
  target.setEnabled(true);
  assert.equal(suggest(target, current).applied, true);
});

test("23. aprendizado ocorre somente após confirmação e salvamento", () => {
  const current = profile();
  const target = engine();
  const result = core.personalization.learnAfterConfirmation(target, transaction(), current, { confirmed: true, saved: true });
  assert.equal(result.ok, true);
  assert.equal(target.snapshot().records.length, 1);
});

test("24. transação cancelada não gera aprendizado", () => {
  const current = profile();
  const target = engine();
  core.personalization.learnAfterConfirmation(target, transaction(), current, { confirmed: false, saved: true });
  assert.equal(target.snapshot().records.length, 0);
});

test("25. falha ao salvar não gera aprendizado", () => {
  const current = profile();
  const target = engine();
  core.personalization.learnAfterConfirmation(target, transaction(), current, { confirmed: true, saved: false });
  assert.equal(target.snapshot().records.length, 0);
});

test("26. correções manuais confirmadas atualizam o padrão", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, { categoryId: "cat-market" });
  train(target, current, 9, { categoryId: "cat-food" });
  assert.equal(suggest(target, current).draft.categoryId, "cat-food");
});

test("27. valor anterior nunca é reutilizado", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, { amount: 58 });
  assert.equal(suggest(target, current, { amount: 72 }).draft.amount, 72);
});

test("28. data anterior nunca é reutilizada", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, { date: "2026-07-01" });
  assert.equal(suggest(target, current, { date: "2026-08-07" }).draft.date, "2026-08-07");
});

test("29. parser local continua funcionando sem histórico", () => {
  const draft = core.aiAssistant.parseTransaction("I spent 58 reais at Supermercado BH using my credit card.", { now: new Date("2026-08-07T12:00:00") });
  assert.equal(draft.amount, 58);
  assert.equal(suggest(engine(), profile(), draft).applied, false);
});

test("30. interpretação inteligente continua funcionando sem histórico", async () => {
  const remote = core.aiInterpreter.createService({ invoke: async () => ({
    type: "expense", amount: 50, currency: "BRL", category: "Alimentação", description: "Almoço",
    paymentMethod: null, account: null, date: "2026-08-07",
  }) });
  const result = await core.financialInput.interpret("Gastei cinquenta reais no almoço.", core.aiAssistant.parseTransaction, remote, {
    now: new Date("2026-08-07T12:00:00"), referenceDate: "2026-08-07", categories: ["Alimentação"], partialParser: core.aiAssistant.parsePartialTransaction,
  });
  assert.equal(result.strategy, "ai");
  assert.equal(result.draft.amount, 50);
});

test("31. histórico confirmado existente pode iniciar o índice uma vez", () => {
  const current = profile();
  current.transactions = [transaction({ id: "1" }), transaction({ id: "2" }), transaction({ id: "3" })];
  const target = engine();
  assert.equal(target.seed(current.transactions, current).added, 3);
  assert.equal(suggest(target, current).draft.categoryId, "cat-market");
});

test("32. inicialização do índice é idempotente", () => {
  const current = profile();
  current.transactions = [transaction({ id: "1" })];
  const target = engine();
  target.seed(current.transactions, current);
  assert.equal(target.seed(current.transactions, current).added, 0);
  assert.equal(target.snapshot().records.length, 1);
});

test("33. limpar preferências preserva transações", () => {
  const current = profile();
  current.transactions = [transaction({ id: "1" }), transaction({ id: "2" }), transaction({ id: "3" })];
  const target = engine();
  target.seed(current.transactions, current);
  const before = JSON.stringify(current.transactions);
  assert.equal(target.clear(), true);
  assert.equal(target.snapshot().records.length, 0);
  assert.equal(JSON.stringify(current.transactions), before);
});

test("34. cache minimizado não armazena valor nem data da transação", () => {
  const current = profile();
  const target = engine();
  target.record(transaction(), current, { paymentMethod: "Pix" });
  const record = target.snapshot().records[0];
  assert.equal(Object.hasOwn(record, "amount"), false);
  assert.equal(Object.hasOwn(record, "date"), false);
});

test("35. janela local é limitada às 300 confirmações mais recentes", () => {
  const current = profile();
  const target = engine();
  train(target, current, 305);
  assert.equal(target.snapshot().records.length, 300);
});

test("36. matching aproximado não confunde estabelecimentos diferentes", () => {
  assert.equal(core.personalization.merchantsMatch("Supermercado BH", "Supermercado Bom Preço"), false);
});

test("37. conta inativa não pode ser sugerida", () => {
  const current = profile();
  const target = engine();
  train(target, current, 3, { accountId: "account-old" });
  assert.equal(suggest(target, current).suggestedFields.account, undefined);
});

test("38. categoria semelhante de outro perfil não cruza identificadores", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  const foreign = profile("profile-foreign");
  foreign.categories = foreign.categories.map((category) => ({ ...category, id: `foreign-${category.id}` }));
  assert.equal(suggest(target, foreign).suggestedFields.category, undefined);
});

test("39. voz, OCR, compartilhamento e texto usam a mesma sugestão determinística", () => {
  const current = profile();
  const target = engine();
  train(target, current);
  const sources = ["voice", "receipt-ocr", "share-target", "text-ai"];
  const results = sources.map((source) => target.suggest({ type: "expense", amount: 72, description: "Supermercado BH", date: "2026-08-07" }, current, { text: "Supermercado BH", source }).draft.categoryId);
  assert.deepEqual(results, ["cat-market", "cat-market", "cat-market", "cat-market"]);
});

test("40. motor local não possui dependência de OpenAI ou rede", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "core", "personalization.js"), "utf8");
  assert.doesNotMatch(source, /OpenAI|\/v1\/responses|fetch\(|XMLHttpRequest|WebSocket/);
});

test("41. preferência ligada ou desligada persiste no cache isolado", () => {
  const storage = memoryStorage();
  engine(storage).setEnabled(false);
  assert.equal(engine(storage).snapshot().enabled, false);
});

test("42. falha ao gravar o cache não altera o estado em memória", () => {
  const target = engine(memoryStorage({ failWrites: true }));
  assert.equal(target.setEnabled(false), false);
  assert.equal(target.snapshot().enabled, true);
});

const uiSource = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const cssSource = fs.readFileSync(path.join(__dirname, "..", "nexio-v2.css"), "utf8");

test("43. módulo de personalização carrega antes da camada de interface", () => {
  assert.ok(htmlSource.indexOf("js/core/personalization.js") < htmlSource.indexOf("js/ui/shared-ui.js"));
});

test("44. toda interpretação passa pelo motor local depois do parser unificado", () => {
  assert.match(uiSource, /const result = await core\.financialInput\.interpret\([\s\S]*?return personalizeAssistantInterpretation\(result, text, source\);/);
});

test("45. voz, OCR e compartilhamento preservam a sugestão até o formulário", () => {
  assert.match(uiSource, /prefillTransactionFromAssistant\(assistantVoice\.draft, assistantVoice\.transcript, assistantVoice\.personalization\)/);
  assert.match(uiSource, /prefillTransactionFromAssistant\(assistantReceipt\.draft, assistantReceipt\.result\.text, assistantReceipt\.personalization\)/);
  assert.match(uiSource, /prefillTransactionFromAssistant\(draft, extractedText, personalization\)/);
  assert.match(uiSource, /Sugerido com base nos seus lançamentos anteriores/);
});

test("46. aprendizado acontece somente depois do salvamento confirmado", () => {
  assert.match(uiSource, /saveStore\(\);\s*learnPersonalizationAfterSavedTransaction\(transaction, profile\);\s*resetTransactionForm\(\);/);
  assert.match(uiSource, /confirmed:\s*true,[\s\S]*?saved:\s*true/);
});

test("47. cancelar ou redefinir o formulário descarta o contexto do assistente", () => {
  assert.match(uiSource, /function resetTransactionForm\(\)[\s\S]*?pendingAssistantPersonalization = null;/);
});

test("48. configurações oferecem controle local ligado por padrão", () => {
  assert.match(htmlSource, /Personalização do Assistente/);
  assert.match(htmlSource, /data-assistant-personalization-toggle[^>]*checked/);
  assert.match(uiSource, /personalizationEngine\.setEnabled\(personalizationToggle\?\.checked !== false\)/);
});

test("49. limpeza exige confirmação explícita com Cancelar e Limpar", () => {
  assert.match(htmlSource, /data-assistant-personalization-modal[\s\S]*?>Cancelar<[\s\S]*?>Limpar</);
  assert.match(uiSource, /data-confirm-clear-assistant-personalization[\s\S]*?clearAssistantPersonalization/);
});

test("50. limpeza informa que transações e demais dados são preservados", () => {
  assert.match(htmlSource, /Suas transações não serão excluídas\./);
  const clearFunction = uiSource.match(/function clearAssistantPersonalization\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
  assert.doesNotMatch(clearFunction, /transactions|saveStore\(/);
});

test("51. histórico personalizado não entra na requisição de interpretação", () => {
  const interpreter = uiSource.match(/function assistantInterpreterService\(\) \{([\s\S]*?)\r?\n  \}\r?\n\r?\n  function assistantPersonalizationEngine/)?.[1] || "";
  assert.match(interpreter, /body: JSON\.stringify\(payload\)/);
  assert.doesNotMatch(interpreter, /personalization|records|transactions/);
});

test("52. componentes de personalização evitam overflow e usam tokens do tema", () => {
  assert.match(cssSource, /\.settings-assistant-personalization-card\s*\{[^}]*min-width:\s*0;/);
  assert.match(cssSource, /\.assistant-personalization-modal-content p\s*\{[^}]*overflow-wrap:\s*break-word;/);
  assert.doesNotMatch(cssSource.match(/\.assistant-personalization-modal-content[\s\S]*?\n\}/)?.[0] || "", /#[0-9a-f]{3,8}/i);
});

console.log("Personalization tests passed: 52/52.");
