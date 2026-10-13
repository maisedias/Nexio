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
const budgetAction = html.match(/<button class="primary-action budgets-new-action"[\s\S]*?<\/button>/)?.[0] || "";
assert.match(budgetAction, /data-lucide="plus"/, "The mobile add-budget action must use the shared Lucide plus icon");
assert.doesNotMatch(budgetAction, /budget-mobile-add-symbol/, "The mobile add-budget action must not render a second textual plus icon");
assert.match(html, /data-budget-report-mobile/);
assert.match(ui, /app\.querySelectorAll\("\[data-new-budget\]"\)\.forEach/);
assert.match(ui, /button\.addEventListener\("click", \(\) => openBudgetComposer\(\)\)/);
assert.match(ui, /core\.reports\.monthlyBudgetReport\(currentProfile\(\), state\.budgetMonth, \{ accountId: state\.budgetAccount \}\)/);
assert.match(ui, /Nenhum orçamento ativo neste mês\./);
assert.match(ui, /Crie um orçamento para acompanhar seus gastos por categoria\./);
assert.match(ui, /budget-mobile-report-item/);

assert.match(css, /\.budgets-new-action \{[\s\S]*?width: var\(--size-touch-target\);[\s\S]*?height: var\(--size-touch-target\);/);
assert.match(css, /\.budgets-new-action > i,[\s\S]*?\.budgets-new-action > svg \{[\s\S]*?width: var\(--size-icon-medium\);[\s\S]*?height: var\(--size-icon-medium\);/, "The add-budget icon must remain centered at the shared action-icon size after Lucide renders SVG");
assert.match(css, /\.budget-month-navigation \{[\s\S]*?grid-template-columns: var\(--size-touch-target\) minmax\(9\.5rem, 1fr\) var\(--size-touch-target\);/);
assert.match(css, /\.budget-account-filter \{\s*grid-column: 1 \/ -1;/);
assert.match(css, /\.budget-report-panel \.table-shell \{\s*display: none;/);
assert.match(css, /\.budget-mobile-report \{[\s\S]*?min-width: 0;/);
assert.match(css, /\.budget-mobile-report-item dl \{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);

console.log("Mobile budgets layout contracts passed.");
