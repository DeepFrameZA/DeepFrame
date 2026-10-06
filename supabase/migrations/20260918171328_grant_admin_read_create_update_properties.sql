CREATE POLICY "Admins can create properties" ON "public"."properties"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (( SELECT public.is_admin() AS is_admin));

CREATE POLICY "Admins can read properties" ON "public"."properties"
  FOR SELECT
  TO "authenticated"
  USING (( SELECT public.is_admin() AS is_admin));

CREATE POLICY "Admins can update properties" ON "public"."properties"
  FOR UPDATE
  TO "authenticated"
  USING (( SELECT public.is_admin() AS is_admin))
  WITH CHECK (( SELECT public.is_admin() AS is_admin));

REVOKE ALL ON TABLE "public"."properties" FROM "authenticated";

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."properties" TO "authenticated";
