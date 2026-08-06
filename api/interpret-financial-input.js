"use strict";

const { createHash } = require("node:crypto");

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const MODEL = "gpt-5.6-sol";
const MAX_INPUT_LENGTH = 600;
const MAX_BODY_BYTES = 4096;
const REQUEST_TIMEOUT_MS = 8000;
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_REQUESTS = 10;
const categories = [
  "Salário", "Freelance", "Alimentação", "Casa", "Transporte", "Saúde", "Lazer",
];
const paymentMethods = ["Credit Card", "Debit Card", "Pix", "Cash", "Bank Transfer", "Boleto"];
const allowedRequestKeys = new Set(["text", "referenceDate", "locale"]);
const allowedDraftKeys = new Set([
  "type", "amount", "currency", "category", "description", "paymentMethod",
  "account", "date", "installments",
]);
const rateLimitBuckets = new Map();

function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(body);
}

function validDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1])
    && date.getUTCMonth() === Number(match[2]) - 1
    && date.getUTCDate() === Number(match[3]);
}

function validateRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  if (Object.keys(body).some((key) => !allowedRequestKeys.has(key))) return null;
  const text = String(body.text || "").trim();
  if (!text || text.length > MAX_INPUT_LENGTH) return null;
  if (body.locale !== "pt-BR" || !validDate(body.referenceDate)) return null;
  return { text, referenceDate: body.referenceDate, locale: "pt-BR" };
}

function validateDraft(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  if (Object.keys(candidate).some((key) => !allowedDraftKeys.has(key))) return null;
  if (!["expense", "income"].includes(candidate.type)) return null;
  if (!Number.isFinite(candidate.amount) || candidate.amount <= 0 || candidate.amount > 999999999999) return null;
  if (candidate.currency !== "BRL" || !categories.includes(candidate.category)) return null;
  const description = String(candidate.description || "").trim();
  if (!description || description.length > 120) return null;
  if (candidate.paymentMethod !== null && !paymentMethods.includes(candidate.paymentMethod)) return null;
  if (candidate.account !== null) return null;
  if (!validDate(candidate.date)) return null;
  if (candidate.installments !== null
    && (!Number.isInteger(candidate.installments) || candidate.installments < 2 || candidate.installments > 60)) return null;
  return {
    type: candidate.type,
    amount: candidate.amount,
    currency: "BRL",
    category: candidate.category,
    description,
    paymentMethod: candidate.paymentMethod,
    account: null,
    date: candidate.date,
    ...(candidate.installments ? { installments: candidate.installments } : {}),
  };
}

function takeRateLimit(userId, now = Date.now()) {
  const current = rateLimitBuckets.get(userId);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(userId, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= RATE_LIMIT_REQUESTS) return false;
  current.count += 1;
  return true;
}

