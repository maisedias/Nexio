"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "ai-assistant.js"));
require(path.join(__dirname, "..", "js", "core", "financial-input.js"));
require(path.join(__dirname, "..", "js", "core", "receipt-ocr.js"));
require(path.join(__dirname, "..", "js", "core", "android-share-target.js"));

const core = global.NexioCore;
const share = core.androidShareTarget;
const fixedNow = new Date(2026, 7, 5, 12, 0, 0, 0);
const parser = (text) => core.aiAssistant.parseTransaction(text, { now: fixedNow });

function serviceHarness(options = {}) {
  const calls = { scanFile: [], renderPdfPage: [], releaseRenderedPage: [], releaseShare: [], parser: 0 };
  const receiptOcr = {
    scanFile: async (photo, scanOptions) => {
      calls.scanFile.push({ photo, scanOptions });
      scanOptions?.onProcessingImage?.();
      scanOptions?.onRecognizing?.();
      if (options.imageError) throw options.imageError;
      const text = options.pageText?.[photo.path] || options.imageText || "Supermercado BH\nTOTAL R$ 58,90\nPIX";
      return { text, previewUrl: `preview:${photo.path}` };
    },
    cancel: async () => ({ cancelled: true }),
  };
  const nativeShare = {
    getPendingShare: async () => ({ content: options.pending || null }),
    addListener: async (eventName, handler) => {
      nativeShare.listener = handler;
      return { remove: async () => {} };
    },
    renderPdfPage: async ({ id, path: pdfPath, page, maxDimension }) => {
      calls.renderPdfPage.push({ id, path: pdfPath, page, maxDimension });
      if (options.pdfError) throw options.pdfError;
      return { path: `page-${page}.jpg`, page, pageCount: options.pageCount || 2 };
    },
    releaseRenderedPage: async ({ path: pagePath }) => {
      calls.releaseRenderedPage.push(pagePath);
      return { released: true };
    },
    releaseShare: async (payload) => {
      calls.releaseShare.push(payload);
      return { released: true };
    },
  };
  const service = share.createService({
    nativeShare,
    receiptOcr,
    inputPipeline: core.financialInput,
    parser: (text) => {
      calls.parser += 1;
      return parser(text);
    },
    toWebPath: (filePath) => `web:${filePath}`,
    maxPdfPages: options.maxPdfPages || 24,
  });
  return { calls, receiptOcr, nativeShare, service };
}

test("01. financial input pipeline delegates to the single parser", () => {
  let parserCalls = 0;
  const result = core.financialInput.createDraft("I paid 120 by Pix.", (text) => {
    parserCalls += 1;
    return parser(text);
  }, {}, { source: "shared-text" });
  assert.equal(parserCalls, 1);
  assert.equal(result.valid, true);
  assert.equal(result.source, "shared-text");
  assert.equal(result.draft.paymentMethod, "Pix");
});

test("02. normalizes ACTION_SEND_MULTIPLE content and ignores extras gracefully", () => {
  const result = share.normalizePayload({ items: [
    { id: "one", mimeType: "image/jpeg", path: "one.jpg" },
    { id: "two", mimeType: "image/png", path: "two.png" },
  ] });
  assert.equal(result.kind, "image");
  assert.equal(result.path, "one.jpg");
  assert.equal(result.ignoredCount, 1);
});

test("03. shared text goes directly through the financial parser", async () => {
  const harness = serviceHarness();
  const result = await harness.service.process({ id: "text-1", kind: "text", mimeType: "text/plain", text: "Salary R$2500." });
  assert.equal(harness.calls.parser, 1);
  assert.equal(harness.calls.scanFile.length, 0);
  assert.deepEqual([result.draft.type, result.draft.amount, result.draft.category], ["income", 2500, "Salary"]);
});

