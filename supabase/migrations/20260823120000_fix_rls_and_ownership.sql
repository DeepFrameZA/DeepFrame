-- Corrective migration: fixes RLS ownership policies, hardens the ownership
-- trigger function, locks down invite_codes, and adds the before_user_created
-- auth hook (replacing the anon-callable redeem_invite RPC).
-- Local reset uses the declarative schemas in supabase/schemas/; this migration
-- keeps the applied (remote) migration history consistent with those files.

-- 1. Harden set_owner_user_id: set search_path and revoke public EXECUTE.
create or replace function public.set_owner_user_id()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
  as $$
begin
  if NEW.user_id is null and (select auth.uid()) is not null then
    NEW.user_id = (select auth.uid());
  end if;
  return NEW;
end;
$$;

revoke execute on function public.set_owner_user_id() from public, anon, authenticated;

-- 2. Fix broken INSERT/UPDATE ownership policies on houses, areas, surfaces.
--    The old INSERT policies used `(select auth.uid()) = (select auth.uid())` (always true),
--    allowing cross-tenant inserts. UPDATE policies lacked WITH CHECK,
--    allowing reassignment of user_id.

drop policy if exists "Homes insertable by owner" on public.houses;
create policy "Homes insertable by owner"
  on public.houses for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "Homes updatable by owner" on public.houses;
create policy "Homes updatable by owner"
  on public.houses for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Areas insertable by owner" on public.areas;
create policy "Areas insertable by owner"
  on public.areas for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "Areas updatable by owner" on public.areas;
create policy "Areas updatable by owner"
  on public.areas for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Surfaces insertable by owner" on public.surfaces;
create policy "Surfaces insertable by owner"
  on public.surfaces for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "Surfaces updatable by owner" on public.surfaces;
create policy "Surfaces updatable by owner"
  on public.surfaces for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 3. Lock down invite_codes: add WITH CHECK so non-admins cannot write codes.
drop policy if exists "Admins manage invite codes" on public.invite_codes;
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

-- 3b. Recreate the SELECT/DELETE ownership policies with a stable initplan
--     (wrap auth.uid() in a subselect) to clear the auth_rls_initplan linter.
drop policy if exists "Homes readable by owner" on public.houses;
create policy "Homes readable by owner"
  on public.houses for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Homes deletable by owner" on public.houses;
create policy "Homes deletable by owner"
  on public.houses for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Areas readable by owner" on public.areas;
create policy "Areas readable by owner"
  on public.areas for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Areas deletable by owner" on public.areas;
create policy "Areas deletable by owner"
  on public.areas for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Surfaces readable by owner" on public.surfaces;
create policy "Surfaces readable by owner"
  on public.surfaces for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Surfaces deletable by owner" on public.surfaces;
create policy "Surfaces deletable by owner"
  on public.surfaces for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- 4. Stop every new signup defaulting to admin (privilege escalation).
alter table public.profiles alter column role set default 'owner';

-- 5. Enforce 10-digit contact numbers.
alter table public.houses
  add constraint houses_contact_number_check
  check (client_contact_number ~ '^\d{10}$');

-- 6. before_user_created auth hook: validates and atomically consumes an invite
--    code supplied in user_metadata during signup. Runs as supabase_auth_admin
--    (BYPASSRLS), so it is NOT a public RPC and cannot be called via /rest/v1/rpc.
create or replace function public.before_user_created(event jsonb)
  returns jsonb
  language plpgsql
  set search_path = ''
  as $$
declare
  v_code text := event->'user'->'raw_user_meta_data'->>'invite_code';
  v_found boolean;
begin
  if v_code is null or v_code = '' then
    raise exception 'invite code is required';
  end if;

  select true into v_found
  from public.invite_codes
  where code = v_code
    and (expires_at is null or expires_at > now())
    and used_count < max_uses
  for update;

  if not found then
    raise exception 'invalid or expired invite code';
  end if;

  update public.invite_codes
  set used_count = used_count + 1
  where code = v_code;

  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function public.before_user_created(jsonb) from authenticated, anon, public;
