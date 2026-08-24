import { useState, useRef } from "react";
import { useHouses } from "../HouseContext";
import { getErrorMessage, getDevErrorMessage, capitalize } from "../utils/message";
import { validateName } from "../utils/validation";
import {
  updateHouse,
  updateArea,
  updateSurface,
  deleteHouse,
  deleteArea,
  deleteSurface,
  createArea,
  createSurface,
} from "../services/houseService";
import toast from "react-hot-toast";

/**
 * Builds the initial field-value map for a managed house. Used as the lazy
 * initializer for `fieldValues` (runs once per mount). New areas/surfaces
 * created during the session are seeded separately in the submit handlers.
 */
const buildInitialFields = (house) => {
  if (!house) return {};
  const initial = {};
  initial[`${house.id}_unit_number`] = house.unit_number;
  initial[`${house.id}_client_surname`] = house.client_surname;
  initial[`${house.id}_client_contact_number`] = house.client_contact_number;
  initial[`${house.id}_notes`] = house.notes;
  house.allAreas.forEach((area) => {
    initial[`${area.id}_name`] = area.name;
    area.allSurfaces.forEach((surface) => {
      initial[`${surface.id}_name`] = surface.name;
      initial[`${surface.id}_selected_tile`] = surface.selected_tile;
      initial[`${surface.id}_surface_length`] = surface.surface_length;
      initial[`${surface.id}_surface_width`] = surface.surface_width;
      initial[`${surface.id}_surface_height`] = surface.surface_height;
    });
  });
  return initial;
};

/**
 * Encapsulates all house/area/surface mutation + optimistic-edit state that used
 * to live in HouseManager. The Manage drawer calls this hook with the house it
 * is managing. The drawer is keyed by house id so this hook remounts (and its
 * lazy field-values initializer re-runs) whenever the managed house changes.
 */
