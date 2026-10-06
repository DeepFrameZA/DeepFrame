SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."list_property_access_accounts"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."list_property_access_accounts"() FROM "service_role";
