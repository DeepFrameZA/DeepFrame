SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.grant_property_access (
  p_profile_id  uuid,
  p_property_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_uid uuid;
  v_membership_id uuid;
BEGIN
  /*
   * Derive the caller from the authenticated JWT.
   */
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  /*
   * Only ordinary admin sessions may grant access.
   */
  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile ID is required';
  END IF;

  IF p_property_id IS NULL THEN
    RAISE EXCEPTION 'Property ID is required';
  END IF;

  /*
   * Only existing resident or contractor profiles receive
   * memberships. Hold their role stable during this operation.
   */
  PERFORM 1
  FROM public.profiles
  WHERE public.profiles.id = p_profile_id
    AND public.profiles.role IN (
      'resident'::public.user_role,
      'contractor'::public.user_role
    )
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile is not eligible for property access';
  END IF;

  /*
   * Require an existing property and protect its identity
   * from deletion while the membership is being granted.
   */
  PERFORM 1
  FROM public.properties
  WHERE public.properties.id = p_property_id
  FOR KEY SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property does not exist';
  END IF;

  /*
   * Create the membership, or reactivate the existing pair.
   * Preserve its original ID and creation timestamp.
   */
  INSERT INTO public.property_memberships (
    profile_id,
    property_id
  )
  VALUES (
    p_profile_id,
    p_property_id
  )
  ON CONFLICT ON CONSTRAINT property_memberships_profile_property_key
  DO UPDATE
  SET revoked_at = NULL
  RETURNING public.property_memberships.id
  INTO v_membership_id;

  RETURN v_membership_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."grant_property_access"(uuid, uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
