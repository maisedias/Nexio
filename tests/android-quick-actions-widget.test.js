"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "external-navigation.js"));

const root = path.join(__dirname, "..");
const navigation = global.NexioCore.externalNavigation;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const manifest = read("android/app/src/main/AndroidManifest.xml");
const shortcuts = read("android/app/src/main/res/xml/shortcuts.xml");
const widgetLayout = read("android/app/src/main/res/layout/nexio_quick_actions_widget.xml");
const widgetInfo = read("android/app/src/main/res/xml/nexio_quick_actions_widget_info.xml");
const strings = read("android/app/src/main/res/values/strings.xml");
const nativePlugin = read("android/app/src/main/java/br/com/nexiofinanceiro/app/NexioQuickActionsPlugin.java");
const widgetProvider = read("android/app/src/main/java/br/com/nexiofinanceiro/app/NexioQuickActionsWidget.java");
const mainActivity = read("android/app/src/main/java/br/com/nexiofinanceiro/app/MainActivity.java");
const renderer = read("js/ui/shared-ui.js");
const html = read("index.html");

function harness(options = {}) {
  const calls = [];
  const notices = [];
  let authenticated = options.authenticated !== false;
  let profile = options.profile !== false;
  const coordinator = navigation.createCoordinator({
    isAuthenticated: () => authenticated,
    hasActiveProfile: () => profile,
    onAuthenticationRequired: (action) => notices.push(["auth", action.action]),
    onProfileRequired: (action) => notices.push(["profile", action.action]),
    handlers: Object.fromEntries(Object.values(navigation.ACTIONS).map((action) => [
      action,
      async (payload) => calls.push([action, payload.source]),
    ])),
  });
  return {
    calls,
    notices,
    coordinator,
    authenticate: () => { authenticated = true; },
    activateProfile: () => { profile = true; },
  };
}

test("01. normaliza destinos externos permitidos e rejeita ações desconhecidas", () => {
  assert.equal(navigation.normalizeAction({ action: "voice-entry", id: "1" }).action, "voice-entry");
  assert.equal(navigation.normalizeAction({ action: { action: "new-expense", id: "2", source: "widget" } }).source, "widget");
  assert.equal(navigation.normalizeAction({ action: "delete-account" }), null);
});

test("02. atalho Registrar por voz usa o destino nativo correto em pt-BR", () => {
  assert.match(strings, /<string name="shortcut_voice_label">Registrar por voz<\/string>/);
  assert.match(shortcuts, /shortcutId="registrar_por_voz"[\s\S]*action="br\.com\.nexiofinanceiro\.app\.action\.VOICE_ENTRY"/);
});

test("03. atalho Novo lançamento usa o formulário existente", () => {
  assert.match(strings, /<string name="shortcut_transaction_label">Novo lançamento<\/string>/);
  assert.match(shortcuts, /shortcutId="novo_lancamento"[\s\S]*action="br\.com\.nexiofinanceiro\.app\.action\.NEW_TRANSACTION"/);
  assert.match(renderer, /\[actions\.NEW_TRANSACTION\]: async \(\) => openTransactionComposer\(\)/);
});

test("04. botão Registrar gasto do widget abre uma despesa no formulário existente", () => {
  assert.match(widgetLayout, /id="@\+id\/widget_new_expense"[\s\S]*text="@string\/widget_expense_label"/);
  assert.match(widgetProvider, /widget_new_expense[\s\S]*ACTION_NEW_EXPENSE/);
  assert.match(renderer, /\[actions\.NEW_EXPENSE\]: async \(\) => openTransactionComposer\("expense"\)/);
});

test("05. botão Registrar por voz do widget reutiliza o fluxo de voz", () => {
  assert.match(widgetLayout, /id="@\+id\/widget_voice_entry"[\s\S]*text="@string\/widget_voice_label"/);
  assert.match(widgetProvider, /widget_voice_entry[\s\S]*ACTION_VOICE_ENTRY/);
  assert.match(renderer, /\[actions\.VOICE_ENTRY\][\s\S]*openAssistantVoiceModal\(\)[\s\S]*startAssistantVoiceRecognition\(\)/);
});

