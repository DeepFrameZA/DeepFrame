SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"(jsonb) FROM "anon";

REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"(jsonb) FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"(jsonb) FROM "service_role";

REVOKE ALL ON TABLE "public"."auth_recovery_sessions" FROM "anon";

REVOKE ALL ON TABLE "public"."auth_recovery_sessions" FROM "authenticated";

REVOKE ALL ON TABLE "public"."auth_recovery_sessions" FROM "service_role";
