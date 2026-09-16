SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.before_user_created (
  event jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."before_user_created"(jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."before_user_created"(jsonb) TO "postgres", "supabase_auth_admin";
