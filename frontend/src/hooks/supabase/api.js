import { supabase } from "./supabase";

export async function getAllHouses() {
  const { data, error } = await supabase
    .from("houses")
    .select("*, areas(*)")
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
//
// export async function createHouse(house) {
//   const { data, error } = await supabase
//     .from("houses")
//     .insert([house])
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }
//
// export async function getAreasForHouse(houseId) {
//   const { data, error } = await supabase
//     .from("areas")
//     .select("*")
//     .eq("house_id", houseId)
//     .order("sort_order");
//   if (error) throw error;
//   return data;
// }
//
// export async function getSurfacesForRoom(roomId) {
//   const { data, error } = await supabase
//     .from("surfaces")
//     .select("*")
//     .eq("room_id", areaId)
//     .order("sort_order");
//   if (error) throw error;
//   return data;
// }
//
// export async function getSelectionsForHouse(houseId) {
//   const { data, error } = await supabase
//     .from("selections")
//     .select(
//       `
//       id, quantity, notes, surface_id,
//       surfaces (
//         id, name, type,
//         areas ( id, name, house_id )
//       ),
//       tiles ( id, sku, name, price_per_box, box_coverage_sqm )
//     `,
//     )
//     .eq("surfaces.areas.house_id", houseId)
//     .order("id");
//   if (error) throw error;
//   return data;
// }
//
// export async function getAllTiles() {
//   const { data, error } = await supabase
//     .from("tiles")
//     .select("*")
//     .order("name");
//   if (error) throw error;
//   return data;
// }
//
// export async function getQuoteForHouse(houseId) {
//   const { data, error } = await supabase
//     .from("quotes")
//     .select("*")
//     .eq("house_id", houseId)
//     .single();
//   if (error) throw error;
//   return data;
// }
//
// export async function updateQuoteStatus(quoteId, updates) {
//   const { data, error } = await supabase
//     .from("quotes")
//     .update(updates)
//     .eq("id", quoteId)
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }
