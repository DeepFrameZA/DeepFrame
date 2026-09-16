SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.revoke_invitation (
  p_invitation_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."revoke_invitation"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."revoke_invitation"(uuid) TO "authenticated", "postgres";
