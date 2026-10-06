SET local check_function_bodies = off;

DROP FUNCTION "public"."list_invitations"();

CREATE OR REPLACE FUNCTION public.list_invitations()
  RETURNS TABLE (
    invitation_id  uuid,
    invited_email  text,
    role           public.user_role,
    created_at     timestamp with time zone,
    expires_at     timestamp with time zone,
    used_at        timestamp with time zone,
    revoked_at     timestamp with time zone,
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

REVOKE ALL ON FUNCTION "public"."list_invitations"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."list_invitations"() TO "authenticated", "postgres";
