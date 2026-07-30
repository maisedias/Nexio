-- Nexio atomic snapshot synchronization using revision compare-and-swap.
-- Apply with a trusted migration owner that can read auth.users and write
-- public.nexio_user_data. Do not change the function owner to anon or authenticated.
-- STOP deployment if the resulting function owner is not a trusted administrative
-- role. Verify the owner explicitly in a disposable environment before production.

begin;

-- Disable a prior copy of the trigger before a possible repair backfill so an
-- idempotent rerun does not change updated_at on existing financial snapshots.
drop trigger if exists nexio_user_data_set_updated_at
on public.nexio_user_data;

alter table public.nexio_user_data
  add column if not exists revision bigint;

-- Existing snapshots are established remote states. Revision 0 is reserved for
-- the logical state where no row exists.
update public.nexio_user_data
set revision = 1
where revision is null;

alter table public.nexio_user_data
  alter column revision set default 1,
  alter column revision set not null;

alter table public.nexio_user_data
  drop constraint if exists nexio_user_data_revision_nonnegative;

alter table public.nexio_user_data
  add constraint nexio_user_data_revision_nonnegative
  check (revision >= 0) not valid;

alter table public.nexio_user_data
  validate constraint nexio_user_data_revision_nonnegative;

comment on column public.nexio_user_data.revision is
  'Monotonic CAS revision. Persisted rows start at 1; logical revision 0 means no row.';

create or replace function public.nexio_user_data_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

revoke all
on function public.nexio_user_data_set_updated_at()
from public, anon, authenticated;

create trigger nexio_user_data_set_updated_at
before insert or update on public.nexio_user_data
for each row
execute function public.nexio_user_data_set_updated_at();

create or replace function public.nexio_save_user_data_cas(
  p_expected_revision text,
  p_data jsonb
)
returns table (
  outcome text,
  revision text,
  updated_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_email text;
  v_expected_revision bigint;
  v_current_revision bigint;
  v_server_updated_at timestamptz;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception
      using errcode = '42501',
            message = 'authentication required';
  end if;

  if p_expected_revision is null
     or p_expected_revision !~ '^(0|[1-9][0-9]*)$'
     or p_data is null
     or pg_catalog.jsonb_typeof(p_data) <> 'object' then
    return query
      select 'invalid-payload'::text, null::text, null::timestamptz;
    return;
  end if;

  begin
    v_expected_revision := p_expected_revision::bigint;
  exception
    when numeric_value_out_of_range or invalid_text_representation then
      return query
        select 'invalid-payload'::text, null::text, null::timestamptz;
      return;
  end;

  select users.email
  into v_email
  from auth.users as users
  where users.id = v_user_id;

  if v_email is null or pg_catalog.btrim(v_email) = '' then
    return query
      select 'invalid-payload'::text, null::text, null::timestamptz;
    return;
  end if;

  -- This transaction-level lock also serializes the no-row-yet creation race.
  -- Hash collisions only serialize unrelated users; they cannot mix their data.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0::bigint)
  );

  v_current_revision := null;

  select user_data.revision
  into v_current_revision
  from public.nexio_user_data as user_data
  where user_data.user_id = v_user_id
  for update;

  if not found then
    if v_expected_revision <> 0 then
      return query
        select 'conflict'::text, '0'::text, null::timestamptz;
      return;
    end if;

    insert into public.nexio_user_data as user_data (
      user_id,
      email,
      data,
      revision
    )
    values (
      v_user_id,
      v_email,
      p_data,
      1
    )
    on conflict (user_id) do nothing
    returning user_data.revision, user_data.updated_at
    into v_current_revision, v_server_updated_at;

    if found then
      return query
        select 'success'::text, v_current_revision::text, v_server_updated_at;
      return;
    end if;

    -- Defensive handling for a trusted administrative write that did not use
    -- the advisory lock. No primary-key detail is exposed to the caller.
    select user_data.revision
    into v_current_revision
    from public.nexio_user_data as user_data
    where user_data.user_id = v_user_id;

    return query
      select
        'conflict'::text,
        coalesce(v_current_revision, 0)::text,
        null::timestamptz;
    return;
  end if;

  if v_current_revision <> v_expected_revision then
    return query
      select 'conflict'::text, v_current_revision::text, null::timestamptz;
    return;
  end if;

  if v_current_revision = 9223372036854775807::bigint then
    return query
      select 'blocked'::text, v_current_revision::text, null::timestamptz;
    return;
  end if;

  update public.nexio_user_data as user_data
  set email = v_email,
      data = p_data,
      revision = user_data.revision + 1
  where user_data.user_id = v_user_id
    and user_data.revision = v_expected_revision
  returning user_data.revision, user_data.updated_at
  into v_current_revision, v_server_updated_at;

  if not found then
    return query
      select 'blocked'::text, null::text, null::timestamptz;
    return;
  end if;

  return query
    select 'success'::text, v_current_revision::text, v_server_updated_at;
end;
$function$;

comment on function public.nexio_save_user_data_cas(text, jsonb) is
  'Authenticated atomic Nexio snapshot save. Owner comes only from auth.uid().';

revoke all
on function public.nexio_save_user_data_cas(text, jsonb)
from public, anon, authenticated;

grant execute
on function public.nexio_save_user_data_cas(text, jsonb)
to authenticated;

alter table public.nexio_user_data enable row level security;

drop policy if exists "Nexio users can read own data"
on public.nexio_user_data;

create policy "Nexio users can read own data"
on public.nexio_user_data
for select
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = user_id
);

-- All authenticated writes must go through the CAS function.
drop policy if exists "Nexio users can insert own data"
on public.nexio_user_data;

drop policy if exists "Nexio users can update own data"
on public.nexio_user_data;

drop policy if exists "Nexio users can delete own data"
on public.nexio_user_data;

revoke insert, update, delete
on public.nexio_user_data
from authenticated;

revoke all
on public.nexio_user_data
from public, anon, authenticated;

grant usage on schema public to authenticated;

grant select
on public.nexio_user_data
to authenticated;

commit;

-- Manual rollback reference. Never execute automatically.
-- New CAS-aware clients will stop synchronizing if this rollback is applied.
-- Financial JSON is preserved, but revision metadata is removed.
--
-- begin;
-- drop function if exists public.nexio_save_user_data_cas(text, jsonb);
-- drop trigger if exists nexio_user_data_set_updated_at on public.nexio_user_data;
-- drop function if exists public.nexio_user_data_set_updated_at();
-- alter table public.nexio_user_data
--   drop constraint if exists nexio_user_data_revision_nonnegative;
-- alter table public.nexio_user_data drop column if exists revision;
-- create policy "Nexio users can insert own data"
--   on public.nexio_user_data for insert to authenticated
--   with check (auth.uid() = user_id);
-- create policy "Nexio users can update own data"
--   on public.nexio_user_data for update to authenticated
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "Nexio users can delete own data"
--   on public.nexio_user_data for delete to authenticated
--   using (auth.uid() = user_id);
-- grant insert, update, delete on public.nexio_user_data to authenticated;
-- commit;
