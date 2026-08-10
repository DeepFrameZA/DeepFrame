import { supabase } from "../hooks/supabase/supabase";

export async function getTiles() {
  const { data, error } = await supabase.from("tiles").select("*");
  if (error) throw error;
  return data;
}

export async function getTileBySku(sku) {
  const { data, error } = await supabase
    .from("tiles")
    .select("*")
    .eq("sku", sku)
    .single();

  if (error) throw error;
  return data;
}

export async function searchTiles(filters = {}) {
  let query = supabase.from("tiles").select("*");

  if (filters.description) {
    query = query.ilike("description", `%${filters.description}%`);
  }

  if (filters.minPrice) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.sku) {
    query = query.eq("sku", filters.sku);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
