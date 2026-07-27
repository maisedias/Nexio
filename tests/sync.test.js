"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "storage.js"));
require(path.join(__dirname, "..", "js", "core", "sync.js"));

const { storage, sync } = global.NexioCore;
const tests = [];

function test(name, callback) {
  tests.push({ name, callback });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function settle() {
  for (let index = 0; index < 12; index += 1) await Promise.resolve();
}

class ControlledTimers {
  constructor() {
    this.time = 0;
    this.nextId = 1;
    this.tasks = new Map();
  }

  setTimer(callback, delay) {
    const id = this.nextId;
    this.nextId += 1;
    this.tasks.set(id, { at: this.time + Number(delay || 0), callback });
    return id;
  }

  clearTimer(id) {
    this.tasks.delete(id);
  }

  now() {
    return new Date(Date.UTC(2026, 6, 27, 12, 0, 0) + this.time).toISOString();
  }

  async advance(milliseconds) {
    const target = this.time + milliseconds;
    let guard = 0;
    while (guard < 100) {
      guard += 1;
      await settle();
      const due = [...this.tasks.entries()]
        .filter(([, task]) => task.at <= target)
        .sort((left, right) => left[1].at - right[1].at || left[0] - right[0])[0];
      if (!due) break;
      const [id, task] = due;
      this.tasks.delete(id);
      this.time = task.at;
      task.callback();
    }
    if (guard >= 100) throw new Error("Controlled timer loop exceeded its safety limit.");
    this.time = target;
    await settle();
  }

  async runAll() {
    let guard = 0;
    while (this.tasks.size && guard < 100) {
      guard += 1;
      const nextAt = Math.min(...[...this.tasks.values()].map((task) => task.at));
      await this.advance(Math.max(0, nextAt - this.time));
    }
    if (guard >= 100) throw new Error("Controlled timer queue did not become idle.");
  }
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  return {
    values,
    get length() { return values.size; },
    getItem: (key) => values.has(key) ? values.get(key) : null,
    key: (index) => [...values.keys()][index] || null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function financialUser(overrides = {}) {
  return {
    id: "owner-a",
    email: "owner@example.com",
    currency: "BRL",
    profiles: [{
      id: "profile-1",
      name: "Principal",
      transactions: [],
      goals: [],
      categories: [],
      imports: [],
    }],
    ...overrides,
  };
}

function coordinatorFixture(options = {}) {
  const timers = options.timers || new ControlledTimers();
  const saves = [];
  let payload = options.payload || { version: 0 };
  let concurrent = 0;
  let maximumConcurrent = 0;
  function successfulResponse(context) {
    return {
      outcome: "success",
      revision: (BigInt(context.expectedRevision) + 1n).toString(),
      updated_at: timers.now(),
    };
  }
  const save = options.save
    ? async (context) => {
      const result = await options.save(context);
      return result === undefined ? successfulResponse(context) : result;
    }
    : async (context) => {
      concurrent += 1;
      maximumConcurrent = Math.max(maximumConcurrent, concurrent);
      saves.push({ ...context, payload: clone(context.payload) });
      concurrent -= 1;
      return successfulResponse(context);
    };
  const baseCoordinator = sync.createCoordinator({
    debounceMs: options.debounceMs ?? 10,
    retryDelays: options.retryDelays || [5, 10, 20],
    maxRetries: options.maxRetries,
    setTimer: timers.setTimer.bind(timers),
    clearTimer: timers.clearTimer.bind(timers),
    now: timers.now.bind(timers),
    getPayload: options.getPayload || (() => clone(payload)),
    save,
    persistMeta: options.persistMeta,
    onStatus: options.onStatus,
  });
  const coordinator = Object.freeze({
    ...baseCoordinator,
    activateOwner(ownerId, activation = {}) {
      if (activation.guest) return baseCoordinator.activateOwner(ownerId, activation);
      const meta = activation.meta || {};
      const hasRevisionState = Object.hasOwn(meta, "remoteRevision")
        || Object.hasOwn(meta, "revisionKnown");
      return baseCoordinator.activateOwner(ownerId, {
        ...activation,
        meta: hasRevisionState
          ? meta
          : { ...meta, remoteRevision: "0", revisionKnown: true },
      });
    },
  });
  return {
    coordinator,
    timers,
    saves,
    get maximumConcurrent() { return maximumConcurrent; },
    setPayload(nextPayload) { payload = nextPayload; },
  };
}

test("1. duas alteracoes no debounce geram um save", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.setPayload({ version: 1 });
  fixture.coordinator.markDirty();
  fixture.setPayload({ version: 2 });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(fixture.saves.length, 1);
  assert.deepEqual(fixture.saves[0].payload, { version: 2 });
});

test("2. alteracao durante save gera segundo save depois do primeiro", async () => {
  const first = deferred();
  const calls = [];
  const fixture = coordinatorFixture({ save: async (context) => {
    calls.push(clone(context));
    if (calls.length === 1) await first.promise;
  } });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.setPayload({ version: 1 });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(calls.length, 1);
  fixture.setPayload({ version: 2 });
  fixture.coordinator.markDirty();
  first.resolve();
  await settle();
  assert.equal(calls.length, 2);
});

test("3. nunca ha dois saves concorrentes para o mesmo owner", async () => {
  const gates = [deferred(), deferred()];
  let active = 0;
  let maximum = 0;
  let call = 0;
  const fixture = coordinatorFixture({ save: async () => {
    const index = call;
    call += 1;
    active += 1;
    maximum = Math.max(maximum, active);
    await gates[index].promise;
    active -= 1;
  } });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.markDirty();
  fixture.coordinator.flush();
  assert.equal(call, 1);
  gates[0].resolve();
  await settle();
  assert.equal(call, 2);
  assert.equal(maximum, 1);
  gates[1].resolve();
  await settle();
});

test("4. segundo save usa o payload mais recente", async () => {
  const first = deferred();
  const payloads = [];
  const fixture = coordinatorFixture({ save: async ({ payload }) => {
    payloads.push(clone(payload));
    if (payloads.length === 1) await first.promise;
  } });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.setPayload({ version: 1 });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.setPayload({ version: 3 });
  fixture.coordinator.markDirty();
  first.resolve();
  await settle();
  assert.deepEqual(payloads, [{ version: 1 }, { version: 3 }]);
});

test("5. resultado antigo nao altera ownerEpoch novo", async () => {
  const oldSave = deferred();
  const fixture = coordinatorFixture({ save: () => oldSave.promise });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  const oldEpoch = fixture.coordinator.getStatus().ownerEpoch;
  fixture.coordinator.activateOwner("owner-b", { canSync: true });
  const newEpoch = fixture.coordinator.getStatus().ownerEpoch;
  oldSave.resolve();
  await settle();
  const status = fixture.coordinator.getStatus();
  assert.ok(newEpoch > oldEpoch);
  assert.equal(status.ownerId, "owner-b");
  assert.equal(status.lastSuccessfulGeneration, 0);
  assert.equal(status.status, "idle");
});

test("6. logout cancela save agendado", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.coordinator.markDirty();
  fixture.coordinator.invalidateOwner();
  await fixture.timers.advance(20);
  assert.equal(fixture.saves.length, 0);
  assert.equal(fixture.coordinator.getStatus().ownerId, "");
});

test("7. logout durante requisicao ignora conclusao antiga", async () => {
  const pending = deferred();
  const fixture = coordinatorFixture({ save: () => pending.promise });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.invalidateOwner();
  pending.resolve();
  await settle();
  assert.deepEqual(fixture.coordinator.getStatus(), {
    ownerId: "", ownerEpoch: 2, dirty: false, syncing: false, scheduled: false,
    conflict: false, blocked: false, offline: false, guest: false, canSync: false,
    remoteRevision: null, revisionKnown: false,
    localGeneration: 0, lastSuccessfulGeneration: 0, lastAttemptAt: "",
    lastSuccessAt: "", lastError: "", retryCount: 0, status: "idle",
  });
});

test("8. troca A para B nunca envia payload A como B", async () => {
  const calls = [];
  let currentPayload = { owner: "A" };
  const timers = new ControlledTimers();
  const coordinator = sync.createCoordinator({
    debounceMs: 10,
    setTimer: timers.setTimer.bind(timers),
    clearTimer: timers.clearTimer.bind(timers),
    now: timers.now.bind(timers),
    getPayload: () => clone(currentPayload),
    save: async (context) => {
      calls.push(clone(context));
      return {
        outcome: "success",
        revision: (BigInt(context.expectedRevision) + 1n).toString(),
        updated_at: timers.now(),
      };
    },
  });
  coordinator.activateOwner("owner-a", {
    canSync: true,
    meta: { remoteRevision: "0", revisionKnown: true },
  });
  coordinator.markDirty();
  coordinator.activateOwner("owner-b", {
    canSync: true,
    meta: { remoteRevision: "0", revisionKnown: true },
  });
  currentPayload = { owner: "B" };
  coordinator.markDirty();
  await timers.advance(10);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].ownerId, "owner-b");
  assert.deepEqual(calls[0].payload, { owner: "B" });
});

