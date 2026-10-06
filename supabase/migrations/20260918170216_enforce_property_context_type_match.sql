ALTER TABLE "public"."properties"
  DROP CONSTRAINT "properties_property_context_id_fkey";

ALTER TABLE "public"."property_contexts"
  ADD CONSTRAINT "property_contexts_id_context_type_key" UNIQUE (id, context_type);

ALTER TABLE "public"."properties"
  ADD CONSTRAINT "properties_property_context_id_fkey" FOREIGN KEY (property_context_id, property_type) REFERENCES public.property_contexts(id, context_type) ON DELETE RESTRICT;
