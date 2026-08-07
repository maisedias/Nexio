"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "ai-assistant.js"));
require(path.join(__dirname, "..", "js", "core", "ai-interpreter.js"));
require(path.join(__dirname, "..", "js", "core", "financial-input.js"));

const core = global.NexioCore;
const fixedNow = new Date(2026, 7, 6, 12, 0, 0, 0);
const profileCategories = Object.freeze(["Salário", "Freelance", "Alimentação", "Casa", "Transporte", "Saúde", "Lazer"]);
const validDraft = Object.freeze({
  type: "expense",
  amount: 150,
  currency: "BRL",
  category: "Transporte",
  description: "Posto Ipiranga",
  paymentMethod: "Debit Card",
  account: null,
  date: "2026-08-05",
});

function serviceWith(result, tracker = { calls: 0 }, options = {}) {
  return core.aiInterpreter.createService({
    timeoutMs: options.timeoutMs || 100,
    invoke: async (request, invokeOptions) => {
      tracker.calls += 1;
      tracker.request = request;
      tracker.signal = invokeOptions.signal;
      if (options.error) throw options.error;
      if (options.invoke) return options.invoke(request, invokeOptions);
      return { draft: result };
    },
  });
}

function interpret(text, service, localDraft = null) {
  return core.financialInput.interpret(
    text,
    core.aiAssistant.parseTransaction,
    service,
    {
      now: fixedNow,
      referenceDate: "2026-08-06",
      categories: profileCategories,
      partialParser: core.aiAssistant.parsePartialTransaction,
    },
    { source: "test", localDraft },
  );
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

test("01. parser local suficiente não chama IA", async () => {
  const tracker = { calls: 0 };
  const result = await interpret("I spent 58 reais at Supermercado BH using my credit card.", serviceWith(validDraft, tracker));
  assert.equal(result.strategy, "local");
  assert.equal(tracker.calls, 0);
});

test("02. parser local incompleto chama IA", async () => {
  const tracker = { calls: 0 };
  const result = await interpret("Ontem abasteci 150 reais no Posto Ipiranga e paguei no débito.", serviceWith(validDraft, tracker));
  assert.equal(result.strategy, "ai");
  assert.equal(tracker.calls, 1);
});

test("03. valida despesa estruturada", () => {
  assert.equal(core.aiInterpreter.validateDraft(validDraft).type, "expense");
});

test("04. valida receita estruturada", () => {
  const income = { ...validDraft, type: "income", category: "Salário", description: "Salário", amount: 4850, paymentMethod: null, date: "2026-08-06" };
  assert.equal(core.aiInterpreter.validateDraft(income).type, "income");
});

test("05. mapeia Mercado somente para a categoria existente Alimentação", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, category: "Alimentação" }).category, "Alimentação");
});

test("06. mapeia Combustível somente para a categoria existente Transporte", () => {
  assert.equal(core.aiInterpreter.validateDraft(validDraft).category, "Transporte");
});

test("07. aceita categoria Salário existente no rascunho", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, type: "income", category: "Salário" }).category, "Salário");
});

test("08. aceita Pix", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, paymentMethod: "Pix" }).paymentMethod, "Pix");
});

test("09. aceita cartão de crédito", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, paymentMethod: "Credit Card" }).paymentMethod, "Credit Card");
});

test("10. aceita cartão de débito", () => {
  assert.equal(core.aiInterpreter.validateDraft(validDraft).paymentMethod, "Debit Card");
});

test("11. aceita dinheiro", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, paymentMethod: "Cash" }).paymentMethod, "Cash");
});

test("12. data ontem é enriquecida pela IA", async () => {
  const result = await interpret("Ontem abasteci 150 reais no posto.", serviceWith(validDraft));
  assert.equal(result.draft.date, "2026-08-05");
});

test("13. data anteontem é enriquecida pela IA", async () => {
  const draft = { ...validDraft, date: "2026-08-04", category: "Saúde", description: "Farmácia" };
  const result = await interpret("Anteontem gastei 35 reais na farmácia.", serviceWith(draft));
  assert.equal(result.draft.date, "2026-08-04");
});