async function authenticate(authorization, fetchImpl, env) {
  if (!/^Bearer\s+\S+$/i.test(authorization || "")) return null;
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) throw new Error("server-config");
  const response = await fetchImpl(`${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: env.SUPABASE_ANON_KEY,
    },
  });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user?.id === "string" && user.id ? user : null;
}

function responseSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      type: { type: "string", enum: ["expense", "income"] },
      amount: { type: "number", exclusiveMinimum: 0, maximum: 999999999999 },
      currency: { type: "string", enum: ["BRL"] },
      category: { type: "string", enum: categories },
      description: { type: "string", minLength: 1, maxLength: 120 },
      paymentMethod: { anyOf: [{ type: "string", enum: paymentMethods }, { type: "null" }] },
      account: { type: "null" },
      date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      installments: { anyOf: [{ type: "integer", minimum: 2, maximum: 60 }, { type: "null" }] },
    },
    required: [
      "type", "amount", "currency", "category", "description", "paymentMethod",
      "account", "date", "installments",
    ],
  };
}

function openAiRequest(input, userId) {
  const safetyIdentifier = createHash("sha256").update(userId).digest("hex");
  return {
    model: MODEL,
    store: false,
    max_output_tokens: 500,
    reasoning: { effort: "low" },
    safety_identifier: safetyIdentifier,
    instructions: [
      "Interprete uma única frase de finanças pessoais em português do Brasil.",
      "Retorne apenas o objeto estruturado solicitado.",
      `Use ${input.referenceDate} como data local de referência para hoje, ontem, anteontem, dias da semana, semana passada e dia do mês.`,
      "Interprete valores no padrão brasileiro: ponto separa milhares e vírgula separa centavos.",
      "Use somente as categorias e formas de pagamento permitidas pelo schema.",
      "Não invente conta; account deve ser null.",
      "Não execute, confirme ou salve transações.",
    ].join(" "),
    input: input.text,
    text: {
      format: {
        type: "json_schema",
        name: "nexio_financial_transaction",
        strict: true,
        schema: responseSchema(),
      },
    },
  };
}

function extractOutputText(response) {
  if (typeof response?.output_text === "string") return response.output_text;
  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") return content.text;
    }
  }
  return "";
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { code: "method-not-allowed", message: "Operação não permitida." });
  }
  const declaredLength = Number(req.headers["content-length"] || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json(res, 413, { code: "input-too-large", message: "O texto informado é muito longo." });
  }
  const serializedBody = JSON.stringify(req.body || {});
  if (Buffer.byteLength(serializedBody, "utf8") > MAX_BODY_BYTES) {
    return json(res, 413, { code: "input-too-large", message: "O texto informado é muito longo." });
  }
  const input = validateRequest(req.body);
  if (!input) return json(res, 400, { code: "invalid-input", message: "Não foi possível validar o lançamento informado." });

  const fetchImpl = global.fetch;
  const env = process.env;
  let user;
  try {
    user = await authenticate(req.headers.authorization, fetchImpl, env);
  } catch {
    return json(res, 503, { code: "server-config", message: "A interpretação inteligente está temporariamente indisponível." });
  }
  if (!user) return json(res, 401, { code: "unauthenticated", message: "Entre na sua conta para usar a interpretação inteligente." });
  if (!takeRateLimit(user.id)) {
    return json(res, 429, { code: "rate-limit", message: "Muitas tentativas em pouco tempo. Tente novamente em instantes." });
  }
  if (!env.OPENAI_API_KEY) {
    return json(res, 503, { code: "server-config", message: "A interpretação inteligente está temporariamente indisponível." });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openAiRequest(input, user.id)),
      signal: controller.signal,
    });
    if (response.status === 429) {
      return json(res, 429, { code: "rate-limit", message: "Limite temporário atingido. Revise o lançamento manualmente." });
    }
    if (!response.ok) {
      return json(res, 502, { code: "provider-error", message: "Não foi possível concluir a interpretação. Revise o lançamento manualmente." });
    }
    const payload = await response.json();
    let parsed;
    try {
      parsed = JSON.parse(extractOutputText(payload));
    } catch {
      return json(res, 502, { code: "invalid-response", message: "A interpretação retornou dados inválidos. Revise o lançamento manualmente." });
    }
    const draft = validateDraft(parsed);
    if (!draft) {
      return json(res, 502, { code: "invalid-response", message: "A interpretação retornou dados inválidos. Revise o lançamento manualmente." });
    }
    return json(res, 200, { draft });
  } catch (error) {
    const timeout = error?.name === "AbortError";
    return json(res, 504, {
      code: timeout ? "timeout" : "provider-error",
      message: timeout
        ? "A interpretação demorou mais que o esperado. Revise o lançamento manualmente."
        : "Não foi possível concluir a interpretação. Revise o lançamento manualmente.",
    });
  } finally {
    clearTimeout(timer);
  }
}

module.exports = handler;
module.exports._test = Object.freeze({
  MODEL,
  extractOutputText,
  openAiRequest,
  responseSchema,
  takeRateLimit,
  validateDraft,
  validateRequest,
});
