"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "utils.js"));
require(path.join(__dirname, "..", "js", "core", "storage.js"));
require(path.join(__dirname, "..", "js", "core", "reports.js"));

const { reports, storage } = global.NexioCore;
const tests = [];

function test(name, callback) {
  tests.push({ name, callback });
}

function exportUser(overrides = {}) {
  const user = {
    email: "user@example.com",
    theme: "dark",
    settings: { notifications: true },
    profiles: [{
      id: "profile-1",
      name: "Principal",
      transactions: [{ id: "transaction-1", description: "Salário", amount: 2500, type: "income" }],
      goals: [{ id: "goal-1", name: "Reserva", target: 10000, saved: 500 }],
    }],
    ...overrides,
  };
  return reports.buildExportUser(user, {
    ensureUserShape(value) {
      if (!Array.isArray(value.profiles)) value.profiles = [];
    },
    ensureProfileShape(profile) {
      if (!Array.isArray(profile.goals)) profile.goals = [];
    },
    ensureGoalShape() {},
    goalHistoryStats: () => ({}),
    goalHistoryEntries: () => [],
    now: new Date("2026-07-27T12:00:00.000Z"),
  });
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("1. sanitiza password", () => {
  assert.deepEqual(storage.sanitizeSensitiveData({ email: "user@example.com", password: "private" }), { email: "user@example.com" });
});

test("2. sanitiza senha", () => {
  assert.deepEqual(storage.sanitizeSensitiveData({ email: "user@example.com", senha: "private" }), { email: "user@example.com" });
});

test("3. sanitiza campos sensíveis aninhados", () => {
  assert.deepEqual(storage.sanitizeSensitiveData({ profile: { passwordHash: "private", name: "Principal" } }), { profile: { name: "Principal" } });
});

test("4. sanitiza campos sensíveis dentro de arrays", () => {
  assert.deepEqual(storage.sanitizeSensitiveData({ users: [{ passwd: "private", email: "user@example.com" }, { passcode: "private" }] }), { users: [{ email: "user@example.com" }, {}] });
});

test("5. preserva dados financeiros legítimos e só regrava quando limpa", () => {
  const financial = {
    users: [{
      currency: "BRL",
      settings: { dueDateAlerts: false, monthlySummary: true },
      profiles: [{
        id: "profile-1",
        name: "Principal",
        categories: [{ id: "category-1", name: "Casa" }],
        transactions: [{
          id: "transaction-1",
          amount: "0.00",
          currency: "BRL",
          description: "Troca de senha do banco",
          date: "2026-07-27",
          installmentNumber: 0,
          installmentTotal: 0,
          tokenizationMethod: "network",
          reconciled: false,
        }],
        goals: [{
          id: "goal-1",
          target: 500,
          saved: 0,
          history: [{ type: "withdrawal", amount: 0, confirmed: false }],
          reminders: [],
        }],
        imports: [{ id: "import-1", sourceName: "extrato.csv", imported: 0 }],
      }],
    }],
  };
  const financialSnapshot = JSON.parse(JSON.stringify(financial));
  assert.strictEqual(storage.sanitizeSensitiveData(financial), financial);
  assert.deepEqual(financial, financialSnapshot);

  const financialWithSensitiveField = JSON.parse(JSON.stringify(financial));
  financialWithSensitiveField.users[0].profiles[0].passwordHash = "private";
  const expectedSanitizedFinancial = JSON.parse(JSON.stringify(financialWithSensitiveField));
  delete expectedSanitizedFinancial.users[0].profiles[0].passwordHash;
  assert.deepEqual(storage.sanitizeSensitiveData(financialWithSensitiveField), expectedSanitizedFinancial);
  assert.ok(Object.hasOwn(financialWithSensitiveField.users[0].profiles[0], "passwordHash"));

  let writes = 0;
  const dirty = memoryStorage({ store: JSON.stringify({ ...financial, password_hash: "private" }) });
  const originalSetItem = dirty.setItem;
  dirty.setItem = (key, value) => { writes += 1; originalSetItem(key, value); };
  assert.deepEqual(storage.loadStore(dirty, "store"), financial);
  assert.equal(writes, 1);

  writes = 0;
  storage.loadStore(dirty, "store");
  assert.equal(writes, 0);
});

test("6. exportação não contém senha", () => {
  const json = JSON.stringify(exportUser({ senha: "private" }));
  assert.doesNotMatch(json, /"senha"\s*:/i);
});

test("7. exportação não contém password", () => {
  const json = JSON.stringify(exportUser({ password: "private" }));
  assert.doesNotMatch(json, /"password"\s*:/i);
});

test("8. exportação não contém access_token", () => {
  const json = JSON.stringify(exportUser({ auth: { access_token: "private" } }));
  assert.doesNotMatch(json, /"access_token"\s*:/i);
});

test("9. exportação não contém refresh_token", () => {
  const json = JSON.stringify(exportUser({
    sessions: [{ refresh_token: "private", session_key: "private" }],
    secret: "private",
    credentials: { client: "private" },
  }));
  assert.doesNotMatch(json, /"refresh_token"\s*:/i);
  assert.doesNotMatch(json, /"session_key"\s*:/i);
  assert.doesNotMatch(json, /"secret"\s*:/i);
  assert.doesNotMatch(json, /"credentials"\s*:/i);
});

test("10. login indisponível não mantém sessão local", () => {
  const adapter = memoryStorage({ session: "user@example.com" });
  assert.equal(storage.clearUnverifiedSession(adapter, "session"), "");
  assert.equal(adapter.getItem("session"), null);

  const source = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
  const localFallback = source.slice(source.indexOf("async function handleAuth"), source.indexOf("async function handleCloudAuth"));
  assert.match(localFallback, /AUTH_SERVICE_UNAVAILABLE_MESSAGE/);
  assert.doesNotMatch(localFallback, /item\.password|password\s*:|state\.store\.users\.push/);
});

test("11. e-mail isolado não representa sessão autenticada", () => {
  const adapter = memoryStorage({ session: "user@example.com" });
  assert.equal(storage.getAuthenticatedSession(adapter, "session", ""), "");
  assert.equal(storage.getAuthenticatedSession(adapter, "session", "other@example.com"), "");
});

test("12. logout remove o marcador local de sessão", () => {
  const adapter = memoryStorage({ session: "user@example.com" });
  return storage.signOutAndClearSession(adapter, "session", async () => {
    throw new Error("remote unavailable");
  }).then((remoteSignOutSucceeded) => {
    assert.equal(remoteSignOutSucceeded, false);
    assert.equal(adapter.getItem("session"), null);
  });
});

test("13. usa correspondência exata após normalização do nome", () => {
  const input = {
    password_hash: "private",
    passwordHash: "private",
    access_token: "private",
    accessToken: "private",
    refresh_token: "private",
    refreshToken: "private",
    session_key: "private",
    sessionKey: "private",
    auth_token: "private",
    authToken: "private",
    tokenizationMethod: "network",
  };
  assert.deepEqual(storage.sanitizeSensitiveData(input), { tokenizationMethod: "network" });
});

test("14. preserva tipos especiais, null, zero e false sem recursão infinita", () => {
  const date = new Date("2026-07-27T12:00:00.000Z");
  const metadata = new Map([["source", "manual"]]);
  const input = { date, metadata, nullable: null, amount: 0, enabled: false, password: "private" };
  const sanitized = storage.sanitizeSensitiveData(input);
  assert.strictEqual(sanitized.date, date);
  assert.strictEqual(sanitized.metadata, metadata);
  assert.equal(sanitized.nullable, null);
  assert.equal(sanitized.amount, 0);
  assert.equal(sanitized.enabled, false);
  assert.ok(Object.hasOwn(input, "password"));
  assert.ok(!Object.hasOwn(sanitized, "password"));

  const circular = { amount: 10, passwordHash: "private" };
  circular.self = circular;
  const sanitizedCircular = storage.sanitizeSensitiveData(circular);
  assert.notStrictEqual(sanitizedCircular, circular);
  assert.strictEqual(sanitizedCircular.self, sanitizedCircular);
  assert.ok(Object.hasOwn(circular, "passwordHash"));
  assert.ok(!Object.hasOwn(sanitizedCircular, "passwordHash"));

  const cleanCircular = { amount: 10 };
  cleanCircular.self = cleanCircular;
  assert.strictEqual(storage.sanitizeSensitiveData(cleanCircular), cleanCircular);
});

test("15. exportação individual de perfil é sanitizada sem alterar a origem", () => {
  const profile = {
    id: "profile-1",
    name: "Principal",
    passwordHash: "private",
    transactions: [{ amount: "0.00", description: "Troca de senha", accessToken: "private" }],
    goals: [{ target: 500, saved: 0 }],
  };
  const payload = reports.buildExportProfile(profile, { now: new Date("2026-07-27T12:00:00.000Z") });
  assert.equal(payload.profile.transactions[0].amount, "0.00");
  assert.equal(payload.profile.transactions[0].description, "Troca de senha");
  assert.ok(!Object.hasOwn(payload.profile, "passwordHash"));
  assert.ok(!Object.hasOwn(payload.profile.transactions[0], "accessToken"));
  assert.ok(Object.hasOwn(profile, "passwordHash"));
  assert.ok(Object.hasOwn(profile.transactions[0], "accessToken"));
});

async function run() {
  for (const { name, callback } of tests) {
    await callback();
    console.log(`ok - ${name}`);
  }
  console.log(`${tests.length} security tests passed.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