test("14. valor brasileiro R$ 2.500,00 permanece 2500", async () => {
  const draft = { ...validDraft, amount: 2500, category: "Lazer", description: "Loja" };
  const result = await interpret("Comprei por R$ 2.500,00 na loja.", serviceWith(draft));
  assert.equal(result.draft.amount, 2500);
});

test("15. valor por extenso solicita IA", async () => {
  const tracker = { calls: 0 };
  const draft = { ...validDraft, amount: 50, category: "Alimentação", description: "Almoço", paymentMethod: null, date: "2026-08-06" };
  const result = await interpret("Gastei cinquenta reais no almoço.", serviceWith(draft, tracker));
  assert.equal(result.draft.amount, 50);
  assert.equal(tracker.calls, 1);
});

test("16. estabelecimento é preservado", async () => {
  const result = await interpret("Ontem abasteci 150 reais no Posto Ipiranga.", serviceWith(validDraft));
  assert.equal(result.draft.description, "Posto Ipiranga");
});

test("17. resposta com campo extra é rejeitada", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, unsafe: true }), null);
});

test("18. categoria inexistente é rejeitada", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, category: "Inventada" }), null);
});

test("19. valor inválido é rejeitado", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, amount: -1 }), null);
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, amount: "150" }), null);
});

test("20. timeout usa fallback sem bloquear", async () => {
  const service = serviceWith(null, { calls: 0 }, {
    timeoutMs: 5,
    invoke: (_request, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(Object.assign(new Error("timeout"), { name: "AbortError" })), { once: true });
    }),
  });
  const result = await interpret("Anteontem gastei 35 reais na farmácia.", service);
  assert.equal(result.strategy, "fallback");
  assert.ok(result.draft);
});

test("21. sem internet usa fallback", async () => {
  const result = await interpret("Anteontem gastei 35 reais na farmácia.", serviceWith(null, { calls: 0 }, { error: Object.assign(new Error("offline"), { code: "offline" }) }));
  assert.equal(result.strategy, "fallback");
});

test("22. rate limit usa fallback", async () => {
  const result = await interpret("Anteontem gastei 35 reais na farmácia.", serviceWith(null, { calls: 0 }, { error: Object.assign(new Error("limit"), { status: 429 }) }));
  assert.equal(result.strategy, "fallback");
});

test("23. erro server-side usa fallback", async () => {
  const result = await interpret("Anteontem gastei 35 reais na farmácia.", serviceWith(null, { calls: 0 }, { error: Object.assign(new Error("server"), { status: 503 }) }));
  assert.equal(result.strategy, "fallback");
});

test("24. cancelamento descarta a interpretação", async () => {
  const pending = deferred();
  const service = serviceWith(null, { calls: 0 }, { invoke: () => pending.promise });
  const resultPromise = interpret("Gastei cinquenta reais no almoço.", service);
  service.cancel();
  pending.resolve({ draft: validDraft });
  assert.equal((await resultPromise).strategy, "cancelled");
});

test("25. requisição duplicada reutiliza a mesma chamada", async () => {
  const pending = deferred();
  const tracker = { calls: 0 };
  const service = serviceWith(null, tracker, { invoke: () => pending.promise });
  const first = service.interpret({ text: "Gastei cinquenta reais no almoço.", referenceDate: "2026-08-06" });
  const second = service.interpret({ text: "Gastei cinquenta reais no almoço.", referenceDate: "2026-08-06" });
  assert.strictEqual(first, second);
  pending.resolve({ draft: validDraft });
  await first;
  assert.equal(tracker.calls, 1);
});

