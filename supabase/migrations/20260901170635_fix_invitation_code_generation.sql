SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_invitation (
  p_invited_email text,
  p_role          public.user_role
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
BEGIN
  /*
   * The caller must be authenticated.
   */
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  /*
   * Only admins may create invitations.
   */
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  /*
   * Normalize the invitation email so that comparisons
   * are case-insensitive and whitespace cannot create
   * accidental duplicates.
   */
  v_email := lower(btrim(p_invited_email));

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Invitation email is required';
  END IF;

  /*
   * The normal invitation system may create resident
   * or contractor invitations, but never admin invitations.
   */
  IF p_role IS NULL OR p_role NOT IN (
    'resident'::public.user_role,
    'contractor'::public.user_role
  ) THEN
    RAISE EXCEPTION 'Invalid invitation role';
  END IF;

  /*
   * Serialize invitation creation for this email address.
   * This prevents two simultaneous admin requests from
   * both creating an active invitation for the same email.
   */
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_email, 0)
  );

  /*
   * An existing Auth identity may not receive a new
   * onboarding invitation.
   */
  IF EXISTS (
    SELECT 1
    FROM auth.users
    WHERE lower(btrim(auth.users.email)) = v_email
  ) THEN
    RAISE EXCEPTION 'An account already exists for this email address';
  END IF;

  /*
   * Do not allow multiple active invitations for the same
   * email address.
   */
  IF EXISTS (
    SELECT 1
    FROM public.invites
    WHERE public.invites.invited_email = v_email
      AND public.invites.used_at IS NULL
      AND public.invites.revoked_at IS NULL
      AND public.invites.expires_at > now()
  ) THEN
    RAISE EXCEPTION 'An active invitation already exists for this email address';
  END IF;

  /*
   * Generate a 12-character cryptographically random code.
   *
   * The alphabet contains 31 characters. To avoid modulo bias,
   * only byte values 0 through 247 are accepted because
   * 248 is evenly divisible by 31.
   *
   * Rejected byte values 248 through 255 are discarded and
   * fresh random bytes are generated until the code reaches
   * exactly 12 characters.
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

  /*
   * Store only the SHA-256 hash of the invitation secret.
   */
  v_code_hash := encode(
    extensions.digest(v_code, 'sha256'),
    'hex'
  );

  /*
   * Create the invitation. The raw code is returned to the
   * trusted caller but is never stored in the database.
   */
  RETURN QUERY
  INSERT INTO public.invites (
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
  RETURNING
    public.invites.id,
    public.invites.invited_email,
    public.invites.role,
    public.invites.expires_at,
    v_code;
END;
$function$;
