"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "services", "assistant-platform.js"));

const platform = global.NexioPlatform;
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const ui = fs.readFileSync(path.join(root, "js", "ui", "shared-ui.js"), "utf8");
const speechCore = fs.readFileSync(path.join(root, "js", "core", "speech-recognition.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "nexio-v2.css"), "utf8");
const transactionCore = fs.readFileSync(path.join(root, "js", "core", "transactions.js"), "utf8");
const androidBuilder = fs.readFileSync(path.join(root, "scripts", "build-android-web.js"), "utf8");

class FakeRecognition {
  static last = null;
  constructor() { FakeRecognition.last = this; }
  start() { this.onstart?.(); }
  stop() { this.onend?.(); }
  abort() { this.aborted = true; this.onend?.(); }
  result(text) { this.onresult?.({ results: [[{ transcript: text }]] }); }
  error(code) { this.onerror?.({ error: code }); }
}

function speechHost(permission = "granted") {
  return {
    SpeechRecognition: FakeRecognition,
    navigator: {
      permissions: { query: async () => ({ state: permission }) },
      mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) },
    },
  };
}

function fakeInput(file = null) {
  const listeners = new Map();
  return {
    files: file ? [file] : [], value: "", attributes: {},
    addEventListener(name, listener) { listeners.set(name, listener); },
    removeEventListener(name) { listeners.delete(name); },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    click() { this.clicked = true; },
    emit(name) { listeners.get(name)?.(); },
  };
}

test("01. detects Web by actual capabilities", () => {
  const input = fakeInput();
  assert.deepEqual(platform.detectCapabilities({ host: { SpeechRecognition: FakeRecognition, document: { createElement() {} } }, fileInput: input }), {
    platform: "web", native: false, speech: "web", filePicker: "web", ocr: "web",
  });
});

test("02. detects Android only when native runtime and plugins are usable", () => {
  const host = { Capacitor: { isNativePlatform: () => true, getPlatform: () => "android", Plugins: {
    SpeechRecognition: { start() {} }, Camera: { getPhoto() {} }, TextRecognition: { processImage() {} },
  } } };
  assert.deepEqual(platform.detectCapabilities({ host }), {
    platform: "android", native: true, speech: "android", filePicker: "android", ocr: "android",
  });
});

test("03. does not treat a Capacitor global alone as native", () => {
  assert.equal(platform.detectCapabilities({ host: { Capacitor: { Plugins: {} } } }).native, false);
});

test("04. supports SpeechRecognition", () => assert.ok(platform.createWebSpeechPlugin(speechHost())));
test("05. supports webkitSpeechRecognition", () => assert.ok(platform.createWebSpeechPlugin({ webkitSpeechRecognition: FakeRecognition })));
test("06. reports unsupported Web speech", () => assert.equal(platform.createWebSpeechPlugin({}), null));

test("07. configures Web speech in pt-BR", async () => {
  const plugin = platform.createWebSpeechPlugin(speechHost());
  await plugin.start();
  assert.equal(FakeRecognition.last.lang, "pt-BR");
  await plugin.forceStop();
});

test("08. reports microphone permission granted", async () => {
  const plugin = platform.createWebSpeechPlugin(speechHost("granted"));
  assert.deepEqual(await plugin.checkPermissions(), { speechRecognition: "granted" });
});

test("09. reports microphone permission denied", async () => {
  const plugin = platform.createWebSpeechPlugin(speechHost("denied"));
  assert.deepEqual(await plugin.checkPermissions(), { speechRecognition: "denied" });
});

test("10. emits a successful Web transcription", async () => {
  const plugin = platform.createWebSpeechPlugin(speechHost());
  let transcript = "";
  await plugin.addListener("partialResults", (event) => { transcript = event.accumulatedText; });
  await plugin.start();
  FakeRecognition.last.result("Gastei 58 reais no mercado");
  assert.equal(transcript, "Gastei 58 reais no mercado");
  await plugin.forceStop();
});

test("11. cancels Web speech without preserving an active recognizer", async () => {
  const plugin = platform.createWebSpeechPlugin(speechHost());
  await plugin.start();
  const active = FakeRecognition.last;
  await plugin.forceStop();
  assert.equal(active.aborted, true);
});

test("12. preserves native Android speech when available", () => {
  const nativeSpeech = { start() {} };
  const host = { Capacitor: { isNativePlatform: () => true, getPlatform: () => "android", Plugins: { SpeechRecognition: nativeSpeech } } };
  assert.equal(platform.resolveAssistantCapabilities({ host }).speech.plugin, nativeSpeech);
});

test("13. exposes the exact unsupported-browser message and typing fallback", () => {
  assert.match(speechCore, /O reconhecimento de voz não está disponível neste navegador\./);
  assert.match(html, /data-ai-voice-manual-toggle[\s\S]*Digitar lançamento/);
});