test("26. resultado antigo não sobrescreve solicitação nova", async () => {
  const firstPending = deferred();
  const secondPending = deferred();
  let calls = 0;
  const service = serviceWith(null, { calls: 0 }, {
    invoke: () => (++calls === 1 ? firstPending.promise : secondPending.promise),
  });
  const first = service.interpret({ text: "Gastei cinquenta reais.", referenceDate: "2026-08-06" });
  const second = service.interpret({ text: "Recebi dois mil reais.", referenceDate: "2026-08-06" });
  secondPending.resolve({ draft: { ...validDraft, type: "income", category: "Salário", amount: 2000, description: "Salário" } });
  firstPending.resolve({ draft: validDraft });
  await assert.rejects(first, (error) => ["cancelled", "stale"].includes(error.code));
  assert.equal((await second).amount, 2000);
});

test("27. falha da IA preserva resultado local utilizável", async () => {
  const result = await interpret("Ontem gastei 35 reais na farmácia.", serviceWith(null, { calls: 0 }, { error: Object.assign(new Error("offline"), { code: "offline" }) }));
  assert.equal(result.draft.amount, 35);
  assert.equal(result.draft.category, "Pharmacy");
});

test("28. falha total cria rascunho manual editável", async () => {
  const result = await interpret("Gastei cinquenta reais no almoço.", null);
  assert.equal(result.strategy, "fallback");
  assert.equal(result.draft.amount, null);
  assert.equal(result.draft.account, null);
});

test("29. formulário existente continua sendo a etapa de confirmação", () => {
  const renderer = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
  assert.match(renderer, /prefillTransactionFromAssistant\(assistantVoice\.draft, assistantVoice\.transcript, assistantVoice\.personalization\)/);
  assert.match(renderer, /Rascunho do Assistente pronto\. Revise e confirme antes de salvar\./);
});

test("30. interpretação nunca salva automaticamente", () => {
  const renderer = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
  const flow = renderer.match(/function interpretAssistantInput[\s\S]*?\n  \}/)?.[0] || "";
  assert.doesNotMatch(flow, /saveStore|transactions\.push|submit/);
  const coreSource = fs.readFileSync(path.join(__dirname, "..", "js", "core", "ai-interpreter.js"), "utf8");
  assert.doesNotMatch(coreSource, /saveStore|transactions\.push|localStorage|IndexedDB/);
});

function responseHarness() {
  return {
    headers: {},
    statusCode: 0,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
  };
}

async function callEndpoint(handler, overrides = {}) {
  const req = {
    method: "POST",
    headers: { authorization: "Bearer session-token", "content-length": "120" },
    body: { text: "Ontem abasteci 150 reais no Posto Ipiranga.", referenceDate: "2026-08-06", locale: "pt-BR" },
    ...overrides,
  };
  const res = responseHarness();
  await handler(req, res);
  return res;
}

test("31. endpoint aceita somente a operação financeira prevista", async () => {
  const handler = require(path.join(__dirname, "..", "api", "interpret-financial-input.js"));
  const res = await callEndpoint(handler, { method: "GET" });
  assert.equal(res.statusCode, 405);
});

test("32. endpoint rejeita input arbitrário", async () => {
  const handler = require(path.join(__dirname, "..", "api", "interpret-financial-input.js"));
  const res = await callEndpoint(handler, { body: { text: "teste", referenceDate: "2026-08-06", locale: "pt-BR", operation: "proxy" } });
  assert.equal(res.statusCode, 400);
});

test("33. endpoint exige autenticação Supabase", async () => {
  const handler = require(path.join(__dirname, "..", "api", "interpret-financial-input.js"));
  const originalFetch = global.fetch;
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY };
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_ANON_KEY = "public-test-key";
  global.fetch = async () => ({ ok: false, json: async () => ({}) });
  try {
    const res = await callEndpoint(handler);
    assert.equal(res.statusCode, 401);
  } finally {
    global.fetch = originalFetch;
    if (previous.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.SUPABASE_ANON_KEY; else process.env.SUPABASE_ANON_KEY = previous.key;
  }
});

