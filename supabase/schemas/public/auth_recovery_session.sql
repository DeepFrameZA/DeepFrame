CREATE TABLE public.auth_recovery_sessions (
  session_id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  latest_token_expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.auth_recovery_sessions IS
  'Server-controlled record of Supabase Auth sessions created through password recovery.';

COMMENT ON COLUMN public.auth_recovery_sessions.session_id IS
  'The server-issued Supabase Auth session_id.';

COMMENT ON COLUMN public.auth_recovery_sessions.user_id IS
  'The auth.users ID associated with the recovery session.';

COMMENT ON COLUMN public.auth_recovery_sessions.latest_token_expires_at IS
  'Expiry of the most recently issued access token for this recovery session.';

ALTER TABLE public.auth_recovery_sessions ENABLE ROW LEVEL SECURITY;

/*
 * This table has no RLS policies. Browser roles must never
 * read or modify it directly.
 */
REVOKE ALL ON TABLE public.auth_recovery_sessions FROM PUBLIC;
REVOKE ALL ON TABLE public.auth_recovery_sessions FROM anon;
REVOKE ALL ON TABLE public.auth_recovery_sessions FROM authenticated;
REVOKE ALL ON TABLE public.auth_recovery_sessions FROM service_role;
