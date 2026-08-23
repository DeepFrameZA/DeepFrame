SET check_function_bodies = false;

CREATE FUNCTION public.set_owner_user_id()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
begin
  if NEW.user_id is null and auth.uid() is not null then
    NEW.user_id = auth.uid();
  end if;
  return NEW;
end;
$function$;

CREATE TRIGGER set_areas_owner
  BEFORE INSERT ON public.areas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_owner_user_id();

CREATE TRIGGER set_houses_owner
  BEFORE INSERT ON public.houses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_owner_user_id();

CREATE TRIGGER set_surfaces_owner
  BEFORE INSERT ON public.surfaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_owner_user_id();

ALTER POLICY "Areas insertable by owner" ON public.areas WITH CHECK ((auth.uid() = auth.uid()));

ALTER POLICY "Homes insertable by owner" ON public.houses WITH CHECK ((auth.uid() = auth.uid()));

ALTER POLICY "Surfaces insertable by owner" ON public.surfaces WITH CHECK ((auth.uid() = auth.uid()));
