import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createInvitationRequest,
  listInvitationsRequest,
  revokeInvitationRequest,
} from "../lib/invitation";
import InvitationContext from "./InvitationContext";

function InvitationProvider({ children }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const mountedRef = useRef(false);
  const requestSequenceRef = useRef(0);

  /*
   * Used for manual retries and after create/revoke actions.
   * These calls originate from user actions or after another
   * asynchronous operation, not directly from an effect.
   */
  const refreshInvitations = useCallback(async () => {
    if (!mountedRef.current) {
      return null;
    }

    const requestSequence = ++requestSequenceRef.current;

    setLoading(true);
    setLoadError(false);

    try {
      const invitationRows = await listInvitationsRequest();

      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setInvitations(invitationRows);
      }

      return invitationRows;
    } catch {
      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setLoadError(true);
      }

      return null;
    } finally {
      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const requestSequence = ++requestSequenceRef.current;

    /*
     * The initial state already represents a pending load:
     *
     *   loading   = true
     *   loadError = false
     *
     * Therefore, no synchronous state update is needed when
     * this effect starts.
     */
    const loadInitialInvitations = async () => {
      try {
        const invitationRows = await listInvitationsRequest();

        if (
          mountedRef.current &&
          requestSequence === requestSequenceRef.current
        ) {
          setInvitations(invitationRows);
        }
      } catch {
        if (
          mountedRef.current &&
          requestSequence === requestSequenceRef.current
        ) {
          setLoadError(true);
        }
      } finally {
        if (
          mountedRef.current &&
          requestSequence === requestSequenceRef.current
        ) {
          setLoading(false);
        }
      }
    };

    void loadInitialInvitations();

    return () => {
      mountedRef.current = false;
      requestSequenceRef.current += 1;
    };
  }, []);

  const createInvitation = useCallback(
    async ({ invitedEmail, role, propertyIds = [] }) => {
      const createdInvitation = await createInvitationRequest({
        invitedEmail,
        role,
        propertyIds,
      });

      await refreshInvitations();

      /*
       * Return the one-time code directly to the component.
       * Do not retain it in shared context.
       */
      return createdInvitation;
    },
    [refreshInvitations],
  );

  const revokeInvitation = useCallback(
    async (invitationId) => {
      await revokeInvitationRequest(invitationId);
      await refreshInvitations();
    },
    [refreshInvitations],
  );

  const value = useMemo(
    () => ({
      invitations,
      loading,
      loadError,
      refreshInvitations,
      createInvitation,
      revokeInvitation,
    }),
    [
      invitations,
      loading,
      loadError,
      refreshInvitations,
      createInvitation,
      revokeInvitation,
    ],
  );

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
}

export default InvitationProvider;
