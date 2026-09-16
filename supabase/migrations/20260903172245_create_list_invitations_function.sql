SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.list_invitations()
  RETURNS TABLE (
    invitation_id  uuid,
    invited_email  text,
    role           public.user_role,
    created_at     timestamp with time zone,
    expires_at     timestamp with time zone,
    used_at        timestamp with time zone,
    revoked_at     timestamp with time zone,
    derived_status text
  )
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."list_invitations"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."list_invitations"() TO "authenticated", "postgres";
