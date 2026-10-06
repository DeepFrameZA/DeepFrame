SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."create_invitation"(text, public.user_role, uuid[]) FROM "anon";

REVOKE ALL ON FUNCTION "public"."create_invitation"(text, public.user_role, uuid[]) FROM "service_role";
