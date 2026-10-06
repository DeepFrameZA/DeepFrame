CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  property_type text NOT NULL,
  address_id uuid NOT NULL
    REFERENCES public.addresses(id) ON DELETE RESTRICT,

  property_context_id uuid,
  unit_identifier text,
  business_name text,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT properties_property_type_check
    CHECK (
      property_type IN (
        'freestanding_house',
        'estate',
        'complex',
        'farm',
        'business',
        'office_park',
        'other'
      )
    ),

  CONSTRAINT properties_context_requirement_check
    CHECK (
      (
        property_type IN ('estate', 'complex', 'office_park')
        AND property_context_id IS NOT NULL
      )
      OR
      (
        property_type NOT IN ('estate', 'complex', 'office_park')
        AND property_context_id IS NULL
      )
    ),

  CONSTRAINT properties_unit_identifier_check
    CHECK (
      unit_identifier IS NULL
      OR btrim(unit_identifier) <> ''
    ),

  CONSTRAINT properties_unit_requirement_check
    CHECK (
      property_type NOT IN ('estate', 'complex', 'office_park')
      OR (
        unit_identifier IS NOT NULL
        AND btrim(unit_identifier) <> ''
      )
    ),

  CONSTRAINT properties_business_name_check
    CHECK (
      business_name IS NULL
      OR btrim(business_name) <> ''
    ),

  CONSTRAINT properties_business_name_requirement_check
    CHECK (
      property_type NOT IN ('business', 'office_park')
      OR (
        business_name IS NOT NULL
        AND btrim(business_name) <> ''
      )
    )
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.properties
FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_property_context_id_fkey
  FOREIGN KEY (property_context_id, property_type)
  REFERENCES public.property_contexts (id, context_type)
  ON DELETE RESTRICT;

CREATE POLICY "Admins can read properties"
ON public.properties
FOR SELECT
TO authenticated
USING (
  (SELECT public.is_admin())
);

CREATE POLICY "Admins can create properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT public.is_admin())
);

CREATE POLICY "Admins can update properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (
  (SELECT public.is_admin())
)
WITH CHECK (
  (SELECT public.is_admin())
);

CREATE POLICY "Members can read assigned properties"
ON public.properties
FOR SELECT
TO authenticated
USING (
  public.has_active_property_membership(id)
);

GRANT SELECT, INSERT, UPDATE
ON TABLE public.properties
TO authenticated;
