"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const migrationPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20260727000000_add_nexio_sync_revision_cas.sql",
);
const sql = fs.readFileSync(migrationPath, "utf8");
const normalized = sql.replace(/\r\n/g, "\n");
const executable = normalized
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

const tests = [];

function test(name, callback) {
  tests.push({ name, callback });
}

test("adds revision to a legacy schema without recreating the table", () => {
  assert.match(executable, /alter table public\.nexio_user_data\s+add column if not exists revision bigint;/i);
  assert.doesNotMatch(executable, /\b(?:drop|create)\s+table\s+(?:if\s+exists\s+)?public\.nexio_user_data\b/i);
});

test("initializes only legacy rows whose revision is null", () => {
  assert.match(
    executable,
    /update public\.nexio_user_data\s+set revision = 1\s+where revision is null;/i,
  );
});

test("never updates or replaces the financial data column during migration", () => {
  const beforeFunction = executable.split(/create or replace function public\.nexio_save_user_data_cas/i)[0];
  assert.doesNotMatch(beforeFunction, /\bset\s+(?:[^;]*,\s*)?data\s*=/i);
  assert.doesNotMatch(beforeFunction, /\binsert\s+into\s+public\.nexio_user_data\b/i);
  assert.doesNotMatch(beforeFunction, /\bdelete\s+from\s+public\.nexio_user_data\b/i);
});

test("preserves legacy updated_at while revision is backfilled", () => {
  const dropTrigger = executable.search(/drop trigger if exists nexio_user_data_set_updated_at/i);
  const backfill = executable.search(/update public\.nexio_user_data\s+set revision = 1/i);
  const createTrigger = executable.search(/create trigger nexio_user_data_set_updated_at/i);
  assert.ok(dropTrigger >= 0 && dropTrigger < backfill);
  assert.ok(createTrigger > backfill);
});

test("enforces bigint revision default 1 and not null", () => {
  assert.match(
    executable,
    /alter table public\.nexio_user_data\s+alter column revision set default 1,\s+alter column revision set not null;/i,
  );
});

test("enforces and validates a nonnegative revision constraint", () => {
  assert.match(executable, /check \(revision >= 0\) not valid;/i);
  assert.match(executable, /validate constraint nexio_user_data_revision_nonnegative;/i);
});

test("documents persisted revision 1 and logical no-row revision 0", () => {
  assert.match(
    normalized,
    /Persisted rows start at 1; logical revision 0 means no row\./,
  );
});

test("keeps the CAS RPC owner derived only from auth.uid", () => {
  assert.match(executable, /v_user_id := auth\.uid\(\);/i);
  assert.doesNotMatch(executable, /p_user_id/i);
});

test("creates a new row only from expected revision zero at revision one", () => {
  assert.match(executable, /if v_expected_revision <> 0 then[\s\S]*?select 'conflict'::text, '0'::text/i);
  assert.match(executable, /values \(\s*v_user_id,\s*v_email,\s*p_data,\s*1\s*\)/i);
});

test("increments existing rows atomically without changing the storage model", () => {
  assert.match(
    executable,
    /set email = v_email,\s+data = p_data,\s+revision = user_data\.revision \+ 1\s+where user_data\.user_id = v_user_id\s+and user_data\.revision = v_expected_revision/i,
  );
});

test("requires authenticated clients to write through the CAS RPC", () => {
  assert.match(executable, /grant execute\s+on function public\.nexio_save_user_data_cas\(text, jsonb\)\s+to authenticated;/i);
  assert.match(executable, /revoke insert, update, delete\s+on public\.nexio_user_data\s+from authenticated;/i);
});

test("runs the schema change transactionally", () => {
  assert.match(executable.trim(), /^begin;/i);
  assert.match(executable.trim(), /commit;$/i);
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
  console.log(`${passed}/${tests.length} Supabase revision migration tests passed.`);
})();
