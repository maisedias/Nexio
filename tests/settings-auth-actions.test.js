"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const ui = fs.readFileSync(path.join(root, "js", "ui", "shared-ui.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "nexio-v2.css"), "utf8");

test("Conta e perfil oferece entrar e sair dentro da seção Identidade", () => {
  const identity = html.match(/<section class="panel settings-card settings-account-card"[\s\S]*?<\/section>/)?.[0] || "";

  assert.match(identity, /data-settings-login/);
  assert.match(identity, /Entrar na conta/);
  assert.match(identity, /data-settings-logout/);
  assert.match(identity, /Sair da conta/);
});

test("A visibilidade das ações usa a sessão autenticada, não o texto mostrado", () => {
  assert.match(ui, /function hasAuthenticatedSession\(user = currentUser\(\), status = syncCoordinator\.getStatus\(\)\)/);
  assert.match(ui, /!isLocalOnlyUser\(user\) && !status\.guest && cloud\.userId/);
  assert.ok(ui.includes('app.querySelector("[data-settings-login]")?.toggleAttribute("hidden", authenticated);'));
  assert.ok(ui.includes('app.querySelector("[data-settings-logout]")?.toggleAttribute("hidden", !authenticated);'));
});

test("Entrar abre o fluxo de autenticação já renderizado pelo aplicativo", () => {
  assert.match(ui, /function openExistingLoginFlow\(\)[\s\S]*?invalidateVisibleOwner\(\);[\s\S]*?render\(\);/);
  assert.ok(ui.includes('app.querySelector("[data-settings-login]")?.addEventListener("click", openExistingLoginFlow);'));
  assert.match(ui, /function renderAuth\(\)/);
});

test("Sair reutiliza o encerramento seguro de sessão para os dois pontos de entrada", () => {
  assert.match(ui, /async function signOutCurrentSession\(\)[\s\S]*?core\.storage\.signOutAndClearSession/);
  assert.ok(ui.includes('app.querySelector("[data-logout]")?.addEventListener("click", signOutCurrentSession);'));
  assert.ok(ui.includes('app.querySelector("[data-settings-logout]")?.addEventListener("click", signOutCurrentSession);'));
});

test("O bootstrap restaura somente uma sessão remota validada e limpa marcador inválido", () => {
  assert.match(ui, /await cloud\.client\.auth\.getSession\(\)/);
  assert.match(ui, /if \(data\.session\?\.user\) \{[\s\S]*?await loadCloudUserData\(data\.session\.user\);/);
  assert.match(ui, /core\.storage\.clearUnverifiedSession\(localStorage, SESSION_KEY/);
});

test("As ações são exibidas apenas no detalhe mobile de Conta e perfil", () => {
  assert.match(styles, /data-mobile-settings-active="account"\] \.settings-auth-actions:not\(\[hidden\]\)/);
  assert.match(styles, /\.settings-auth-actions button \{[\s\S]*?min-height: var\(--size-touch-target\)/);
});