test("9. guest nunca chama o adaptador", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("guest", { guest: true, canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(100);
  await fixture.coordinator.flush();
  assert.equal(fixture.saves.length, 0);
  assert.equal(fixture.coordinator.getStatus().dirty, true);
});

test("10. falha mantem dirty", async () => {
  const fixture = coordinatorFixture({ maxRetries: 1, save: async () => { throw new Error("private backend detail"); } });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  const status = fixture.coordinator.getStatus();
  assert.equal(status.dirty, true);
  assert.equal(status.status, "error");
  assert.doesNotMatch(status.lastError, /private|backend/i);
});

test("11. reconexao dispara retry serializado", async () => {
  let attempts = 0;
  let active = 0;
  let maximum = 0;
  const fixture = coordinatorFixture({ maxRetries: 1, save: async () => {
    attempts += 1;
    active += 1;
    maximum = Math.max(maximum, active);
    active -= 1;
    if (attempts === 1) throw new Error("offline");
  } });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.setOnline(false);
  fixture.coordinator.setOnline(true);
  await fixture.timers.advance(0);
  assert.equal(attempts, 2);
  assert.equal(maximum, 1);
  assert.equal(fixture.coordinator.getStatus().status, "synced");
});

test("12. retry respeita o limite", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ maxRetries: 3, retryDelays: [1, 1, 1], save: async () => {
    attempts += 1;
    throw new Error("temporary");
  } });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  await fixture.timers.runAll();
  assert.equal(attempts, 3);
  assert.equal(fixture.coordinator.getStatus().status, "error");
  assert.equal(fixture.coordinator.getStatus().dirty, true);
});

