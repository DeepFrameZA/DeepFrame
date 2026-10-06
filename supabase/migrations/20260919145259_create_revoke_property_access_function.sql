SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.revoke_property_access (
  p_membership_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_uid uuid;
BEGIN
  /*
   * Derive the caller from the authenticated JWT.
   */
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  /*
   * Only ordinary admin sessions may revoke access.
   */
  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  /*
   * Revoke only an active membership.
   * Preserve its identity and original creation timestamp.
   */
  UPDATE public.property_memberships
  SET revoked_at = now()
  WHERE public.property_memberships.id = p_membership_id
    AND public.property_memberships.revoked_at IS NULL;

  /*
   * Use one response for missing or already-revoked
   * memberships, including a missing input ID.
   */
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership is not active or does not exist';
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."revoke_property_access"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
