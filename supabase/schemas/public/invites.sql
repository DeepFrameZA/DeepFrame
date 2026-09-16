CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_email text NOT NULL,
  code_hash text NOT NULL UNIQUE,
  role public.user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.invites FROM PUBLIC;
REVOKE ALL ON TABLE public.invites FROM anon;
REVOKE ALL ON TABLE public.invites FROM authenticated;
