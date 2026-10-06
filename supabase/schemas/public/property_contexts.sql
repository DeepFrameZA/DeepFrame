CREATE TABLE public.property_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type text NOT NULL
    CHECK (context_type IN ('estate', 'complex', 'office_park')),
  name text NOT NULL
    CHECK (btrim(name) <> ''),
  address_id uuid NOT NULL
    REFERENCES public.addresses(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_contexts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.property_contexts
FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE
ON TABLE public.property_contexts
TO authenticated;

CREATE POLICY "Admins can read property contexts"
ON public.property_contexts
FOR SELECT
TO authenticated
USING ((SELECT public.is_admin()));

CREATE POLICY "Admins can create property contexts"
ON public.property_contexts
FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can update property contexts"
ON public.property_contexts
FOR UPDATE
TO authenticated
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Members can read assigned property contexts"
ON public.property_contexts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.properties AS p
    WHERE p.property_context_id = property_contexts.id
      AND public.has_active_property_membership(p.id)
  )
);

ALTER TABLE public.property_contexts
  ADD CONSTRAINT property_contexts_id_context_type_key
  UNIQUE (id, context_type);
