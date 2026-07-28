-- pgTAP regression coverage for the Nexio revision/CAS migration.
-- Prerequisite: run against a disposable local database with both Nexio
-- migrations already applied. This file is intended for `supabase test db`.
-- It contains no credentials and rolls back all test data.
--
-- The role and claim tests below simulate PostgREST database context only.
-- They do not validate JWT signatures or the external Supabase Auth gateway.
-- Real concurrency requires two database sessions and is documented manually
-- at the end of this file; it is not executed by this pgTAP script.

begin;

select plan(47);

-- ---------------------------------------------------------------------------
-- 1. CATALOG TESTS (9 assertions)
-- ---------------------------------------------------------------------------

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'nexio_user_data'
      and column_name = 'revision'
      and data_type = 'bigint'
      and is_nullable = 'NO'
      and column_default like '1%'
  ),
  'revision is a non-null bigint with default 1'
);

select ok(
  not exists (
    select 1
    from public.nexio_user_data
    where revision is null
  ),
  'all existing rows have a revision'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.nexio_user_data'::regclass
      and conname = 'nexio_user_data_revision_nonnegative'
      and convalidated
  ),
  'revision nonnegative constraint exists and is validated'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_class
    where oid = 'public.nexio_user_data'::regclass
      and relrowsecurity
  ),
  'row level security is enabled'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'nexio_user_data'
      and policyname = 'Nexio users can read own data'
      and cmd = 'SELECT'
  )
  and not exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'nexio_user_data'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ),
  'CAS migration retains only the authenticated read policy'
);

select ok(
  not pg_catalog.has_table_privilege(
    'authenticated', 'public.nexio_user_data', 'INSERT'
  )
  and not pg_catalog.has_table_privilege(
    'authenticated', 'public.nexio_user_data', 'UPDATE'
  )
  and not pg_catalog.has_table_privilege(
    'authenticated', 'public.nexio_user_data', 'DELETE'
  ),
  'authenticated has no direct table write privileges'
);

select ok(
  pg_catalog.has_table_privilege(
    'authenticated', 'public.nexio_user_data', 'SELECT'
  )
  and not pg_catalog.has_table_privilege(
    'anon', 'public.nexio_user_data', 'SELECT'
  )
  and not pg_catalog.has_table_privilege(
    'anon', 'public.nexio_user_data', 'INSERT'
  )
  and not pg_catalog.has_table_privilege(
    'anon', 'public.nexio_user_data', 'UPDATE'
  )
  and not pg_catalog.has_table_privilege(
    'anon', 'public.nexio_user_data', 'DELETE'
  ),
  'table grants follow least privilege'
);

select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.nexio_save_user_data_cas(text,jsonb)',
    'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'anon',
    'public.nexio_save_user_data_cas(text,jsonb)',
    'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'authenticated',
    'public.nexio_user_data_set_updated_at()',
    'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'anon',
    'public.nexio_user_data_set_updated_at()',
    'EXECUTE'
  )
  and not exists (
    select 1
    from pg_catalog.pg_proc as procedures
    cross join lateral pg_catalog.aclexplode(
      coalesce(
        procedures.proacl,
        pg_catalog.acldefault('f', procedures.proowner)
      )
    ) as privileges
    where procedures.oid in (
      pg_catalog.to_regprocedure(
        'public.nexio_save_user_data_cas(text,jsonb)'
      ),
      pg_catalog.to_regprocedure('public.nexio_user_data_set_updated_at()')
    )
      and privileges.grantee = 0
      and privileges.privilege_type = 'EXECUTE'
  ),
  'only authenticated can execute the CAS RPC; helper and PUBLIC stay revoked'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_roles as owners
      on owners.oid = procedures.proowner
    where procedures.oid = pg_catalog.to_regprocedure(
      'public.nexio_save_user_data_cas(text,jsonb)'
    )
      and procedures.prosecdef
      and owners.rolname not in ('anon', 'authenticated')
      and pg_catalog.oidvectortypes(procedures.proargtypes) = 'text, jsonb'
      and procedures.proargnames[1:2] = array[
        'p_expected_revision',
        'p_data'
      ]::text[]
      and not (
        'user_id' = any(
          coalesce(procedures.proargnames, '{}'::text[])
        )
      )
      and not (
        'p_user_id' = any(
          coalesce(procedures.proargnames, '{}'::text[])
        )
      )
      and not (
        'data' = any(
          coalesce(procedures.proargnames, '{}'::text[])
        )
      )
      and procedures.proargnames @> array[
        'outcome',
        'revision',
        'updated_at'
      ]::text[]
      and exists (
        select 1
        from pg_catalog.unnest(
          coalesce(procedures.proconfig, '{}'::text[])
        ) as configurations(setting)
        where pg_catalog.split_part(configurations.setting, '=', 1)
              = 'search_path'
          and pg_catalog.btrim(
            pg_catalog.split_part(configurations.setting, '=', 2),
            '"'
          ) = ''
      )
  ),
  'CAS RPC has hardened SECURITY DEFINER metadata and no user_id/data interface'
);

