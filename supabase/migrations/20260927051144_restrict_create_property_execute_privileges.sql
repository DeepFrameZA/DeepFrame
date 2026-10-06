SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."create_property"(text, jsonb, text, text, uuid, jsonb) FROM "anon";

REVOKE ALL ON FUNCTION "public"."create_property"(text, jsonb, text, text, uuid, jsonb) FROM "service_role";
