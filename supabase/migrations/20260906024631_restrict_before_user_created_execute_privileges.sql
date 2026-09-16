SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."before_user_created"(jsonb) FROM "anon";

REVOKE ALL ON FUNCTION "public"."before_user_created"(jsonb) FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."before_user_created"(jsonb) FROM "service_role";