test("13. sucesso antigo nao limpa dirty da geracao nova", async () => {
  const first = deferred();
  const second = deferred();
  let attempts = 0;
  const fixture = coordinatorFixture({ save: () => {
    attempts += 1;
    return attempts === 1 ? first.promise : second.promise;
  } });
  fixture.coordinator.activateOwner("owner-a", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.markDirty();
  first.resolve();
  await settle();
  const status = fixture.coordinator.getStatus();
  assert.equal(status.localGeneration, 2);
  assert.equal(status.lastSuccessfulGeneration, 1);
  assert.equal(status.dirty, true);
  assert.notEqual(status.status, "synced");
  second.resolve();
  await settle();
});

test("14. chaves locais sao separadas por authUser.id", () => {
  assert.equal(storage.ownerStateKey("user-a"), "nexio-finance-state-v2:user:user-a");
  assert.equal(storage.ownerStateKey("user-b"), "nexio-finance-state-v2:user:user-b");
  assert.notEqual(storage.ownerStateKey("user-a"), storage.ownerStateKey("user-b"));
});

test("15. guest usa chave separada", () => {
  assert.equal(storage.ownerStateKey("guest", { guest: true }), "nexio-finance-state-v2:guest");
  assert.equal(storage.syncMetaKey("guest", { guest: true }), "nexio-sync-meta-v1:guest");
});

test("16. mudanca de email preserva dados pelo mesmo userId", () => {
  const local = memoryStorage();
  storage.saveOwnerUser(local, "auth-1", financialUser({ email: "old@example.com" }));
  const loaded = storage.loadOwnerUser(local, "auth-1");
  loaded.user.email = "new@example.com";
  storage.saveOwnerUser(local, "auth-1", loaded.user);
  assert.equal(storage.loadOwnerUser(local, "auth-1").user.email, "new@example.com");
  assert.equal(local.values.has("nexio-finance-state-v2:user:new@example.com"), false);
});

test("17. migracao v1 cria backup", () => {
  const legacy = { users: [financialUser()] };
  const local = memoryStorage({ "nexio-finance-state-v1": JSON.stringify(legacy) });
  const result = storage.migrateLegacyOwner(local, "auth-1", {
    email: "owner@example.com",
    now: "2026-07-27T12:00:00.000Z",
  });
  assert.equal(result.migrated, true);
  assert.equal(result.backupCreated, true);
  assert.ok(result.backupKey.startsWith("nexio-local-backup-v1:legacy:"));
  assert.ok(local.getItem(result.backupKey));
});

test("18. migracao v1 mantem a chave antiga", () => {
  const original = JSON.stringify({ users: [financialUser()] });
  const local = memoryStorage({ "nexio-finance-state-v1": original });
  storage.migrateLegacyOwner(local, "auth-1", { email: "owner@example.com" });
  assert.equal(local.getItem("nexio-finance-state-v1"), original);
});

test("19. migracao v1 nao sobrescreve v2", () => {
  const existing = financialUser({ email: "existing@example.com", currency: "USD" });
  const local = memoryStorage({ "nexio-finance-state-v1": JSON.stringify({ users: [financialUser()] }) });
  storage.saveOwnerUser(local, "auth-1", existing);
  const result = storage.migrateLegacyOwner(local, "auth-1", { email: "owner@example.com" });
  assert.equal(result.status, "existing");
  assert.deepEqual(storage.loadOwnerUser(local, "auth-1").user, existing);
});

test("20. migracao v1 e idempotente", () => {
  const local = memoryStorage({ "nexio-finance-state-v1": JSON.stringify({ users: [financialUser()] }) });
  const first = storage.migrateLegacyOwner(local, "auth-1", { email: "owner@example.com" });
  const snapshot = new Map(local.values);
  const second = storage.migrateLegacyOwner(local, "auth-1", { email: "owner@example.com" });
  assert.equal(first.migrated, true);
  assert.equal(second.status, "existing");
  assert.deepEqual(local.values, snapshot);
});

test("21. remoto sem data.email continua sendo dado valido", () => {
  const result = sync.reconcileBootstrap({
    authUser: { id: "auth-1", email: "owner@example.com" },
    localExists: false,
    remoteRowExists: true,
    remoteData: { currency: "BRL", profiles: [] },
  });
  assert.equal(result.status, "remote");
  assert.equal(result.blocked, false);
  assert.equal(result.user.email, "owner@example.com");
  assert.equal(result.user.id, "auth-1");
});

test("22. remoto invalido bloqueia escrita", async () => {
  const reconciliation = sync.reconcileBootstrap({
    authUser: { id: "auth-1", email: "owner@example.com" },
    localExists: true,
    localUser: financialUser(),
    remoteRowExists: true,
    remoteData: { unexpected: "shape" },
  });
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { dirty: true, blocked: reconciliation.blocked, localGeneration: 1 },
  });
  fixture.coordinator.scheduleSave();
  await fixture.timers.advance(100);
  assert.equal(reconciliation.reason, "invalid-remote");
  assert.equal(fixture.saves.length, 0);
  assert.equal(fixture.coordinator.getStatus().status, "blocked");
});

test("23. local vazio nao sobrescreve remoto valido", () => {
  const remote = financialUser({ currency: "EUR" });
  const result = sync.reconcileBootstrap({
    authUser: { id: "auth-1", email: "owner@example.com" },
    localExists: false,
    remoteRowExists: true,
    remoteData: remote,
  });
  assert.equal(result.status, "remote");
  assert.equal(result.dirty, false);
  assert.equal(result.user.currency, "EUR");
});

test("24. local e remoto divergentes entram em conflict", () => {
  const result = sync.reconcileBootstrap({
    authUser: { id: "auth-1", email: "owner@example.com" },
    localExists: true,
    localUser: financialUser({ currency: "BRL" }),
    remoteRowExists: true,
    remoteData: financialUser({ currency: "USD" }),
  });
  assert.equal(result.status, "conflict");
  assert.equal(result.conflict, true);
  assert.equal(result.localBackupCandidate.currency, "BRL");
  assert.equal(result.user.currency, "USD");
});

test("25. bootstrap em conflict nao faz upsert automatico", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { dirty: true, conflict: true, localGeneration: 1 },
  });
  fixture.coordinator.scheduleSave();
  await fixture.timers.advance(100);
  assert.equal(fixture.saves.length, 0);
  assert.equal(fixture.coordinator.getStatus().status, "conflict");
});

test("26. backup local remove campos sensiveis", () => {
  const local = memoryStorage();
  const key = storage.backupOwnerUser(local, "auth-1", financialUser({
    password: "private-password",
    auth: { access_token: "private-token", safe: true },
  }), { now: "2026-07-27T12:00:00.000Z" });
  const backup = local.getItem(key);
  assert.doesNotMatch(backup, /private-password|private-token|password|access_token/i);
  assert.equal(JSON.parse(backup).auth.safe, true);
});

class FakeBroadcastChannel {
  static channels = [];

  constructor(name) {
    this.name = name;
    this.onmessage = null;
    FakeBroadcastChannel.channels.push(this);
  }

  postMessage(data) {
    FakeBroadcastChannel.channels
      .filter((channel) => channel !== this && channel.name === this.name)
      .forEach((channel) => channel.onmessage?.({ data: clone(data) }));
  }

  close() {
    FakeBroadcastChannel.channels = FakeBroadcastChannel.channels.filter((channel) => channel !== this);
  }
}

test("27. logout em outra aba invalida o contexto", () => {
  FakeBroadcastChannel.channels = [];
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", { canSync: true });
  const receiver = sync.createTabChannel({
    BroadcastChannelCtor: FakeBroadcastChannel,
    sourceId: "receiver",
    onMessage: (message) => {
      if (message.type === "logout" && message.ownerId === fixture.coordinator.getStatus().ownerId) {
        fixture.coordinator.invalidateOwner();
      }
    },
  });
  const sender = sync.createTabChannel({ BroadcastChannelCtor: FakeBroadcastChannel, sourceId: "sender" });
  sender.post("logout", { ownerId: "auth-1" });
  assert.equal(fixture.coordinator.getStatus().ownerId, "");
  receiver.destroy();
  sender.destroy();
});

test("28. aba stale nao grava na nuvem", async () => {
  FakeBroadcastChannel.channels = [];
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", { canSync: true });
  const receiver = sync.createTabChannel({
    BroadcastChannelCtor: FakeBroadcastChannel,
    sourceId: "receiver",
    onMessage: (message) => {
      if (message.type === "state-changed" && message.ownerId === "auth-1") fixture.coordinator.markStale();
    },
  });
  const sender = sync.createTabChannel({ BroadcastChannelCtor: FakeBroadcastChannel, sourceId: "sender" });
  sender.post("state-changed", { ownerId: "auth-1" });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(100);
  assert.equal(fixture.saves.length, 0);
  assert.equal(fixture.coordinator.getStatus().status, "blocked");
  receiver.destroy();
  sender.destroy();
});

