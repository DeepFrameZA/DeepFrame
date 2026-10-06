import { useContext } from "react";
import PropertyContext from "../context/PropertyContext";

export function useProperty() {
  const context = useContext(PropertyContext);

  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }

  return context;
}
