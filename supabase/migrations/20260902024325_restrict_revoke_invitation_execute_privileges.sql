SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."revoke_invitation"(uuid) FROM "anon";

REVOKE ALL ON FUNCTION "public"."revoke_invitation"(uuid) FROM "service_role";