test("29. synced corresponde apenas a geracao atual", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(fixture.coordinator.getStatus().status, "synced");
  fixture.coordinator.markDirty({ schedule: false });
  const status = fixture.coordinator.getStatus();
  assert.equal(status.dirty, true);
  assert.notEqual(status.status, "synced");
  assert.ok(status.lastSuccessfulGeneration < status.localGeneration);
});

test("30. comparacao preserva dados financeiros e ignora apenas meta volatil", () => {
  const base = financialUser({
    _sync: { lastAttempt: "old" },
    lastSyncedAt: "2026-07-27T10:00:00.000Z",
    profiles: [{
      id: "profile-1",
      transactions: [{ id: "trx-1", amount: 10, date: "2026-07-27", currency: "BRL" }],
      goals: [{ id: "goal-1", target: 100, saved: 25 }],
    }],
  });
  const volatileChange = clone(base);
  volatileChange._sync.lastAttempt = "new";
  volatileChange.lastSyncedAt = "2026-07-27T12:00:00.000Z";
  assert.equal(sync.statesEquivalent(base, volatileChange), true);
  const financialChange = clone(base);
  financialChange.profiles[0].transactions[0].amount = 11;
  assert.equal(sync.statesEquivalent(base, financialChange), false);
  const idChange = clone(base);
  idChange.profiles[0].transactions[0].id = "trx-2";
  assert.equal(sync.statesEquivalent(base, idChange), false);
});

test("31. migracao guest nao mistura usuario autenticado", () => {
  const guest = financialUser({ id: "guest-old", email: "sem-login@nexio.local", localOnly: true });
  const authenticated = financialUser({ id: "auth-old", email: "owner@example.com", currency: "USD" });
  const local = memoryStorage({ "nexio-finance-state-v1": JSON.stringify({ users: [authenticated, guest] }) });
  const result = storage.migrateLegacyOwner(local, "guest", { guest: true, localOnlyEmail: "sem-login@nexio.local" });
  assert.equal(result.migrated, true);
  assert.equal(result.user.id, "guest-old");
  assert.equal(result.user.localOnly, true);
});

test("32. migracao ambigua preserva v1 e exige revisao", () => {
  const duplicate = financialUser({ id: "duplicate" });
  const original = JSON.stringify({ users: [financialUser(), duplicate] });
  const local = memoryStorage({ "nexio-finance-state-v1": original });
  const result = storage.migrateLegacyOwner(local, "auth-1", { email: "owner@example.com" });
  assert.equal(result.reviewRequired, true);
  assert.equal(result.status, "review-required");
  assert.equal(local.getItem("nexio-finance-state-v1"), original);
  assert.equal(local.getItem(storage.ownerStateKey("auth-1")), null);
});

test("33. metadados persistidos nao armazenam payload ou erro privado", () => {
  const local = memoryStorage();
  storage.saveSyncMeta(local, "auth-1", {
    dirty: true,
    conflict: false,
    blocked: false,
    localGeneration: 4,
    lastSuccessfulGeneration: 3,
    retryCount: 2,
    lastError: "service role key private-value",
    payload: financialUser({ password: "private-password" }),
    stack: "private stack",
  }, { now: "2026-07-27T12:00:00.000Z" });
  const raw = local.getItem(storage.syncMetaKey("auth-1"));
  assert.doesNotMatch(raw, /service role|private-value|private-password|payload|stack/i);
  assert.equal(JSON.parse(raw).dirty, true);
});

test("34. evento storage funciona como fallback entre abas", () => {
  const listeners = new Set();
  const values = new Map();
  const globalObject = {
    addEventListener(type, callback) { if (type === "storage") listeners.add(callback); },
    removeEventListener(type, callback) { if (type === "storage") listeners.delete(callback); },
  };
  const local = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => {
      values.set(key, String(value));
      listeners.forEach((listener) => listener({ key, newValue: String(value) }));
    },
    removeItem: (key) => {
      values.delete(key);
      listeners.forEach((listener) => listener({ key, newValue: null }));
    },
  };
  let received = null;
  const receiver = sync.createTabChannel({
    globalObject,
    storage: local,
    BroadcastChannelCtor: null,
    sourceId: "receiver",
    onMessage: (message) => { received = message; },
  });
  const sender = sync.createTabChannel({
    globalObject,
    storage: local,
    BroadcastChannelCtor: null,
    sourceId: "sender",
  });
  sender.post("session-invalidated", { ownerId: "auth-1" });
  assert.equal(received.type, "session-invalidated");
  assert.equal(received.ownerId, "auth-1");
  receiver.destroy();
  sender.destroy();
});

test("35. limite de backups preserva sempre o mais recente", () => {
  const local = memoryStorage();
  const keys = [0, 1, 2, 3].map((index) => storage.backupOwnerUser(
    local,
    "auth-1",
    financialUser({ sequence: index }),
    { now: `2026-07-27T12:00:0${index}.000Z`, maxBackups: 3 },
  ));
  assert.equal(local.getItem(keys[0]), null);
  assert.ok(local.getItem(keys[1]));
  assert.ok(local.getItem(keys[2]));
  assert.ok(local.getItem(keys[3]));
  assert.equal(JSON.parse(local.getItem(keys[3])).sequence, 3);
});

test("36. nova alteracao enquanto retry aguarda usa o payload novo", async () => {
  const payloads = [];
  let attempt = 0;
  const fixture = coordinatorFixture({ retryDelays: [5, 10, 20], save: async ({ payload }) => {
    attempt += 1;
    payloads.push(clone(payload));
    if (attempt === 1) throw new Error("temporary");
  } });
  fixture.coordinator.activateOwner("auth-1", { canSync: true });
  fixture.setPayload({ version: 1 });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.setPayload({ version: 2 });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.deepEqual(payloads, [{ version: 1 }, { version: 2 }]);
  assert.equal(fixture.coordinator.getStatus().status, "synced");
});

test("37. logout cancela retry agendado", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ retryDelays: [5, 10, 20], save: async () => {
    attempts += 1;
    throw new Error("temporary");
  } });
  fixture.coordinator.activateOwner("auth-1", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(fixture.coordinator.getStatus().status, "retrying");
  fixture.coordinator.invalidateOwner();
  await fixture.timers.runAll();
  assert.equal(attempts, 1);
});

test("38. stale durante save nao confirma a geracao em voo", async () => {
  const pending = deferred();
  const fixture = coordinatorFixture({ save: () => pending.promise });
  fixture.coordinator.activateOwner("auth-1", { canSync: true });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.markStale();
  pending.resolve();
  await settle();
  const status = fixture.coordinator.getStatus();
  assert.equal(status.status, "blocked");
  assert.equal(status.dirty, true);
  assert.equal(status.lastSuccessfulGeneration, 0);
  assert.equal(status.lastSuccessAt, "");
});

