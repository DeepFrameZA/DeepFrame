CREATE POLICY "Admins can read addresses" ON "public"."addresses"
  FOR SELECT
  TO "authenticated"
  USING (( SELECT public.is_admin() AS is_admin));

REVOKE ALL ON TABLE "public"."addresses" FROM "authenticated";

GRANT SELECT ON TABLE "public"."addresses" TO "authenticated";
