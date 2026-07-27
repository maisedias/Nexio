-- Local Supabase/PostgreSQL regression script for Nexio revision/CAS.
-- Prerequisite: apply the migration to a disposable local database first.
-- This file contains no credentials and rolls back all test data.
-- It was authored for review but is not executed by the repository's Node suite.
--
-- Classification:
-- * Catalog assertions are static checks of the migrated database.
-- * RPC assertions are functional, single-session checks.
-- * SET ROLE tests depend on local anon/authenticated roles.
-- * request.jwt.* settings simulate PostgREST claims; they do not validate JWT
--   signature verification or the external Supabase Auth gateway.
-- * The final two-session procedure is manual and is not executed by this file.

begin;

create or replace function pg_temp.assert_true(condition boolean, message text)
returns void
language plpgsql
as $function$
begin
  if condition is not true then
    raise exception 'assertion failed: %', message;
  end if;
end;
$function$;

select pg_temp.assert_true(
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
  'migration must add a non-null bigint revision'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from public.nexio_user_data
    where revision is null
  ),
  'all existing rows must receive a revision'
);

select pg_temp.assert_true(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.nexio_user_data'::regclass
      and conname = 'nexio_user_data_revision_nonnegative'
      and convalidated
  ),
  'revision nonnegative constraint must exist and be valid'
);

select pg_temp.assert_true(
  not pg_catalog.has_table_privilege('authenticated', 'public.nexio_user_data', 'INSERT')
  and not pg_catalog.has_table_privilege('authenticated', 'public.nexio_user_data', 'UPDATE')
  and not pg_catalog.has_table_privilege('authenticated', 'public.nexio_user_data', 'DELETE'),
  'authenticated must not have direct table write privileges'
);

select pg_temp.assert_true(
  pg_catalog.has_table_privilege('authenticated', 'public.nexio_user_data', 'SELECT')
  and not pg_catalog.has_table_privilege('anon', 'public.nexio_user_data', 'SELECT')
  and not pg_catalog.has_table_privilege('anon', 'public.nexio_user_data', 'INSERT')
  and not pg_catalog.has_table_privilege('anon', 'public.nexio_user_data', 'UPDATE')
  and not pg_catalog.has_table_privilege('anon', 'public.nexio_user_data', 'DELETE'),
  'table grants must be least privilege'
);

select pg_temp.assert_true(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.nexio_save_user_data_cas(text,jsonb)',
    'EXECUTE'
  )
  and not pg_catalog.has_function_privilege(
    'anon',
    'public.nexio_save_user_data_cas(text,jsonb)',
    'EXECUTE'
  ),
  'only authenticated may execute the CAS RPC'
);

select pg_temp.assert_true(
  exists (
    select 1
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    join pg_catalog.pg_roles as owners
      on owners.oid = procedures.proowner
    where namespaces.nspname = 'public'
      and procedures.proname = 'nexio_save_user_data_cas'
      and owners.rolname not in ('anon', 'authenticated')
  ),
  'SECURITY DEFINER owner must be an administrative role'
);

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

do $test$
declare
  result_row record;
begin
  select *
  into result_row
  from public.nexio_save_user_data_cas(
    '0',
    '{"profiles":[],"marker":"created-by-a"}'::jsonb
  );

  perform pg_temp.assert_true(result_row.outcome = 'success', 'first create must succeed');
  perform pg_temp.assert_true(result_row.revision = '1', 'first create must return revision 1');
  perform pg_temp.assert_true(result_row.updated_at is not null, 'server must return updated_at');
end;
$test$;

do $test$
declare
  result_row record;
begin
  select *
  into result_row
  from public.nexio_save_user_data_cas(
    '1',
    '{"profiles":[],"marker":"updated-by-a"}'::jsonb
  );

  perform pg_temp.assert_true(result_row.outcome = 'success', 'matching revision must update');
  perform pg_temp.assert_true(result_row.revision = '2', 'revision 1 must advance to 2');
end;
$test$;

do $test$
declare
  result_row record;
  before_data jsonb;
  before_email text;
  before_updated_at timestamptz;
begin
  select data, email, updated_at
  into before_data, before_email, before_updated_at
  from public.nexio_user_data
  where user_id = auth.uid();

  select *
  into result_row
  from public.nexio_save_user_data_cas(
    '1',
    '{"profiles":[],"marker":"stale-overwrite"}'::jsonb
  );

  perform pg_temp.assert_true(result_row.outcome = 'conflict', 'stale revision must conflict');
  perform pg_temp.assert_true(result_row.revision = '2', 'conflict must report current revision');
  perform pg_temp.assert_true(
    not (pg_catalog.to_jsonb(result_row) ? 'data'),
    'conflict response must not contain financial data'
  );
  perform pg_temp.assert_true(
    exists (
      select 1
      from public.nexio_user_data
      where user_id = auth.uid()
        and data = before_data
        and email = before_email
        and updated_at = before_updated_at
    ),
    'conflict must not alter data, email, or updated_at'
  );
end;
$test$;

-- Sequential conflict regression only; this is not a simultaneous-concurrency
-- test. It verifies the deterministic result after one writer already won.
do $test$
declare
  first_result record;
  second_result record;
