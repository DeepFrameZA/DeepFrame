create table public.areas (
  id uuid primary key default gen_random_uuid(),
  house_id uuid references public.houses(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_areas_house_id ON public.areas (house_id);

alter table public.areas enable row level security;

create policy "Areas readable by owner"
  on public.areas for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Areas insertable by owner"
  on public.areas for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "Areas updatable by owner"
  on public.areas for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Areas deletable by owner"
  on public.areas for delete
  to authenticated
  using (user_id = (select auth.uid()));