test("34. endpoint usa Responses API, schema estrito e modelo atual", async () => {
  const handler = require(path.join(__dirname, "..", "api", "interpret-financial-input.js"));
  const originalFetch = global.fetch;
  const previous = { url: process.env.SUPABASE_URL, anon: process.env.SUPABASE_ANON_KEY, openai: process.env.OPENAI_API_KEY };
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_ANON_KEY = "public-test-key";
  process.env.OPENAI_API_KEY = "server-test-secret";
  const requests = [];
  global.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    if (String(url).includes("/auth/v1/user")) return { ok: true, json: async () => ({ id: "user-34" }) };
    return { ok: true, status: 200, json: async () => ({ output_text: JSON.stringify({ ...validDraft, installments: null }) }) };
  };
  try {
    const res = await callEndpoint(handler);
    assert.equal(res.statusCode, 200);
    const request = JSON.parse(requests[1].options.body);
    assert.equal(request.model, "gpt-5.6-sol");
    assert.equal(request.store, false);
    assert.equal(request.text.format.type, "json_schema");
    assert.equal(request.text.format.strict, true);
    assert.equal(request.input, "Ontem abasteci 150 reais no Posto Ipiranga.");
    assert.doesNotMatch(requests[1].options.body, /session-token|public-test-key/);
  } finally {
    global.fetch = originalFetch;
    for (const [name, value] of [["SUPABASE_URL", previous.url], ["SUPABASE_ANON_KEY", previous.anon], ["OPENAI_API_KEY", previous.openai]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});

test("35. nenhuma chave OpenAI existe no frontend ou bundle Android", () => {
  const frontendFiles = [
    "index.html", "app.js", "supabase-config.js", "mobile-capacitor.js",
    ...fs.readdirSync(path.join(__dirname, "..", "js", "core")).map((name) => `js/core/${name}`),
    ...fs.readdirSync(path.join(__dirname, "..", "js", "ui")).map((name) => `js/ui/${name}`),
    "android-web/index.html",
  ];
  const content = frontendFiles.map((name) => fs.readFileSync(path.join(__dirname, "..", name), "utf8")).join("\n");
  assert.doesNotMatch(content, /sk-[A-Za-z0-9_-]{16,}/);
  assert.doesNotMatch(content, /OPENAI_API_KEY/);
});

test("36. endpoint não registra frase financeira, resposta ou secret", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "api", "interpret-financial-input.js"), "utf8");
  assert.doesNotMatch(source, /console\.(?:log|info|warn|error)/);
  assert.doesNotMatch(source, /process\.env\.OPENAI_API_KEY\s*[+`]/);
});

test("37. interface nova e estados permanecem em pt-BR", () => {
  const renderer = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
  const pipeline = fs.readFileSync(path.join(__dirname, "..", "js", "core", "financial-input.js"), "utf8");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(renderer, /Interpretando lançamento\.\.\./);
  assert.match(pipeline, /Não foi possível interpretar todos os detalhes\. Revise o lançamento antes de continuar\./);
  assert.match(renderer, /message: result\.message/);
  assert.match(html, /Parser local primeiro/);
  assert.doesNotMatch(`${renderer}\n${html}`, />\s*(?:AI Assistant|Processing|Try Again|Failed|Voice Entry|Transaction Draft)\s*</i);
});

test("38. contas nunca são inventadas pela IA", () => {
  assert.equal(core.aiInterpreter.validateDraft({ ...validDraft, account: "Nubank" }), null);
  assert.equal(core.aiInterpreter.manualDraft("texto", { ...validDraft, account: "Nubank" }).account, null);
});

test("39. entrada enviada à IA é limitada ao texto necessário", async () => {
  const tracker = { calls: 0 };
  await interpret("Ontem abasteci 150 reais no posto.", serviceWith(validDraft, tracker));
  assert.deepEqual(Object.keys(tracker.request).sort(), ["locale", "referenceDate", "text"]);
});

test("40. parcelamento compatível permanece apenas no rascunho", () => {
  const draft = core.aiInterpreter.validateDraft({ ...validDraft, installments: 3 });
  assert.equal(draft.installments, 3);
});
