CREATE OR REPLACE FUNCTION public.is_recovery_session()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  /*
   * The session ID and user ID come from the verified JWT.
   * The matching recovery record is controlled exclusively
   * by the custom access-token hook.
   *
   * Do not add an expiry condition here. Supabase already
   * rejects expired JWTs, while retaining the record ensures
   * that every still-valid token from this session remains
   * restricted.
   */
  SELECT EXISTS (
    SELECT 1
    FROM public.auth_recovery_sessions
    WHERE public.auth_recovery_sessions.session_id =
      nullif(
        (SELECT auth.jwt()->>'session_id'),
        ''
      )::uuid
      AND public.auth_recovery_sessions.user_id =
        (SELECT auth.uid())
  );
$$;

REVOKE EXECUTE
ON FUNCTION public.is_recovery_session()
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.is_recovery_session()
FROM anon;

REVOKE EXECUTE
ON FUNCTION public.is_recovery_session()
FROM service_role;

GRANT EXECUTE
ON FUNCTION public.is_recovery_session()
TO authenticated;


CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  /*
   * A password-recovery session is authenticated by
   * Supabase, but it is not an ordinary application session
   * and must never receive administrator authorization.
   */
  SELECT
    NOT public.is_recovery_session()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = (SELECT auth.uid())
        AND public.profiles.role = 'admin'
    );
$$;

REVOKE EXECUTE
ON FUNCTION public.is_admin()
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.is_admin()
FROM anon;

REVOKE EXECUTE
ON FUNCTION public.is_admin()
FROM service_role;

GRANT EXECUTE
ON FUNCTION public.is_admin()
TO authenticated;