test("04. shared images reuse the existing OCR scanFile path", async () => {
  const harness = serviceHarness();
  const states = [];
  const result = await harness.service.process({ id: "image-1", kind: "image", mimeType: "image/jpeg", path: "receipt.jpg", name: "receipt.jpg" }, {
    onState: (state) => states.push(state),
  });
  assert.equal(harness.calls.scanFile.length, 1);
  assert.equal(harness.calls.scanFile[0].photo.webPath, "web:receipt.jpg");
  assert.equal(harness.calls.parser, 1);
  assert.equal(result.draft.category, "Market");
  assert.ok(states.includes("recognizing"));
});

test("05. shared PDFs render and OCR pages sequentially", async () => {
  const harness = serviceHarness({
    pageCount: 2,
    pageText: {
      "page-0.jpg": "POSTO SHELL",
      "page-1.jpg": "TOTAL R$120,00\nCRÉDITO",
    },
  });
  const result = await harness.service.process({ id: "pdf-1", kind: "pdf", mimeType: "application/pdf", path: "receipt.pdf", name: "receipt.pdf" });
  assert.deepEqual(harness.calls.renderPdfPage.map((call) => call.page), [0, 1]);
  assert.equal(harness.calls.scanFile.length, 2);
  assert.deepEqual(harness.calls.releaseRenderedPage, ["page-1.jpg"]);
  assert.equal(result.previewUrl, "web:page-0.jpg");
  assert.deepEqual([result.draft.category, result.draft.paymentMethod], ["Fuel", "Credit Card"]);
});

test("06. large PDFs are bounded and report truncated processing", async () => {
  const harness = serviceHarness({ pageCount: 5, maxPdfPages: 2, imageText: "MERCADO CENTRAL\nTOTAL R$ 20,00\nPIX" });
  const result = await harness.service.process({ id: "pdf-large", kind: "pdf", mimeType: "application/pdf", path: "large.pdf" });
  assert.equal(harness.calls.renderPdfPage.length, 2);
  assert.equal(result.processedPages, 2);
  assert.equal(result.truncated, true);
});

test("07. unsupported content fails with a recovery message", async () => {
  const harness = serviceHarness();
  await assert.rejects(
    harness.service.process({ mimeType: "application/zip", path: "receipt.zip" }),
    (error) => error.code === "unsupported-file" && /plain text, an image, or a PDF/i.test(error.message),
  );
});

test("08. missing and empty shared text never reaches the parser", async () => {
  const harness = serviceHarness();
  await assert.rejects(harness.service.process({ kind: "text", mimeType: "text/plain", text: "" }), (error) => error.code === "missing-content");
  assert.equal(harness.calls.parser, 0);
});

test("09. permission errors are preserved and never crash processing", async () => {
  const harness = serviceHarness({ imageError: { code: "permission-denied", message: "Access denied" } });
  await assert.rejects(
    harness.service.process({ id: "denied", kind: "image", mimeType: "image/jpeg", path: "receipt.jpg" }),
    (error) => error.code === "permission-denied",
  );
});

test("10. corrupted PDFs return a friendly typed failure", async () => {
  const harness = serviceHarness({ pdfError: new Error("corrupted pdf") });
  await assert.rejects(
    harness.service.process({ id: "bad-pdf", kind: "pdf", mimeType: "application/pdf", path: "bad.pdf" }),
    (error) => error.code === "corrupted-pdf" && /could not be opened/i.test(error.message),
  );
});

test("11. parser failures remain drafts only and cannot continue", async () => {
  const harness = serviceHarness();
  await assert.rejects(
    harness.service.process({ id: "invalid", kind: "text", mimeType: "text/plain", text: "Unrelated copied text" }),
    (error) => error.code === "parser-failure" && error.extractedText === "Unrelated copied text",
  );
});

test("12. pending content, listener delivery, cancellation and cache release are supported", async () => {
  const pending = { id: "pending-1", kind: "text", mimeType: "text/plain", text: "I paid 80 by Pix." };
  const harness = serviceHarness({ pending });
  assert.deepEqual(await harness.service.pending(), pending);
  let received = null;
  const handle = await harness.service.listen((payload) => { received = payload; });
  harness.nativeShare.listener({ content: pending });
  assert.deepEqual(received, pending);
  await harness.service.process(pending);
  assert.deepEqual(await harness.service.cancel(), { cancelled: true });
  assert.equal(harness.calls.releaseShare[0].id, "pending-1");
  assert.equal(typeof handle.remove, "function");
});

