"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const generated = (file) => path.join(root, "android-web", file);
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 12);

childProcess.execFileSync(process.execPath, ["scripts/build-android-web.js"], {
  cwd: root,
  stdio: "pipe",
});

const index = fs.readFileSync(generated("index.html"), "utf8");
const styles = fs.readFileSync(generated("styles.css"), "utf8");
const metadata = fs.readFileSync(generated("release-metadata.js"), "utf8");

assert.match(index, new RegExp(`styles\\.css\\?v=${hash(generated("styles.css"))}`));
assert.match(index, new RegExp(`js/ui/shared-ui\\.js\\?v=${hash(generated("js/ui/shared-ui.js"))}`));
assert.match(index, new RegExp(`mobile-capacitor\\.js\\?v=${hash(generated("mobile-capacitor.js"))}`));
assert.match(styles, new RegExp(`css/components\\.css\\?v=${hash(generated("css/components.css"))}`));
assert.match(metadata, /"assetRevisions"/);
assert.match(metadata, new RegExp(`"ui":"${hash(generated("js/ui/shared-ui.js"))}"`));

console.log("Android web asset fingerprint tests passed.");
