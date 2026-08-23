create or replace function public.set_owner_user_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if NEW.user_id is null and auth.uid() is not null then
    NEW.user_id = auth.uid();
  end if;
  return NEW;
end;
$$;

revoke execute on function public.set_owner_user_id() from public, anon, authenticated;
