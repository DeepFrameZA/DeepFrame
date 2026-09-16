import { useContext } from "react";
import InvitationContext from "../context/InvitationContext";

export function useInvitation() {
  const context = useContext(InvitationContext);

  if (context === undefined) {
    throw new Error("useInvitation must be used within an InvitationProvider");
  }

  return context;
}
