import { supabase } from "./supabase";

/**
 * DATA ENRICHMENT LAYER
 * Transforms raw Supabase relations into a format optimized for the UI
 * while preserving all original table data and injecting parent references.
 */
function enrichHouseData(house) {
  // 1. Enrich and Flatten Areas
  const allAreas = house.areas?.map((area) => ({
    ...area,
  })) || [];

  // 2. Enrich and Flatten Surfaces (Inject area name/id and keep full selected_tile)
  const allSurfaces =
    house.areas?.flatMap((area) =>
      (area.surfaces || []).map((surface) => ({
        ...surface,
        area_name: area.name,
        area_id: area.id,
      })),
    ) || [];

  // 3. Enrich and Deduplicate Tiles
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

/**
 * HOUSE SERVICES
 */
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

/**
 * TILE SERVICES
 */
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
