SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."list_invitations"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."list_invitations"() FROM "service_role";
