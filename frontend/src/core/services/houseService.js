import { supabase } from "../supabase/supabase";
import { requireAuthSession } from "../supabase/withAuth";

/**
 * DATA ENRICHMENT LAYER
 * Transforms raw Supabase relations into a format optimized for the UI
 * while preserving all original table data and injecting parent references.
 */
function enrichHouseData(house) {
  const allAreas =
    house.areas?.map((area) => ({
      ...area,
      allSurfaces: (area.surfaces || []).map((surface) => ({
        ...surface,
        area_name: area.name,
        area_id: area.id,
      })),
    })) || [];

  const allSurfaces = allAreas.flatMap((area) => area.allSurfaces);

  const tilesMap = new Map();
  allSurfaces.forEach((s) => {
    if (s.selected_tile) {
      const tile = s.selected_tile;
      tilesMap.set(tile.sku, {
        ...tile,
        usedInSurfaces: allSurfaces.filter(
          (surf) => surf.selected_tile?.sku === tile.sku,
        ),
      });
    }
  });

  return {
    ...house,
    allAreas,
    allSurfaces,
    selectedTiles: Array.from(tilesMap.values()),
  };
}

export async function getAllHouses() {
  const { data, error } = await supabase
    .from("houses")
    .select("*, areas(*, surfaces(*, selected_tile(*)))")
    .order("unit_number");

  if (error) throw error;
  
  return data.map((house) => {
    const enriched = enrichHouseData(house);
    enriched.allAreas.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    return enriched;
  });
}

export async function getHouse(id) {
  const { data, error } = await supabase
    .from("houses")
    .select("*, areas(*, surfaces(*, selected_tile(*)))")
    .eq("id", id)
    .single();

  if (error) throw error;
  return enrichHouseData(data);
}

export async function createHouse(house) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("houses")
    .insert(house)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHouse(id, updates) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("houses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHouse(id) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("houses")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("House not found or not permitted");
  return true;
}

export async function createArea(area) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("areas")
    .insert(area)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateArea(id, updates) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("areas")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteArea(id) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("areas")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Area not found or not permitted");
  return true;
}

export async function createSurface(surface) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("surfaces")
    .insert(surface)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSurface(id, updates) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("surfaces")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSurface(id) {
  await requireAuthSession();
  const { data, error } = await supabase
    .from("surfaces")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Surface not found or not permitted");
  return true;
}

export async function createTile(tile) {
  const { data, error } = await supabase
    .from("tiles")
    .insert(tile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTile(sku, updates) {
  const { data, error } = await supabase
    .from("tiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("sku", sku)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTile(sku) {
  const { error } = await supabase.from("tiles").delete().eq("sku", sku);
  if (error) throw error;
  return true;
}

export async function getAllTiles() {
  const { data, error } = await supabase
    .from("tiles")
    .select("*")
    .order("description");

  if (error) throw error;
  return data;
}