test("39. ownerId inesperado e codificado e limitado", () => {
  assert.equal(
    storage.ownerStateKey("auth/user:1"),
    "nexio-finance-state-v2:user:auth%2Fuser%3A1",
  );
  assert.notEqual(storage.ownerStateKey("auth/user:1"), storage.ownerStateKey("auth%2Fuser:1"));
  assert.throws(() => storage.ownerStateKey("x".repeat(257)), /too long/i);
  assert.throws(() => storage.ownerStateKey("\uD800"), /invalid characters/i);
});

test("40. formatos remotos invalidos sao todos bloqueados", () => {
  [null, [], "invalid", { profiles: "invalid" }].forEach((remoteData) => {
    const result = sync.reconcileBootstrap({
      authUser: { id: "auth-1", email: "owner@example.com" },
      localExists: true,
      localUser: financialUser(),
      remoteRowExists: true,
      remoteData,
    });
    assert.equal(result.status, "blocked");
    assert.equal(result.reason, "invalid-remote");
  });
});

test("41. comparacao e deterministica e preserva ordem e valores falsy", () => {
  const left = {
    currency: "BRL",
    profiles: [{ id: "p", transactions: [{ id: "a", amount: 0, confirmed: false, note: "" }, { id: "b" }] }],
  };
  const reorderedProperties = {
    profiles: [{ transactions: [{ note: "", confirmed: false, amount: 0, id: "a" }, { id: "b" }], id: "p" }],
    currency: "BRL",
  };
  assert.equal(sync.statesEquivalent(left, reorderedProperties), true);
  const reorderedArray = clone(left);
  reorderedArray.profiles[0].transactions.reverse();
  assert.equal(sync.statesEquivalent(left, reorderedArray), false);
  const changedFalse = clone(left);
  changedFalse.profiles[0].transactions[0].confirmed = true;
  assert.equal(sync.statesEquivalent(left, changedFalse), false);
  const changedEmpty = clone(left);
  changedEmpty.profiles[0].transactions[0].note = "filled";
  assert.equal(sync.statesEquivalent(left, changedEmpty), false);
});

test("42. backup de migracao contem somente o owner correspondente", () => {
  const firstUser = financialUser({ email: "first@example.com" });
  const secondUser = financialUser({ id: "owner-b", email: "second@example.com" });
  const local = memoryStorage({ "nexio-finance-state-v1": JSON.stringify({ users: [firstUser, secondUser] }) });
  const first = storage.migrateLegacyOwner(local, "auth-1", { email: "first@example.com" });
  const second = storage.migrateLegacyOwner(local, "auth-2", { email: "second@example.com" });
  const firstBackup = JSON.parse(local.getItem(first.backupKey));
  const secondBackup = JSON.parse(local.getItem(second.backupKey));
  assert.equal(firstBackup.users.length, 1);
  assert.equal(firstBackup.users[0].email, "first@example.com");
  assert.equal(secondBackup.users.length, 1);
  assert.equal(secondBackup.users[0].email, "second@example.com");
  assert.notEqual(first.backupKey, second.backupKey);
  assert.ok(local.getItem(first.backupKey));
});

test("43. falha ao criar backup impede a migracao v2", () => {
  const local = memoryStorage({ "nexio-finance-state-v1": JSON.stringify({ users: [financialUser()] }) });
  const originalSetItem = local.setItem;
  local.setItem = (key, value) => {
    if (key.startsWith("nexio-local-backup-v1:")) throw new Error("quota");
    originalSetItem(key, value);
  };
  const result = storage.migrateLegacyOwner(local, "auth-1", { email: "owner@example.com" });
  assert.equal(result.status, "backup-failed");
  assert.equal(result.reviewRequired, true);
  assert.equal(local.getItem(storage.ownerStateKey("auth-1")), null);
  assert.equal(local.getItem("nexio-migration-v1-to-v2:user:auth-1"), null);
  assert.ok(local.getItem("nexio-finance-state-v1"));
});

test("44. reconexoes repetidas mantem apenas um retry", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => { attempts += 1; } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { dirty: true, localGeneration: 1 },
  });
  fixture.coordinator.setOnline(false);
  fixture.coordinator.handleReconnect();
  fixture.coordinator.handleReconnect();
  await fixture.timers.advance(0);
  assert.equal(attempts, 1);
  assert.equal(fixture.coordinator.getStatus().status, "synced");
});

test("45. destroy cancela timers pendentes", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", { canSync: true });
  fixture.coordinator.markDirty();
  fixture.coordinator.destroy();
  await fixture.timers.runAll();
  assert.equal(fixture.saves.length, 0);
});

test("46. marcador de migracao concluida so existe apos sucesso", () => {
  const ambiguous = memoryStorage({
    "nexio-finance-state-v1": JSON.stringify({ users: [financialUser(), financialUser({ id: "duplicate" })] }),
  });
  storage.migrateLegacyOwner(ambiguous, "auth-1", { email: "owner@example.com" });
  assert.equal(ambiguous.getItem("nexio-migration-v1-to-v2:user:auth-1"), null);
  assert.ok(ambiguous.getItem("nexio-migration-v1-review:user:auth-1"));
  storage.saveOwnerUser(ambiguous, "auth-1", financialUser({ email: "remote@example.com" }));
  assert.equal(
    storage.migrateLegacyOwner(ambiguous, "auth-1", { email: "owner@example.com" }).reviewRequired,
    true,
  );

  const valid = memoryStorage({
    "nexio-finance-state-v1": JSON.stringify({ users: [financialUser()] }),
  });
  storage.migrateLegacyOwner(valid, "auth-1", { email: "owner@example.com" });
  assert.equal(
    JSON.parse(valid.getItem("nexio-migration-v1-to-v2:user:auth-1")).status,
    "migrated",
  );
});

