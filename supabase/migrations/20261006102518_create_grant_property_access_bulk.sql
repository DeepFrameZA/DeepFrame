SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.grant_property_access_bulk (
  p_profile_id   uuid,
  p_property_ids uuid[]
)
  RETURNS TABLE (
    membership_id uuid,
    property_id   uuid
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_property_ids uuid[];
  v_property_id uuid;
BEGIN
  /*
   * Authorize before validating inputs or looking up targets.
   */
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF public.is_admin() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile ID is required';
  END IF;

  /*
   * A grant request must select at least one property.
   * NULL entries are invalid, even alongside valid IDs.
   */
  IF p_property_ids IS NULL
     OR cardinality(p_property_ids) = 0
  THEN
    RAISE EXCEPTION 'Select at least one property';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(p_property_ids) AS supplied(property_id)
    WHERE supplied.property_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Property selection is invalid or unavailable';
  END IF;

  /*
   * Deduplicate and sort before acquiring locks.
   * Overlapping bulk requests process properties in the same order.
   */
  SELECT array_agg(
    DISTINCT supplied.property_id
    ORDER BY supplied.property_id
  )
  INTO v_property_ids
  FROM unnest(p_property_ids) AS supplied(property_id);

  /*
   * Reuse the established grant operation:
   * - require an existing resident or contractor profile;
   * - require an existing property;
   * - create a membership or restore the existing one;
   * - preserve existing membership IDs and creation timestamps.
   *
   * These calls run inside this RPC's transaction.
   * Do not catch failures here: any error must roll back every
   * membership change made by this request.
   */
  FOREACH v_property_id IN ARRAY v_property_ids
  LOOP
    membership_id := public.grant_property_access(
      p_profile_id,
      v_property_id
    );

    property_id := v_property_id;

    RETURN NEXT;
  END LOOP;
END;
$function$;

REVOKE ALL ON FUNCTION "public"."grant_property_access_bulk"(uuid, uuid[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."grant_property_access_bulk"(uuid, uuid[]) TO "authenticated", "postgres";
