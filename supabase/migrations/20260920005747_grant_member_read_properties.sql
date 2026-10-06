CREATE POLICY "Members can read assigned properties" ON "public"."properties"
  FOR SELECT
  TO "authenticated"
  USING (public.has_active_property_membership(id));
