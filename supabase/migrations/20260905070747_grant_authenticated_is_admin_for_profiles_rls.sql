SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "authenticated";
