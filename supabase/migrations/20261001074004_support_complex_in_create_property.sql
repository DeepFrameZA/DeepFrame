SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_property (
  p_property_type   text,
  p_address         jsonb,
  p_unit_identifier text  DEFAULT NULL::text,
  p_business_name   text  DEFAULT NULL::text,
  p_context_id      uuid  DEFAULT NULL::uuid,
  p_new_context     jsonb DEFAULT NULL::jsonb
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_property_id uuid;
  v_address_id uuid;
  v_context_address_id uuid;
  v_context_id uuid;
  v_unit text := nullif(btrim(p_unit_identifier), '');
  v_business text := nullif(btrim(p_business_name), '');
  v_needs_context boolean;
  v_address jsonb;
  v_key text;
BEGIN
  /*
   * Authorization precedes input validation.
   */
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_property_type IS NULL OR p_property_type NOT IN (
    'freestanding_house',
    'estate',
    'complex',
    'farm',
    'business',
    'office_park',
    'other'
  ) THEN
    RAISE EXCEPTION 'Invalid property type';
  END IF;

  v_needs_context := p_property_type IN (
    'estate', 'complex', 'office_park'
  );

  IF v_needs_context THEN
    IF (p_context_id IS NULL) = (p_new_context IS NULL) THEN
      RAISE EXCEPTION
        'Select an existing development or provide a new development';
    END IF;

    IF v_unit IS NULL THEN
      RAISE EXCEPTION 'Unit or building identifier is required';
    END IF;
  ELSIF p_context_id IS NOT NULL OR p_new_context IS NOT NULL THEN
    RAISE EXCEPTION 'This property type cannot have a development';
  END IF;

  IF p_property_type IN ('business', 'office_park')
     AND v_business IS NULL
  THEN
    RAISE EXCEPTION 'Business name is required';
  END IF;

  /*
   * A complex unit inherits its development's address.
   * Reject a separate address instead of silently ignoring it.
   */
  IF p_property_type = 'complex' AND p_address IS NOT NULL THEN
    RAISE EXCEPTION
      'Complex properties use the complex address; omit the property address';
  END IF;

  IF p_new_context IS NOT NULL THEN
    IF jsonb_typeof(p_new_context) IS DISTINCT FROM 'object'
       OR jsonb_typeof(p_new_context->'name') IS DISTINCT FROM 'string'
       OR nullif(btrim(p_new_context->>'name'), '') IS NULL
    THEN
      RAISE EXCEPTION 'Development name is required';
    END IF;
  END IF;

  /*
   * Validate only the addresses that will be created.
   *
   * Existing complex: no address input.
   * New complex: development address only.
   * Other types: property address and any new development address.
   */
  FOR v_address IN
    SELECT p_address
    WHERE p_property_type <> 'complex'

    UNION ALL

    SELECT p_new_context->'address'
    WHERE p_new_context IS NOT NULL
  LOOP
    IF jsonb_typeof(v_address) IS DISTINCT FROM 'object'
       OR jsonb_typeof(v_address->'street_address') IS DISTINCT FROM 'string'
       OR nullif(btrim(v_address->>'street_address'), '') IS NULL
    THEN
      RAISE EXCEPTION 'Street address is required';
    END IF;

    FOREACH v_key IN ARRAY ARRAY[
      'suburb_or_locality',
      'city_or_town',
      'postal_code'
    ]
    LOOP
      IF v_address ? v_key
         AND jsonb_typeof(v_address->v_key) NOT IN ('string', 'null')
      THEN
        RAISE EXCEPTION 'Address fields must be text';
      END IF;
    END LOOP;
  END LOOP;

  IF p_context_id IS NOT NULL THEN
    /*
     * Keep the selected development's type and address reference
     * stable until property creation finishes.
     */
    SELECT pc.id, pc.address_id
    INTO v_context_id, v_context_address_id
    FROM public.property_contexts AS pc
    WHERE pc.id = p_context_id
      AND pc.context_type = p_property_type
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Development is invalid or unavailable';
    END IF;

  ELSIF p_new_context IS NOT NULL THEN
    v_address := p_new_context->'address';

    INSERT INTO public.addresses (
      street_address,
      suburb_or_locality,
      city_or_town,
      postal_code
    )
    VALUES (
      btrim(v_address->>'street_address'),
      nullif(btrim(v_address->>'suburb_or_locality'), ''),
      nullif(btrim(v_address->>'city_or_town'), ''),
      nullif(btrim(v_address->>'postal_code'), '')
    )
    RETURNING id INTO v_context_address_id;

    INSERT INTO public.property_contexts (
      context_type,
      name,
      address_id
    )
    VALUES (
      p_property_type,
      btrim(p_new_context->>'name'),
      v_context_address_id
    )
    RETURNING id INTO v_context_id;
  END IF;

  IF p_property_type = 'complex' THEN
    /*
     * Reference the same address row as the complex.
     * Do not create a duplicate address for the unit.
     */
    v_address_id := v_context_address_id;
  ELSE
    INSERT INTO public.addresses (
      street_address,
      suburb_or_locality,
      city_or_town,
      postal_code
    )
    VALUES (
      btrim(p_address->>'street_address'),
      nullif(btrim(p_address->>'suburb_or_locality'), ''),
      nullif(btrim(p_address->>'city_or_town'), ''),
      nullif(btrim(p_address->>'postal_code'), '')
    )
    RETURNING id INTO v_address_id;
  END IF;

  INSERT INTO public.properties (
    property_type,
    address_id,
    property_context_id,
    unit_identifier,
    business_name
  )
  VALUES (
    p_property_type,
    v_address_id,
    v_context_id,
    v_unit,
    v_business
  )
  RETURNING id INTO v_property_id;

  RETURN v_property_id;
END;
$function$;
