CREATE TABLE "public"."property_contexts" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "context_type" text                     NOT NULL,
  "name"         text                     NOT NULL,
  "address_id"   uuid                     NOT NULL,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "property_contexts_context_type_check" CHECK ((context_type = ANY (ARRAY['estate'::text, 'office_park'::text]))),
  CONSTRAINT "property_contexts_name_check" CHECK ((btrim(name) <> ''::text)),
  CONSTRAINT "property_contexts_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."property_contexts"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."property_contexts"
  ADD CONSTRAINT "property_contexts_address_id_fkey" FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE RESTRICT;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."property_contexts" TO "anon", "authenticated", "postgres", "service_role";
