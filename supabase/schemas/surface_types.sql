create table public.surface_types (
  id   uuid primary key default gen_random_uuid(),
  name text unique not null
);
