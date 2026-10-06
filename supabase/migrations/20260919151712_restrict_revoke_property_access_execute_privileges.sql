SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."revoke_property_access"(uuid) FROM "anon";

REVOKE ALL ON FUNCTION "public"."revoke_property_access"(uuid) FROM "service_role";

REVOKE ALL ON FUNCTION "public"."revoke_property_access"(uuid) FROM PUBLIC;
