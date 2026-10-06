CREATE TABLE public.property_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  profile_id uuid NOT NULL
    REFERENCES public.profiles(id) ON DELETE RESTRICT,

  property_id uuid NOT NULL
    REFERENCES public.properties(id) ON DELETE RESTRICT,

  created_at timestamptz NOT NULL DEFAULT now(),

  revoked_at timestamptz,

  CONSTRAINT property_memberships_profile_property_key
    UNIQUE (profile_id, property_id)
);

ALTER TABLE public.property_memberships
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.property_memberships
FROM PUBLIC, anon, authenticated, service_role;
