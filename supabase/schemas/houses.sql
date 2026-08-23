create table public.houses (
  id uuid primary key default gen_random_uuid(),
  unit_number text unique not null,
  client_surname text not null,
  client_contact_number text unique not null check (client_contact_number ~ '^\d{10}$'),
  notes text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_houses_unit_number on public.houses (unit_number);

alter table public.houses enable row level security;

create policy "Homes readable by owner"
  on public.houses for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Homes insertable by owner"
  on public.houses for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "Homes updatable by owner"
  on public.houses for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Homes deletable by owner"
  on public.houses for delete
  to authenticated
  using (user_id = (select auth.uid()));
