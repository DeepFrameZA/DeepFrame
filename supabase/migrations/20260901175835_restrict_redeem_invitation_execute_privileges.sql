SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."redeem_invitation"(text) FROM "anon";

REVOKE ALL ON FUNCTION "public"."redeem_invitation"(text) FROM "service_role";
