CREATE TABLE "public"."signup_tickets" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "invitation_id" uuid                     NOT NULL,
  "ticket_hash"   text                     NOT NULL,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at"    timestamp with time zone NOT NULL,
  "consumed_at"   timestamp with time zone,
  CONSTRAINT "signup_tickets_expiry_check" CHECK ((expires_at > created_at)),
  CONSTRAINT "signup_tickets_pkey" PRIMARY KEY (id),
  CONSTRAINT "signup_tickets_ticket_hash_check" CHECK ((ticket_hash ~ '^[0-9a-f]{64}$'::text)),
  CONSTRAINT "signup_tickets_ticket_hash_key" UNIQUE (ticket_hash)
);

ALTER TABLE "public"."signup_tickets"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."signup_tickets"
  ADD CONSTRAINT "signup_tickets_invitation_id_fkey" FOREIGN KEY (invitation_id) REFERENCES public.invites(id) ON DELETE RESTRICT;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."signup_tickets" TO "anon", "authenticated", "postgres", "service_role";