test("47. modulos carregam na ordem do navegador sem bundler", () => {
  const browserStorage = memoryStorage();
  const listeners = new Map();
  const classList = { add() {}, remove() {}, toggle() {} };
  const context = {
    clearTimeout,
    console: { debug() {}, error() {}, info() {}, log() {}, warn() {} },
    document: {
      body: { classList, dataset: {} },
      documentElement: { classList, style: { setProperty() {} } },
      readyState: "loading",
      addEventListener(type, callback) { listeners.set(`document:${type}`, callback); },
      getElementById() { return {}; },
    },
    localStorage: browserStorage,
    navigator: { language: "pt-BR", languages: ["pt-BR"], onLine: true, userAgent: "Browser" },
    setTimeout,
    innerWidth: 1280,
    addEventListener(type, callback) { listeners.set(`window:${type}`, callback); },
    removeEventListener() {},
  };
  context.window = context;
  vm.createContext(context);
  [
    "mobile-capacitor.js",
    "js/core/utils.js",
    "js/core/storage.js",
    "js/core/sync.js",
    "js/core/categories.js",
    "js/core/finance.js",
    "js/core/transactions.js",
    "js/core/goals.js",
    "js/core/profiles.js",
    "js/core/reports.js",
    "js/core/notifications.js",
    "js/ui/shared-ui.js",
    "app.js",
  ].forEach((file) => {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    vm.runInContext(source, context, { filename: file });
  });
  assert.equal(typeof context.NexioCore.sync.createCoordinator, "function");
  assert.equal(typeof context.NexioApp.bootstrap, "function");
  assert.equal(typeof context.NexioApp.handleConnectivity, "function");
  assert.equal(typeof listeners.get("document:DOMContentLoaded"), "function");
});

test("48. revision aceita somente decimal canonico dentro de bigint", () => {
  ["0", "1", "25", "9223372036854775807"].forEach((revision) => {
    assert.equal(storage.normalizeSyncRevision(revision), revision);
    assert.equal(storage.isValidSyncRevision(revision), true);
  });
});

test("49. revision rejeita formatos ambiguos e fora de bigint", () => {
  [
    null,
    undefined,
    "",
    "-1",
    "1.0",
    "1e2",
    " 1",
    "1 ",
    "01",
    "9223372036854775808",
    1,
    {},
  ].forEach((revision) => {
    assert.equal(storage.normalizeSyncRevision(revision), null);
    assert.equal(storage.isValidSyncRevision(revision), false);
  });
});

test("50. metadado persiste revision por owner sem payload sensivel", () => {
  const local = memoryStorage();
  storage.saveSyncMeta(local, "auth-1", {
    dirty: true,
    remoteRevision: "25",
    revisionKnown: true,
    payload: financialUser({ password: "must-not-persist" }),
    token: "must-not-persist",
  });
  const raw = local.getItem(storage.syncMetaKey("auth-1"));
  const parsed = JSON.parse(raw);
  assert.equal(parsed.remoteRevision, "25");
  assert.equal(parsed.revisionKnown, true);
  assert.doesNotMatch(raw, /must-not-persist|payload|token|profiles/i);
  assert.deepEqual(
    storage.loadSyncMeta(local, "auth-1"),
    { ...parsed, lastError: "", updatedAt: parsed.updatedAt },
  );
});

test("51. revision local invalida nunca vira zero conhecido", () => {
  const local = memoryStorage({
    [storage.syncMetaKey("auth-1")]: JSON.stringify({
      dirty: true,
      remoteRevision: "01",
      revisionKnown: true,
    }),
  });
  const meta = storage.loadSyncMeta(local, "auth-1");
  assert.equal(meta.remoteRevision, null);
  assert.equal(meta.revisionKnown, false);
});

test("52. guest nao persiste revision remota", () => {
  const local = memoryStorage();
  storage.saveSyncMeta(local, "guest", {
    dirty: true,
    remoteRevision: "8",
    revisionKnown: true,
  }, { guest: true });
  const meta = storage.loadSyncMeta(local, "guest", { guest: true });
  assert.equal(meta.remoteRevision, null);
  assert.equal(meta.revisionKnown, false);
});

