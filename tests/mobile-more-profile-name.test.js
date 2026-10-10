"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const ui = fs.readFileSync(path.join(root, "js", "ui", "shared-ui.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "css", "components.css"), "utf8");

assert.match(html, /id="view-more"[\s\S]*?data-mobile-active-profile-name/);
assert.match(ui, /function currentProfile\(\)[\s\S]*?core\.profiles\.currentProfile\(currentUser\(\)\)/);
const labelUpdateStart = ui.indexOf('[data-active-profile-label], [data-mobile-active-profile-name]');
const labelUpdate = ui.slice(labelUpdateStart, ui.indexOf("updateTopbarContext();", labelUpdateStart));
assert.match(labelUpdate, /label\.textContent = profile\.name/);
assert.doesNotMatch(labelUpdate, /profile\.accounts/);
assert.match(styles, /@media \(max-width: 767px\)[\s\S]*?\.mobile-more-active-profile > strong[\s\S]*?overflow-wrap: anywhere[\s\S]*?text-overflow: clip[\s\S]*?white-space: normal/);

console.log("Mobile Mais active-profile heading tests passed.");