test("14. typing fallback uses the same assistant interpretation pipeline", () => {
  assert.match(ui, /function processAssistantManualEntry[\s\S]*recognizeAssistantTranscript\(text\)/);
  assert.match(ui, /function recognizeAssistantTranscript[\s\S]*interpretAssistantInput\(assistantVoice\.transcript, "voice"\)/);
});

test("15. validates JPG images", () => assert.equal(platform.validateImageFile({ name: "nota.jpg", type: "image/jpeg", size: 1024 }).name, "nota.jpg"));
test("16. validates PNG images", () => assert.equal(platform.validateImageFile({ name: "nota.png", type: "image/png", size: 1024 }).name, "nota.png"));
test("17. validates WEBP images", () => assert.equal(platform.validateImageFile({ name: "nota.webp", type: "image/webp", size: 1024 }).name, "nota.webp"));
test("18. rejects an invalid image format", () => assert.throws(() => platform.validateImageFile({ name: "nota.pdf", type: "application/pdf", size: 1024 }), /JPG/));
test("19. rejects oversized images", () => assert.throws(() => platform.validateImageFile({ name: "nota.jpg", type: "image/jpeg", size: 13 * 1024 * 1024 }), /12 MB/));

test("20. opens the Web system file selector and returns a blob URL", async () => {
  const input = fakeInput({ name: "nota.png", type: "image/png", size: 2048 });
  const host = { URL: { createObjectURL: () => "blob:nota", revokeObjectURL() {} }, addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout };
  const picker = platform.createWebFilePicker({ host, input });
  const pending = picker.getPhoto({ source: "PHOTOS" });
  assert.equal(input.clicked, true);
  input.emit("change");
  assert.equal((await pending).webPath, "blob:nota");
});

test("21. handles cancellation of the Web file selector", async () => {
  const input = fakeInput();
  const host = { URL, addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout };
  const pending = platform.createWebFilePicker({ host, input }).getPhoto();
  input.emit("cancel");
  await assert.rejects(pending, (error) => error.code === "cancelled");
});

test("22. Web OCR uses only packaged local assets", async () => {
  let workerOptions;
  const host = { Tesseract: { createWorker: async (_lang, _engine, options) => {
    workerOptions = options;
    return { recognize: async () => ({ data: { text: "TOTAL R$ 58,90", confidence: 91 } }), terminate: async () => {} };
  } } };
  const ocr = platform.createWebTextRecognition({ host, assetRoot: "http://127.0.0.1:4173/" });
  assert.equal((await ocr.processImage({ image: { size: 10 } })).text, "TOTAL R$ 58,90");
  assert.match(workerOptions.workerPath, /^http:\/\/127\.0\.0\.1:4173\/vendor\/tesseract/);
  assert.match(workerOptions.langPath, /^http:\/\/127\.0\.0\.1:4173\/vendor\/tesseract\/lang/);
  assert.equal(workerOptions.corePath, "http://127.0.0.1:4173/vendor/tesseract");
  await ocr.release();
});

test("23. Web OCR reuses one worker and reports progress", async () => {
  let created = 0;
  let logger;
  const host = { setTimeout, clearTimeout, Tesseract: { createWorker: async (_lang, _engine, options) => {
    created += 1;
    logger = options.logger;
    return { recognize: async () => {
      logger({ status: "recognizing text", progress: 0.5 });
      return { data: { text: "PIX R$ 10,00" } };
    }, terminate: async () => {} };
  } } };
  const progress = [];
  const ocr = platform.createWebTextRecognition({ host, assetRoot: "http://localhost/" });
  await ocr.processImage({ image: "first", onProgress: (message) => progress.push(message.progress) });
  await ocr.processImage({ image: "second" });
  assert.equal(created, 1);
  assert.deepEqual(progress, [0.5]);
  await ocr.release();
});

test("24. Web OCR times out and terminates the stalled worker", async () => {
  let terminated = 0;
  const host = { setTimeout, clearTimeout, Tesseract: { createWorker: async () => ({
    recognize: async () => new Promise(() => {}),
    terminate: async () => { terminated += 1; },
  }) } };
  const ocr = platform.createWebTextRecognition({ host, assetRoot: "http://localhost/", timeoutMs: 15 });
  await assert.rejects(ocr.processImage({ image: "slow" }), (error) => error.code === "ocr-timeout");
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(terminated, 1);
});

test("25. Web OCR cancellation resolves promptly", async () => {
  let terminated = 0;
  const host = { setTimeout, clearTimeout, Tesseract: { createWorker: async () => ({
    recognize: async () => new Promise(() => {}),
    terminate: async () => { terminated += 1; },
  }) } };
  const ocr = platform.createWebTextRecognition({ host, assetRoot: "http://localhost/" });
  const pending = ocr.processImage({ image: "cancel" });
  await new Promise((resolve) => setTimeout(resolve, 0));
  await ocr.cancel();
  await assert.rejects(pending, (error) => error.code === "cancelled");
  assert.equal(terminated, 1);
});

