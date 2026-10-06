SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_property (
  p_property_id     uuid,
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
  v_property public.properties%ROWTYPE;
  v_current_address public.addresses%ROWTYPE;
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
   * Authorization precedes target lookup and input validation.
   */
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT p.*
  INTO v_property
  FROM public.properties AS p
  WHERE p.id = p_property_id
  FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property is invalid or unavailable';
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
   * Complex units have no separate property address input.
   * A newly created development still requires its own address.
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
     * Hold the selected development's type and address reference
     * stable until the edit finishes.
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
     * Use the selected complex's address, including when moving
     * the property from another complex or another property type.
     * Never modify the shared address through this operation.
     */
    v_address_id := v_context_address_id;
  ELSE
    SELECT a.*
    INTO STRICT v_current_address
    FROM public.addresses AS a
    WHERE a.id = v_property.address_id
    FOR SHARE;

    v_address_id := v_property.address_id;

    IF ROW(
      v_current_address.street_address,
      v_current_address.suburb_or_locality,
      v_current_address.city_or_town,
      v_current_address.postal_code
    ) IS DISTINCT FROM ROW(
      btrim(p_address->>'street_address'),
      nullif(btrim(p_address->>'suburb_or_locality'), ''),
      nullif(btrim(p_address->>'city_or_town'), ''),
      nullif(btrim(p_address->>'postal_code'), '')
    ) THEN
      /*
       * Changed address values receive a new row so other
       * properties or developments sharing the old row are safe.
       * Unchanged values retain the existing address reference.
       */
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
  END IF;

  /*
   * Preserve property identity, creation time, memberships and
   * invitation assignments. All writes succeed or roll back together.
   */
  UPDATE public.properties
  SET property_type = p_property_type,
      address_id = v_address_id,
      property_context_id = v_context_id,
      unit_identifier = v_unit,
      business_name = v_business
  WHERE id = v_property.id;

  RETURN v_property.id;
END;
$function$;
