create table public.surfaces (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas(id) on delete cascade,
  selected_tile text references public.tiles(sku) on delete set null,
  surface_length numeric,
  surface_width numeric,
  surface_height numeric,
  name text not null,
  sort_order int default 0,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_surfaces_area_id on public.surfaces (area_id);

alter table public.surfaces enable row level security;

create policy "Surfaces readable by owner"
  on public.surfaces for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Surfaces insertable by owner"
  on public.surfaces for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "Surfaces updatable by owner"
  on public.surfaces for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Surfaces deletable by owner"
  on public.surfaces for delete
  to authenticated
  using (user_id = (select auth.uid()));
