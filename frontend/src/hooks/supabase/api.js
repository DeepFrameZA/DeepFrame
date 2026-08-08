import { supabase } from "./supabase";

export async function getAllHouses() {
  const { data, error } = await supabase
    .from("houses")
    .select("*, areas(*, surfaces(*))")
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
