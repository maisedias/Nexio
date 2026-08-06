"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "ai-assistant.js"));
require(path.join(__dirname, "..", "js", "core", "speech-recognition.js"));

const speech = global.NexioCore.speechRecognition;
const parser = global.NexioCore.aiAssistant.parseTransaction;
const fixedNow = new Date(2026, 7, 5, 12, 0, 0, 0);

function pluginHarness(options = {}) {
  const listeners = new Map();
  const calls = { requestPermissions: 0, start: [], stop: 0, forceStop: 0 };
  let lastText = options.lastText || "";
  const emit = (eventName, payload) => listeners.get(eventName)?.(payload);
  return {
    calls,
    emit,
    setLastText: (text) => { lastText = text; },
    plugin: {
      available: async () => ({ available: options.available !== false }),
      isOnDeviceRecognitionAvailable: async () => ({ available: Boolean(options.onDevice) }),
      checkPermissions: async () => ({ speechRecognition: options.permission || "granted" }),
      requestPermissions: async () => {
        calls.requestPermissions += 1;
        return { speechRecognition: options.requestedPermission || "granted" };
      },
      addListener: async (eventName, listener) => {
        listeners.set(eventName, listener);
        return { remove: async () => listeners.delete(eventName) };
      },
      start: async (startOptions) => {
        calls.start.push(startOptions);
        if (options.startError) throw options.startError;
        return options.startResult || { matches: [] };
      },
      stop: async () => {
        calls.stop += 1;
        emit("listeningState", { state: "stopped", reason: "userStop" });
      },
      forceStop: async () => { calls.forceStop += 1; },
      getLastPartialResult: async () => ({ available: Boolean(lastText), text: lastText }),
    },
  };
}

test("01. exposes every required voice modal state", () => {
  assert.deepEqual(Object.values(speech.STATES), [
    "idle", "listening", "processing", "recognized", "error", "permission-denied",
  ]);
});

test("02. applies deterministic modal state transitions", () => {
  assert.equal(speech.transitionState("idle", "start"), "listening");
  assert.equal(speech.transitionState("listening", "stop"), "processing");
  assert.equal(speech.transitionState("processing", "recognized"), "recognized");
  assert.equal(speech.transitionState("error", "retry"), "idle");
  assert.equal(speech.transitionState("permission-denied", "cancel"), "idle");
});

test("03. extracts partial and accumulated transcriptions", () => {
  assert.equal(speech.transcriptFrom({ matches: ["I spent 35 cash."] }), "I spent 35 cash.");
  assert.equal(speech.transcriptFrom({ accumulatedText: "I paid 80 by Pix." }), "I paid 80 by Pix.");
  assert.equal(speech.transcriptFrom({ matches: ["  "] }), "");
});

test("04. maps permission denial to a friendly error", () => {
  const error = speech.normalizeError({ code: "permission-denied" });
  assert.equal(error.code, "permission-denied");
  assert.match(error.message, /configurações do Android/i);
});

test("05. maps no-speech timeout without crashing", () => {
  const error = speech.normalizeError({ code: "speech-timeout" });
  assert.equal(error.code, "no-speech");
  assert.match(error.message, /Nenhuma fala foi detectada/i);
});

test("06. integrates a successful transcript with the existing parser", () => {
  const result = speech.createDraft(
    "I spent 58 reais at Supermercado BH using my credit card.",
    parser,
    { now: fixedNow },
  );
  assert.equal(result.valid, true);
  assert.deepEqual(result.draft, {
    type: "expense",
    amount: 58,
    currency: "BRL",
    category: "Market",
    description: "Supermercado BH",
    paymentMethod: "Credit Card",
    account: null,
    date: "2026-08-05",
  });
});

test("07. rejects an empty or invalid transcription", () => {
  assert.equal(speech.createDraft("", parser, { now: fixedNow }).valid, false);
  assert.equal(speech.createDraft("Something maybe happened", parser, { now: fixedNow }).valid, false);
});

test("08. reports unavailable native speech recognition", async () => {
  const harness = pluginHarness({ available: false });
  const service = speech.createService({ plugin: harness.plugin });
  await assert.rejects(service.start(), (error) => error.code === "recognition-unavailable");
});

test("09. starts immediately when microphone permission is granted", async () => {
  const harness = pluginHarness({ permission: "granted", onDevice: true });
  const service = speech.createService({ plugin: harness.plugin, language: "en-US" });
  const support = await service.start();
  assert.deepEqual(support, { available: true, onDevice: true });
  assert.equal(harness.calls.requestPermissions, 0);
  assert.equal(harness.calls.start[0].useOnDeviceRecognition, true);
  assert.equal(harness.calls.start[0].partialResults, true);
  assert.equal(harness.calls.start[0].popup, false);
  await service.cancel();
});

