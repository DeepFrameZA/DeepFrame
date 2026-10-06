CREATE POLICY "Admins can create property contexts" ON "public"."property_contexts"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (( SELECT public.is_admin() AS is_admin));

CREATE POLICY "Admins can read property contexts" ON "public"."property_contexts"
  FOR SELECT
  TO "authenticated"
  USING (( SELECT public.is_admin() AS is_admin));

CREATE POLICY "Admins can update property contexts" ON "public"."property_contexts"
  FOR UPDATE
  TO "authenticated"
  USING (( SELECT public.is_admin() AS is_admin))
  WITH CHECK (( SELECT public.is_admin() AS is_admin));

REVOKE ALL ON TABLE "public"."property_contexts" FROM "authenticated";

GRANT INSERT, SELECT, UPDATE ON TABLE "public"."property_contexts" TO "authenticated";
