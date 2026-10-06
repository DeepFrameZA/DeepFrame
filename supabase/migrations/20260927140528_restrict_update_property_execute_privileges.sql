SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."update_property"(uuid, text, jsonb, text, text, uuid, jsonb) FROM "anon";

REVOKE ALL ON FUNCTION "public"."update_property"(uuid, text, jsonb, text, text, uuid, jsonb) FROM "service_role";
