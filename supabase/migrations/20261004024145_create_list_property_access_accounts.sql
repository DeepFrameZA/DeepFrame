SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.list_property_access_accounts()
  RETURNS TABLE (
    profile_id uuid,
    email      text,
    role       public.user_role
  )
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
  /*
   * Authorize before reading account information.
   */
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  /*
   * Include all eligible profiles, including accounts
   * with no memberships or only revoked memberships.
   *
   * Exclude administrators and unfinished registrations.
   * Return only the fields needed by the account selector.
   */
  RETURN QUERY
  SELECT
    p.id AS profile_id,
    u.email::text AS email,
    p.role
  FROM public.profiles AS p
  JOIN auth.users AS u
    ON u.id = p.id
  WHERE p.role IN (
    'resident'::public.user_role,
    'contractor'::public.user_role
  )
  ORDER BY lower(u.email), p.id;
END;
$function$;

REVOKE ALL ON FUNCTION "public"."list_property_access_accounts"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."list_property_access_accounts"() TO "anon", "authenticated", "postgres", "service_role";