test("06. aplicativo fechado preserva a ação pendente até o JavaScript estar pronto", () => {
  assert.match(nativePlugin, /public void load\(\)[\s\S]*receiveIntent\(getActivity\(\).*getIntent\(\)/);
  assert.match(nativePlugin, /getPendingAction[\s\S]*pendingAction = null/);
});

test("07. aplicativo aberto recebe novas ações sem criar outra tela", () => {
  assert.match(nativePlugin, /handleOnNewIntent\(Intent intent\)[\s\S]*receiveIntent\(intent\)/);
  assert.match(nativePlugin, /notifyListeners\(EVENT_QUICK_ACTION/);
  assert.match(manifest, /android:launchMode="singleTask"/);
});

test("08. aplicativo em segundo plano volta à atividade existente", () => {
  assert.match(widgetProvider, /FLAG_ACTIVITY_CLEAR_TOP \| Intent\.FLAG_ACTIVITY_SINGLE_TOP/);
  assert.match(manifest, /android:launchMode="singleTask"/);
});

test("09. usuário não autenticado mantém o destino pendente", async () => {
  const context = harness({ authenticated: false });
  const result = await context.coordinator.receive({ id: "auth", action: "voice-entry" });
  assert.equal(result.status, "authentication-required");
  assert.deepEqual(context.notices, [["auth", "voice-entry"]]);
  assert.equal(context.coordinator.getPending().action, "voice-entry");
  context.authenticate();
  assert.equal((await context.coordinator.flush()).status, "handled");
});

test("10. ausência de perfil ativo bloqueia sem perder o destino", async () => {
  const context = harness({ profile: false });
  assert.equal((await context.coordinator.receive({ id: "profile", action: "new-transaction" })).status, "profile-required");
  assert.deepEqual(context.notices, [["profile", "new-transaction"]]);
  context.activateProfile();
  assert.equal((await context.coordinator.flush()).status, "handled");
});

test("11. permissão de microfone negada permanece no fluxo existente", () => {
  assert.match(renderer, /startAssistantVoiceRecognition\(\)[\s\S]*assistantSpeechService\(\)/);
  assert.match(renderer, /permission-denied[\s\S]*O acesso ao microfone está bloqueado/);
  assert.doesNotMatch(renderer, /NexioQuickActions[\s\S]*requestPermissions/);
});

test("12. deep links aceitam somente destinos seguros do Nexio", () => {
  assert.match(manifest, /android\.intent\.action\.VIEW[\s\S]*android\.intent\.category\.BROWSABLE[\s\S]*android:scheme="nexio" android:host="acao"/);
  for (const pathName of ["/voz", "/novo-lancamento", "/registrar-gasto", "/assistente"]) {
    assert.match(nativePlugin, new RegExp(pathName.replace("/", "\\/")));
  }
});

test("13. ações repetidas não abrem telas duplicadas", async () => {
  const context = harness();
  assert.equal((await context.coordinator.receive({ id: "same", action: "assistant" })).status, "handled");
  assert.equal((await context.coordinator.receive({ id: "same", action: "assistant" })).status, "duplicate");
  assert.equal(context.calls.length, 1);
});

test("14. integração de voz abre Assistente, microfone e parser existentes", () => {
  assert.match(renderer, /setView\("assistant"\);[\s\S]*openAssistantVoiceModal\(\);[\s\S]*startAssistantVoiceRecognition\(\)/);
  assert.match(renderer, /recognizeAssistantTranscript[\s\S]*interpretAssistantInput\(assistantVoice\.transcript, "voice"\)/);
  assert.match(renderer, /core\.financialInput\.interpret\([\s\S]*core\.aiAssistant\?\.parseTransaction/);
});

test("15. rascunho externo continua exigindo confirmação manual", () => {
  const handler = renderer.match(/\[actions\.VOICE_ENTRY\][\s\S]*?\n\s*},/)?.[0] || "";
  assert.doesNotMatch(handler, /saveStore|transactions\.push|submit/);
  assert.match(html, /data-ai-voice-confirm[^>]*disabled/);
});

test("16. navegação externa não duplica formulário nem persistência", () => {
  assert.match(renderer, /\[actions\.NEW_TRANSACTION\]: async \(\) => openTransactionComposer\(\)/);
  assert.match(renderer, /\[actions\.NEW_EXPENSE\]: async \(\) => openTransactionComposer\("expense"\)/);
  assert.doesNotMatch(read("js/core/external-navigation.js"), /localStorage|saveStore|transactions/);
});

test("17. widget não expõe informações financeiras sensíveis", () => {
  assert.match(widgetLayout, /@string\/widget_title/);
  assert.doesNotMatch(widgetLayout, /saldo|renda|conta|transaç|R\$|valor/i);
  assert.doesNotMatch(strings.match(/<string name="widget_[\s\S]*?<\/resources>/)?.[0] || "", /saldo|renda|últimas transações|nome da conta/i);
});

test("18. widget é responsivo, acessível e possui temas claro e escuro", () => {
  const styles = read("nexio-v2.css");
  assert.match(widgetInfo, /resizeMode="horizontal\|vertical"/);
  assert.match(widgetLayout, /minHeight="48dp"/);
  assert.match(widgetLayout, /contentDescription="@string\/widget_expense_accessibility"/);
  assert.match(widgetLayout, /contentDescription="@string\/widget_voice_accessibility"/);
  assert.match(read("android/app/src/main/res/values/widget_colors.xml"), /nexio_widget_background/);
  assert.match(read("android/app/src/main/res/values-night/widget_colors.xml"), /nexio_widget_background/);
  assert.match(styles, /data-share-target-option[\s\S]*max-width: 100%[\s\S]*white-space: normal/);
});

test("19. toda nova interface e o Assistente visível permanecem em pt-BR", () => {
  const forbidden = [
    "Financial Assistant", "Voice Entry", "Listening...", "Processing...",
    "Try Again", "Permission denied", "Open Settings", "Scan Receipt",
    "Incoming Shared Content", "Not identified",
  ];
  for (const phrase of forbidden) {
    assert.equal(html.includes(phrase), false, phrase);
    assert.equal(renderer.includes(phrase), false, phrase);
  }
  assert.match(html, /Assistente Financeiro/);
  assert.match(html, /Registrar por voz/);
});

test("20. recursos nativos e overrides permanecem equivalentes e instaláveis", () => {
  assert.match(mainActivity, /registerPlugin\(NexioQuickActionsPlugin\.class\)/);
  assert.match(manifest, /NexioQuickActionsWidget[\s\S]*APPWIDGET_UPDATE/);
  assert.equal(nativePlugin, read("capacitor-overrides/android/NexioQuickActionsPlugin.java"));
  assert.equal(widgetProvider, read("capacitor-overrides/android/NexioQuickActionsWidget.java"));
  assert.match(read("scripts/apply-capacitor-android-overrides.ps1"), /NexioQuickActionsPlugin\.java[\s\S]*NexioQuickActionsWidget\.java[\s\S]*shortcuts\.xml/);
});
