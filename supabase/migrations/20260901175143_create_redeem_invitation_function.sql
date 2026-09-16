SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.redeem_invitation (
  p_code text
)
  RETURNS public.user_role
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."redeem_invitation"(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."redeem_invitation"(text) TO "authenticated", "postgres";
