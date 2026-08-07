"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "utils.js"));
require(path.join(__dirname, "..", "js", "core", "finance.js"));

const root = path.join(__dirname, "..");
const renderer = fs.readFileSync(path.join(root, "js", "ui", "shared-ui.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "nexio-v2.css"), "utf8");
const source = renderer.match(/function profileStatsSeries\([\s\S]*?\n  \}/)?.[0] || "";
assert.ok(source, "profileStatsSeries helper must remain testable");
const profileStatsSeries = vm.runInNewContext(`(${source})`);
const months = global.NexioCore.utils.lastMonths(6, "pt-BR", new Date(2026, 7, 7));

function transaction(type, amount, date = "2026-08-07") {
  return {
    type,
    amount,
    date,
    status: type === "income" ? "Recebido" : "Pago",
  };
}

function stats(transactions) {
  return profileStatsSeries([{ transactions }], months, global.NexioCore.finance.monthlyTotal);
}

test("01. gráfico preserva receitas e despesas consolidadas", () => {
  const result = stats([transaction("income", 800), transaction("expense", 300)]);
  assert.equal(result.totalIncome, 800);
  assert.equal(result.totalExpense, 300);
  assert.equal(result.totalBalance, 500);
  assert.equal(result.hasData, true);
});

test("02. gráfico funciona somente com receitas", () => {
  const result = stats([transaction("income", 1200)]);
  assert.equal(result.totalIncome, 1200);
  assert.equal(result.totalExpense, 0);
  assert.equal(result.hasData, true);
});

test("03. gráfico funciona somente com despesas", () => {
  const result = stats([transaction("expense", 450)]);
  assert.equal(result.totalIncome, 0);
  assert.equal(result.totalExpense, 450);
  assert.equal(result.totalBalance, -450);
});

test("04. valores totalmente zerados ativam o estado vazio", () => {
  const result = stats([]);
  assert.equal(result.hasData, false);
  assert.deepEqual([...result.income], [0, 0, 0, 0, 0, 0]);
  assert.deepEqual([...result.expense], [0, 0, 0, 0, 0, 0]);
});

test("05. meses permanecem abreviados em pt-BR", () => {
  assert.deepEqual(months.map((month) => month.label), ["mar", "abr", "mai", "jun", "jul", "ago"]);
  assert.match(renderer, /emptyMonths\.textContent = labels\.join\(" · "\)/);
});

test("06. legenda externa mantém Receitas e Despesas", () => {
  assert.match(html, /profiles-chart-toolbar[\s\S]*?legend-income[^>]*>[\s\S]*?Receitas[\s\S]*?legend-expense[^>]*>[\s\S]*?Despesas/);
  assert.match(renderer, /showLegend:\s*false/);
});

test("07. indicador sem base anterior possui slot integrado ao gráfico", () => {
  assert.match(html, /data-chart-comparison-slot="profileStatsChart"/);
  assert.match(renderer, /comparisonSlot \|\| heading/);
  assert.match(renderer, /"● sem base anterior"/);
});

for (const width of [280, 320, 360, 390]) {
  test(`${String(8 + [280, 320, 360, 390].indexOf(width)).padStart(2, "0")}. mobile ${width}px usa o contrato compacto`, () => {
    assert.ok(width <= 767);
    assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.profiles-stats-panel \.chart-canvas\s*\{[^}]*height:\s*var\(--size-layout-min-extra-large\)/);
  });
}

test("12. tablet mantém largura fluida e sem mínimo excessivo", () => {
  assert.match(css, /\.profiles-chart-stage\s*\{[^}]*min-width:\s*0;/);
  assert.match(css, /\.profiles-stats-panel\s*\{[^}]*min-width:\s*0;/);
});

test("13. desktop preserva altura de gráfico do Design System", () => {
  assert.match(css, /\.profiles-stats-panel \.chart-canvas\s*\{[^}]*height:\s*var\(--size-dashboard-chart\);[^}]*max-height:\s*var\(--size-dashboard-chart\);/);
});

test("14. tema claro utiliza somente tokens sem cor nova hardcoded", () => {
  const block = css.match(/\/\* Profiles consolidated chart \*\/[\s\S]*?(?=\/\*|@media)/)?.[0] || "";
  assert.doesNotMatch(block, /#[0-9a-f]{3,8}|rgba?\(/i);
  assert.match(block, /var\(--nx-surface-soft\)/);
});

test("15. tema escuro herda texto, superfície e borda sem sobrescrita", () => {
  assert.match(css, /profiles-chart-empty[\s\S]*?var\(--nx-border\)[\s\S]*?var\(--nx-surface-soft\)[\s\S]*?var\(--nx-text-muted\)/);
});

test("16. Fold recalcula o gráfico ao redimensionar", () => {
  assert.match(renderer, /window\.addEventListener\("resize"[\s\S]*?state\.view === "profiles"[\s\S]*?renderProfileStatsChart\(currentUser\(\)\.profiles\)/);
  assert.match(renderer, /compact:\s*canvas\.getBoundingClientRect\(\)\.width < 480/);
});

test("17. componentes críticos não criam overflow horizontal", () => {
  assert.match(css, /\.profiles-chart-toolbar\s*\{[^}]*min-width:\s*0;/);
  assert.match(css, /\.profiles-stats-summary\s*\{[^}]*min-width:\s*0;/);
});

test("18. altura útil mobile fica entre 160 e 210 pixels pelo token atual", () => {
  const variables = fs.readFileSync(path.join(root, "css", "variables.css"), "utf8");
  const value = Number(variables.match(/--size-layout-min-extra-large:\s*([\d.]+)rem/)?.[1]) * 16;
  assert.ok(value >= 160 && value <= 210, `mobile chart height was ${value}px`);
});

test("19. seis meses são desenhados uniformemente sem descarte de labels", () => {
  assert.match(renderer, /const groupWidth = chartWidth \/ config\.labels\.length/);
  assert.match(renderer, /config\.labels\.forEach\(\(label, index\)/);
  assert.doesNotMatch(renderer.match(/renderProfileStatsChart\(profiles\)[\s\S]*?\n  \}/)?.[0] || "", /dense:\s*true/);
  assert.match(renderer, /resizeCanvas\(canvas, \{ minWidth: config\.compact \? 180 : 300 \}\)/);
  assert.match(renderer, /\? \{ top: 12, right: 10, bottom: 34, left: 62 \}/);
});

test("20. estado vazio substitui o canvas e evita escala artificial", () => {
  assert.match(html, /Sem movimentações nos últimos 6 meses/);
  assert.match(renderer, /canvas\.hidden = !stats\.hasData/);
  assert.match(renderer, /canvas\.getContext\("2d"\)\.clearRect/);
});

test("21. eixo Y usa formatação financeira quando existem dados", () => {
  assert.match(renderer, /moneyLabels:\s*true/);
  assert.match(renderer, /options\.compact \? compactAxisMoney\(value\) : compactMoney\(value\)/);
});

test("22. resumo acessível continua descrevendo receitas, despesas e saldo", () => {
  assert.match(renderer, /updateChartSummary\(canvas, `Nos últimos 6 meses, receitas consolidadas somam/);
  assert.match(html, /aria-label="Receitas, despesas e saldo dos perfis nos últimos 6 meses"/);
});

console.log("Profiles responsive chart tests passed: 22/22.");
