SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook (
  event jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;
