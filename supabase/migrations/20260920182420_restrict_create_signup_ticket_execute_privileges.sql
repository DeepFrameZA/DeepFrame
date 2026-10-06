SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."create_signup_ticket"(text, text) FROM "service_role";

REVOKE ALL ON FUNCTION "public"."create_signup_ticket"(text, text) FROM PUBLIC;
