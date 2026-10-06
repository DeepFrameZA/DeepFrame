import { useContext } from "react";
import AccessContext from "../context/AccessContext";

export function useAccess() {
  const context = useContext(AccessContext);

  if (context === undefined) {
    throw new Error("useAccess must be used within an AccessProvider");
  }

  return context;
}
