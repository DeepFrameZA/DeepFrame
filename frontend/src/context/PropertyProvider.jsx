import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listPropertiesRequest,
  createPropertyRequest,
  updatePropertyRequest,
  listPropertyContextsRequest,
} from "../lib/property";
import PropertyContext from "./PropertyContext";

function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const mountedRef = useRef(false);
  const requestSequenceRef = useRef(0);

  /*
   * Refresh after user actions. Only the latest request may
   * update state, and only while the provider is mounted.
   */
  const refreshProperties = useCallback(async () => {
    if (!mountedRef.current) {
      return null;
    }

    const requestSequence = ++requestSequenceRef.current;

    setLoading(true);
    setLoadError(false);

    try {
      const propertyRows = await listPropertiesRequest();

      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setProperties(propertyRows);
      }

      return propertyRows;
    } catch {
      if (
        mountedRef.current &&
        requestSequence === requestSequenceRef.current
      ) {
        setProperties([]);
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
     * Initial state already represents a pending load.
     * No synchronous state update is needed here.
     */
    const loadInitialProperties = async () => {
      try {
        const propertyRows = await listPropertiesRequest();

        if (
          mountedRef.current &&
          requestSequence === requestSequenceRef.current
        ) {
          setProperties(propertyRows);
        }
      } catch {
        if (
          mountedRef.current &&
          requestSequence === requestSequenceRef.current
        ) {
          setProperties([]);
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

    void loadInitialProperties();

    return () => {
      mountedRef.current = false;
      requestSequenceRef.current += 1;
    };
  }, []);

  const createProperty = useCallback(
    async (payload) => {
      const createdProperty = await createPropertyRequest(payload);
      await refreshProperties();
      return createdProperty;
    },
    [refreshProperties],
  );

  const updateProperty = useCallback(
    async (propertyId, payload) => {
      const updatedProperty = await updatePropertyRequest(propertyId, payload);

      await refreshProperties();
      return updatedProperty;
    },
    [refreshProperties],
  );

  const listPropertyContexts = useCallback(
    () => listPropertyContextsRequest(),
    [],
  );

  const value = useMemo(
    () => ({
      properties,
      loading,
      loadError,
      refreshProperties,
      createProperty,
      updateProperty,
      listPropertyContexts,
    }),
    [
      properties,
      loading,
      loadError,
      refreshProperties,
      createProperty,
      updateProperty,
      listPropertyContexts,
    ],
  );

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export default PropertyProvider;
