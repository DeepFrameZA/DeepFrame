SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.complete_registration()
  RETURNS public.user_role
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_uid uuid;
  v_email text;
  v_email_confirmed_at timestamptz;
  v_existing_role public.user_role;
  v_invite public.invites%ROWTYPE;
  v_now timestamptz;
BEGIN
  /*
   * Derive identity from the authenticated session.
   */
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  /*
   * Require an ordinary session authenticated with a password.
   * The amr claim comes from the server-validated JWT,
   * not from editable user metadata.
   */
  IF public.is_recovery_session() IS DISTINCT FROM false
     OR (
       (SELECT auth.jwt())->'amr'
       @> '[{"method":"password"}]'::jsonb
     ) IS DISTINCT FROM true
  THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  /*
   * Read the current account state.
   * Locking this row serializes completion attempts for
   * the same account and keeps its email stable.
   */
  SELECT
    lower(btrim(u.email)),
    u.email_confirmed_at
  INTO
    v_email,
    v_email_confirmed_at
  FROM auth.users AS u
  WHERE u.id = v_uid
  FOR UPDATE;

  IF NOT FOUND
     OR v_email IS NULL
     OR v_email = ''
     OR v_email_confirmed_at IS NULL
  THEN
    RAISE EXCEPTION 'Registration is invalid or unavailable';
  END IF;

  /*
   * A repeated completion request must not create another
   * profile, change its role, or consume another invitation.
   */
  SELECT p.role
  INTO v_existing_role
  FROM public.profiles AS p
  WHERE p.id = v_uid;

  IF FOUND THEN
    RETURN v_existing_role;
  END IF;

  /*
   * Find exactly one invitation through the trusted binding.
   * EXISTS avoids duplicate results if multiple tickets
   * reference the same invitation.
   *
   * Lock the invitation to serialize completion with
   * revocation and other redemption attempts.
   */
  BEGIN
    SELECT i.*
    INTO STRICT v_invite
    FROM public.invites AS i
    WHERE EXISTS (
      SELECT 1
      FROM public.signup_tickets AS st
      WHERE st.invitation_id = i.id
        AND st.auth_user_id = v_uid
        AND st.consumed_at IS NOT NULL
    )
    FOR UPDATE OF i;
  EXCEPTION
    WHEN no_data_found OR too_many_rows THEN
      RAISE EXCEPTION 'Registration is invalid or unavailable';
  END;

  /*
   * Check expiry after acquiring the invitation lock.
   *
   * Ticket expiry limits when signup may begin.
   * Once the hook has consumed and bound the ticket,
   * invitation expiry governs registration completion.
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
    RAISE EXCEPTION 'Registration is invalid or unavailable';
  END IF;

  /*
   * Profile creation, initial memberships and invitation
   * consumption succeed together or roll back together.
   * Identity, role and assignments are database-derived.
   */
  INSERT INTO public.profiles (
    id,
    role
  )
  VALUES (
    v_uid,
    v_invite.role
  );

  /*
   * Grant access to every property attached to this invitation.
   * No assignment rows means no memberships are created.
   *
   * Membership defaults supply the ID and creation timestamp.
   * revoked_at remains NULL, making each membership active.
   */
  INSERT INTO public.property_memberships (
    profile_id,
    property_id
  )
  SELECT
    v_uid,
    ip.property_id
  FROM public.invitation_properties AS ip
  WHERE ip.invitation_id = v_invite.id
  ORDER BY ip.property_id;

  UPDATE public.invites
  SET used_at = v_now
  WHERE id = v_invite.id;

  RETURN v_invite.role;
END;
$function$;
