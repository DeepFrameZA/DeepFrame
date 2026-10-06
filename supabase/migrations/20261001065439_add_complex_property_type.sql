ALTER TABLE "public"."properties"
  DROP CONSTRAINT "properties_context_requirement_check";

ALTER TABLE "public"."properties"
  DROP CONSTRAINT "properties_property_type_check";

ALTER TABLE "public"."properties"
  DROP CONSTRAINT "properties_unit_requirement_check";

ALTER TABLE "public"."property_contexts"
  DROP CONSTRAINT "property_contexts_context_type_check";

ALTER TABLE "public"."properties"
  ADD CONSTRAINT "properties_context_requirement_check" CHECK ((((property_type = ANY (ARRAY['estate'::text, 'complex'::text, 'office_park'::text])) AND (property_context_id IS
    NOT NULL)) OR ((property_type <> ALL (ARRAY['estate'::text, 'complex'::text, 'office_park'::text])) AND (property_context_id IS NULL))));

ALTER TABLE "public"."properties"
  ADD CONSTRAINT "properties_property_type_check"
    CHECK ((property_type = ANY (ARRAY['freestanding_house'::text, 'estate'::text, 'complex'::text, 'farm'::text, 'business'::text, 'office_park'::text, 'other'::text])));

ALTER TABLE "public"."properties"
  ADD CONSTRAINT "properties_unit_requirement_check" CHECK (((property_type <> ALL (ARRAY['estate'::text, 'complex'::text, 'office_park'::text])) OR ((unit_identifier IS
    NOT NULL) AND (btrim(unit_identifier) <> ''::text))));

ALTER TABLE "public"."property_contexts"
  ADD CONSTRAINT "property_contexts_context_type_check" CHECK ((context_type = ANY (ARRAY['estate'::text, 'complex'::text, 'office_park'::text])));
