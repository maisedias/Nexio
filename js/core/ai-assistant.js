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
    { category: "Transfer", pattern: /\b(transfer|transferencia|ted|doc|boleto|comprovante de pix|pix (?:enviado|realizado|concluido))\b/i },
    { category: "Salary", pattern: /\b(salary|paycheck|wage|salario)\b/i },
  ]);

  const paymentRules = Object.freeze([
    { paymentMethod: "Credit Card", pattern: /\b(credit card|cartao de credito|credito|compra no credito)\b/i },
    { paymentMethod: "Debit Card", pattern: /\b(debit card|cartao de debito|debito|compra no debito)\b/i },
    { paymentMethod: "Pix", pattern: /\b(pix|pagamento instantaneo|instant payment)\b/i },
    { paymentMethod: "Cash", pattern: /\b(cash|dinheiro|especie)\b/i },
    { paymentMethod: "Bank Transfer", pattern: /\b(transfer|transferencia|ted|doc)\b/i },
    { paymentMethod: "Boleto", pattern: /\bboleto\b/i },
  ]);

  const bankRules = Object.freeze([
    { account: "Nubank", pattern: /\b(nubank|nu pagamentos)\b/i },
    { account: "Banco Inter", pattern: /\b(banco inter|inter pagamentos)\b/i },
    { account: "Itaú", pattern: /\b(itau|itau unibanco)\b/i },
    { account: "Bradesco", pattern: /\b(bradesco)\b/i },
    { account: "Banco do Brasil", pattern: /\b(banco do brasil)\b/i },
    { account: "Caixa", pattern: /\b(caixa economica|caixa tem)\b/i },
    { account: "Santander", pattern: /\b(santander)\b/i },
    { account: "PicPay", pattern: /\b(picpay)\b/i },
    { account: "Mercado Pago", pattern: /\b(mercado pago)\b/i },
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
    if (/\b(received|earned|income|salary|paycheck|wage|recebi|recebido|ganhei|receita|salario|creditado|deposito recebido)\b/i.test(sentence)) return "income";
    if (/\b(spent|paid|bought|expense|gastei|paguei|comprei|despesa|enviado|pagamento efetuado|compra aprovada)\b/i.test(sentence)) return "expense";
    if (/\b(total|valor total|a pagar|pix|pagamento instantaneo|instant payment|debito|credito|dinheiro|mercado|supermercado|posto|combustivel|farmacia|restaurante|padaria|loja|transferencia|ted|doc|boleto|comprovante)\b/i.test(sentence)) return "expense";
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

  function inferAccount(sentence) {
    return bankRules.find((rule) => rule.pattern.test(sentence))?.account || null;
  }

  function inferInstallments(sentence) {
    const normalized = normalizeText(sentence);
    const match = normalized.match(/\b(?:em\s+)?(\d{1,2})\s*x\b|\b(\d{1,2})\s+parcelas?\b|\bparcela\s+\d{1,2}\s*(?:de|\/)\s*(\d{1,2})\b/i);
    const count = Number(match?.[1] || match?.[2] || match?.[3]);
    return Number.isInteger(count) && count > 1 && count <= 60 ? count : null;
  }

  function cleanDescription(value) {
    return String(value || "")
      .replace(/^(?:the|a|an|o|a)\s+/i, "")
      .replace(/[.!?,;:]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function inferDescription(sentence, category, type) {
    const labelledMerchant = sentence.match(/(?:merchant|estabelecimento|comercio|favorecido|recebedor|beneficiario)\s*[:\-]\s*([^\r\n]+)/i);
    if (labelledMerchant?.[1]) return cleanDescription(labelledMerchant[1]);

    const merchant = sentence.match(/\b(?:at|no|na|em)\s+(.+?)(?=\s+(?:using|with|via|on|com|usando|pelo|pela)\b|[.!?]|$)/i);
    if (merchant?.[1]) return cleanDescription(merchant[1]);

    const source = sentence.match(/\b(?:from|de)\s+(.+?)(?=\s+(?:using|with|via|on|com|pelo|pela)\b|[.!?]|$)/i);
    if (type === "income" && source?.[1]) return cleanDescription(source[1]);

    const receiptLine = String(sentence || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line && !/(?:^|\b)(?:total|subtotal|valor|r\$|brl|pix|debito|credito|dinheiro|data|hora|cnpj|cpf|cupom|nota fiscal|nfce|ted|doc|boleto|comprovante|autenticacao|transacao|parcela)(?:\b|$)/i.test(normalizeText(line)) && !/^\d{2}[\/.\-]\d{2}[\/.\-]\d{2,4}$/.test(line));
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

  function parsePartialTransaction(sentence, options = {}) {
    const original = String(sentence || "").trim();
    const normalized = normalizeText(original);
    if (!normalized) return null;

    const type = inferType(normalized);
    const amount = parseAmount(original);
    const category = inferCategory(normalized, type);
    const draft = {
      type,
      amount,
      currency: "BRL",
      category,
      description: inferDescription(original, category, type),
      paymentMethod: inferPaymentMethod(normalized),
      account: inferAccount(normalized),
      date: inferDate(original, options.now || new Date()),
    };
    const installments = inferInstallments(normalized);
    if (installments) draft.installments = installments;
    return draft;
  }

  function parseTransaction(sentence, options = {}) {
    const draft = parsePartialTransaction(sentence, options);
    return draft?.type && draft.amount !== null ? draft : null;
  }

  core.aiAssistant = Object.freeze({
    parsePartialTransaction,
    parseTransaction,
  });
})(globalThis);