test("26. preserves native Android camera and OCR providers", () => {
  const Camera = { getPhoto() {} }; const TextRecognition = { processImage() {} };
  const host = { Capacitor: { isNativePlatform: () => true, getPlatform: () => "android", Plugins: { Camera, TextRecognition } } };
  const receipt = platform.resolveAssistantCapabilities({ host }).receipt;
  assert.equal(receipt.camera, Camera); assert.equal(receipt.textRecognition, TextRecognition);
});

test("27. receipt and voice converge on the existing parser and transaction prefill", () => {
  assert.match(ui, /interpretAssistantInput\(result\.text, "receipt-ocr", localDraft\)/);
  assert.match(ui, /function confirmAssistantVoiceDraft[\s\S]*prefillTransactionFromAssistant/);
  assert.match(ui, /function continueReceiptDraft[\s\S]*prefillTransactionFromAssistant/);
});

test("28. confirmation remains mandatory and no assistant path saves automatically", () => {
  assert.match(html, /data-ai-voice-confirm[^>]*disabled/);
  assert.match(html, /data-receipt-continue[^>]*disabled/);
  const prefill = ui.slice(ui.indexOf("function prefillTransactionFromAssistant"), ui.indexOf("function bindTopbar"));
  assert.doesNotMatch(prefill, /saveStore\(/);
});

test("29. UI exposes no silent Web control", () => {
  assert.match(html, /data-receipt-web-file/);
  assert.match(html, /data-receipt-manual[\s\S]*Digitar lançamento/);
  assert.match(ui, /function openManualEntryFromReceipt[\s\S]*toggleAssistantManualEntry\(true\)/);
  assert.match(ui, /setReceiptOcrState\("error"/);
  assert.match(ui, /handleAssistantVoiceError/);
});

test("30. parity controls are responsive, accessible and theme-token based", () => {
  assert.match(styles, /assistant-manual-entry[\s\S]*min-width:\s*0/);
  assert.match(styles, /@media \(max-width: 360px\)/);
  assert.match(styles, /var\(--nx-surface-raised\)/);
  assert.match(html, /aria-live="polite"/);
});

test("31. Web exibe Data da transação em pt-BR", () => {
  assert.match(html, /<span>Data da transação<\/span>\s*<input id="transactionDate" type="date" required\s*\/>/);
  assert.doesNotMatch(html, />Data limite</);
});

test("32. Android copia o mesmo formulário compartilhado da Web", () => {
  assert.match(androidBuilder, /const files = \[[\s\S]*?"index\.html"/);
  assert.match(androidBuilder, /files\.forEach\(copy\)/);
  assert.doesNotMatch(androidBuilder, /androidTransactionDateLogic|webTransactionDateLogic/);
});

test("33. novas receitas e despesas usam hoje no campo compartilhado", () => {
  assert.match(ui, /function bindTransactionForm\(\)[\s\S]*?#transactionDate"\)\.value = toDateInput\(new Date\(\)\)/);
  assert.match(ui, /function resetTransactionForm\(\)[\s\S]*?#transactionDate"\)\.value = toDateInput\(new Date\(\)\)/);
  assert.match(html, /name="type" value="income"/);
  assert.match(html, /name="type" value="expense"/);
});

test("34. edição preserva a data armazenada", () => {
  assert.match(ui, /function editTransaction\(id\)[\s\S]*?#transactionDate"\)\.value = transaction\.date/);
});

test("35. voz, OCR e IA preenchem o mesmo campo sem salvar automaticamente", () => {
  assert.match(ui, /function prefillTransactionFromAssistant[\s\S]*?const date = app\.querySelector\("#transactionDate"\)[\s\S]*?date\.value = draft\.date/);
  const prefill = ui.slice(ui.indexOf("function prefillTransactionFromAssistant"), ui.indexOf("function bindTopbar"));
  assert.doesNotMatch(prefill, /saveStore\(/);
});

test("36. parcelas mantêm datas mensais e a regra de atraso existente", () => {
  assert.match(transactionCore, /createInstallments[\s\S]*?date: utils\.addMonthsToDate\(transaction\.date, number - 1\)/);
  assert.match(transactionCore, /applyAutomaticOverdueStatus\(installment, timestamp\)/);
  assert.match(transactionCore, /transaction\.status !== "Pendente"[\s\S]*?isPendingOverdue\(transaction\.date, now\)/);
});

test("37. formato de storage permanece compatível no campo date", () => {
  assert.match(ui, /date: app\.querySelector\("#transactionDate"\)\.value/);
  assert.doesNotMatch(ui, /transactionDate:\s*app\.querySelector/);
  assert.doesNotMatch(ui, /dueDate:\s*app\.querySelector/);
});

test("38. campo de data preserva responsividade e temas compartilhados", () => {
  assert.match(html, /<div class="split-fields">[\s\S]*?id="transactionDate"/);
  assert.match(styles, /@media \(max-width: 640px\)[\s\S]*?\.transaction-form-modern \.split-fields/);
  assert.match(styles, /var\(--nx-surface-raised\)|var\(--nx-surface-soft\)/);
});

console.log("Platform parity tests passed: 38/38.");
