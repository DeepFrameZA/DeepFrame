SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.before_user_created (
  event jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;
