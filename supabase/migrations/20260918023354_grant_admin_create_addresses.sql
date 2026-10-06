CREATE POLICY "Admins can create addresses" ON "public"."addresses"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (( SELECT public.is_admin() AS is_admin));

REVOKE ALL ON TABLE "public"."addresses" FROM "authenticated";

GRANT INSERT, SELECT ON TABLE "public"."addresses" TO "authenticated";
