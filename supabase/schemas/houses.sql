create table public.houses (
  id uuid primary key default gen_random_uuid(),
  unit_number text unique not null,
  client_surname text not null,
  client_contact_number text unique not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_houses_unit_number on public.houses (unit_number);
