CREATE TABLE public.signup_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  invitation_id uuid NOT NULL
    REFERENCES public.invites(id) ON DELETE RESTRICT,

  ticket_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  auth_user_id uuid,

  CONSTRAINT signup_tickets_ticket_hash_check
    CHECK (ticket_hash ~ '^[0-9a-f]{64}$'),

  CONSTRAINT signup_tickets_expiry_check
    CHECK (expires_at > created_at)
);

ALTER TABLE public.signup_tickets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.signup_tickets
FROM PUBLIC, anon, authenticated, service_role;
