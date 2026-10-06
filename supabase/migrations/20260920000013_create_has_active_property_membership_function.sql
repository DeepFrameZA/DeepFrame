SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.has_active_property_membership (
  p_property_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  SELECT
    (SELECT public.is_recovery_session()) IS FALSE
    AND EXISTS (
      SELECT 1
      FROM public.property_memberships AS m
      WHERE m.profile_id = (SELECT auth.uid())
        AND m.property_id = p_property_id
        AND m.revoked_at IS NULL
    );
$function$;

GRANT EXECUTE ON FUNCTION "public"."has_active_property_membership"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
