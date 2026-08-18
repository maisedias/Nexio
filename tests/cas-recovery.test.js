"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "storage.js"));
require(path.join(__dirname, "..", "js", "core", "sync.js"));

const { sync } = global.NexioCore;
const tests = [];

function test(name, callback) {
  tests.push({ name, callback });
}

function transaction(index, overrides = {}) {
  return {
    id: `transaction-${index}`,
    description: `Registro ${index}`,
    createdAt: "2026-07-30T12:00:00.000Z",
    updatedAt: "2026-07-30T12:00:00.000Z",
    ...overrides,
  };
}

function userWithTransactions(count, overrides = {}) {
  return {
    id: "auth-1",
    email: "owner@example.com",
    currency: "BRL",
    profiles: [{
      id: "profile-1",
      name: "Principal",
      accounts: [
        { id: "account-1", name: "Conta 1", updatedAt: "2026-07-30T12:00:00.000Z" },
        { id: "account-2", name: "Conta 2", updatedAt: "2026-07-30T12:00:00.000Z" },
        { id: "account-3", name: "Conta 3", updatedAt: "2026-07-30T12:00:00.000Z" },
      ],
      transactions: Array.from({ length: count }, (_, index) => transaction(index + 1)),
      goals: [{ id: "goal-1", name: "Meta", updatedAt: "2026-07-30T12:00:00.000Z" }],
      budgets: [],
      categories: [],
      imports: [],
    }],
    ...overrides,
  };
}

function remoteSubset() {
  const remote = userWithTransactions(370);
  remote.profiles[0].accounts = [];
  return remote;
}

function coordinatorFixture(options = {}) {
  const saves = [];
  const payload = options.payload || userWithTransactions(371);
  const coordinator = sync.createCoordinator({
    debounceMs: 0,
    retryDelays: [],
    getPayload: () => payload,
    save: async (context) => {
      saves.push(context);
      return options.result || {
        outcome: "success",
        revision: (BigInt(context.expectedRevision) + 1n).toString(),
        updated_at: "2026-08-18T12:00:00.000Z",
      };
    },
    persistMeta: () => {},
    onStatus: () => {},
    setTimer: (callback) => {
      queueMicrotask(callback);
      return 1;
    },
    clearTimer: () => {},
  });
  return { coordinator, payload, saves };
}

async function settle() {
  for (let index = 0; index < 20; index += 1) await Promise.resolve();
}

test("1. local superset is identified by record ids", () => {
  const comparison = sync.compareFinancialRecords(userWithTransactions(371), remoteSubset());
  assert.equal(comparison.safe, true);
  assert.equal(comparison.remoteOnly.length, 0);
  assert.deepEqual(
    comparison.localOnly.map((entry) => entry.kind).sort(),
    ["accounts", "accounts", "accounts", "transactions"],
  );
});

test("2. remote exclusive data blocks reconciliation", () => {
  const local = userWithTransactions(371);
  const remote = remoteSubset();
  remote.profiles[0].goals.push({
    id: "remote-goal",
    name: "Somente remoto",
    updatedAt: "2026-08-01T12:00:00.000Z",
  });
  const comparison = sync.compareFinancialRecords(local, remote);
  assert.equal(comparison.safe, false);
  assert.deepEqual(comparison.remoteOnly.map((entry) => entry.id), ["remote-goal"]);
});

test("3. a newer remote record blocks reconciliation", () => {
  const local = userWithTransactions(371);
  const remote = remoteSubset();
  remote.profiles[0].transactions[0] = transaction(1, {
    description: "Alterado remotamente",
    updatedAt: "2026-08-02T12:00:00.000Z",
  });
  const comparison = sync.compareFinancialRecords(local, remote);
  assert.equal(comparison.safe, false);
  assert.equal(comparison.divergent.length, 1);
  assert.equal(comparison.divergent[0].remoteNewer, true);
});

test("4. controlled save sends exactly the known expected revision", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "1", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await settle();
  assert.equal(fixture.saves.length, 1);
  assert.equal(fixture.saves[0].expectedRevision, "1");
});

test("5. CAS conflict stops without a blind retry", async () => {
  const fixture = coordinatorFixture({
    result: { outcome: "conflict", revision: "2", updated_at: null },
  });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "1", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await settle();
  assert.equal(fixture.saves.length, 1);
  assert.equal(fixture.coordinator.getStatus().status, "conflict");
  assert.equal(fixture.coordinator.getStatus().dirty, true);
});

test("6. successful controlled reconciliation advances revision 1 to 2", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "1", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await settle();
  const status = fixture.coordinator.getStatus();
  assert.equal(status.remoteRevision, "2");
  assert.equal(status.dirty, false);
});

test("7. a clean second session bootstraps the full remote snapshot", () => {
  const remote = userWithTransactions(371);
  const result = sync.reconcileBootstrap({
    authUser: { id: "auth-1", email: "owner@example.com" },
    localExists: false,
    remoteRowExists: true,
    remoteData: remote,
  });
  assert.equal(result.status, "remote");
  assert.equal(result.user.profiles[0].transactions.length, 371);
});

test("8. divergent bootstrap keeps local data visible and blocks automatic writes", () => {
  const local = userWithTransactions(371);
  const result = sync.reconcileBootstrap({
    authUser: { id: "auth-1", email: "owner@example.com" },
    localExists: true,
    localUser: local,
    remoteRowExists: true,
    remoteData: remoteSubset(),
  });
  assert.equal(result.status, "conflict");
  assert.equal(result.conflict, true);
  assert.equal(result.user.profiles[0].transactions.length, 371);
  assert.equal(result.reason, "local-superset");
});

test("9. the CAS payload preserves all 371 transactions", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "1", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await settle();
  assert.equal(fixture.saves[0].payload.profiles[0].transactions.length, 371);
});

(async () => {
  let passed = 0;
  for (const entry of tests) {
    try {
      await entry.callback();
      passed += 1;
      console.log(`ok - ${entry.name}`);
    } catch (error) {
      console.error(`not ok - ${entry.name}`);
      console.error(error && error.stack ? error.stack : error);
      process.exitCode = 1;
    }
  }
  console.log(`${passed}/${tests.length} CAS recovery tests passed.`);
})();
