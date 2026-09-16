SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE public.profiles.id = (SELECT auth.uid())
      AND public.profiles.role = 'admin'
  );
$function$;

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