-- Shared fixtures record results while calls run as API roles. All assertions
-- themselves remain pgTAP assertions.
create temporary table cas_test_results (
  test_order integer primary key,
  label text unique not null,
  outcome text,
  revision text,
  updated_at timestamptz
) on commit drop;

create temporary table cas_test_snapshots (
  label text primary key,
  data jsonb not null,
  email text not null,
  updated_at timestamptz not null
) on commit drop;

create temporary table cas_test_observations (
  label text primary key,
  bool_value boolean,
  text_value text
) on commit drop;

grant select, insert on cas_test_results to authenticated, anon;
grant select, insert on cas_test_snapshots to authenticated, anon;
grant select, insert on cas_test_observations to authenticated, anon;

insert into auth.users (id, email)
values
  ('00000000-0000-4000-8000-0000000000a1', 'cas-a@example.invalid'),
  ('00000000-0000-4000-8000-0000000000b2', 'cas-b@example.invalid')
on conflict (id) do update
set email = excluded.email;

delete from public.nexio_user_data
where user_id in (
  '00000000-0000-4000-8000-0000000000a1',
  '00000000-0000-4000-8000-0000000000b2'
);

-- ---------------------------------------------------------------------------
-- 2. FUNCTIONAL TESTS IN ONE AUTHENTICATED SESSION (27 assertions)
-- ---------------------------------------------------------------------------

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-0000000000a1',
  true
);
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}',
  true
);

set local role authenticated;

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select 10, 'create', result.outcome, result.revision, result.updated_at
from public.nexio_save_user_data_cas(
  '0',
  '{"profiles":[],"marker":"created-by-a"}'::jsonb
) as result;

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select 11, 'matching-update', result.outcome, result.revision, result.updated_at
from public.nexio_save_user_data_cas(
  '1',
  '{"profiles":[],"marker":"updated-by-a"}'::jsonb
) as result;

insert into pg_temp.cas_test_snapshots (label, data, email, updated_at)
select 'before-stale', data, email, updated_at
from public.nexio_user_data
where user_id = auth.uid();

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select 12, 'stale-update', result.outcome, result.revision, result.updated_at
from public.nexio_save_user_data_cas(
  '1',
  '{"profiles":[],"marker":"stale-overwrite"}'::jsonb
) as result;

insert into pg_temp.cas_test_snapshots (label, data, email, updated_at)
select 'after-stale', data, email, updated_at
from public.nexio_user_data
where user_id = auth.uid();

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select
  inputs.test_order,
  inputs.label,
  result.outcome,
  result.revision,
  result.updated_at
from (
  values
    (20, 'invalid-revision-empty', ''::text),
    (21, 'invalid-revision-plus', '+1'),
    (22, 'invalid-revision-negative', '-1'),
    (23, 'invalid-revision-decimal', '1.0'),
    (24, 'invalid-revision-exponent', '1e2'),
    (25, 'invalid-revision-leading-space', ' 1'),
    (26, 'invalid-revision-trailing-space', '1 '),
    (27, 'invalid-revision-leading-zero', '01'),
    (28, 'invalid-revision-text', 'arbitrary'),
    (29, 'invalid-revision-overflow', '9223372036854775808'),
    (30, 'invalid-revision-null', null)
) as inputs (test_order, label, expected_revision)
cross join lateral public.nexio_save_user_data_cas(
  inputs.expected_revision,
  '{"profiles":[]}'::jsonb
) as result;

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select
  inputs.test_order,
  inputs.label,
  result.outcome,
  result.revision,
  result.updated_at
from (
  values
    (40, 'invalid-data-json-null', 'null'::jsonb),
    (41, 'invalid-data-array', '[]'::jsonb),
    (42, 'invalid-data-string', '"text"'::jsonb),
    (43, 'invalid-data-number', '10'::jsonb),
    (44, 'invalid-data-boolean', 'true'::jsonb)
) as inputs (test_order, label, payload)
cross join lateral public.nexio_save_user_data_cas(
  '2',
  inputs.payload
) as result;

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select 45, 'empty-object', result.outcome, result.revision, result.updated_at
from public.nexio_save_user_data_cas('2', '{}'::jsonb) as result;

reset role;

select is(outcome, 'success'::text, 'first create succeeds')
from pg_temp.cas_test_results
where label = 'create';

