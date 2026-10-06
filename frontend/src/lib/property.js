import { supabase } from "./supabaseClient";

const propertyFields = `
  id, property_type, address_id, property_context_id,
  unit_identifier, business_name, created_at,
  address:addresses!properties_address_id_fkey (
    id, street_address, suburb_or_locality, city_or_town, postal_code
  ),
  context:property_contexts!properties_property_context_id_fkey (
    id, context_type, name, address_id,
    address:addresses!property_contexts_address_id_fkey (
      id, street_address, suburb_or_locality, city_or_town, postal_code
    )
  )
`;

export async function listPropertiesRequest() {
  const properties = [];
  const batchSize = 500;

  // Fetch successive batches so the API's row limit does not silently
  // truncate the list. UI filtering/pagination can remain local for now.
  for (let offset = 0; ; offset += batchSize) {
    const { data, error } = await supabase
      .from("properties")
      .select(propertyFields)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + batchSize - 1);

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    properties.push(...rows);

    if (rows.length < batchSize) {
      return properties;
    }
  }
}

export async function listPropertyContextsRequest() {
  const contexts = [];
  const batchSize = 500;
  for (let offset = 0; ; offset += batchSize) {
    const { data, error } = await supabase
      .from("property_contexts")
      .select(
        `id, context_type, name,
        address:addresses!property_contexts_address_id_fkey (
          street_address, suburb_or_locality, city_or_town, postal_code
        )`,
      )
      .order("name")
      .order("id")
      .range(offset, offset + batchSize - 1);
    if (error) throw error;
    const rows = data ?? [];
    contexts.push(...rows);
    if (rows.length < batchSize) return contexts;
  }
}

export async function createPropertyRequest(payload) {
  const { data, error } = await supabase.rpc("create_property", {
    p_property_type: payload.propertyType,
    p_address: payload.address,
    p_unit_identifier: payload.unitIdentifier,
    p_business_name: payload.businessName,
    p_context_id: payload.contextId,
    p_new_context: payload.newContext,
  });
  if (error) throw error;
  if (!data) throw new Error("Property creation returned no ID.");
  return data;
}

export async function updatePropertyRequest(propertyId, payload) {
  const { data, error } = await supabase.rpc("update_property", {
    p_property_id: propertyId,
    p_property_type: payload.propertyType,
    p_address: payload.address,
    p_unit_identifier: payload.unitIdentifier,
    p_business_name: payload.businessName,
    p_context_id: payload.contextId,
    p_new_context: payload.newContext,
  });

  if (error) throw error;
  if (!data) throw new Error("Property update returned no ID.");

  return data;
}

export async function getPropertyRequest(propertyId) {
  const { data, error } = await supabase
    .from("properties")
    .select(propertyFields)
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;

  return data;
}
