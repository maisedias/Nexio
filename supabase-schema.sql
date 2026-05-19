create table if not exists public.nexio_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.nexio_user_data enable row level security;

drop policy if exists "Nexio users can read own data" on public.nexio_user_data;
drop policy if exists "Nexio users can insert own data" on public.nexio_user_data;
drop policy if exists "Nexio users can update own data" on public.nexio_user_data;
drop policy if exists "Nexio users can delete own data" on public.nexio_user_data;

create policy "Nexio users can read own data"
on public.nexio_user_data
for select
to authenticated
using (auth.uid() = user_id);

create policy "Nexio users can insert own data"
on public.nexio_user_data
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Nexio users can update own data"
on public.nexio_user_data
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Nexio users can delete own data"
on public.nexio_user_data
for delete
to authenticated
using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.nexio_user_data to authenticated;