select is(revision, '1'::text, 'first create returns revision 1')
from pg_temp.cas_test_results
where label = 'create';

select ok(updated_at is not null, 'first create returns server updated_at')
from pg_temp.cas_test_results
where label = 'create';

select is(outcome, 'success'::text, 'matching revision updates')
from pg_temp.cas_test_results
where label = 'matching-update';

select is(revision, '2'::text, 'matching update advances revision to 2')
from pg_temp.cas_test_results
where label = 'matching-update';

select is(outcome, 'conflict'::text, 'stale revision conflicts')
from pg_temp.cas_test_results
where label = 'stale-update';

select is(revision, '2'::text, 'stale conflict reports current revision')
from pg_temp.cas_test_results
where label = 'stale-update';

select ok(
  not (pg_catalog.to_jsonb(results) ? 'data'),
  'conflict response contains no financial data'
)
from pg_temp.cas_test_results as results
where label = 'stale-update';

select ok(
  exists (
    select 1
    from pg_temp.cas_test_snapshots as before_state
    join pg_temp.cas_test_snapshots as after_state
      on before_state.label = 'before-stale'
     and after_state.label = 'after-stale'
     and before_state.data = after_state.data
     and before_state.email = after_state.email
     and before_state.updated_at = after_state.updated_at
  ),
  'stale conflict changes no stored data, email, or updated_at'
);

select is(
  outcome,
  'invalid-payload'::text,
  pg_catalog.format('%s returns invalid-payload', label)
)
from pg_temp.cas_test_results
where label like 'invalid-revision-%'
order by test_order;

select is(
  outcome,
  'invalid-payload'::text,
  pg_catalog.format('%s returns invalid-payload', label)
)
from pg_temp.cas_test_results
where label like 'invalid-data-%'
order by test_order;

select is(outcome, 'success'::text, 'empty JSON object is valid')
from pg_temp.cas_test_results
where label = 'empty-object';

select is(revision, '3'::text, 'empty JSON object advances revision to 3')
from pg_temp.cas_test_results
where label = 'empty-object';

select pg_catalog.set_config('request.jwt.claim.sub', '', true);
select pg_catalog.set_config('request.jwt.claims', '{}', true);

-- ---------------------------------------------------------------------------
-- 3. SEQUENTIAL CONFLICT TEST (4 assertions)
-- This is deterministic single-session sequencing, not real concurrency.
-- ---------------------------------------------------------------------------

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-0000000000a1',
  true
);
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}',
  true
);

set local role authenticated;

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select 50, 'sequential-winner', result.outcome, result.revision, result.updated_at
from public.nexio_save_user_data_cas(
  '3',
  '{"profiles":[],"marker":"winner"}'::jsonb
) as result;

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select 51, 'sequential-loser', result.outcome, result.revision, result.updated_at
from public.nexio_save_user_data_cas(
  '3',
  '{"profiles":[],"marker":"loser"}'::jsonb
) as result;

reset role;

select pg_catalog.set_config('request.jwt.claim.sub', '', true);
select pg_catalog.set_config('request.jwt.claims', '{}', true);

select is(outcome, 'success'::text, 'first sequential client wins')
from pg_temp.cas_test_results
where label = 'sequential-winner';

select is(revision, '4'::text, 'sequential winner advances revision to 4')
from pg_temp.cas_test_results
where label = 'sequential-winner';

select is(outcome, 'conflict'::text, 'second sequential client conflicts')
from pg_temp.cas_test_results
where label = 'sequential-loser';

select is(revision, '4'::text, 'sequential loser sees winner revision')
from pg_temp.cas_test_results
where label = 'sequential-loser';

-- ---------------------------------------------------------------------------
-- 4. ROLE AND CLAIM SIMULATION TESTS (7 assertions)
-- ---------------------------------------------------------------------------

insert into public.nexio_user_data (user_id, email, data, revision)
values (
  '00000000-0000-4000-8000-0000000000b2',
  'cas-b@example.invalid',
  '{"profiles":[],"marker":"belongs-to-b"}'::jsonb,
  1
);

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-0000000000a1',
  true
);
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}',
  true
);

set local role authenticated;

insert into pg_temp.cas_test_observations (label, bool_value)
select
  'user-b-hidden-from-a',
  not exists (
    select 1
    from public.nexio_user_data
    where user_id = '00000000-0000-4000-8000-0000000000b2'
  );

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select 60, 'claim-a-save', result.outcome, result.revision, result.updated_at
from public.nexio_save_user_data_cas(
  '4',
  '{"profiles":[],"marker":"a-cannot-target-b"}'::jsonb
) as result;

reset role;

select pg_catalog.set_config('request.jwt.claim.sub', '', true);
select pg_catalog.set_config('request.jwt.claims', '{}', true);

