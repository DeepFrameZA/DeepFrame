CREATE POLICY "Members can read assigned property addresses" ON "public"."addresses"
  FOR SELECT
  TO "authenticated"
  USING (((EXISTS ( SELECT 1
   FROM public.properties p
  WHERE ((p.address_id = addresses.id) AND public.has_active_property_membership(p.id)))) OR (EXISTS ( SELECT 1
   FROM (public.property_contexts pc
     JOIN public.properties p ON ((p.property_context_id = pc.id)))
  WHERE ((pc.address_id = addresses.id) AND public.has_active_property_membership(p.id))))));
