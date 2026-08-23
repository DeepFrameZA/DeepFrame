set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_owner_user_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if NEW.user_id is null and auth.uid() is not null then
    NEW.user_id = auth.uid();
  end if;
  return NEW;
end;
$function$
;