CREATE OR REPLACE FUNCTION public.before_user_created(
  event jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_auth_user_id uuid;
  v_email text;
  v_ticket text;
  v_ticket_hash text;
  v_invite public.invites%ROWTYPE;
  v_signup_ticket public.signup_tickets%ROWTYPE;
  v_now timestamptz;
  v_rejection jsonb := jsonb_build_object(
    'error',
    jsonb_build_object(
      'http_code', 403,
      'message', 'Registration requires an active invitation.'
    )
  );
BEGIN

  /*
   * Read the prospective account ID supplied by Supabase Auth.
   * Never take this identity from user_metadata.
   */
  BEGIN
    v_auth_user_id := (event->'user'->>'id')::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN v_rejection;
  END;

  IF v_auth_user_id IS NULL THEN
    RETURN v_rejection;
  END IF;
  /*
   * Read the prospective account's email and the ticket
   * submitted through signup metadata.
   * Treat both as untrusted input.
   */
  v_email := lower(btrim(event->'user'->>'email'));

  v_ticket :=
    event->'user'->'user_metadata'->>'signup_ticket';

  IF v_email IS NULL
     OR v_email = ''
     OR v_ticket IS NULL
     OR v_ticket !~ '^[0-9a-f]{64}$'
  THEN
    RETURN v_rejection;
  END IF;

  v_ticket_hash := encode(
    extensions.digest(v_ticket, 'sha256'),
    'hex'
  );

  /*
   * Find the invitation through the ticket.
   * Lock the invitation first, matching the issuance
   * function's lock order.
   */
  SELECT i.*
  INTO v_invite
  FROM public.invites AS i
  JOIN public.signup_tickets AS st
    ON st.invitation_id = i.id
  WHERE st.ticket_hash = v_ticket_hash
    AND i.invited_email = v_email
  FOR UPDATE OF i;

  IF NOT FOUND THEN
    RETURN v_rejection;
  END IF;

  /*
   * Lock the ticket before checking or consuming it.
   * Concurrent attempts must inspect its latest state.
   */
  SELECT st.*
  INTO v_signup_ticket
  FROM public.signup_tickets AS st
  WHERE st.ticket_hash = v_ticket_hash
    AND st.invitation_id = v_invite.id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN v_rejection;
  END IF;

  v_now := clock_timestamp();

  /*
   * Recheck both lifecycles after acquiring the locks.
   * Issuing a ticket does not guarantee that its
   * invitation remains valid until signup.
   */
  IF v_invite.used_at IS NOT NULL
     OR v_invite.revoked_at IS NOT NULL
     OR v_invite.expires_at <= v_now
     OR v_invite.role NOT IN (
       'resident'::public.user_role,
       'contractor'::public.user_role
     )
     OR v_signup_ticket.consumed_at IS NOT NULL
     OR v_signup_ticket.auth_user_id IS NOT NULL
     OR v_signup_ticket.expires_at <= v_now
  THEN
    RETURN v_rejection;
  END IF;

  /*
   * Consume the ticket and bind it to the prospective account.
   * The existing row lock protects both values from
   * concurrent signup attempts.
   *
   * This association can remain if Auth later fails to
   * create the account. A retry must obtain a fresh ticket.
   *
   * Redemption remains responsible for consuming
   * the invitation and creating the profile.
   */
  UPDATE public.signup_tickets
  SET
    consumed_at = v_now,
    auth_user_id = v_auth_user_id
  WHERE id = v_signup_ticket.id;

  RETURN '{}'::jsonb;
END;
$$;

REVOKE ALL ON FUNCTION public.before_user_created(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.before_user_created(jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.before_user_created(jsonb) FROM authenticated;
REVOKE ALL ON FUNCTION public.before_user_created(jsonb) FROM service_role;

GRANT EXECUTE ON FUNCTION public.before_user_created(jsonb)
TO supabase_auth_admin;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(
  event jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_claims jsonb;
  v_app_metadata jsonb;
  v_authentication_method text;
  v_event_user_id uuid;
  v_claim_user_id uuid;
  v_session_id uuid;
  v_token_expires_at timestamp with time zone;
  v_is_recovery boolean;
BEGIN
  /*
   * Supabase Auth supplies the prospective JWT claims and
   * the authoritative authentication method.
   */
  v_claims := event->'claims';
  v_authentication_method := event->>'authentication_method';

  IF v_claims IS NULL
     OR jsonb_typeof(v_claims) <> 'object'
  THEN
    RAISE EXCEPTION 'Invalid custom access token hook event';
  END IF;

  /*
   * These are required Supabase access-token claims.
   * Reject malformed hook input instead of issuing a token
   * whose recovery status cannot be tracked reliably.
   */
  v_event_user_id := nullif(event->>'user_id', '')::uuid;
  v_claim_user_id := nullif(v_claims->>'sub', '')::uuid;
  v_session_id := nullif(v_claims->>'session_id', '')::uuid;

  IF v_claims->>'exp' IS NOT NULL THEN
    v_token_expires_at := to_timestamp(
      (v_claims->>'exp')::double precision
    );
  END IF;

  IF v_event_user_id IS NULL
     OR v_claim_user_id IS NULL
     OR v_event_user_id <> v_claim_user_id
     OR v_session_id IS NULL
     OR v_token_expires_at IS NULL
  THEN
    RAISE EXCEPTION 'Invalid custom access token hook identity';
  END IF;

  /*
   * PKCE exposes password recovery directly as "recovery".
   *
   * Supabase's implicit email-link flow instead reports both
   * signup confirmation and password recovery as "otp".
   *
   * DeepFrame distinguishes them using its onboarding
   * invariant:
   *
   *   no profile       -> signup confirmation
   *   existing profile -> established account recovery
   *
   * DeepFrame does not support passwordless OTP or magic-link
   * login. Treating any OTP session for an established account
   * as recovery is therefore deliberately fail-closed.
   */
  IF v_authentication_method = 'recovery'
     OR (
       v_authentication_method = 'otp'
       AND EXISTS (
         SELECT 1
         FROM public.profiles
         WHERE public.profiles.id = v_claim_user_id
       )
     )
  THEN
    IF EXISTS (
      SELECT 1
      FROM public.auth_recovery_sessions
      WHERE public.auth_recovery_sessions.session_id = v_session_id
        AND public.auth_recovery_sessions.user_id <> v_claim_user_id
    ) THEN
      RAISE EXCEPTION 'Recovery session identity mismatch';
    END IF;

    INSERT INTO public.auth_recovery_sessions (
      session_id,
      user_id,
      latest_token_expires_at
    )
    VALUES (
      v_session_id,
      v_claim_user_id,
      v_token_expires_at
    )
    ON CONFLICT (session_id)
    DO UPDATE
    SET
      latest_token_expires_at = greatest(
        public.auth_recovery_sessions.latest_token_expires_at,
        EXCLUDED.latest_token_expires_at
      ),
      updated_at = now();
  END IF;

  /*
   * Once a session has been identified as recovery, preserve
   * that classification when Supabase refreshes its token.
   */
  SELECT EXISTS (
    SELECT 1
    FROM public.auth_recovery_sessions
    WHERE public.auth_recovery_sessions.session_id = v_session_id
      AND public.auth_recovery_sessions.user_id = v_claim_user_id
  )
  INTO v_is_recovery;

  IF v_is_recovery THEN
    UPDATE public.auth_recovery_sessions
    SET
      latest_token_expires_at = greatest(
        public.auth_recovery_sessions.latest_token_expires_at,
        v_token_expires_at
      ),
      updated_at = now()
    WHERE public.auth_recovery_sessions.session_id = v_session_id
      AND public.auth_recovery_sessions.user_id = v_claim_user_id;
  END IF;

  /*
   * Include a server-issued, signed routing indicator.
   * The frontend may read this for UX, but PostgreSQL will
   * later use the authoritative table record for security.
   */
  v_app_metadata := coalesce(
    v_claims->'app_metadata',
    '{}'::jsonb
  );

  IF jsonb_typeof(v_app_metadata) <> 'object' THEN
    v_app_metadata := '{}'::jsonb;
  END IF;

  v_app_metadata := jsonb_set(
    v_app_metadata,
    '{deepframe_recovery}',
    to_jsonb(v_is_recovery),
    true
  );

  v_claims := jsonb_set(
    v_claims,
    '{app_metadata}',
    v_app_metadata,
    true
  );

  RETURN jsonb_build_object(
    'claims',
    v_claims
  );
END;
$$;

REVOKE ALL ON FUNCTION public.custom_access_token_hook(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.custom_access_token_hook(jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated;
REVOKE ALL ON FUNCTION public.custom_access_token_hook(jsonb) FROM service_role;

GRANT EXECUTE
ON FUNCTION public.custom_access_token_hook(jsonb)
TO supabase_auth_admin;

CREATE OR REPLACE FUNCTION public.create_invitation(
  p_invited_email text,
  p_role public.user_role,
  p_property_ids uuid[] DEFAULT '{}'::uuid[]
)
RETURNS TABLE (
  invitation_id uuid,
  invited_email text,
  role public.user_role,
  expires_at timestamptz,
  code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.create_invitation(
  text, public.user_role, uuid[]
) FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.create_invitation(
  text, public.user_role, uuid[]
) TO authenticated;

CREATE OR REPLACE FUNCTION public.revoke_invitation(
  p_invitation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid;
  v_invite public.invites%ROWTYPE;
BEGIN
  /*
   * Derive the caller from the authenticated JWT rather
   * than accepting a user ID from the client.
   */
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  /*
   * Authenticated clients may invoke this RPC, but only an
   * administrator may revoke an invitation.
   */
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  /*
   * Locate and lock the requested invitation.
   *
   * revoke_invitation() and complete_registration() both use
   * FOR UPDATE, so concurrent revocation and registration
   * completion are serialized against the same invitation row.
   */
  SELECT public.invites.*
  INTO v_invite
  FROM public.invites
  WHERE public.invites.id = p_invitation_id
  FOR UPDATE;

  /*
   * Only an active invitation may be revoked.
   *
   * Use the same generic response for nonexistent, used,
   * already-revoked, or expired invitations. This avoids
   * revealing the invitation's state to callers.
   */
  IF NOT FOUND
     OR v_invite.used_at IS NOT NULL
     OR v_invite.revoked_at IS NOT NULL
     OR v_invite.expires_at <= now()
  THEN
    RAISE EXCEPTION 'Invitation is not active or does not exist';
  END IF;

  /*
   * Preserve the invitation row as lifecycle history and
   * let the database supply the revocation timestamp.
   */
  UPDATE public.invites
  SET revoked_at = now()
  WHERE public.invites.id = v_invite.id;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_invitation(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_invitation(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.revoke_invitation(uuid) FROM service_role;

GRANT EXECUTE ON FUNCTION public.revoke_invitation(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_invitations()
  RETURNS TABLE (
    invitation_id  uuid,
    invited_email  text,
    role           public.user_role,
    created_at     timestamptz,
    expires_at     timestamptz,
    used_at        timestamptz,
    revoked_at     timestamptz,
    derived_status text,
    property_ids   uuid[]
  )
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    i.id AS invitation_id,
    i.invited_email,
    i.role,
    i.created_at,
    i.expires_at,
    i.used_at,
    i.revoked_at,
    CASE
      WHEN i.used_at IS NOT NULL THEN 'used'
      WHEN i.revoked_at IS NOT NULL THEN 'revoked'
      WHEN i.expires_at <= now() THEN 'expired'
      ELSE 'pending'
    END AS derived_status,
    COALESCE(
      (
        SELECT array_agg(ip.property_id ORDER BY ip.property_id)
        FROM public.invitation_properties AS ip
        WHERE ip.invitation_id = i.id
      ),
      '{}'::uuid[]
    ) AS property_ids
  FROM public.invites AS i
  ORDER BY i.created_at DESC, i.id DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.list_invitations()
  FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.list_invitations()
  TO authenticated;

CREATE OR REPLACE FUNCTION public.grant_property_access(
  p_profile_id uuid,
  p_property_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.grant_property_access(uuid, uuid)
FROM PUBLIC;

REVOKE ALL ON FUNCTION public.grant_property_access(uuid, uuid)
FROM anon;

REVOKE ALL ON FUNCTION public.grant_property_access(uuid, uuid)
FROM service_role;

GRANT EXECUTE ON FUNCTION public.grant_property_access(uuid, uuid)
TO authenticated;

CREATE OR REPLACE FUNCTION public.revoke_property_access(
  p_membership_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.revoke_property_access(uuid)
FROM PUBLIC;

REVOKE ALL ON FUNCTION public.revoke_property_access(uuid)
FROM anon;

REVOKE ALL ON FUNCTION public.revoke_property_access(uuid)
FROM service_role;

GRANT EXECUTE ON FUNCTION public.revoke_property_access(uuid)
TO authenticated;

CREATE OR REPLACE FUNCTION public.list_property_memberships()
RETURNS TABLE (
  membership_id uuid,
  profile_id uuid,
  email text,
  role public.user_role,
  property_id uuid,
  created_at timestamptz,
  revoked_at timestamptz,
  derived_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.list_property_memberships()
FROM PUBLIC;

REVOKE ALL ON FUNCTION public.list_property_memberships()
FROM anon;

REVOKE ALL ON FUNCTION public.list_property_memberships()
FROM service_role;

GRANT EXECUTE ON FUNCTION public.list_property_memberships()
TO authenticated;

CREATE OR REPLACE FUNCTION public.has_active_property_membership(
  p_property_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (SELECT public.is_recovery_session()) IS FALSE
    AND EXISTS (
      SELECT 1
      FROM public.property_memberships AS m
      WHERE m.profile_id = (SELECT auth.uid())
        AND m.property_id = p_property_id
        AND m.revoked_at IS NULL
    );
$$;

REVOKE ALL ON FUNCTION public.has_active_property_membership(uuid)
FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.has_active_property_membership(uuid)
TO authenticated;

CREATE OR REPLACE FUNCTION public.create_signup_ticket(
  p_email text,
  p_code text
)
RETURNS TABLE (
  signup_ticket text,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.create_signup_ticket(text, text)
FROM PUBLIC, service_role;

GRANT EXECUTE ON FUNCTION public.create_signup_ticket(text, text)
TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.complete_registration()
RETURNS public.user_role
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.complete_registration()
FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.complete_registration()
TO authenticated;

CREATE OR REPLACE FUNCTION public.create_property(
  p_property_type text,
  p_address jsonb,
  p_unit_identifier text DEFAULT NULL,
  p_business_name text DEFAULT NULL,
  p_context_id uuid DEFAULT NULL,
  p_new_context jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_property_id uuid;
  v_address_id uuid;
  v_context_address_id uuid;
  v_context_id uuid;
  v_unit text := nullif(btrim(p_unit_identifier), '');
  v_business text := nullif(btrim(p_business_name), '');
  v_needs_context boolean;
  v_address jsonb;
  v_key text;
BEGIN
  /*
   * Authorization precedes input validation.
   */
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_property_type IS NULL OR p_property_type NOT IN (
    'freestanding_house',
    'estate',
    'complex',
    'farm',
    'business',
    'office_park',
    'other'
  ) THEN
    RAISE EXCEPTION 'Invalid property type';
  END IF;

  v_needs_context := p_property_type IN (
    'estate', 'complex', 'office_park'
  );

  IF v_needs_context THEN
    IF (p_context_id IS NULL) = (p_new_context IS NULL) THEN
      RAISE EXCEPTION
        'Select an existing development or provide a new development';
    END IF;

    IF v_unit IS NULL THEN
      RAISE EXCEPTION 'Unit or building identifier is required';
    END IF;
  ELSIF p_context_id IS NOT NULL OR p_new_context IS NOT NULL THEN
    RAISE EXCEPTION 'This property type cannot have a development';
  END IF;

  IF p_property_type IN ('business', 'office_park')
     AND v_business IS NULL
  THEN
    RAISE EXCEPTION 'Business name is required';
  END IF;

  /*
   * A complex unit inherits its development's address.
   * Reject a separate address instead of silently ignoring it.
   */
  IF p_property_type = 'complex' AND p_address IS NOT NULL THEN
    RAISE EXCEPTION
      'Complex properties use the complex address; omit the property address';
  END IF;

  IF p_new_context IS NOT NULL THEN
    IF jsonb_typeof(p_new_context) IS DISTINCT FROM 'object'
       OR jsonb_typeof(p_new_context->'name') IS DISTINCT FROM 'string'
       OR nullif(btrim(p_new_context->>'name'), '') IS NULL
    THEN
      RAISE EXCEPTION 'Development name is required';
    END IF;
  END IF;

  /*
   * Validate only the addresses that will be created.
   *
   * Existing complex: no address input.
   * New complex: development address only.
   * Other types: property address and any new development address.
   */
  FOR v_address IN
    SELECT p_address
    WHERE p_property_type <> 'complex'

    UNION ALL

    SELECT p_new_context->'address'
    WHERE p_new_context IS NOT NULL
  LOOP
    IF jsonb_typeof(v_address) IS DISTINCT FROM 'object'
       OR jsonb_typeof(v_address->'street_address') IS DISTINCT FROM 'string'
       OR nullif(btrim(v_address->>'street_address'), '') IS NULL
    THEN
      RAISE EXCEPTION 'Street address is required';
    END IF;

    FOREACH v_key IN ARRAY ARRAY[
      'suburb_or_locality',
      'city_or_town',
      'postal_code'
    ]
    LOOP
      IF v_address ? v_key
         AND jsonb_typeof(v_address->v_key) NOT IN ('string', 'null')
      THEN
        RAISE EXCEPTION 'Address fields must be text';
      END IF;
    END LOOP;
  END LOOP;

  IF p_context_id IS NOT NULL THEN
    /*
     * Keep the selected development's type and address reference
     * stable until property creation finishes.
     */
    SELECT pc.id, pc.address_id
    INTO v_context_id, v_context_address_id
    FROM public.property_contexts AS pc
    WHERE pc.id = p_context_id
      AND pc.context_type = p_property_type
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Development is invalid or unavailable';
    END IF;

  ELSIF p_new_context IS NOT NULL THEN
    v_address := p_new_context->'address';

    INSERT INTO public.addresses (
      street_address,
      suburb_or_locality,
      city_or_town,
      postal_code
    )
    VALUES (
      btrim(v_address->>'street_address'),
      nullif(btrim(v_address->>'suburb_or_locality'), ''),
      nullif(btrim(v_address->>'city_or_town'), ''),
      nullif(btrim(v_address->>'postal_code'), '')
    )
    RETURNING id INTO v_context_address_id;

    INSERT INTO public.property_contexts (
      context_type,
      name,
      address_id
    )
    VALUES (
      p_property_type,
      btrim(p_new_context->>'name'),
      v_context_address_id
    )
    RETURNING id INTO v_context_id;
  END IF;

  /*
   * Estate and office-park properties retain their individual
   * street address, but their additional address details come
   * from the development.
   *
   * Replace the local input values with database-derived values.
   * This does not modify the development or its address.
   */
  IF p_property_type IN ('estate', 'office_park') THEN
    SELECT
      p_address || jsonb_build_object(
        'suburb_or_locality', a.suburb_or_locality,
        'city_or_town', a.city_or_town,
        'postal_code', a.postal_code
      )
    INTO p_address
    FROM public.addresses AS a
    WHERE a.id = v_context_address_id
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Development is invalid or unavailable';
    END IF;
  END IF;

  IF p_property_type = 'complex' THEN
    /*
     * Reference the same address row as the complex.
     * Do not create a duplicate address for the unit.
     */
    v_address_id := v_context_address_id;
  ELSE
    INSERT INTO public.addresses (
      street_address,
      suburb_or_locality,
      city_or_town,
      postal_code
    )
    VALUES (
      btrim(p_address->>'street_address'),
      nullif(btrim(p_address->>'suburb_or_locality'), ''),
      nullif(btrim(p_address->>'city_or_town'), ''),
      nullif(btrim(p_address->>'postal_code'), '')
    )
    RETURNING id INTO v_address_id;
  END IF;

  INSERT INTO public.properties (
    property_type,
    address_id,
    property_context_id,
    unit_identifier,
    business_name
  )
  VALUES (
    p_property_type,
    v_address_id,
    v_context_id,
    v_unit,
    v_business
  )
  RETURNING id INTO v_property_id;

  RETURN v_property_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_property(text, jsonb, text, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_property(text, jsonb, text, text, uuid, jsonb) TO authenticated, postgres;
REVOKE ALL ON FUNCTION public.create_property(
  text, jsonb, text, text, uuid, jsonb
) FROM anon;

REVOKE ALL ON FUNCTION public.create_property(
  text, jsonb, text, text, uuid, jsonb
) FROM service_role;

CREATE OR REPLACE FUNCTION public.update_property(
  p_property_id uuid,
  p_property_type text,
  p_address jsonb,
  p_unit_identifier text DEFAULT NULL,
  p_business_name text DEFAULT NULL,
  p_context_id uuid DEFAULT NULL,
  p_new_context jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_property public.properties%ROWTYPE;
  v_current_address public.addresses%ROWTYPE;
  v_address_id uuid;
  v_context_address_id uuid;
  v_context_id uuid;
  v_unit text := nullif(btrim(p_unit_identifier), '');
  v_business text := nullif(btrim(p_business_name), '');
  v_needs_context boolean;
  v_address jsonb;
  v_key text;
BEGIN
  /*
   * Authorization precedes target lookup and input validation.
   */
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT p.*
  INTO v_property
  FROM public.properties AS p
  WHERE p.id = p_property_id
  FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property is invalid or unavailable';
  END IF;

  IF p_property_type IS NULL OR p_property_type NOT IN (
    'freestanding_house',
    'estate',
    'complex',
    'farm',
    'business',
    'office_park',
    'other'
  ) THEN
    RAISE EXCEPTION 'Invalid property type';
  END IF;

  v_needs_context := p_property_type IN (
    'estate', 'complex', 'office_park'
  );

  IF v_needs_context THEN
    IF (p_context_id IS NULL) = (p_new_context IS NULL) THEN
      RAISE EXCEPTION
        'Select an existing development or provide a new development';
    END IF;

    IF v_unit IS NULL THEN
      RAISE EXCEPTION 'Unit or building identifier is required';
    END IF;
  ELSIF p_context_id IS NOT NULL OR p_new_context IS NOT NULL THEN
    RAISE EXCEPTION 'This property type cannot have a development';
  END IF;

  IF p_property_type IN ('business', 'office_park')
     AND v_business IS NULL
  THEN
    RAISE EXCEPTION 'Business name is required';
  END IF;

  IF p_property_type = 'complex' AND p_address IS NOT NULL THEN
    RAISE EXCEPTION
      'Complex properties use the complex address; omit the property address';
  END IF;

  IF p_new_context IS NOT NULL THEN
    IF jsonb_typeof(p_new_context) IS DISTINCT FROM 'object'
       OR jsonb_typeof(p_new_context->'name') IS DISTINCT FROM 'string'
       OR nullif(btrim(p_new_context->>'name'), '') IS NULL
    THEN
      RAISE EXCEPTION 'Development name is required';
    END IF;
  END IF;

  /*
   * Complex units have no separate property address input.
   * A newly created development still requires its own address.
   */
  FOR v_address IN
    SELECT p_address
    WHERE p_property_type <> 'complex'

    UNION ALL

    SELECT p_new_context->'address'
    WHERE p_new_context IS NOT NULL
  LOOP
    IF jsonb_typeof(v_address) IS DISTINCT FROM 'object'
       OR jsonb_typeof(v_address->'street_address') IS DISTINCT FROM 'string'
       OR nullif(btrim(v_address->>'street_address'), '') IS NULL
    THEN
      RAISE EXCEPTION 'Street address is required';
    END IF;

    FOREACH v_key IN ARRAY ARRAY[
      'suburb_or_locality',
      'city_or_town',
      'postal_code'
    ]
    LOOP
      IF v_address ? v_key
         AND jsonb_typeof(v_address->v_key) NOT IN ('string', 'null')
      THEN
        RAISE EXCEPTION 'Address fields must be text';
      END IF;
    END LOOP;
  END LOOP;

  IF p_context_id IS NOT NULL THEN
    /*
     * Hold the selected development's type and address reference
     * stable until the edit finishes.
     */
    SELECT pc.id, pc.address_id
    INTO v_context_id, v_context_address_id
    FROM public.property_contexts AS pc
    WHERE pc.id = p_context_id
      AND pc.context_type = p_property_type
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Development is invalid or unavailable';
    END IF;

  ELSIF p_new_context IS NOT NULL THEN
    v_address := p_new_context->'address';

    INSERT INTO public.addresses (
      street_address,
      suburb_or_locality,
      city_or_town,
      postal_code
    )
    VALUES (
      btrim(v_address->>'street_address'),
      nullif(btrim(v_address->>'suburb_or_locality'), ''),
      nullif(btrim(v_address->>'city_or_town'), ''),
      nullif(btrim(v_address->>'postal_code'), '')
    )
    RETURNING id INTO v_context_address_id;

    INSERT INTO public.property_contexts (
      context_type,
      name,
      address_id
    )
    VALUES (
      p_property_type,
      btrim(p_new_context->>'name'),
      v_context_address_id
    )
    RETURNING id INTO v_context_id;
  END IF;

  /*
   * Estate and office-park properties retain their individual
   * street address, but their additional address details come
   * from the development.
   *
   * Replace the local input values with database-derived values.
   * This does not modify the development or its address.
   */
  IF p_property_type IN ('estate', 'office_park') THEN
    SELECT
      p_address || jsonb_build_object(
        'suburb_or_locality', a.suburb_or_locality,
        'city_or_town', a.city_or_town,
        'postal_code', a.postal_code
      )
    INTO p_address
    FROM public.addresses AS a
    WHERE a.id = v_context_address_id
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Development is invalid or unavailable';
    END IF;
  END IF;

  IF p_property_type = 'complex' THEN
    /*
     * Use the selected complex's address, including when moving
     * the property from another complex or another property type.
     * Never modify the shared address through this operation.
     */
    v_address_id := v_context_address_id;
  ELSE
    SELECT a.*
    INTO STRICT v_current_address
    FROM public.addresses AS a
    WHERE a.id = v_property.address_id
    FOR SHARE;

    v_address_id := v_property.address_id;

    IF ROW(
      v_current_address.street_address,
      v_current_address.suburb_or_locality,
      v_current_address.city_or_town,
      v_current_address.postal_code
    ) IS DISTINCT FROM ROW(
      btrim(p_address->>'street_address'),
      nullif(btrim(p_address->>'suburb_or_locality'), ''),
      nullif(btrim(p_address->>'city_or_town'), ''),
      nullif(btrim(p_address->>'postal_code'), '')
    ) THEN
      /*
       * Changed address values receive a new row so other
       * properties or developments sharing the old row are safe.
       * Unchanged values retain the existing address reference.
       */
      INSERT INTO public.addresses (
        street_address,
        suburb_or_locality,
        city_or_town,
        postal_code
      )
      VALUES (
        btrim(p_address->>'street_address'),
        nullif(btrim(p_address->>'suburb_or_locality'), ''),
        nullif(btrim(p_address->>'city_or_town'), ''),
        nullif(btrim(p_address->>'postal_code'), '')
      )
      RETURNING id INTO v_address_id;
    END IF;
  END IF;

  /*
   * Preserve property identity, creation time, memberships and
   * invitation assignments. All writes succeed or roll back together.
   */
  UPDATE public.properties
  SET property_type = p_property_type,
      address_id = v_address_id,
      property_context_id = v_context_id,
      unit_identifier = v_unit,
      business_name = v_business
  WHERE id = v_property.id;

  RETURN v_property.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.update_property(uuid, text, jsonb, text, text, uuid, jsonb)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.update_property(uuid, text, jsonb, text, text, uuid, jsonb)
TO authenticated, postgres;

REVOKE ALL ON FUNCTION public.update_property(
  uuid, text, jsonb, text, text, uuid, jsonb
) FROM anon;

REVOKE ALL ON FUNCTION public.update_property(
  uuid, text, jsonb, text, text, uuid, jsonb
) FROM service_role;

CREATE OR REPLACE FUNCTION public.list_property_access_accounts()
RETURNS TABLE (
  profile_id uuid,
  email text,
  role public.user_role
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
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

REVOKE ALL ON FUNCTION public.list_property_access_accounts()
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.list_property_access_accounts()
TO authenticated;

REVOKE ALL ON FUNCTION public.list_property_access_accounts()
FROM anon;

REVOKE ALL ON FUNCTION public.list_property_access_accounts()
FROM service_role;

CREATE OR REPLACE FUNCTION public.grant_property_access_bulk(
  p_profile_id uuid,
  p_property_ids uuid[]
)
RETURNS TABLE (
  membership_id uuid,
  property_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_property_ids uuid[];
  v_property_id uuid;
BEGIN
  /*
   * Authorize before validating inputs or looking up targets.
   */
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile ID is required';
  END IF;

  /*
   * A grant request must select at least one property.
   * NULL entries are invalid, even alongside valid IDs.
   */
  IF p_property_ids IS NULL
     OR cardinality(p_property_ids) = 0
  THEN
    RAISE EXCEPTION 'Select at least one property';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(p_property_ids) AS supplied(property_id)
    WHERE supplied.property_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Property selection is invalid or unavailable';
  END IF;

  /*
   * Deduplicate and sort before acquiring locks.
   * Overlapping bulk requests process properties in the same order.
   */
  SELECT array_agg(
    DISTINCT supplied.property_id
    ORDER BY supplied.property_id
  )
  INTO v_property_ids
  FROM unnest(p_property_ids) AS supplied(property_id);

  /*
   * Reuse the established grant operation:
   * - require an existing resident or contractor profile;
   * - require an existing property;
   * - create a membership or restore the existing one;
   * - preserve existing membership IDs and creation timestamps.
   *
   * These calls run inside this RPC's transaction.
   * Do not catch failures here: any error must roll back every
   * membership change made by this request.
   */
  FOREACH v_property_id IN ARRAY v_property_ids
  LOOP
    membership_id := public.grant_property_access(
      p_profile_id,
      v_property_id
    );

    property_id := v_property_id;

    RETURN NEXT;
  END LOOP;
END;
$function$;

REVOKE ALL ON FUNCTION public.grant_property_access_bulk(uuid, uuid[])
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.grant_property_access_bulk(uuid, uuid[])
TO authenticated;


REVOKE ALL ON FUNCTION public.grant_property_access_bulk(uuid, uuid[])
FROM anon;

REVOKE ALL ON FUNCTION public.grant_property_access_bulk(uuid, uuid[])
FROM service_role;

