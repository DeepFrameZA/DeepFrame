SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.list_property_memberships()
  RETURNS TABLE (
    membership_id  uuid,
    profile_id     uuid,
    email          text,
    role           public.user_role,
    property_id    uuid,
    created_at     timestamp with time zone,
    revoked_at     timestamp with time zone,
    derived_status text
  )
  LANGUAGE plpgsql
  STABLE
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
   * Only ordinary admin sessions may list memberships.
   */
  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  /*
   * Return explicitly selected fields for the Access UI.
   * Include revoked memberships so admins can review
   * their current state and grant access again.
   */
  RETURN QUERY
  SELECT
    m.id AS membership_id,
    m.profile_id,
    u.email::text AS email,
    p.role,
    m.property_id,
    m.created_at,
    m.revoked_at,
    CASE
      WHEN m.revoked_at IS NULL THEN 'active'
      ELSE 'revoked'
    END AS derived_status
  FROM public.property_memberships AS m
  JOIN public.profiles AS p
    ON p.id = m.profile_id
  JOIN auth.users AS u
    ON u.id = p.id
  ORDER BY
    m.created_at DESC,
    m.id DESC;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."list_property_memberships"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
