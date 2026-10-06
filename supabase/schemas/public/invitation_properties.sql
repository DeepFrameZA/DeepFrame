CREATE TABLE public.invitation_properties (
  invitation_id uuid NOT NULL,
  property_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invitation_properties_pkey PRIMARY KEY (invitation_id, property_id),
  CONSTRAINT invitation_properties_invitation_id_fkey FOREIGN KEY (invitation_id) REFERENCES public.invites (id) ON DELETE RESTRICT,
  CONSTRAINT invitation_properties_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties (id) ON DELETE RESTRICT
);

ALTER TABLE public.invitation_properties ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.invitation_properties
FROM PUBLIC, anon, authenticated, service_role;