test("13. parser recognizes transfer confirmations, banks, merchants and installments", () => {
  const pix = parser("COMPROVANTE DE PIX\nNUBANK\nFavorecido: Maria Silva\nValor R$ 80,00\nPix realizado");
  assert.deepEqual([pix.type, pix.category, pix.paymentMethod, pix.account, pix.description], ["expense", "Transfer", "Pix", "Nubank", "Maria Silva"]);
  const card = parser("LOJA CENTRAL\nTOTAL R$ 300,00\nCRÉDITO\n3x");
  assert.deepEqual([card.category, card.paymentMethod, card.installments], ["Store", "Credit Card", 3]);
  assert.equal(parser("Banco Inter\nPagamento instantâneo\nR$ 45,00").account, "Banco Inter");
});

test("14. incoming preview, cancel, reprocess and manual Continue flow are present", () => {
  const root = path.join(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const renderer = fs.readFileSync(path.join(root, "js", "ui", "shared-ui.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "nexio-v2.css"), "utf8");
  assert.match(html, /Incoming Shared Content/);
  assert.match(html, /data-shared-detected="type"[\s\S]*data-shared-detected="file"[\s\S]*data-shared-detected="merchant"[\s\S]*data-shared-detected="amount"[\s\S]*data-shared-detected="payment"[\s\S]*data-shared-detected="category"/);
  assert.match(html, /data-close-shared-content/);
  assert.match(html, /data-reprocess-shared-content/);
  assert.match(html, /data-continue-shared-content[^>]*disabled/);
  assert.match(renderer, /function continueIncomingSharedContent\(\)[\s\S]*prefillTransactionFromAssistant/);
  assert.doesNotMatch(renderer.match(/async function processIncomingSharedContent[\s\S]*?\n  }/)?.[0] || "", /saveStore|transactions\.push/);
  assert.match(styles, /shared-content-preview[\s\S]*grid-template-columns/);
  assert.match(styles, /@media \(max-width: 1180px\)[\s\S]*?assistant-option-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  assert.match(styles, /@media \(max-width: 420px\)[\s\S]*?assistant-option-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
});

test("15. transaction draft integration maps account and installment fields without saving", () => {
  const renderer = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
  const prefill = renderer.match(/function prefillTransactionFromAssistant[\s\S]*?\n  }/)?.[0] || "";
  assert.match(prefill, /#transactionDescription/);
  assert.match(prefill, /#transactionAmount/);
  assert.match(prefill, /#transactionDate/);
  assert.match(prefill, /#transactionCategory/);
  assert.match(prefill, /#transactionAccount/);
  assert.match(prefill, /#transactionInstallmentsEnabled/);
  assert.doesNotMatch(prefill, /saveStore|transactions\.push/);
});

test("16. Android manifests register natural ACTION_SEND and ACTION_SEND_MULTIPLE targets", () => {
  const root = path.join(__dirname, "..");
  const manifest = fs.readFileSync(path.join(root, "capacitor-overrides", "android", "AndroidManifest.xml"), "utf8");
  const plugin = fs.readFileSync(path.join(root, "capacitor-overrides", "android", "NexioShareTargetPlugin.java"), "utf8");
  const main = fs.readFileSync(path.join(root, "capacitor-overrides", "android", "MainActivity.java"), "utf8");
  assert.match(manifest, /android\.intent\.action\.SEND/);
  assert.match(manifest, /android\.intent\.action\.SEND_MULTIPLE/);
  assert.match(manifest, /text\/plain/);
  assert.match(manifest, /image\/\*/);
  assert.match(manifest, /application\/pdf/);
  assert.match(plugin, /handleOnNewIntent/);
  assert.match(plugin, /PdfRenderer/);
  assert.match(plugin, /renderPdfPage/);
  assert.match(plugin, /MAX_SHARED_BYTES/);
  assert.match(main, /registerPlugin\(NexioShareTargetPlugin\.class\)/);
});

console.log("Android Share Target tests passed: 16/16.");
