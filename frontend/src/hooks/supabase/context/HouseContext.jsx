/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { getAllHouses, getHouse } from "../api";

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

  return (
    <HouseContext.Provider
      value={{ houses, selectedHouse, loading, selectHouse }}
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
