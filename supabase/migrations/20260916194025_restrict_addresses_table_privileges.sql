REVOKE ALL ON TABLE "public"."addresses" FROM "anon";

REVOKE ALL ON TABLE "public"."addresses" FROM "authenticated";

REVOKE ALL ON TABLE "public"."addresses" FROM "service_role";
