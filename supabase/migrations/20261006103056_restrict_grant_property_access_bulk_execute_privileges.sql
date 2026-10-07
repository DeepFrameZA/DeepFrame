SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."grant_property_access_bulk"(uuid, uuid[]) FROM "anon";

REVOKE ALL ON FUNCTION "public"."grant_property_access_bulk"(uuid, uuid[]) FROM "service_role";
