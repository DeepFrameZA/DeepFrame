create table public.invite_codes (
  code text primary key,
  max_uses int default 1,
  used_count int default 0,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.invite_codes enable row level security;

create policy "Admins manage invite codes"
  on public.invite_codes for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
    )
  );
