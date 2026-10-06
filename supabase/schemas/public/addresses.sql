CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street_address text NOT NULL
    CHECK (btrim(street_address) <> ''),
  suburb_or_locality text,
  city_or_town text,
  postal_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.addresses FROM PUBLIC;
REVOKE ALL ON TABLE public.addresses FROM anon;
REVOKE ALL ON TABLE public.addresses FROM authenticated;
REVOKE ALL ON TABLE public.addresses FROM service_role;

GRANT SELECT ON TABLE public.addresses TO authenticated;

CREATE POLICY "Admins can read addresses"
ON public.addresses
FOR SELECT
TO authenticated
USING ((SELECT public.is_admin()));

GRANT INSERT ON TABLE public.addresses TO authenticated;

CREATE POLICY "Admins can create addresses"
ON public.addresses
FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Members can read assigned property addresses"
ON public.addresses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.properties AS p
    WHERE p.address_id = addresses.id
      AND public.has_active_property_membership(p.id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.property_contexts AS pc
    JOIN public.properties AS p
      ON p.property_context_id = pc.id
    WHERE pc.address_id = addresses.id
      AND public.has_active_property_membership(p.id)
  )
);

CREATE POLICY "Admins can update addresses"
ON public.addresses
FOR UPDATE
TO authenticated
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

GRANT UPDATE ON TABLE public.addresses TO authenticated;
