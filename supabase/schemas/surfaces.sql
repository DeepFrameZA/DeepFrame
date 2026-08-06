create table public.surfaces (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas(id) on delete cascade,
  type_id uuid not null references public.surface_types(id),
  length numeric,
  width numeric,
  height numeric,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_surfaces_area_id on public.surfaces (area_id);
