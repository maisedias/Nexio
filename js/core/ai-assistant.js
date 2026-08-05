(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  const categoryRules = Object.freeze([
    { category: "Market", pattern: /\b(supermarket|grocery|groceries|market|mercado|supermercado)\b/i },
    { category: "Fuel", pattern: /\b(fuel|gasoline|gas station|gas|combustivel|gasolina|posto)\b/i },
    { category: "Salary", pattern: /\b(salary|paycheck|wage|salario)\b/i },
  ]);

  const paymentRules = Object.freeze([
    { paymentMethod: "Credit Card", pattern: /\b(credit card|cartao de credito|credito)\b/i },
    { paymentMethod: "Debit Card", pattern: /\b(debit card|cartao de debito|debito)\b/i },
    { paymentMethod: "Pix", pattern: /\bpix\b/i },
    { paymentMethod: "Cash", pattern: /\b(cash|dinheiro|especie)\b/i },
  ]);

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function dateInputValue(value) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseAmount(sentence) {
    const currencyAmount = sentence.match(/(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:reais?|brl)\b/i);
    const fallbackAmount = sentence.match(/(?:spent|paid|received|earned|gastei|paguei|recebi|ganhei)\s+(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/i);
    const raw = currencyAmount?.[1] || fallbackAmount?.[1];
    if (!raw) return null;
    const amount = Number(raw.replace(",", "."));
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  }

  function inferType(sentence) {
    if (/\b(received|earned|income|salary|paycheck|wage|recebi|ganhei|receita|salario)\b/i.test(sentence)) return "income";
    if (/\b(spent|paid|bought|expense|gastei|paguei|comprei|despesa)\b/i.test(sentence)) return "expense";
    return null;
  }

  function inferCategory(sentence, type) {
    const match = categoryRules.find((rule) => rule.pattern.test(sentence));
    if (match) return match.category;
    return type === "income" ? "Income" : "Other";
  }

  function inferPaymentMethod(sentence) {
    return paymentRules.find((rule) => rule.pattern.test(sentence))?.paymentMethod || null;
  }

  function cleanDescription(value) {
    return String(value || "")
      .replace(/^(?:the|a|an|o|a)\s+/i, "")
      .replace(/[.!?,;:]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function inferDescription(sentence, category, type) {
    const merchant = sentence.match(/\b(?:at|no|na|em)\s+(.+?)(?=\s+(?:using|with|via|on|com|usando|pelo|pela)\b|[.!?]|$)/i);
    if (merchant?.[1]) return cleanDescription(merchant[1]);

    const source = sentence.match(/\b(?:from|de)\s+(.+?)(?=\s+(?:using|with|via|on|com|pelo|pela)\b|[.!?]|$)/i);
    if (type === "income" && source?.[1]) return cleanDescription(source[1]);

    if (category === "Salary") return "Salary";
    if (category === "Market") return "Market purchase";
    if (category === "Fuel") return "Fuel";
    return type === "income" ? "Income" : "Expense";
  }

  function parseTransaction(sentence, options = {}) {
    const original = String(sentence || "").trim();
    const normalized = normalizeText(original);
    if (!normalized) return null;

    const type = inferType(normalized);
    const amount = parseAmount(normalized);
    if (!type || amount === null) return null;

    const category = inferCategory(normalized, type);
    return {
      type,
      amount,
      currency: "BRL",
      category,
      description: inferDescription(original, category, type),
      paymentMethod: inferPaymentMethod(normalized),
      account: null,
      date: dateInputValue(options.now || new Date()),
    };
  }

  core.aiAssistant = Object.freeze({
    parseTransaction,
  });
})(globalThis);
