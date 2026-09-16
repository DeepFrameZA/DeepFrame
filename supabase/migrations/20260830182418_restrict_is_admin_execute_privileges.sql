SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM "service_role";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
