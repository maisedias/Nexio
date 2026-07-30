-- Original Nexio user snapshot storage.

begin;

create table public.nexio_user_data (
  user_id uuid primary key
    references auth.users (id) on delete cascade,
  email text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.nexio_user_data enable row level security;

create policy "Nexio users can read own data"
on public.nexio_user_data
for select
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = user_id
);

create policy "Nexio users can insert own data"
on public.nexio_user_data
for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = user_id
);

create policy "Nexio users can update own data"
on public.nexio_user_data
for update
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = user_id
)
with check (
  auth.uid() is not null
  and auth.uid() = user_id
);

create policy "Nexio users can delete own data"
on public.nexio_user_data
for delete
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = user_id
);

revoke all
on public.nexio_user_data
from public, anon;

grant usage on schema public to authenticated;

grant select, insert, update, delete
on public.nexio_user_data
to authenticated;

commit;
