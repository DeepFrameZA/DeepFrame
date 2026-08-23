create or replace function public.before_user_created(event jsonb)
returns jsonb
language plpgsql
security invoker
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