begin
  select * into first_result
  from public.nexio_save_user_data_cas(
    '2',
    '{"profiles":[],"marker":"winner"}'::jsonb
  );

  select * into second_result
  from public.nexio_save_user_data_cas(
    '2',
    '{"profiles":[],"marker":"loser"}'::jsonb
  );

  perform pg_temp.assert_true(first_result.outcome = 'success', 'first client must win');
  perform pg_temp.assert_true(first_result.revision = '3', 'winner must advance revision');
  perform pg_temp.assert_true(second_result.outcome = 'conflict', 'second client must conflict');
  perform pg_temp.assert_true(second_result.revision = '3', 'loser sees winner revision');
end;
$test$;

do $test$
declare
  invalid_revision text;
  result_row record;
begin
  foreach invalid_revision in array array[
    '', '+1', '-1', '1.0', '1e2', ' 1', '1 ', '01', 'arbitrary',
    '9223372036854775808'
  ]
  loop
    select * into result_row
    from public.nexio_save_user_data_cas(
      invalid_revision,
      '{"profiles":[]}'::jsonb
    );
    perform pg_temp.assert_true(
      result_row.outcome = 'invalid-payload',
      'invalid revision must be rejected'
    );
  end loop;

  select * into result_row
  from public.nexio_save_user_data_cas(null, '{"profiles":[]}'::jsonb);
  perform pg_temp.assert_true(
    result_row.outcome = 'invalid-payload',
    'null revision must be rejected'
  );
end;
$test$;

do $test$
declare
  invalid_data jsonb;
  result_row record;
begin
  foreach invalid_data in array array[
    'null'::jsonb,
    '[]'::jsonb,
    '"text"'::jsonb,
    '10'::jsonb,
    'true'::jsonb
  ]
  loop
    select * into result_row
    from public.nexio_save_user_data_cas('3', invalid_data);
    perform pg_temp.assert_true(
      result_row.outcome = 'invalid-payload',
      'non-object data must be rejected'
    );
  end loop;
end;
$test$;

do $test$
declare
  result_row record;
begin
  select * into result_row
  from public.nexio_save_user_data_cas('3', '{}'::jsonb);
  perform pg_temp.assert_true(result_row.outcome = 'success', 'empty JSON object is valid');
  perform pg_temp.assert_true(result_row.revision = '4', 'empty object advances revision');
end;
$test$;

reset role;

-- A call authenticated as A can only touch A because the RPC has no user_id
-- parameter. B remains unchanged.
insert into public.nexio_user_data (user_id, email, data, revision)
values (
  '00000000-0000-4000-8000-0000000000b2',
  'cas-b@example.invalid',
  '{"profiles":[],"marker":"belongs-to-b"}'::jsonb,
  1
);

set local role authenticated;

do $test$
begin
  perform pg_temp.assert_true(
    not exists (
      select 1
      from public.nexio_user_data
      where user_id = '00000000-0000-4000-8000-0000000000b2'
    ),
    'RLS must hide user B from user A'
  );
  perform public.nexio_save_user_data_cas(
    '4',
    '{"profiles":[],"marker":"a-cannot-target-b"}'::jsonb
  );
end;
$test$;

reset role;

select pg_temp.assert_true(
  exists (
    select 1
    from public.nexio_user_data
    where user_id = '00000000-0000-4000-8000-0000000000b2'
      and data ->> 'marker' = 'belongs-to-b'
      and revision = 1
  ),
  'user A must not modify user B'
);

update public.nexio_user_data
set revision = 9223372036854775807
where user_id = '00000000-0000-4000-8000-0000000000a1';

set local role authenticated;

do $test$
declare
  result_row record;
begin
  select * into result_row
  from public.nexio_save_user_data_cas(
    '9223372036854775807',
    '{"profiles":[],"marker":"must-not-overflow"}'::jsonb
  );
  perform pg_temp.assert_true(result_row.outcome = 'blocked', 'max bigint must block');
  perform pg_temp.assert_true(
    result_row.revision = '9223372036854775807',
    'blocked max revision must remain unchanged'
  );
end;
$test$;

reset role;

set local role anon;

do $test$
begin
  perform public.nexio_save_user_data_cas('0', '{"profiles":[]}'::jsonb);
  raise exception using
    errcode = 'check_violation',
    message = 'anon unexpectedly executed CAS RPC';
exception
  when insufficient_privilege then
    null;
end;
$test$;

reset role;

select pg_catalog.set_config('request.jwt.claim.sub', '', true);
select pg_catalog.set_config('request.jwt.claims', '{}', true);
set local role authenticated;

do $test$
declare
  returned_state text;
begin
  perform public.nexio_save_user_data_cas('0', '{"profiles":[]}'::jsonb);
  raise exception using
    errcode = 'check_violation',
    message = 'authenticated caller without session unexpectedly executed CAS RPC';
exception
  when others then
    get stacked diagnostics returned_state = returned_sqlstate;
    if returned_state <> '42501' then
      raise;
    end if;
end;
$test$;

reset role;

-- MANUAL TWO-SESSION TEST (not executed here)
-- Administrative prerequisite in a disposable local project:
--   create a test auth.users row and a nexio_user_data row at revision N.
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
--   -- Expect success/N+1. Do not commit yet; keep the advisory lock.
--
-- Session B, while Session A remains uncommitted:
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
-- Session B must then return conflict/N+1 without changing any column:
--   rollback;
--
-- Repeat with no nexio_user_data row and expected revision '0' to validate the
-- creation race: exactly one success/'1', one conflict/'1', and no exposed PK
-- exception. No dblink or pg_background extension is required.

rollback;
