import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  grantPropertyAccessRequest,
  grantPropertyAccessBulkRequest,
  listPropertyAccessAccountsRequest,
  listPropertyMembershipsRequest,
  revokePropertyAccessRequest,
} from "../lib/access";
import AccessContext from "./AccessContext";

function AccessProvider({ children }) {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const mountedRef = useRef(false);
  const requestSequenceRef = useRef(0);

  /*
   * Only the latest request may update mounted provider state.
   * Initial loading and manual refresh share the same handling.
   */
  const loadMemberships = useCallback(async (requestSequence) => {
    try {
      const rows = await listPropertyMembershipsRequest();

      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setMemberships(rows);
        setLoadError(false);
      }

      return rows;
    } catch {
      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setMemberships([]);
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

  const refreshMemberships = useCallback(async () => {
    if (!mountedRef.current) {
      return null;
    }

    const requestSequence = ++requestSequenceRef.current;

    setLoading(true);
    setLoadError(false);

    return loadMemberships(requestSequence);
  }, [loadMemberships]);

  useEffect(() => {
    mountedRef.current = true;

    const requestSequence = ++requestSequenceRef.current;

    // Initial state already represents a pending load.
    void loadMemberships(requestSequence);

    return () => {
      mountedRef.current = false;
      requestSequenceRef.current += 1;
    };
  }, [loadMemberships]);

  /*
   * Keep the single-property operation for individual Restore actions.
   */

  const grantPropertyAccess = useCallback(
    async ({ profileId, propertyId }) => {
      const membershipId = await grantPropertyAccessRequest({
        profileId,
        propertyId,
      });

      await refreshMemberships();

      return membershipId;
    },
    [refreshMemberships],
  );

  /*
   * Save the entire selection in one RPC, then refresh once.
   * A failed refresh is reported through loadError without
   * misreporting a successful grant as a failed mutation.
   */
  const grantPropertyAccessBulk = useCallback(
    async ({ profileId, propertyIds }) => {
      const results = await grantPropertyAccessBulkRequest({
        profileId,
        propertyIds,
      });

      await refreshMemberships();

      return results;
    },
    [refreshMemberships],
  );

  const revokePropertyAccess = useCallback(
    async (membershipId) => {
      await revokePropertyAccessRequest(membershipId);
      await refreshMemberships();
    },
    [refreshMemberships],
  );

  /*
   * The grant form loads accounts when opened and owns its
   * selector loading/error state, like property context lookup.
   */
  const listPropertyAccessAccounts = useCallback(
    () => listPropertyAccessAccountsRequest(),
    [],
  );

  const value = useMemo(
    () => ({
      memberships,
      loading,
      loadError,
      refreshMemberships,
      grantPropertyAccess,
      grantPropertyAccessBulk,
      revokePropertyAccess,
      listPropertyAccessAccounts,
    }),
    [
      memberships,
      loading,
      loadError,
      refreshMemberships,
      grantPropertyAccess,
      grantPropertyAccessBulk,
      revokePropertyAccess,
      listPropertyAccessAccounts,
    ],
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

export default AccessProvider;
