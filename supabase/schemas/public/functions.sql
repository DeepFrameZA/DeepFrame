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
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text;
BEGIN
  /*
   * Normalize the prospective Auth user's email using
   * the same rules as the invitation subsystem.
   */
  v_email := lower(btrim(event->'user'->>'email'));

  /*
   * Allow account creation only when the email currently
   * has an active resident or contractor invitation.
   *
   * This hook controls Auth account creation. It does not
   * verify or consume the invitation code; that remains
   * redeem_invitation()'s responsibility after confirmation.
   */
  IF v_email IS NOT NULL
     AND v_email <> ''
     AND EXISTS (
       SELECT 1
       FROM public.invites
       WHERE public.invites.invited_email = v_email
         AND public.invites.used_at IS NULL
         AND public.invites.revoked_at IS NULL
         AND public.invites.expires_at > now()
         AND public.invites.role IN (
           'resident'::public.user_role,
           'contractor'::public.user_role
         )
     )
  THEN
    RETURN '{}'::jsonb;
  END IF;

  /*
   * Return one generic rejection without revealing whether
   * the email was missing, malformed, uninvited, or associated
   * with an expired, revoked, or used invitation.
   */
  RETURN jsonb_build_object(
    'error',
    jsonb_build_object(
      'http_code',
      403,
      'message',
      'Registration requires an active invitation.'
    )
  );
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
  p_role public.user_role
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
$$;

REVOKE ALL ON FUNCTION public.create_invitation(text, public.user_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_invitation(text, public.user_role) FROM anon;
REVOKE ALL ON FUNCTION public.create_invitation(text, public.user_role) FROM service_role;

GRANT EXECUTE ON FUNCTION public.create_invitation(text, public.user_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_invitation(
  p_code text
)
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_code text;
  v_code_hash text;
  v_invite public.invites%ROWTYPE;
BEGIN
  /*
   * The caller must already be authenticated through
   * Supabase Auth.
   */
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  /*
   * Determine the authenticated user's email from auth.users.
   * The client is never trusted to supply its own identity
   * or email address.
   */
  SELECT lower(btrim(auth.users.email))
  INTO v_email
  FROM auth.users
  WHERE auth.users.id = v_uid;

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Authenticated account has no email address';
  END IF;

  /*
   * An invitation is an onboarding mechanism only.
   * It must never be usable to modify an existing profile
   * or change an existing user's role.
   */
  IF EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE public.profiles.id = v_uid
  ) THEN
    RAISE EXCEPTION 'Profile already exists';
  END IF;

  /*
   * Normalize the human-friendly invitation code.
   *
   * Codes may be entered as:
   *
   *   ABCD-EFGH-JKLM
   *   ABCD EFGH JKLM
   *   abcdefghjklm
   *
   * The canonical form is 12 uppercase characters with
   * separators removed.
   */
  v_code := upper(
    replace(
      replace(
        btrim(p_code),
        '-',
        ''
      ),
      ' ',
      ''
    )
  );

  /*
   * Reject null, malformed, or unexpected codes before
   * performing the hash lookup.
   */
  IF v_code IS NULL
     OR char_length(v_code) <> 12
     OR v_code !~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{12}$'
  THEN
    RAISE EXCEPTION 'Invitation is invalid or unavailable';
  END IF;

  /*
   * Hash the normalized code exactly as create_invitation()
   * hashes the canonical invitation secret.
   */
  v_code_hash := encode(
    extensions.digest(v_code, 'sha256'),
    'hex'
  );

  /*
   * Locate and lock the matching invitation.
   *
   * FOR UPDATE prevents two concurrent redemption attempts
   * from successfully consuming the same invitation.
   */
  SELECT public.invites.*
  INTO v_invite
  FROM public.invites
  WHERE public.invites.code_hash = v_code_hash
  FOR UPDATE;

  /*
   * Use the same generic response for invalid, used,
   * revoked, expired, or email-mismatched invitations.
   * This avoids revealing invitation state to callers.
   */
  IF NOT FOUND
     OR v_invite.used_at IS NOT NULL
     OR v_invite.revoked_at IS NOT NULL
     OR v_invite.expires_at <= now()
     OR v_invite.invited_email <> v_email
  THEN
    RAISE EXCEPTION 'Invitation is invalid or unavailable';
  END IF;

  /*
   * Create the application profile using only trusted
   * database-derived values:
   *
   *   id   -> authenticated user's auth.uid()
   *   role -> role stored on the invitation
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
   * Consume the invitation in the same transaction as
   * profile creation. If either operation fails, PostgreSQL
   * rolls the entire function call back.
   */
  UPDATE public.invites
  SET used_at = now()
  WHERE public.invites.id = v_invite.id;

  RETURN v_invite.role;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_invitation(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_invitation(text) FROM anon;
REVOKE ALL ON FUNCTION public.redeem_invitation(text) FROM service_role;

GRANT EXECUTE ON FUNCTION public.redeem_invitation(text) TO authenticated;

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
   * revoke_invitation() and redeem_invitation() both use
   * FOR UPDATE, so concurrent revocation and redemption
   * attempts are serialized against the same row.
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
  invitation_id uuid,
  invited_email text,
  role public.user_role,
  created_at timestamptz,
  expires_at timestamptz,
  used_at timestamptz,
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
   * Derive the caller from the authenticated JWT rather
   * than accepting an identity from the client.
   */
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  /*
   * Authenticated clients may invoke this RPC, but only an
   * administrator may view invitation history.
   */
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  /*
   * Return only the fields deliberately approved for the
   * admin interface. Never expose code_hash or a raw code.
   *
   * Status is derived from lifecycle timestamps rather than
   * stored separately. Ordering is deterministic, including
   * when multiple invitations share the same creation time.
   */
  RETURN QUERY
  SELECT
    public.invites.id AS invitation_id,
    public.invites.invited_email,
    public.invites.role,
    public.invites.created_at,
    public.invites.expires_at,
    public.invites.used_at,
    public.invites.revoked_at,
    CASE
      WHEN public.invites.used_at IS NOT NULL THEN 'used'
      WHEN public.invites.revoked_at IS NOT NULL THEN 'revoked'
      WHEN public.invites.expires_at <= now() THEN 'expired'
      ELSE 'pending'
    END AS derived_status
  FROM public.invites
  ORDER BY
    public.invites.created_at DESC,
    public.invites.id DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_invitations() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_invitations() FROM anon;
REVOKE ALL ON FUNCTION public.list_invitations() FROM service_role;

GRANT EXECUTE ON FUNCTION public.list_invitations() TO authenticated;