const useHouseMutations = (house) => {
  const {
    updateHouseLocal,
    updateAreaLocal,
    addAreaLocal,
    deleteHouseLocal,
    deleteAreaLocal,
    addSurfaceLocal,
    updateSurfaceLocal,
    deleteSurfaceLocal,
  } = useHouses();

  const [fieldValues, setFieldValues] = useState(() => buildInitialFields(house));
  const [editingField, setEditingField] = useState({});
  const [savingField, setSavingField] = useState(null);
  const [creatingAreaId, setCreatingAreaId] = useState(null);
  const [creatingSurfaceId, setCreatingSurfaceId] = useState(null);
  const originalValueRef = useRef({});

  // OPTIMISTIC UPDATE, NO REFETCH (by design).
  const handleSaveEntity = async (
    updateFn,
    updateLocalFn,
    entityId,
    fieldKey,
    newValue,
    displayName,
    parentIds = [],
    remoteValue = newValue,
  ) => {
    const fieldName = fieldKey.split("_").slice(1).join("_");
    const oldValue = originalValueRef.current[fieldKey] ?? fieldValues[fieldKey];

    setSavingField(fieldKey);

    const localArgs = [...parentIds, entityId, { [fieldName]: newValue }];
    updateLocalFn(...localArgs);

    const savePromise = updateFn(entityId, { [fieldName]: remoteValue });

    try {
      await toast.promise(savePromise, {
        loading: `Saving...`,
        success: `${capitalize(displayName)} updated!`,
        error: (err) => getDevErrorMessage(err) ?? getErrorMessage(err, "Could not save changes"),
      });
      originalValueRef.current[fieldKey] = newValue;
      setFieldValues((prev) => ({ ...prev, [fieldKey]: newValue }));
      setEditingField((prev) => ({ ...prev, [fieldKey]: false }));
    } catch (error) {
      console.error("Save failed:", error);
      updateLocalFn(...[...parentIds, entityId, { [fieldName]: oldValue }]);
      setFieldValues((prev) => ({ ...prev, [fieldKey]: oldValue }));
      setEditingField((prev) => ({ ...prev, [fieldKey]: false }));
    } finally {
      setSavingField(null);
    }
  };

  const saveHouseField = (fieldKey, displayName, newValue) =>
    handleSaveEntity(
      updateHouse,
      updateHouseLocal,
      house.id,
      fieldKey,
      newValue ?? fieldValues[fieldKey],
      displayName,
    );

  const saveAreaField = (areaId, fieldKey, displayName, newValue) =>
    handleSaveEntity(
      updateArea,
      updateAreaLocal,
      areaId,
      fieldKey,
      newValue ?? fieldValues[fieldKey],
      displayName,
      [house.id],
    );

  const saveSurfaceField = (
    areaId,
    surfaceId,
    fieldKey,
    newValue,
    displayName,
    remoteValue = newValue,
  ) =>
    handleSaveEntity(
      updateSurface,
      updateSurfaceLocal,
      surfaceId,
      fieldKey,
      newValue,
      displayName,
      [house.id, areaId],
      remoteValue,
    );

  const submitAddArea = async (name) => {
    const result = validateName(name, "Area name");
    if (!result.valid) {
      toast.error(result.error);
      return;
    }
    setCreatingAreaId(house.id);
    const areaData = { house_id: house.id, name: result.value };
    const createPromise = createArea(areaData);
    try {
      const newArea = await toast.promise(createPromise, {
        loading: "Creating...",
        success: `Area "${result.value}" created!`,
        error: (err) => getDevErrorMessage(err) ?? getErrorMessage(err, "Could not create area"),
      });
      addAreaLocal(house.id, newArea);
      setFieldValues((prev) => ({
        ...prev,
        [`${newArea.id}_name`]: newArea.name,
      }));
    } catch (error) {
      console.error("Create area failed:", error);
    } finally {
      setCreatingAreaId(null);
    }
  };

  const submitDeleteArea = async (areaId, areaName) => {
    const deletePromise = deleteArea(areaId);
    try {
      await toast.promise(deletePromise, {
        loading: `Deleting...`,
        success: `Area "${areaName}" deleted!`,
        error: (err) => getDevErrorMessage(err) ?? getErrorMessage(err, "Could not delete area"),
      });
      deleteAreaLocal(house.id, areaId);
    } catch (error) {
      console.error("Delete area failed:", error);
    }
  };

  const submitAddSurface = async (areaId, name) => {
    const result = validateName(name, "Surface name");
    if (!result.valid) {
      toast.error(result.error);
      return;
    }
    setCreatingSurfaceId(areaId);
    const surfaceData = { area_id: areaId, name: result.value };
    const createPromise = createSurface(surfaceData);
    try {
      const newSurface = await toast.promise(createPromise, {
        loading: "Creating surface...",
        success: `Surface "${result.value}" created!`,
        error: (err) => getDevErrorMessage(err) ?? getErrorMessage(err, "Could not create surface"),
      });
      addSurfaceLocal(house.id, areaId, newSurface);
      setFieldValues((prev) => ({
        ...prev,
        [`${newSurface.id}_name`]: newSurface.name,
        [`${newSurface.id}_selected_tile`]: newSurface.selected_tile,
        [`${newSurface.id}_surface_length`]: newSurface.surface_length,
        [`${newSurface.id}_surface_width`]: newSurface.surface_width,
        [`${newSurface.id}_surface_height`]: newSurface.surface_height,
      }));
    } catch (error) {
      console.error("Create surface failed:", error);
    } finally {
      setCreatingSurfaceId(null);
    }
  };

  const submitDeleteSurface = async (areaId, surfaceId, surfaceName) => {
    const deletePromise = deleteSurface(surfaceId);
    try {
      await toast.promise(deletePromise, {
        loading: `Deleting surface ${surfaceName}...`,
        success: `Surface "${surfaceName}" deleted!`,
        error: (err) => getDevErrorMessage(err) ?? getErrorMessage(err, "Could not delete surface"),
      });
      deleteSurfaceLocal(house.id, areaId, surfaceId);
    } catch (error) {
      console.error("Delete surface failed:", error);
    }
  };

  const submitDeleteHouse = async () => {
    const deletePromise = deleteHouse(house.id);
    try {
      await toast.promise(deletePromise, {
        loading: `Deleting house ${house.unit_number}...`,
        success: `House MH ${house.unit_number} deleted!`,
        error: (err) => getDevErrorMessage(err) ?? getErrorMessage(err, "Could not delete house"),
      });
      deleteHouseLocal(house.id);
    } catch (error) {
      console.error("Delete house failed:", error);
    }
  };

  const setValue = (fieldKey, value) =>
    setFieldValues((prev) => ({ ...prev, [fieldKey]: value }));

  const cancelEdit = (fieldKey) => {
    const oldValue = originalValueRef.current[fieldKey];
    if (oldValue !== undefined) {
      setFieldValues((prev) => ({ ...prev, [fieldKey]: oldValue }));
    }
    setEditingField((prev) => ({ ...prev, [fieldKey]: false }));
  };

  const startEdit = (fieldKey) => {
    setEditingField((prev) => {
      const current = prev[fieldKey];
      if (!current) return { ...prev, [fieldKey]: true };
      return prev;
    });
    originalValueRef.current[fieldKey] = fieldValues[fieldKey];
  };

  const beginEdit = (fieldKey) => {
    const hasActive = Object.values(editingField).some(Boolean);
    if (hasActive) {
      const activeKey = Object.keys(editingField).find((key) => editingField[key]);
      if (activeKey && activeKey !== fieldKey) {
        cancelEdit(activeKey);
      }
    }
    startEdit(fieldKey);
  };

  const beginEditClear = (fieldKey) => {
    originalValueRef.current[fieldKey] = fieldValues[fieldKey];
    setFieldValues((prev) => ({ ...prev, [fieldKey]: "" }));
    setEditingField((prev) => ({ ...prev, [fieldKey]: true }));
  };

  return {
    fieldValues,
    editingField,
    savingField,
    creatingAreaId,
    creatingSurfaceId,
    setValue,
    beginEdit,
    beginEditClear,
    cancelEdit,
    saveHouseField,
    saveAreaField,
    saveSurfaceField,
    submitAddArea,
    submitDeleteArea,
    submitAddSurface,
    submitDeleteSurface,
    submitDeleteHouse,
  };
};

export default useHouseMutations;
