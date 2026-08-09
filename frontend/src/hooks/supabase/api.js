import { supabase } from "./supabase";

export async function getAllHouses() {
  const { data, error } = await supabase
    .from("houses")
    .select("*, areas(*, surfaces(*, selected_tile(*)))")
    .order("unit_number");
  if (error) throw error;
  return data;
}

export async function getHouse(id) {
  const { data, error } = await supabase
    .from("houses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getTiles() {
  const { data, error } = await supabase
    .from("tiles")
    .select("*");
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
