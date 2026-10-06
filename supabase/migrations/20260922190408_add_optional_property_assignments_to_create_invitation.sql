SET local check_function_bodies = off;

DROP FUNCTION "public"."create_invitation"(text, public.user_role);

CREATE OR REPLACE FUNCTION public.create_invitation (
  p_invited_email text,
  p_role          public.user_role,
  p_property_ids  uuid[]           DEFAULT '{}'::uuid[]
)
  RETURNS TABLE (
    invitation_id uuid,
    invited_email text,
    role          public.user_role,
    expires_at    timestamp with time zone,
    code          text
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_email text;
  v_code text := '';
  v_code_hash text;
  v_random bytea;
  v_alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  v_uid uuid;
  v_property_ids uuid[];
  v_property_id uuid;
  v_invite public.invites%ROWTYPE;
BEGIN
  /*
   * Authenticate and authorize before validating inputs.
   */
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_email := lower(btrim(p_invited_email));

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Invitation email is required';
  END IF;

  IF p_role IS NULL OR p_role NOT IN (
    'resident'::public.user_role,
    'contractor'::public.user_role
  ) THEN
    RAISE EXCEPTION 'Invalid invitation role';
  END IF;

  /*
   * No list means no assignments. A NULL item inside
   * a supplied list is an invalid property selection.
   */
  IF EXISTS (
    SELECT 1
    FROM unnest(p_property_ids) AS supplied(property_id)
    WHERE supplied.property_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Property selection is invalid or unavailable';
  END IF;

  /*
   * Remove duplicates and sort IDs so concurrent requests
   * acquire property locks in a consistent order.
   */
  SELECT COALESCE(
    array_agg(
      DISTINCT supplied.property_id
      ORDER BY supplied.property_id
    ),
    '{}'::uuid[]
  )
  INTO v_property_ids
  FROM unnest(p_property_ids) AS supplied(property_id);

  /*
   * Serialize invitation creation for the same email.
   */
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_email, 0)
  );

  IF EXISTS (
    SELECT 1
    FROM auth.users AS u
    WHERE lower(btrim(u.email)) = v_email
  ) THEN
    RAISE EXCEPTION 'An account already exists for this email address';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.invites AS i
    WHERE i.invited_email = v_email
      AND i.used_at IS NULL
      AND i.revoked_at IS NULL
      AND i.expires_at > now()
  ) THEN
    RAISE EXCEPTION 'An active invitation already exists for this email address';
  END IF;

  /*
   * Check each property and protect it from deletion
   * until the invitation and its assignments are saved.
   * An empty array simply skips this loop.
   */
  FOREACH v_property_id IN ARRAY v_property_ids
  LOOP
    PERFORM 1
    FROM public.properties AS p
    WHERE p.id = v_property_id
    FOR KEY SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Property selection is invalid or unavailable';
    END IF;
  END LOOP;

  /*
   * Generate the existing 12-character invitation code.
   * Accept only bytes below 248 to avoid modulo bias
   * when selecting from the 31-character alphabet.
   */
  WHILE char_length(v_code) < 12 LOOP
    v_random := extensions.gen_random_bytes(1);

    IF pg_catalog.get_byte(v_random, 0) < 248 THEN
      v_code := v_code
        || substr(
             v_alphabet,
             (pg_catalog.get_byte(v_random, 0) % 31) + 1,
             1
           );
    END IF;
  END LOOP;

  v_code_hash := encode(
    extensions.digest(v_code, 'sha256'),
    'hex'
  );

  /*
   * Capture the new invitation before inserting assignments.
   * Only the hash of the invitation code is stored.
   */
  INSERT INTO public.invites AS i (
    invited_email,
    code_hash,
    role,
    expires_at
  )
  VALUES (
    v_email,
    v_code_hash,
    p_role,
    now() + interval '7 days'
  )
  RETURNING i.*
  INTO v_invite;

  /*
   * Insert zero, one or multiple assignments.
   * Any failure rolls back the invitation as well.
   */
  INSERT INTO public.invitation_properties (
    invitation_id,
    property_id
  )
  SELECT
    v_invite.id,
    selected.property_id
  FROM unnest(v_property_ids) AS selected(property_id);

  /*
   * Preserve the response expected by the existing frontend.
   */
  RETURN QUERY
  SELECT
    v_invite.id,
    v_invite.invited_email,
    v_invite.role,
    v_invite.expires_at,
    v_code;
END;
$function$;

REVOKE ALL ON FUNCTION "public"."create_invitation"(text, public.user_role, uuid[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_invitation"(text, public.user_role, uuid[]) TO "authenticated", "postgres";
