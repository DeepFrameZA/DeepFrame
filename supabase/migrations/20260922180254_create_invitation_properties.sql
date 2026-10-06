CREATE TABLE "public"."invitation_properties" (
  "invitation_id" uuid                     NOT NULL,
  "property_id"   uuid                     NOT NULL,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "invitation_properties_pkey" PRIMARY KEY (invitation_id, property_id)
);

ALTER TABLE "public"."invitation_properties"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."invitation_properties"
  ADD CONSTRAINT "invitation_properties_invitation_id_fkey" FOREIGN KEY (invitation_id) REFERENCES public.invites(id) ON DELETE RESTRICT;

ALTER TABLE "public"."invitation_properties"
  ADD CONSTRAINT "invitation_properties_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE RESTRICT;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."invitation_properties" TO "anon", "authenticated", "postgres", "service_role";
