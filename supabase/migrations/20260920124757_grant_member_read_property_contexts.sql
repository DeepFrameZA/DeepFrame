CREATE POLICY "Members can read assigned property contexts" ON "public"."property_contexts"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.properties p
  WHERE ((p.property_context_id = property_contexts.id) AND public.has_active_property_membership(p.id)))));
