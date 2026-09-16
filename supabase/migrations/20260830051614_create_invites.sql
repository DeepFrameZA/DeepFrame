CREATE TABLE "public"."invites" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "code_hash"  text                     NOT NULL,
  "role"       public.user_role         NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone,
  "used_at"    timestamp with time zone,
  CONSTRAINT "invites_code_hash_key" UNIQUE (code_hash),
  CONSTRAINT "invites_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."invites"
  ENABLE ROW LEVEL SECURITY;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."invites" TO "anon", "authenticated", "postgres", "service_role";
