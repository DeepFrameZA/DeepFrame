SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."complete_registration"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."complete_registration"() FROM "service_role";
