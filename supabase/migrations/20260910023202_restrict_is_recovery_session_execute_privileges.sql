SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."is_recovery_session"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."is_recovery_session"() FROM "service_role";
