CREATE POLICY "Admins can update addresses" ON "public"."addresses"
  FOR UPDATE
  TO "authenticated"
  USING (( SELECT public.is_admin() AS is_admin))
  WITH CHECK (( SELECT public.is_admin() AS is_admin));

REVOKE ALL ON TABLE "public"."addresses" FROM "authenticated";

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."addresses" TO "authenticated";