test("53. primeira criacao envia zero e confirma revision um", async () => {
  const calls = [];
  const fixture = coordinatorFixture({ save: async (context) => {
    calls.push(clone(context));
    return { outcome: "success", revision: "1", updated_at: fixture.timers.now() };
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "0", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(calls[0].expectedRevision, "0");
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "1");
  assert.equal(fixture.coordinator.getStatus().status, "synced");
});

test("54. atualizacao envia N e confirma N mais um", async () => {
  const calls = [];
  const fixture = coordinatorFixture({ save: async (context) => {
    calls.push(clone(context));
    return { outcome: "success", revision: "26", updated_at: fixture.timers.now() };
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "25", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(calls[0].expectedRevision, "25");
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "26");
});

test("55. success persiste remoteRevision confirmada", async () => {
  const local = memoryStorage();
  const fixture = coordinatorFixture({
    persistMeta: (meta) => storage.saveSyncMeta(local, meta.ownerId, meta),
  });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "0", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  const stored = storage.loadSyncMeta(local, "auth-1");
  assert.equal(stored.remoteRevision, "1");
  assert.equal(stored.revisionKnown, true);
});

test("56. geracao nova usa revision confirmada sem limpar dirty cedo", async () => {
  const first = deferred();
  const second = deferred();
  const calls = [];
  const fixture = coordinatorFixture({ save: (context) => {
    calls.push(clone(context));
    return calls.length === 1 ? first.promise : second.promise;
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "0", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.markDirty();
  first.resolve({ outcome: "success", revision: "1", updated_at: fixture.timers.now() });
  await settle();
  assert.equal(fixture.coordinator.getStatus().dirty, true);
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "1");
  assert.equal(calls[1].expectedRevision, "1");
  second.resolve({ outcome: "success", revision: "2", updated_at: fixture.timers.now() });
  await settle();
  assert.equal(fixture.coordinator.getStatus().status, "synced");
});

test("57. resposta de epoch antigo nao altera revision do owner novo", async () => {
  const pending = deferred();
  const fixture = coordinatorFixture({ save: () => pending.promise });
  fixture.coordinator.activateOwner("owner-a", {
    canSync: true,
    meta: { remoteRevision: "3", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.activateOwner("owner-b", {
    canSync: true,
    meta: { remoteRevision: "9", revisionKnown: true },
  });
  pending.resolve({ outcome: "success", revision: "4", updated_at: fixture.timers.now() });
  await settle();
  const status = fixture.coordinator.getStatus();
  assert.equal(status.ownerId, "owner-b");
  assert.equal(status.remoteRevision, "9");
  assert.equal(status.dirty, false);
});

test("58. conflict mantem dirty, ativa conflict e nao faz retry", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => {
    attempts += 1;
    return { outcome: "conflict", revision: "6", updated_at: null };
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "5", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  await fixture.timers.runAll();
  const status = fixture.coordinator.getStatus();
  assert.equal(attempts, 1);
  assert.equal(status.dirty, true);
  assert.equal(status.conflict, true);
  assert.equal(status.status, "conflict");
  assert.equal(status.remoteRevision, "6");
  assert.equal(status.lastSuccessfulGeneration, 0);
});

test("59. network-error preserva revision e retry usa o mesmo expectedRevision", async () => {
  const expected = [];
  let attempt = 0;
  const fixture = coordinatorFixture({ retryDelays: [1, 1, 1], save: async (context) => {
    attempt += 1;
    expected.push(context.expectedRevision);
    if (attempt === 1) throw sync.createSyncError("network-error", "transient");
    return { outcome: "success", revision: "8", updated_at: fixture.timers.now() };
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "7", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "7");
  await fixture.timers.runAll();
  assert.deepEqual(expected, ["7", "7"]);
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "8");
});

test("60. save posterior ao success usa a revision nova", async () => {
  const expected = [];
  const fixture = coordinatorFixture({ save: async (context) => {
    expected.push(context.expectedRevision);
    return {
      outcome: "success",
      revision: (BigInt(context.expectedRevision) + 1n).toString(),
      updated_at: fixture.timers.now(),
    };
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "10", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.deepEqual(expected, ["10", "11"]);
});

test("61. invalid-payload bloqueia sem retry", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => {
    attempts += 1;
    return { outcome: "invalid-payload", revision: null, updated_at: null };
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "1", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  await fixture.timers.runAll();
  assert.equal(attempts, 1);
  assert.equal(fixture.coordinator.getStatus().blocked, true);
  assert.equal(fixture.coordinator.getStatus().dirty, true);
});

test("62. unauthenticated invalida sync e nao entra em retry", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => {
    attempts += 1;
    throw sync.createSyncError("unauthenticated", "session-required");
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "1", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  await fixture.timers.runAll();
  const status = fixture.coordinator.getStatus();
  assert.equal(attempts, 1);
  assert.equal(status.blocked, true);
  assert.equal(status.canSync, false);
  assert.equal(status.dirty, true);
});

test("63. outcome blocked nao entra em retry", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => {
    attempts += 1;
    return { outcome: "blocked", revision: "9223372036854775807", updated_at: null };
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "9223372036854775807", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  await fixture.timers.runAll();
  assert.equal(attempts, 1);
  assert.equal(fixture.coordinator.getStatus().blocked, true);
});

test("64. resultado malformado bloqueia e nao assume success", async () => {
  const fixture = coordinatorFixture({ save: async () => ({ outcome: "success", revision: "1" }) });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "0", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  const status = fixture.coordinator.getStatus();
  assert.equal(status.blocked, true);
  assert.equal(status.dirty, true);
  assert.equal(status.remoteRevision, "0");
});

test("65. revision retornada invalida bloqueia sem alterar revision", async () => {
  const fixture = coordinatorFixture({
    save: async () => ({
      outcome: "success",
      revision: "01",
      updated_at: "2026-07-27T12:00:00.000Z",
    }),
  });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "0", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(fixture.coordinator.getStatus().blocked, true);
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "0");
});

test("66. revision ausente bloqueia antes de chamar adapter", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => { attempts += 1; } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { dirty: true, remoteRevision: null, revisionKnown: false },
  });
  await fixture.coordinator.flush();
  assert.equal(attempts, 0);
  assert.equal(fixture.coordinator.getStatus().blocked, true);
  assert.equal(fixture.coordinator.getStatus().dirty, true);
});

test("67. linha remota inexistente confirmada permite expectedRevision zero", async () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { dirty: true, localGeneration: 1, remoteRevision: "0", revisionKnown: true },
  });
  await fixture.coordinator.flush();
  assert.equal(fixture.saves[0].expectedRevision, "0");
});

test("68. troca de owner isola revisions", () => {
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("owner-a", {
    canSync: true,
    meta: { remoteRevision: "4", revisionKnown: true },
  });
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "4");
  fixture.coordinator.activateOwner("owner-b", {
    canSync: true,
    meta: { remoteRevision: "12", revisionKnown: true },
  });
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "12");
  fixture.coordinator.activateOwner("owner-a", {
    canSync: true,
    meta: { remoteRevision: "4", revisionKnown: true },
  });
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "4");
});

test("69. mudanca de email preserva revision pelo userId", () => {
  const local = memoryStorage();
  storage.saveSyncMeta(local, "auth-1", { remoteRevision: "14", revisionKnown: true });
  storage.saveOwnerUser(local, "auth-1", financialUser({ email: "old@example.com" }));
  storage.saveOwnerUser(local, "auth-1", financialUser({ email: "new@example.com" }));
  assert.equal(storage.loadSyncMeta(local, "auth-1").remoteRevision, "14");
});

test("70. logout invalida resposta CAS pendente", async () => {
  const pending = deferred();
  const fixture = coordinatorFixture({ save: () => pending.promise });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "2", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.invalidateOwner();
  pending.resolve({ outcome: "success", revision: "3", updated_at: fixture.timers.now() });
  await settle();
  assert.equal(fixture.coordinator.getStatus().remoteRevision, null);
  assert.equal(fixture.coordinator.getStatus().ownerId, "");
});

test("71. adapter usa RPC CAS sem campos controlados pelo servidor", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
  const rpcStart = source.indexOf('.rpc("nexio_save_user_data_cas"');
  assert.ok(rpcStart >= 0);
  const rpcCall = source.slice(rpcStart, rpcStart + 260);
  assert.match(rpcCall, /p_expected_revision:\s*expectedRevision/);
  assert.match(rpcCall, /p_data:\s*payload/);
  assert.doesNotMatch(rpcCall, /user_id|email|updated_at/);
  assert.doesNotMatch(source, /\.upsert\(/);
  assert.match(source, /delete clone\.email/);
});

test("72. bootstrap remoto seleciona revision", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
  assert.match(source, /\.select\("data, revision"\)/);
});

test("73. migration ausente e classificada como bloqueio seguro", () => {
  [
    { code: "PGRST202", message: "function missing" },
    { code: "42703", message: "column revision does not exist" },
  ].forEach((sourceError) => {
    const error = sync.classifySupabaseError(sourceError);
    assert.equal(error.syncCategory, "blocked");
    assert.equal(error.syncReason, "migration-required");
    assert.equal(error.retryable, false);
  });
});

test("74. conflito de bootstrap preserva revision remota conhecida", () => {
  const reconciliation = sync.reconcileBootstrap({
    authUser: { id: "auth-1", email: "owner@example.com" },
    localExists: true,
    localUser: financialUser({ currency: "BRL" }),
    remoteRowExists: true,
    remoteData: financialUser({ currency: "USD" }),
  });
  const fixture = coordinatorFixture();
  fixture.coordinator.activateOwner("auth-1", {
    canSync: false,
    meta: {
      dirty: reconciliation.dirty,
      conflict: reconciliation.conflict,
      remoteRevision: "22",
      revisionKnown: true,
    },
  });
  const status = fixture.coordinator.getStatus();
  assert.equal(status.conflict, true);
  assert.equal(status.remoteRevision, "22");
  assert.equal(status.dirty, true);
});

test("75. resposta RPC valida exatamente uma linha", () => {
  assert.deepEqual(
    sync.normalizeCasResponse([{
      outcome: "success",
      revision: "1",
      updated_at: "2026-07-27T12:00:00.000Z",
    }]),
    {
      outcome: "success",
      revision: "1",
      updatedAt: "2026-07-27T12:00:00.000Z",
    },
  );
  assert.throws(() => sync.normalizeCasResponse([]), /Sync operation failed/);
  assert.throws(() => sync.normalizeCasResponse([{}, {}]), /Sync operation failed/);
});

test("76. success com salto inesperado de revision bloqueia", async () => {
  const fixture = coordinatorFixture({
    save: async () => ({
      outcome: "success",
      revision: "7",
      updated_at: "2026-07-27T12:00:00.000Z",
    }),
  });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "5", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(fixture.coordinator.getStatus().blocked, true);
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "5");
});

test("77. server-error transitorio tem retry limitado", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ maxRetries: 2, retryDelays: [1, 1], save: async () => {
    attempts += 1;
    throw sync.createSyncError("server-error", "transient");
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "3", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  await fixture.timers.runAll();
  assert.equal(attempts, 2);
  assert.equal(fixture.coordinator.getStatus().remoteRevision, "3");
  assert.equal(fixture.coordinator.getStatus().dirty, true);
});

test("78. server-error permanente bloqueia sem retry", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => {
    attempts += 1;
    throw sync.createSyncError("server-error", "permanent");
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "3", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  await fixture.timers.runAll();
  assert.equal(attempts, 1);
  assert.equal(fixture.coordinator.getStatus().blocked, true);
});

test("79. success exige updated_at valido do servidor", async () => {
  const fixture = coordinatorFixture({
    save: async () => ({ outcome: "success", revision: "1", updated_at: "not-a-date" }),
  });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "0", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  assert.equal(fixture.coordinator.getStatus().blocked, true);
  assert.equal(fixture.coordinator.getStatus().lastSuccessAt, "");
});

test("80. SQL versionado remove escrita direta e nao recebe user_id", () => {
  const migration = fs.readFileSync(
    path.join(__dirname, "..", "supabase", "migrations", "20260727000000_add_nexio_sync_revision_cas.sql"),
    "utf8",
  );
  const signature = migration.slice(
    migration.indexOf("create or replace function public.nexio_save_user_data_cas"),
    migration.indexOf("returns table", migration.indexOf("create or replace function public.nexio_save_user_data_cas")),
  );
  assert.doesNotMatch(signature, /user_id/i);
  assert.match(migration, /v_user_id\s*:=\s*auth\.uid\(\)/i);
  assert.match(migration, /revoke insert, update, delete[\s\S]*from authenticated/i);
  assert.match(
    migration,
    /on function public\.nexio_save_user_data_cas\(text, jsonb\)[\s\S]*from public, anon, authenticated/i,
  );
  assert.match(
    migration,
    /revoke all[\s\S]*on public\.nexio_user_data[\s\S]*from public, anon, authenticated/i,
  );
  assert.match(migration, /pg_advisory_xact_lock/i);
  assert.match(migration, /on conflict \(user_id\) do nothing/i);
});

test("81. schema e migration mantem o mesmo contrato RPC", () => {
  const schema = fs.readFileSync(path.join(__dirname, "..", "supabase-schema.sql"), "utf8");
  const migration = fs.readFileSync(
    path.join(__dirname, "..", "supabase", "migrations", "20260727000000_add_nexio_sync_revision_cas.sql"),
    "utf8",
  );
  [
    "revision bigint",
    "nexio_user_data_revision_nonnegative",
    "nexio_user_data_set_updated_at",
    "nexio_save_user_data_cas",
    "security definer",
    "set search_path = ''",
  ].forEach((contractPart) => {
    assert.ok(schema.toLowerCase().includes(contractPart));
    assert.ok(migration.toLowerCase().includes(contractPart));
  });
});

test("82. bootstrap sem migration bloqueia e mantem dados locais", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "shared-ui.js"), "utf8");
  assert.match(source, /syncError\.syncReason !== "migration-required"/);
  assert.match(source, /remoteRevision:\s*null,[\s\S]{0,80}revisionKnown:\s*false/);
  assert.match(
    source,
    /A sincronização precisa ser atualizada no servidor\. Seus dados continuam salvos neste dispositivo\./,
  );
  assert.doesNotMatch(source, /\.upsert\(/);
});

