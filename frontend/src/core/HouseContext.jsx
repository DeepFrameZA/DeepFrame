/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { getAllHouses, getHouse } from "../core/services/houseService";

const HouseContext = createContext(null);

export function HouseProvider({ children }) {
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllHouses()
      .then(setHouses)
      .finally(() => setLoading(false));
  }, []);

  async function selectHouse(id) {
    if (selectedHouse?.id === id) return;
    const data = await getHouse(id);
    setSelectedHouse(data);
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
          ? { ...house, allAreas: [...house.allAreas, newArea] }
          : house
      )
    );
  }

  return (
    <HouseContext.Provider
      value={{ houses, selectedHouse, loading, selectHouse, updateHouseLocal, updateAreaLocal, addAreaLocal }}
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
