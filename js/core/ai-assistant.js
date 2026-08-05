(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  const categoryRules = Object.freeze([
    { category: "Market", pattern: /\b(supermarket|grocery|groceries|market|mercado|supermercado)\b/i },
    { category: "Fuel", pattern: /\b(fuel|gasoline|gas station|gas|combustivel|gasolina|posto)\b/i },
    { category: "Pharmacy", pattern: /\b(pharmacy|drugstore|farmacia)\b/i },
    { category: "Restaurant", pattern: /\b(restaurant|restaurante|lanchonete)\b/i },
    { category: "Bakery", pattern: /\b(bakery|padaria)\b/i },
    { category: "Store", pattern: /\b(store|shop|loja)\b/i },
    { category: "Transfer", pattern: /\b(transfer|transferencia|ted|doc|boleto)\b/i },
    { category: "Salary", pattern: /\b(salary|paycheck|wage|salario)\b/i },
  ]);

  const paymentRules = Object.freeze([
    { paymentMethod: "Credit Card", pattern: /\b(credit card|cartao de credito|credito)\b/i },
    { paymentMethod: "Debit Card", pattern: /\b(debit card|cartao de debito|debito)\b/i },
    { paymentMethod: "Pix", pattern: /\bpix\b/i },
    { paymentMethod: "Cash", pattern: /\b(cash|dinheiro|especie)\b/i },
    { paymentMethod: "Bank Transfer", pattern: /\b(transfer|transferencia|ted|doc)\b/i },
    { paymentMethod: "Boleto", pattern: /\bboleto\b/i },
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

  function moneyNumber(value) {
    const raw = String(value || "").replace(/\s/g, "");
    if (!raw) return null;
    let normalized = raw;
    const comma = raw.lastIndexOf(",");
    const dot = raw.lastIndexOf(".");
    if (comma < 0 && /^\d{1,3}(?:\.\d{3})+$/.test(raw)) normalized = raw.replace(/\./g, "");
    else if (comma > dot) normalized = raw.replace(/\./g, "").replace(",", ".");
    else if (dot > comma && comma >= 0) normalized = raw.replace(/,/g, "");
    else if (comma >= 0) normalized = raw.replace(",", ".");
    const amount = Number(normalized);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  }

  function parseAmount(sentence) {
    const totalAmount = sentence.match(/(?:total|valor\s+total|a\s+pagar)\s*[:\-]?\s*(?:r\$|brl)?\s*(\d{1,3}(?:[.\s]\d{3})+(?:,\d{2})?|\d+(?:[.,]\d{1,2})?)/i);
    const currencyAmount = sentence.match(/(?:r\$\s*)?(\d{1,3}(?:[.\s]\d{3})+(?:,\d{2})?|\d+(?:[.,]\d{1,2})?)\s*(?:reais?|brl)\b/i);
    const prefixedCurrency = sentence.match(/(?:r\$|brl)\s*(\d{1,3}(?:[.\s]\d{3})+(?:,\d{2})?|\d+(?:[.,]\d{1,2})?)/i);
    const fallbackAmount = sentence.match(/(?:spent|paid|received|earned|gastei|paguei|recebi|ganhei)\s+(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/i);
    return moneyNumber(totalAmount?.[1] || currencyAmount?.[1] || prefixedCurrency?.[1] || fallbackAmount?.[1]);
  }

  function inferType(sentence) {
    if (/\b(received|earned|income|salary|paycheck|wage|recebi|ganhei|receita|salario)\b/i.test(sentence)) return "income";
    if (/\b(spent|paid|bought|expense|gastei|paguei|comprei|despesa)\b/i.test(sentence)) return "expense";
    if (/\b(total|valor total|a pagar|pix|debito|credito|dinheiro|mercado|supermercado|posto|combustivel|farmacia|restaurante|padaria|loja|transferencia|ted|doc|boleto)\b/i.test(sentence)) return "expense";
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

    const receiptLine = String(sentence || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line && !/(?:^|\b)(?:total|subtotal|valor|r\$|brl|pix|debito|credito|dinheiro|data|hora|cnpj|cpf|cupom|nota fiscal|nfce|ted|doc|boleto)(?:\b|$)/i.test(normalizeText(line)) && !/^\d{2}[\/.\-]\d{2}[\/.\-]\d{2,4}$/.test(line));
    if (receiptLine) return cleanDescription(receiptLine);

    if (category === "Salary") return "Salary";
    if (category === "Market") return "Market purchase";
    if (category === "Fuel") return "Fuel";
    return type === "income" ? "Income" : "Expense";
  }

  function inferDate(sentence, fallback) {
    const match = String(sentence || "").match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2}|\d{4})\b/);
    if (!match) return dateInputValue(fallback);
    const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]);
    const month = Number(match[2]);
    const day = Number(match[1]);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return dateInputValue(fallback);
    return dateInputValue(parsed);
  }

  function parseTransaction(sentence, options = {}) {
    const original = String(sentence || "").trim();
    const normalized = normalizeText(original);
    if (!normalized) return null;

    const type = inferType(normalized);
    const amount = parseAmount(original);
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
      date: inferDate(original, options.now || new Date()),
    };
  }

  core.aiAssistant = Object.freeze({
    parseTransaction,
  });
})(globalThis);
