/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import {
  getAllHouses,
  getHouse,
  getAllTiles,
} from "../core/services/houseService";

const HouseContext = createContext(null);

export function HouseProvider({ children }) {
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tilesCatalog, setTilesCatalog] = useState([]);
  const [tilesCatalogLoaded, setTilesCatalogLoaded] = useState(false);

  useEffect(() => {
    getAllHouses()
      .then(setHouses)
      .finally(() => setLoading(false));
  }, []);

  async function ensureTilesCatalog() {
    if (tilesCatalogLoaded || tilesCatalog.length) return;
    const data = await getAllTiles();
    setTilesCatalog(data);
    setTilesCatalogLoaded(true);
  }

  async function selectHouse(id) {
    if (selectedHouse?.id === id) return;
    const data = await getHouse(id);
    setSelectedHouse(data);
  }

  function addHouseLocal(newHouse) {
    setHouses((prevHouses) => [newHouse, ...prevHouses]);
  }

  function updateHouseLocal(id, updates) {
    setHouses((prevHouses) =>
      prevHouses.map((house) => (house.id === id ? { ...house, ...updates } : house))
    );
  }

  function updateAreaLocal(id, updates) {
    setHouses((prevHouses) =>
      prevHouses.map((house) => ({
        ...house,
        allAreas: house.allAreas.map((area) =>
          area.id === id ? { ...area, ...updates } : area
        ),
      }))
    );
  }

  function addAreaLocal(houseId, newArea) {
    setHouses((prevHouses) =>
      prevHouses.map((house) =>
        house.id === houseId
          ? { ...house, allAreas: [{ ...newArea, allSurfaces: [] }, ...house.allAreas] }
          : house
      )
    );
  }

  function deleteHouseLocal(id) {
    setHouses((prevHouses) => prevHouses.filter((house) => house.id !== id));
  }

  function deleteAreaLocal(houseId, areaId) {
    setHouses((prevHouses) =>
      prevHouses.map((house) =>
        house.id === houseId
          ? {
              ...house,
              allAreas: house.allAreas.filter((area) => area.id !== areaId),
            }
          : house
      )
    );
  }

  function addSurfaceLocal(houseId, areaId, newSurface) {
    setHouses((prevHouses) =>
      prevHouses.map((house) =>
        house.id === houseId
          ? {
              ...house,
              allAreas: house.allAreas.map((area) =>
                area.id === areaId
                  ? { ...area, allSurfaces: [newSurface, ...area.allSurfaces] }
                  : area
              ),
            }
          : house
      )
    );
  }

  function updateSurfaceLocal(houseId, areaId, surfaceId, updates) {
    setHouses((prevHouses) =>
      prevHouses.map((house) =>
        house.id === houseId
          ? {
              ...house,
              allAreas: house.allAreas.map((area) =>
                area.id === areaId
                  ? {
                      ...area,
                      allSurfaces: area.allSurfaces.map((surface) =>
                        surface.id === surfaceId ? { ...surface, ...updates } : surface
                      ),
                    }
                  : area
              ),
            }
          : house
      )
    );
  }

  function deleteSurfaceLocal(houseId, areaId, surfaceId) {
    setHouses((prevHouses) =>
      prevHouses.map((house) =>
        house.id === houseId
          ? {
              ...house,
              allAreas: house.allAreas.map((area) =>
                area.id === areaId
                  ? {
                      ...area,
                      allSurfaces: area.allSurfaces.filter((s) => s.id !== surfaceId),
                    }
                  : area
              ),
            }
          : house
      )
    );
  }

  return (
    <HouseContext.Provider
      value={{
        houses,
        selectedHouse,
        loading,
        tilesCatalog,
        tilesCatalogLoaded,
        ensureTilesCatalog,
        selectHouse,
        addHouseLocal,
        updateHouseLocal,
        deleteHouseLocal,
        addAreaLocal,
        updateAreaLocal,
        deleteAreaLocal,
        addSurfaceLocal,
        updateSurfaceLocal,
        deleteSurfaceLocal,
      }}
    >
      {children}
    </HouseContext.Provider>
  );
}

export function useHouses() {
  const ctx = useContext(HouseContext);
  if (!ctx) throw new Error("useHouses must be used inside HouseProvider");
  return ctx;
}
