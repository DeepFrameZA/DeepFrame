import { supabase } from "../supabase/supabase";

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

  if (filters.minPricePerSqm) {
    query = query.gte("price_per_sqm", filters.minPricePerSqm);
  }
  if (filters.maxPricePerSqm) {
    query = query.lte("price_per_sqm", filters.maxPricePerSqm);
  }
  if (filters.minPricePerBox) {
    query = query.gte("price_per_box", filters.minPricePerBox);
  }
  if (filters.maxPricePerBox) {
    query = query.lte("price_per_box", filters.maxPricePerBox);
  }

  if (filters.sku) {
    query = query.eq("sku", filters.sku);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
