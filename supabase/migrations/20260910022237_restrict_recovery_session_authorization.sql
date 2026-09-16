SET local check_function_bodies = off;

DROP POLICY "Users can read their own profile" ON "public"."profiles";

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_recovery_session()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

CREATE POLICY "Users can read their own profile" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING (((( SELECT auth.uid() AS uid) = id) AND (NOT ( SELECT public.is_recovery_session() AS is_recovery_session))));

REVOKE ALL ON FUNCTION "public"."is_recovery_session"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_recovery_session"() TO "authenticated", "postgres";
