create table public.tiles (
  sku text primary key,
  description text,
  price_per_sqm numeric,
  price_per_box numeric,
  box_coverage_sqm numeric,
  unit text default 'box',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tiles enable row level security;

create policy "Tiles readable by authenticated users"
  on public.tiles for select
  to authenticated
  using (true);

