SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."list_property_memberships"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."list_property_memberships"() FROM "service_role";

REVOKE ALL ON FUNCTION "public"."list_property_memberships"() FROM PUBLIC;