select ok(bool_value, 'RLS hides user B from user A')
from pg_temp.cas_test_observations
where label = 'user-b-hidden-from-a';

select is(outcome, 'success'::text, 'claim for user A saves only user A')
from pg_temp.cas_test_results
where label = 'claim-a-save';

select ok(
  exists (
    select 1
    from public.nexio_user_data
    where user_id = '00000000-0000-4000-8000-0000000000b2'
      and data ->> 'marker' = 'belongs-to-b'
      and revision = 1
  ),
  'user A cannot modify user B'
);

update public.nexio_user_data
set revision = 9223372036854775807
where user_id = '00000000-0000-4000-8000-0000000000a1';

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-0000000000a1',
  true
);
select pg_catalog.set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}',
  true
);

set local role authenticated;

insert into pg_temp.cas_test_results
  (test_order, label, outcome, revision, updated_at)
select 61, 'max-revision', result.outcome, result.revision, result.updated_at
from public.nexio_save_user_data_cas(
  '9223372036854775807',
  '{"profiles":[],"marker":"must-not-overflow"}'::jsonb
) as result;

reset role;

select pg_catalog.set_config('request.jwt.claim.sub', '', true);
select pg_catalog.set_config('request.jwt.claims', '{}', true);

select is(outcome, 'blocked'::text, 'maximum bigint revision is blocked')
from pg_temp.cas_test_results
where label = 'max-revision';

select is(
  revision,
  '9223372036854775807'::text,
  'blocked maximum revision remains unchanged'
)
from pg_temp.cas_test_results
where label = 'max-revision';

set local role anon;

do $test$
declare
  returned_state text := 'no-error';
begin
  begin
    perform public.nexio_save_user_data_cas('0', '{"profiles":[]}'::jsonb);
  exception
    when others then
      get stacked diagnostics returned_state = returned_sqlstate;
  end;

  insert into pg_temp.cas_test_observations (label, text_value)
  values ('anon-rpc-sqlstate', returned_state);
end;
$test$;

reset role;

select pg_catalog.set_config('request.jwt.claim.sub', '', true);
select pg_catalog.set_config('request.jwt.claims', '{}', true);

set local role authenticated;

do $test$
declare
  returned_state text := 'no-error';
begin
  begin
    perform public.nexio_save_user_data_cas('0', '{"profiles":[]}'::jsonb);
  exception
    when others then
      get stacked diagnostics returned_state = returned_sqlstate;
  end;

  insert into pg_temp.cas_test_observations (label, text_value)
  values ('missing-claim-sqlstate', returned_state);
end;
$test$;

reset role;

select is(text_value, '42501'::text, 'anon cannot execute the CAS RPC')
from pg_temp.cas_test_observations
where label = 'anon-rpc-sqlstate';

select is(
  text_value,
  '42501'::text,
  'authenticated role without a user claim is rejected'
)
from pg_temp.cas_test_observations
where label = 'missing-claim-sqlstate';

-- ---------------------------------------------------------------------------
-- 5. MANUAL REAL-CONCURRENCY PROCEDURE (not executed by this file)
-- ---------------------------------------------------------------------------
-- Administrative prerequisite in a disposable local project:
--   Create one auth.users row and one nexio_user_data row at revision N.
--
-- Session A:
--   begin;
--   select set_config('request.jwt.claim.sub', '<same-test-user-uuid>', true);
--   select set_config(
--     'request.jwt.claims',
--     '{"sub":"<same-test-user-uuid>","role":"authenticated"}',
--     true
--   );
--   set local role authenticated;
--   select * from public.nexio_save_user_data_cas(
--     '<N>', '{"profiles":[],"marker":"session-a"}'::jsonb
--   );
--   -- Expect success/N+1. Keep the transaction open and do not commit yet.
--
-- Session B, while Session A remains open:
--   begin;
--   select set_config('request.jwt.claim.sub', '<same-test-user-uuid>', true);
--   select set_config(
--     'request.jwt.claims',
--     '{"sub":"<same-test-user-uuid>","role":"authenticated"}',
--     true
--   );
--   set local role authenticated;
--   select * from public.nexio_save_user_data_cas(
--     '<N>', '{"profiles":[],"marker":"session-b"}'::jsonb
--   );
--   -- Confirm this call waits for Session A.
--
-- Back in Session A:
--   commit;
--
-- Session B must then return conflict/N+1 without changing stored columns:
--   rollback;
--
-- Repeat with no nexio_user_data row and expected revision '0' to validate the
-- creation race: exactly one success/'1', one conflict/'1', and no exposed
-- primary-key exception. This procedure requires no optional extensions.

select * from finish();

rollback;
