"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const ui = read("js/ui/shared-ui.js");
const css = read("nexio-v2.css");

assert.match(html, /data-new-budget[^>]*aria-label="Criar orçamento"/);
assert.match(html, /class="budget-mobile-add-symbol"[^>]*>\+<\/span>/);
assert.match(html, /data-budget-report-mobile/);
assert.match(ui, /app\.querySelectorAll\("\[data-new-budget\]"\)\.forEach/);
assert.match(ui, /button\.addEventListener\("click", \(\) => openBudgetComposer\(\)\)/);
assert.match(ui, /core\.reports\.monthlyBudgetReport\(currentProfile\(\), state\.budgetMonth, \{ accountId: state\.budgetAccount \}\)/);
assert.match(ui, /Nenhum orçamento ativo neste mês\./);
assert.match(ui, /Crie um orçamento para acompanhar seus gastos por categoria\./);
assert.match(ui, /budget-mobile-report-item/);

assert.match(css, /\.budgets-new-action \{[\s\S]*?width: var\(--size-touch-target\);[\s\S]*?height: var\(--size-touch-target\);/);
assert.match(css, /\.budget-month-navigation \{[\s\S]*?grid-template-columns: var\(--size-touch-target\) minmax\(9\.5rem, 1fr\) var\(--size-touch-target\);/);
assert.match(css, /\.budget-account-filter \{\s*grid-column: 1 \/ -1;/);
assert.match(css, /\.budget-report-panel \.table-shell \{\s*display: none;/);
assert.match(css, /\.budget-mobile-report \{[\s\S]*?min-width: 0;/);
assert.match(css, /\.budget-mobile-report-item dl \{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);

console.log("Mobile budgets layout contracts passed.");
