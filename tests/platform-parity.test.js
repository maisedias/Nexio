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
  await ocr.release();
});

test("23. preserves native Android camera and OCR providers", () => {
  const Camera = { getPhoto() {} }; const TextRecognition = { processImage() {} };
  const host = { Capacitor: { isNativePlatform: () => true, getPlatform: () => "android", Plugins: { Camera, TextRecognition } } };
  const receipt = platform.resolveAssistantCapabilities({ host }).receipt;
  assert.equal(receipt.camera, Camera); assert.equal(receipt.textRecognition, TextRecognition);
});

test("24. receipt and voice converge on the existing parser and transaction prefill", () => {
  assert.match(ui, /interpretAssistantInput\(result\.text, "receipt-ocr", localDraft\)/);
  assert.match(ui, /function confirmAssistantVoiceDraft[\s\S]*prefillTransactionFromAssistant/);
  assert.match(ui, /function continueReceiptDraft[\s\S]*prefillTransactionFromAssistant/);
});

test("25. confirmation remains mandatory and no assistant path saves automatically", () => {
  assert.match(html, /data-ai-voice-confirm[^>]*disabled/);
  assert.match(html, /data-receipt-continue[^>]*disabled/);
  const prefill = ui.slice(ui.indexOf("function prefillTransactionFromAssistant"), ui.indexOf("function assistantPaymentLabel"));
  assert.doesNotMatch(prefill, /saveStore\(/);
});

test("26. UI exposes no silent Web control", () => {
  assert.match(html, /data-receipt-web-file/);
  assert.match(html, /data-receipt-manual[\s\S]*Digitar lançamento/);
  assert.match(ui, /function openManualEntryFromReceipt[\s\S]*toggleAssistantManualEntry\(true\)/);
  assert.match(ui, /setReceiptOcrState\("error"/);
  assert.match(ui, /handleAssistantVoiceError/);
});

test("27. parity controls are responsive, accessible and theme-token based", () => {
  assert.match(styles, /assistant-manual-entry[\s\S]*min-width:\s*0/);
  assert.match(styles, /@media \(max-width: 360px\)/);
  assert.match(styles, /var\(--nx-surface-raised\)/);
  assert.match(html, /aria-live="polite"/);
});

console.log("Platform parity tests passed: 27/27.");
