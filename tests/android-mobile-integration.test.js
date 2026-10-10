"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const bridge = read("mobile-capacitor.js");
const ui = read("js/ui/shared-ui.js");
const override = read("capacitor-overrides/android/MainActivity.java");
const generated = read("android/app/src/main/java/br/com/nexiofinanceiro/app/MainActivity.java");

assert.match(bridge, /darkTheme \? "LIGHT" : "DARK"/);
assert.match(bridge, /MutationObserver/);
assert.match(bridge, /window\.NexioApp\?\.handleNativeBack/);
assert.doesNotMatch(bridge, /window\.history\.back\(\)/);

assert.match(ui, /async function handleNativeBack\(\)/);
assert.match(ui, /closeAssistantVoiceModal/);
assert.match(ui, /closeReceiptOcrModal/);
assert.match(ui, /closeMobileTransactionComposer/);
assert.match(ui, /handleNativeBack \}/);

for (const source of [override, generated]) {
  assert.doesNotMatch(source, /void onBackPressed\s*\(/);
  assert.match(source, /setAppearanceLightStatusBars\(false\)/);
  assert.match(source, /applySystemBarInsets\(\)/);
}

console.log("Android mobile integration tests passed: status bar, back routing, and native override parity.");