test("10. requests microphone permission when the status is prompt", async () => {
  const harness = pluginHarness({ permission: "prompt", requestedPermission: "granted" });
  const service = speech.createService({ plugin: harness.plugin });
  await service.start();
  assert.equal(harness.calls.requestPermissions, 1);
  await service.cancel();
});

test("11. blocks listening when microphone permission is denied", async () => {
  const harness = pluginHarness({ permission: "denied" });
  const service = speech.createService({ plugin: harness.plugin });
  await assert.rejects(service.start(), (error) => error.code === "permission-denied");
  assert.equal(harness.calls.start.length, 0);
});

test("12. returns a successful final transcription", async () => {
  const harness = pluginHarness();
  const completed = [];
  const partial = [];
  const service = speech.createService({ plugin: harness.plugin });
  await service.start({ onTranscript: (text) => partial.push(text), onComplete: (text) => completed.push(text) });
  harness.setLastText("I received 2500 salary.");
  harness.emit("partialResults", { matches: ["I received 2500 salary."] });
  const result = await service.stop();
  assert.deepEqual(partial, ["I received 2500 salary."]);
  assert.deepEqual(completed, ["I received 2500 salary."]);
  assert.deepEqual(result, { cancelled: false, transcript: "I received 2500 salary." });
});

test("13. cancellation stops native capture without returning a transcript", async () => {
  const harness = pluginHarness({ lastText: "I spent 120 on fuel." });
  let cancelled = 0;
  let completed = 0;
  const service = speech.createService({ plugin: harness.plugin });
  await service.start({ onCancelled: () => { cancelled += 1; }, onComplete: () => { completed += 1; } });
  const result = await service.cancel();
  assert.deepEqual(result, { cancelled: true, transcript: "" });
  assert.equal(harness.calls.forceStop, 1);
  assert.equal(cancelled, 1);
  assert.equal(completed, 0);
});

test("14. empty native transcription reaches the retryable empty state", async () => {
  const harness = pluginHarness();
  let empty = 0;
  const service = speech.createService({ plugin: harness.plugin });
  await service.start({ onEmpty: () => { empty += 1; } });
  const result = await service.stop();
  assert.deepEqual(result, { cancelled: false, transcript: "" });
  assert.equal(empty, 1);
});

test("15. native recognition errors are normalized for the UI", async () => {
  const harness = pluginHarness();
  const errors = [];
  const service = speech.createService({ plugin: harness.plugin });
  await service.start({ onError: (error) => errors.push(error) });
  harness.emit("error", { code: "no-match", message: "No match", sessionId: 1 });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(errors[0].code, "no-speech");
});

test("16. opens Android application settings through the native bridge", async () => {
  let opened = 0;
  const service = speech.createService({
    plugin: pluginHarness().plugin,
    settingsPlugin: { openAppSettings: async () => { opened += 1; } },
  });
  assert.equal(await service.openSettings(), true);
  assert.equal(opened, 1);
});

test("17. voice UI requires confirmation and reuses transaction prefill", () => {
  const root = path.join(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const renderer = fs.readFileSync(path.join(root, "js", "ui", "shared-ui.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "nexio-v2.css"), "utf8");
  const manifest = fs.readFileSync(path.join(root, "capacitor-overrides", "android", "AndroidManifest.xml"), "utf8");
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.doesNotMatch(html, /Simulate Voice|data-simulate-ai-voice/);
  assert.match(html, /data-ai-voice-confirm[^>]*disabled/);
  assert.match(html, /data-ai-open-settings/);
  assert.match(renderer, /createDraft\?\.\([\s\S]*?core\.aiAssistant\?\.parseTransaction/);
  assert.match(renderer, /function confirmAssistantVoiceDraft\(\)[\s\S]*?prefillTransactionFromAssistant/);
  assert.match(renderer, /prefillTransactionFromAssistant[\s\S]*?#transactionDescription[\s\S]*?#transactionAmount[\s\S]*?#transactionDate[\s\S]*?#transactionCategory[\s\S]*?#transactionAccount/);
  assert.doesNotMatch(renderer, /SIMULATED_VOICE_SENTENCE|simulateAssistantVoice/);
  assert.match(styles, /assistant-voice-modal\[data-ai-voice-state="listening"\]/);
  assert.match(styles, /@media \(max-width: 420px\)[\s\S]*?assistant-modal-actions[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(manifest, /android\.permission\.RECORD_AUDIO/);
  assert.equal(packageJson.dependencies["@capgo/capacitor-speech-recognition"], "^8.1.10");
});

console.log("Speech recognition tests passed: 17/17.");
