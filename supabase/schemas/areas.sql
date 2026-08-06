create table public.areas (
  id uuid primary key default gen_random_uuid(),
  house_id uuid references public.houses(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_areas_house_id ON public.areas (house_id);
