CREATE TABLE "public"."properties" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "property_type"       text                     NOT NULL,
  "address_id"          uuid                     NOT NULL,
  "property_context_id" uuid,
  "unit_identifier"     text,
  "business_name"       text,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "properties_business_name_check" CHECK (((business_name IS NULL) OR (btrim(business_name) <> ''::text))),
  CONSTRAINT "properties_business_name_requirement_check" CHECK (((property_type <> ALL (ARRAY['business'::text, 'office_park'::text])) OR ((business_name IS
    NOT NULL) AND (btrim(business_name) <> ''::text)))),
  CONSTRAINT "properties_context_requirement_check" CHECK ((((property_type = ANY (ARRAY['estate'::text, 'office_park'::text])) AND (property_context_id IS
    NOT NULL)) OR ((property_type <> ALL (ARRAY['estate'::text, 'office_park'::text])) AND (property_context_id IS NULL)))),
  CONSTRAINT "properties_pkey" PRIMARY KEY (id),
  CONSTRAINT "properties_property_type_check"
    CHECK ((property_type = ANY (ARRAY['freestanding_house'::text, 'estate'::text, 'farm'::text, 'business'::text, 'office_park'::text, 'other'::text]))),
  CONSTRAINT "properties_unit_identifier_check" CHECK (((unit_identifier IS NULL) OR (btrim(unit_identifier) <> ''::text))),
  CONSTRAINT "properties_unit_requirement_check" CHECK (((property_type <> ALL (ARRAY['estate'::text, 'office_park'::text])) OR ((unit_identifier IS
    NOT NULL) AND (btrim(unit_identifier) <> ''::text))))
);

ALTER TABLE "public"."properties"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."properties"
  ADD CONSTRAINT "properties_address_id_fkey" FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE RESTRICT;

ALTER TABLE "public"."properties"
  ADD CONSTRAINT "properties_property_context_id_fkey" FOREIGN KEY (property_context_id) REFERENCES public.property_contexts(id) ON DELETE RESTRICT;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."properties" TO "anon", "authenticated", "postgres", "service_role";
