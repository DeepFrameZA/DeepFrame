SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."create_invitation"(text, public.user_role) FROM "anon";

REVOKE ALL ON FUNCTION "public"."create_invitation"(text, public.user_role) FROM "service_role";
