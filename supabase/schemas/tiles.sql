create table public.tiles (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  description text,
  -- image_url text,
  price_per_sqm numeric,
  price_per_box numeric,
  box_coverage_sqm numeric,
  unit text default 'box',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
