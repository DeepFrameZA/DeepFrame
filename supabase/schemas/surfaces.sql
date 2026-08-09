create table public.surfaces (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas(id) on delete cascade,
  selected_tile text references public.tiles(sku) on delete set null,
  surface_length numeric,
  surface_width numeric,
  surface_height numeric,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_surfaces_area_id on public.surfaces (area_id);
