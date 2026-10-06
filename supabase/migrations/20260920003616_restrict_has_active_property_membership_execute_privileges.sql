SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."has_active_property_membership"(uuid) FROM "anon";

REVOKE ALL ON FUNCTION "public"."has_active_property_membership"(uuid) FROM "service_role";

REVOKE ALL ON FUNCTION "public"."has_active_property_membership"(uuid) FROM PUBLIC;
