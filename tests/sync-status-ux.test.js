"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "sync-status.js"));

const present = global.NexioCore.syncStatus.present;
const root = path.join(__dirname, "..");
const ui = fs.readFileSync(path.join(root, "js", "ui", "shared-ui.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "nexio-v2.css"), "utf8");
const androidBuilder = fs.readFileSync(path.join(root, "scripts", "build-android-web.js"), "utf8");

function context(status = {}, overrides = {}) {
  return {
    online: true,
    cloudAvailable: true,
    authenticated: true,
    hasProfile: true,
    status,
    ...overrides,
  };
}

test("01. sincronização ativa usa estado positivo", () => {
  const result = present(context({ status: "synced", canSync: true }));
  assert.deepEqual([result.title, result.tone], ["Sincronização ativa", "success"]);
});

test("02. offline pausa mesmo quando havia bloqueio anterior", () => {
  const result = present(context({ status: "blocked", blocked: true, offline: true }, { online: false }));
  assert.equal(result.title, "Sincronização pausada");
  assert.equal(result.tone, "warning");
  assert.doesNotMatch(result.title, /bloqueada/i);
});

test("03. usuário não autenticado recebe orientação de login", () => {
  const result = present(context({ status: "idle", guest: true }, { authenticated: false }));
  assert.deepEqual([result.title, result.action, result.actionLabel], ["Entre na sua conta para sincronizar", "login", "Entrar"]);
});

test("04. ausência de perfil pede uma seleção válida", () => {
  const result = present(context({ status: "idle", canSync: true }, { hasProfile: false }));
  assert.deepEqual([result.key, result.action], ["profile-required", "profile"]);
});

test("05. erro recuperável oferece nova tentativa sem tom de perigo", () => {
  const result = present(context({ status: "error", dirty: true }));
  assert.deepEqual([result.title, result.tone, result.action], ["Sincronização temporariamente indisponível", "warning", "retry"]);
});

test("06. bloqueio real mantém linguagem de segurança e explicação", () => {
  const result = present(context({ status: "blocked", blocked: true, lastError: "A sincronização foi bloqueada para proteger seus dados." }));
  assert.deepEqual([result.title, result.tone], ["Sincronização bloqueada", "danger"]);
  assert.match(result.description, /segurança|seguros/i);
});

test("07. retry agendado permite tentar novamente", () => {
  const result = present(context({ status: "retrying", dirty: true }));
  assert.equal(result.actionLabel, "Tentar novamente");
  assert.match(result.description, /nova tentativa/i);
});

test("08. sessão expirada vira login necessário, não bloqueio genérico", () => {
  const result = present(context({ status: "blocked", blocked: true, lastError: "A sessão expirou. Entre novamente para sincronizar." }));
  assert.equal(result.key, "login-required");
  assert.equal(result.tone, "info");
});

test("09. Web e Android recebem o mesmo significado", () => {
  const status = { status: "offline", offline: true };
  assert.deepEqual(present(context(status, { online: false, platform: "web" })), present(context(status, { online: false, platform: "android" })));
  assert.match(html, /js\/core\/sync-status\.js/);
  assert.match(androidBuilder, /const directories = \["assets", "css", "js", "vendor"\]/);
});

test("10. claro e escuro usam tokens e texto, não somente cor", () => {
  assert.match(css, /settings-sync-card\[data-sync-tone="success"\][\s\S]*?var\(--nx-income\)/);
  assert.match(css, /settings-sync-card\[data-sync-tone="danger"\][\s\S]*?var\(--nx-expense\)/);
  assert.match(html, /data-sync-description/);
});

test("11. retry reutiliza o coordenador existente", () => {
  assert.match(ui, /data-sync-action[\s\S]*?syncCoordinator\.handleReconnect\(\)[\s\S]*?syncCoordinator\.flush\(\)/);
  assert.doesNotMatch(ui, /new SyncCoordinator|createSyncCoordinator/);
});

test("12. toda apresentação permanece em pt-BR e sem detalhes internos", () => {
  const states = [
    present(context({ status: "synced", canSync: true })),
    present(context({ status: "offline", offline: true }, { online: false })),
    present(context({ status: "blocked", blocked: true })),
  ];
  assert.doesNotMatch(JSON.stringify(states), /\bCAS\b|revision|Sync Coordinator|HTTP|stack trace/i);
  assert.match(JSON.stringify(states), /Sincronização/);
});

console.log("Sync status UX tests passed: 12/12.");
