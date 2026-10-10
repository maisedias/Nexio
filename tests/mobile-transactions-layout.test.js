"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const ui = read("js/ui/shared-ui.js");
const components = read("css/components.css");
const mobileLayout = read("nexio-v2.css");

assert.match(html, /data-mobile-transaction-search[^>]*placeholder="Buscar transação"/);
assert.match(ui, /<h3>\$\{escapeHtml\(transaction\.description\)\}<\/h3>/);
assert.match(ui, /transactionMobileSubtitle\(transaction\)/);

assert.match(components, /\.mobile-transaction-search \{[\s\S]*?min-height: 46px;/);
assert.match(components, /\.mobile-transaction-search input \{[\s\S]*?font-size: \.9rem;/);
assert.match(components, /\.mobile-transaction-filter-trigger,[\s\S]*?font-size: \.82rem;/);
assert.doesNotMatch(components, /Final mobile transaction overrides/);

assert.match(mobileLayout, /\.transaction-mobile-list \.transaction-card \{ display: grid; grid-template-columns: minmax\(0, 1fr\) max-content;/);
assert.match(mobileLayout, /\.transaction-mobile-date \{ display: none; \}/);
assert.match(mobileLayout, /-webkit-line-clamp: 2/);
assert.doesNotMatch(mobileLayout, /margin-top: -20px/);
assert.match(mobileLayout, /\.transaction-list-panel\.is-mobile-selection-mode \.transaction-card-check \{ display: grid; grid-column: 1; grid-row: 1;/);
assert.match(mobileLayout, /@media \(max-width: 340px\) \{[\s\S]*?\.transaction-mobile-amount \{ grid-column: 1; justify-self: start;/);

console.log("Mobile transactions layout contracts passed.");
