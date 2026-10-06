CREATE TABLE "public"."property_memberships" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "profile_id"  uuid                     NOT NULL,
  "property_id" uuid                     NOT NULL,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "revoked_at"  timestamp with time zone,
  CONSTRAINT "property_memberships_pkey" PRIMARY KEY (id),
  CONSTRAINT "property_memberships_profile_property_key" UNIQUE (profile_id, property_id)
);

ALTER TABLE "public"."property_memberships"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."property_memberships"
  ADD CONSTRAINT "property_memberships_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."property_memberships"
  ADD CONSTRAINT "property_memberships_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE RESTRICT;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."property_memberships" TO "anon", "authenticated", "postgres", "service_role";
