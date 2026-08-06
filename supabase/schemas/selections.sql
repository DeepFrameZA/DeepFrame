create table public.selections (
  id uuid primary key default gen_random_uuid(),
  surface_id uuid references public.surfaces(id) on delete cascade,
  tile_id uuid references public.tiles(id),
  quantity numeric not null default 1,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_selections_surface_id on public.selections (surface_id);

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

