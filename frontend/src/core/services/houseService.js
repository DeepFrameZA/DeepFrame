import { supabase } from "../supabase/supabase";

/**
 * DATA ENRICHMENT LAYER
 * Transforms raw Supabase relations into a format optimized for the UI
 * while preserving all original table data and injecting parent references.
 */
function enrichHouseData(house) {
  const allAreas =
    house.areas?.map((area) => ({
      ...area,
    })) || [];

  const allSurfaces =
    house.areas?.flatMap((area) =>
      (area.surfaces || []).map((surface) => ({
        ...surface,
        area_name: area.name,
        area_id: area.id,
      })),
    ) || [];

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
  return data.map(enrichHouseData);
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
