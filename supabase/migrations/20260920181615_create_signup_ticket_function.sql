SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_signup_ticket (
  p_email text,
  p_code  text
)
  RETURNS TABLE (
    signup_ticket text,
    expires_at    timestamp with time zone
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_email text;
  v_code text;
  v_code_hash text;
  v_invite public.invites%ROWTYPE;
  v_ticket text;
  v_now timestamptz;
  v_expires_at timestamptz;
  v_recent_count bigint;
BEGIN
  /*
   * Match the existing invitation normalization rules.
   */
  v_email := lower(btrim(p_email));

  v_code := upper(
    replace(
      replace(btrim(p_code), '-', ''),
      ' ',
      ''
    )
  );

  IF v_email IS NULL
     OR v_email = ''
     OR v_code IS NULL
     OR v_code !~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{12}$'
  THEN
    RAISE EXCEPTION 'Invitation is invalid or unavailable';
  END IF;

  v_code_hash := encode(
    extensions.digest(v_code, 'sha256'),
    'hex'
  );

  /*
   * Lock the invitation to serialize ticket issuance
   * with other issuance, revocation, and redemption.
   */
  SELECT i.*
  INTO v_invite
  FROM public.invites AS i
  WHERE i.code_hash = v_code_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation is invalid or unavailable';
  END IF;

  /*
   * Use the current time after acquiring the lock,
   * because waiting for another transaction takes time.
   */
  v_now := clock_timestamp();

  IF v_invite.invited_email <> v_email
     OR v_invite.used_at IS NOT NULL
     OR v_invite.revoked_at IS NOT NULL
     OR v_invite.expires_at <= v_now
     OR v_invite.role NOT IN (
       'resident'::public.user_role,
       'contractor'::public.user_role
     )
  THEN
    RAISE EXCEPTION 'Invitation is invalid or unavailable';
  END IF;

  /*
   * Limit successful ticket issuance to five tickets
   * per invitation within a rolling five-minute window.
   * Validate the code first so guesses cannot use this allowance.
   */
  SELECT count(*)
  INTO v_recent_count
  FROM public.signup_tickets AS st
  WHERE st.invitation_id = v_invite.id
    AND st.created_at > v_now - interval '5 minutes';

  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Invitation is invalid or unavailable';
  END IF;

  /*
   * Generate a separate random secret.
   * Store only its hash and return the raw ticket once.
   */
  v_ticket := encode(extensions.gen_random_bytes(32), 'hex');

  v_expires_at := least(
    v_now + interval '5 minutes',
    v_invite.expires_at
  );

  INSERT INTO public.signup_tickets (
    invitation_id,
    ticket_hash,
    created_at,
    expires_at
  )
  VALUES (
    v_invite.id,
    encode(extensions.digest(v_ticket, 'sha256'), 'hex'),
    v_now,
    v_expires_at
  );

  RETURN QUERY
  SELECT v_ticket, v_expires_at;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."create_signup_ticket"(text, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