test("83. migration-required bloqueia sem retry", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => {
    attempts += 1;
    throw sync.classifySupabaseError({
      code: "PGRST202",
      message: "Could not find the function in the schema cache",
    });
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "1", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  await fixture.timers.runAll();
  assert.equal(attempts, 1);
  assert.equal(fixture.coordinator.getStatus().blocked, true);
  assert.equal(fixture.coordinator.getStatus().dirty, true);
});

test("84. conflict bloqueia saves automaticos posteriores", async () => {
  let attempts = 0;
  const fixture = coordinatorFixture({ save: async () => {
    attempts += 1;
    return { outcome: "conflict", revision: "2", updated_at: null };
  } });
  fixture.coordinator.activateOwner("auth-1", {
    canSync: true,
    meta: { remoteRevision: "1", revisionKnown: true },
  });
  fixture.coordinator.markDirty();
  await fixture.timers.advance(10);
  fixture.coordinator.markDirty();
  fixture.coordinator.scheduleSave();
  await fixture.timers.runAll();
  assert.equal(attempts, 1);
  assert.equal(fixture.coordinator.getStatus().conflict, true);
  assert.equal(fixture.coordinator.getStatus().dirty, true);
});

test("85. outcome desconhecido ou revision ausente sao malformados", () => {
  assert.throws(
    () => sync.normalizeCasResponse({ outcome: "unknown", revision: "1", updated_at: null }),
    /Sync operation failed/,
  );
  assert.throws(
    () => sync.normalizeCasResponse({
      outcome: "success",
      revision: null,
      updated_at: "2026-07-27T12:00:00.000Z",
    }),
    /Sync operation failed/,
  );
});

(async () => {
  for (const { name, callback } of tests) {
    try {
      await callback();
      console.log(`ok - ${name}`);
    } catch (error) {
      console.error(`not ok - ${name}`);
      throw error;
    }
  }
  console.log(`${tests.length} sync safety tests passed.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
