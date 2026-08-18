import { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import { useHouses } from "../../core/HouseContext";
import {
  createHouse,
  createArea,
  createSurface,
  updateHouse,
  updateArea,
  updateSurface,
  deleteHouse,
  deleteArea,
  deleteSurface,
} from "../../core/services/houseService";
import EditIcon from "../../components/EditIcon";
import SaveIcon from "../../components/SaveIcon";
import DeleteIcon from "../../components/DeleteIcon";
import TileCombobox from "../../components/TileCombobox";
import toast from "react-hot-toast";

const HouseManager = ({ className = "className" }) => {
  const {
    houses,
    updateHouseLocal,
    updateAreaLocal,
    addAreaLocal,
    deleteHouseLocal,
    deleteAreaLocal,
    updateSurfaceLocal,
    addSurfaceLocal,
    deleteSurfaceLocal,
    tilesCatalog,
    tilesCatalogLoaded,
    ensureTilesCatalog,
  } = useHouses();
  const [editingField, setEditingField] = useState({});
  const [fieldValues, setFieldValues] = useState({});
  const [savingField, setSavingField] = useState(null);
  const [creatingAreaId, setCreatingAreaId] = useState(null);
  const [newAreaName, setNewAreaName] = useState("");
  const [activeHouseId, setActiveHouseId] = useState(null);
  const [creatingSurfaceId, setCreatingSurfaceId] = useState(null);
  const [activeSurfaceAreaId, setActiveSurfaceAreaId] = useState(null);
  const [newSurfaceName, setNewSurfaceName] = useState("");

  useEffect(() => {
    const initial = {};
    houses.forEach((h) => {
      initial[`${h.id}_unit_number`] = h.unit_number;
      initial[`${h.id}_client_surname`] = h.client_surname;
      initial[`${h.id}_client_contact_number`] = h.client_contact_number;
      h.allAreas.forEach((area) => {
        initial[`${area.id}_name`] = area.name;
        area.allSurfaces.forEach((surface) => {
          initial[`${surface.id}_name`] = surface.name;
          initial[`${surface.id}_selected_tile`] = surface.selected_tile;
          initial[`${surface.id}_length`] = surface.surface_length;
          initial[`${surface.id}_width`] = surface.surface_width;
          initial[`${surface.id}_height`] = surface.surface_height;
        });
      });
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFieldValues(initial);
  }, [houses]);

  // OPTIMISTIC UPDATE, NO REFETCH (by design).
  // After a successful save we update only local state fields (fieldValues /
  // editingField) and never re-query the server. The only server-computed
  // column is `updated_at`, which is not rendered in the UI, so a refetch would
  // add latency + bandwidth for hidden data — conflicting with the site's speed
  // goal (no unnecessary refreshes). Local state already mirrors exactly what
  // was saved for every visible field. Revisit only if a server-computed field
  // becomes visible or multi-user concurrent editing is introduced.
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
    const oldValue = fieldValues[fieldKey];

    setSavingField(fieldKey);

    const localArgs = [...parentIds, entityId, { [fieldName]: newValue }];
    updateLocalFn(...localArgs);

    const savePromise = updateFn(entityId, { [fieldName]: remoteValue });

    try {
      await toast.promise(savePromise, {
        loading: `Saving ${displayName}...`,
        success: `${displayName} saved!`,
        error: (err) => err?.message ?? "Save failed",
      });
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

  const submitAddArea = async () => {
    if (!newAreaName.trim()) {
      toast.error("Please provide an area name");
      return;
    }

    setCreatingAreaId(activeHouseId);
    const areaData = { house_id: activeHouseId, name: newAreaName.trim() };
    const createPromise = createArea(areaData);

    try {
      const newArea = await toast.promise(createPromise, {
        loading: "Creating area...",
        success: "Area created!",
        error: (err) => err?.message ?? "Create failed",
      });

      addAreaLocal(activeHouseId, newArea);

      const modal = document.getElementById(
        `unit_number_${houses.find((h) => h.id === activeHouseId)?.unit_number}_add_area_modal`,
      );
      modal?.close();
      setNewAreaName("");
    } catch (error) {
      console.error("Create area failed:", error);
    } finally {
      setCreatingAreaId(null);
    }
  };

  const submitDeleteArea = async (houseId, areaId, areaName) => {
    const deletePromise = deleteArea(areaId);

    try {
      await toast.promise(deletePromise, {
        loading: `Deleting area ${areaName}...`,
        success: "Area deleted!",
        error: (err) => err?.message ?? "Delete failed",
      });
      deleteAreaLocal(houseId, areaId);
    } catch (error) {
      console.error("Delete area failed:", error);
    }
  };

  const submitDeleteSurface = async (
    houseId,
    areaId,
    surfaceId,
    surfaceName,
  ) => {
    const deletePromise = deleteSurface(surfaceId);

    try {
      await toast.promise(deletePromise, {
        loading: `Deleting surface ${surfaceName}...`,
        success: "Surface deleted!",
        error: (err) => err?.message ?? "Delete failed",
      });
      deleteSurfaceLocal(houseId, areaId, surfaceId);
    } catch (error) {
      console.error("Delete surface failed:", error);
    }
  };

  const submitAddSurface = async (houseId, areaId) => {
    if (!newSurfaceName.trim()) {
      toast.error("Please provide a surface name");
      return;
    }

    setCreatingSurfaceId(areaId);
    const surfaceData = { area_id: areaId, name: newSurfaceName.trim() };
    const createPromise = createSurface(surfaceData);

    try {
      const newSurface = await toast.promise(createPromise, {
        loading: "Creating surface...",
        success: "Surface created!",
        error: (err) => err?.message ?? "Create failed",
      });

      addSurfaceLocal(houseId, areaId, newSurface);

      const modal = document.getElementById(`add_surface_modal_${areaId}`);
      modal?.close();
      setNewSurfaceName("");
    } catch (error) {
      console.error("Create surface failed:", error);
    } finally {
      setCreatingSurfaceId(null);
    }
  };

  const submitDeleteHouse = async (id, unitNumber) => {
    const deletePromise = deleteHouse(id);

    try {
      await toast.promise(deletePromise, {
        loading: `Deleting house ${unitNumber}...`,
        success: "House deleted!",
        error: (err) => err?.message ?? "Delete failed",
      });
      deleteHouseLocal(id);
    } catch (error) {
      console.error("Delete house failed:", error);
    }
  };

  return (
    <>
      <div className={`${className} w-[95%] relative top-16.25`}>
        <div className="flex justify-center px-1.5 py-3">
          <h2 className="text-2xl font-bold">House Manager</h2>
        </div>
        <div className="">
          <div className="tabs tabs-box justify-end tabs-xl mb-3">
            <input
              className={`tab`}
              type="radio"
              name="my_tabs_2"
              aria-label="Manage"
              defaultChecked
            />

            <div className="tab-content bg-base-100 border-base-300 p-6">
              <div className="flex justify-center">
                <SearchBar className="lg:w-96 mb-6" />
              </div>

              <div className="">
                {houses.map((h, index) => {
                  const unitNumberFieldKey = `${h.id}_unit_number`;
                  const clientSurnameFieldKey = `${h.id}_client_surname`;
                  const clientContactNumberFieldKey = `${h.id}_client_contact_number`;

                  return (
                    <div
                      className="collapse collapse-arrow mb-3 bg-base-100 border border-base-content/25 focus-within:outline-0 focus-within:shadow-none"
                      key={h.id}
                    >
                      <input
                        type="checkbox"
                        className="peer"
                        defaultChecked={index === 0}
                      />
                      <div className="collapse-title font-semibold after:inset-s-5 after:inset-e-auto pe-4 ps-12">
                        {h.unit_number}
                      </div>
                      <div className="collapse-content z-1">
                        <div className="">
                          <div className="flex justify-center font-semibold text-sm mb-6">
                            GENERAL INFORMATION
                          </div>

                          <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex join">
                              <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                <span className="dark:text-[#414342] text-[#d2d2d2]">
                                  Unit number
                                </span>
                                <input
                                  type="text"
                                  placeholder="Unit number"
                                  className=""
                                  required
                                  disabled={!editingField[unitNumberFieldKey]}
                                  value={
                                    fieldValues[unitNumberFieldKey] ??
                                    h.unit_number
                                  }
                                  onChange={(e) =>
                                    setFieldValues((prev) => ({
                                      ...prev,
                                      [unitNumberFieldKey]: e.target.value,
                                    }))
                                  }
                                />
                              </label>
                              <button
                                className="btn join-item focus-within:outline-0"
                                disabled={savingField === unitNumberFieldKey}
                                onClick={() => {
                                  if (editingField[unitNumberFieldKey]) {
                                    handleSaveEntity(
                                      updateHouse,
                                      updateHouseLocal,
                                      h.id,
                                      unitNumberFieldKey,
                                      fieldValues[unitNumberFieldKey],
                                      "unit number",
                                    );
                                  } else {
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [unitNumberFieldKey]: true,
                                    }));
                                  }
                                }}
                              >
                                {savingField === unitNumberFieldKey ? (
                                  <span className="loading loading-spinner text-current" />
                                ) : editingField[unitNumberFieldKey] ? (
                                  <SaveIcon
                                    className="w-4 h-4 fill-base-content"
                                    unique_id={`save_unit_number_field_${h.unit_number}`}
                                  />
                                ) : (
                                  <EditIcon className="w-4 h-4 fill-base-content" />
                                )}
                              </button>
                            </div>

                            <div className="flex join">
                              <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                <span className="dark:text-[#414342] text-[#d2d2d2]">
                                  Client surname
                                </span>

                                <input
                                  type="text"
                                  placeholder="Client surname"
                                  className=""
                                  required
                                  disabled={
                                    !editingField[clientSurnameFieldKey]
                                  }
                                  value={
                                    fieldValues[clientSurnameFieldKey] ??
                                    h.client_surname
                                  }
                                  onChange={(e) =>
                                    setFieldValues((prev) => ({
                                      ...prev,
                                      [clientSurnameFieldKey]: e.target.value,
                                    }))
                                  }
                                />
                              </label>
                              <button
                                className="btn join-item focus-within:outline-0"
                                disabled={savingField === clientSurnameFieldKey}
                                onClick={() => {
                                  if (editingField[clientSurnameFieldKey]) {
                                    handleSaveEntity(
                                      updateHouse,
                                      updateHouseLocal,
                                      h.id,
                                      clientSurnameFieldKey,
                                      fieldValues[clientSurnameFieldKey],
                                      "client surname",
                                    );
                                  } else {
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [clientSurnameFieldKey]: true,
                                    }));
                                  }
                                }}
                              >
                                {savingField === clientSurnameFieldKey ? (
                                  <span className="loading loading-spinner text-current" />
                                ) : editingField[clientSurnameFieldKey] ? (
                                  <SaveIcon
                                    className="w-4 h-4 fill-base-content"
                                    unique_id={`save_client_surname_field_${h.unit_number}`}
                                  />
                                ) : (
                                  <EditIcon className="w-4 h-4 fill-base-content" />
                                )}
                              </button>
                            </div>

                            <div className="flex join">
                              <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                <span className="dark:text-[#414342] text-[#d2d2d2]">
                                  Client contact number
                                </span>
                                <svg
                                  className="h-[1em] opacity-50"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 16 16"
                                >
                                  <g fill="none">
                                    <path
                                      d="M7.25 11.5C6.83579 11.5 6.5 11.8358 6.5 12.25C6.5 12.6642 6.83579 13 7.25 13H8.75C9.16421 13 9.5 12.6642 9.5 12.25C9.5 11.8358 9.16421 11.5 8.75 11.5H7.25Z"
                                      fill="currentColor"
                                    ></path>
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M6 1C4.61929 1 3.5 2.11929 3.5 3.5V12.5C3.5 13.8807 4.61929 15 6 15H10C11.3807 15 12.5 13.8807 12.5 12.5V3.5C12.5 2.11929 11.3807 1 10 1H6ZM10 2.5H9.5V3C9.5 3.27614 9.27614 3.5 9 3.5H7C6.72386 3.5 6.5 3.27614 6.5 3V2.5H6C5.44771 2.5 5 2.94772 5 3.5V12.5C5 13.0523 5.44772 13.5 6 13.5H10C10.5523 13.5 11 13.0523 11 12.5V3.5C11 2.94772 10.5523 2.5 10 2.5Z"
                                      fill="currentColor"
                                    ></path>
                                  </g>
                                </svg>

                                <input
                                  type="tel"
                                  placeholder="Client contact number"
                                  className=""
                                  required
                                  disabled={
                                    !editingField[clientContactNumberFieldKey]
                                  }
                                  value={
                                    fieldValues[clientContactNumberFieldKey] ??
                                    h.client_contact_number
                                  }
                                  onChange={(e) =>
                                    setFieldValues((prev) => ({
                                      ...prev,
                                      [clientContactNumberFieldKey]:
                                        e.target.value,
                                    }))
                                  }
                                  pattern="[0-9]*"
                                  minLength="10"
                                  maxLength="10"
                                />
                              </label>
                              <button
                                className="btn join-item focus-within:outline-0"
                                disabled={
                                  savingField === clientContactNumberFieldKey
                                }
                                onClick={() => {
                                  if (
                                    editingField[clientContactNumberFieldKey]
                                  ) {
                                    handleSaveEntity(
                                      updateHouse,
                                      updateHouseLocal,
                                      h.id,
                                      clientContactNumberFieldKey,
                                      fieldValues[clientContactNumberFieldKey],
                                      "contact number",
                                    );
                                  } else {
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [clientContactNumberFieldKey]: true,
                                    }));
                                  }
                                }}
                              >
                                {savingField === clientContactNumberFieldKey ? (
                                  <span className="loading loading-spinner text-current" />
                                ) : editingField[
                                    clientContactNumberFieldKey
                                  ] ? (
                                  <SaveIcon
                                    className="w-4 h-4 fill-base-content"
                                    unique_id={`save_contact_number_field_${h.unit_number}`}
                                  />
                                ) : (
                                  <EditIcon className="w-4 h-4 fill-base-content" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="">
                          <div className="divider text-sm my-6">
                            AREAS AND SURFACES
                          </div>
                          <div className="flex justify-between items-center w-full mb-6">
                            <div className="font-semibold text-sm">Areas</div>
                            <button
                              className="btn btn-sm focus-within:outline-0"
                              disabled={creatingAreaId === h.id}
                              onClick={() => {
                                setActiveHouseId(h.id);
                                setNewAreaName("");
                                document
                                  .getElementById(
                                    `unit_number_${h.unit_number}_add_area_modal`,
                                  )
                                  .showModal();
                              }}
                            >
                              {creatingAreaId === h.id ? (
                                <span className="loading loading-spinner text-current" />
                              ) : (
                                "Add Area"
                              )}
                            </button>
                            <dialog
                              id={`unit_number_${h.unit_number}_add_area_modal`}
                              className="modal modal-middle"
                            >
                              <div className="modal-box">
                                <h3 className="font-bold text-lg mb-6">
                                  Provide new area name:
                                </h3>
                                <label className="input floating-label validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                  <span className="dark:text-[#414342] text-[#d2d2d2]">
                                    Area name
                                  </span>
                                  <input
                                    className=""
                                    placeholder="Area name"
                                    type="text"
                                    required
                                    value={
                                      activeHouseId === h.id ? newAreaName : ""
                                    }
                                    onChange={(e) =>
                                      setNewAreaName(e.target.value)
                                    }
                                  />
                                </label>
                                <div className="modal-action flex justify-end gap-y-4">
                                  <form method="dialog">
                                    <button className="btn text-error">
                                      Cancel
                                    </button>
                                  </form>
                                  <button
                                    className="btn"
                                    disabled={creatingAreaId === h.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      submitAddArea();
                                    }}
                                  >
                                    {creatingAreaId === h.id ? (
                                      <span className="loading loading-spinner text-current" />
                                    ) : (
                                      "Add"
                                    )}
                                  </button>
                                </div>
                              </div>
                            </dialog>
                          </div>

                          <div className="">
                            {h.allAreas.map((area) => {
                              const areaNameFieldKey = `${area.id}_name`;
                              return (
                                <div
                                  className="collapse first:collapse-open collapse-arrow bg-base-100 border border-base-content/25 focus-within:outline-0 focus-within:shadow-none mb-3"
                                  key={area.id}
                                >
                                  <input type="checkbox" className="peer" />
                                  <div className="collapse-title font-semibold after:inset-s-5 after:inset-e-auto pe-4 ps-12">
                                    {area.name}
                                  </div>
                                  <div className="collapse-content z-1">
                                    <div className="">
                                      <div className="flex join py-2">
                                        <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                          <span className="dark:text-[#414342] text-[#d2d2d2]">
                                            Area name
                                          </span>
                                          <input
                                            type="text"
                                            placeholder="Area name"
                                            className=""
                                            required
                                            disabled={
                                              !editingField[areaNameFieldKey]
                                            }
                                            value={
                                              fieldValues[areaNameFieldKey] ??
                                              area.name
                                            }
                                            onChange={(e) =>
                                              setFieldValues((prev) => ({
                                                ...prev,
                                                [areaNameFieldKey]:
                                                  e.target.value,
                                              }))
                                            }
                                          />
                                        </label>
                                        <button
                                          className="btn join-item focus-within:outline-0"
                                          disabled={
                                            savingField === areaNameFieldKey
                                          }
                                          onClick={() => {
                                            if (
                                              editingField[areaNameFieldKey]
                                            ) {
                                              handleSaveEntity(
                                                updateArea,
                                                updateAreaLocal,
                                                area.id,
                                                areaNameFieldKey,
                                                fieldValues[areaNameFieldKey],
                                                "area name",
                                              );
                                            } else {
                                              setEditingField((prev) => ({
                                                ...prev,
                                                [areaNameFieldKey]: true,
                                              }));
                                            }
                                          }}
                                        >
                                          {savingField === areaNameFieldKey ? (
                                            <span className="loading loading-spinner text-current" />
                                          ) : editingField[areaNameFieldKey] ? (
                                            <SaveIcon
                                              className="w-4 h-4 fill-base-content"
                                              unique_id={`save_unit_${h.unit_number}_area_name_field_${area.id}`}
                                            />
                                          ) : (
                                            <EditIcon className="w-4 h-4 fill-base-content" />
                                          )}
                                        </button>
                                      </div>

                                      <div className="flex justify-between items-center w-full my-6">
                                        <div className="font-semibold text-sm">
                                          Surfaces
                                        </div>
                                        <button
                                          className="btn btn-sm focus-within:outline-0"
                                          disabled={
                                            creatingSurfaceId === area.id
                                          }
                                          onClick={() => {
                                            setActiveSurfaceAreaId(area.id);
                                            setNewSurfaceName("");
                                            document
                                              .getElementById(
                                                `add_surface_modal_${area.id}`,
                                              )
                                              ?.showModal();
                                          }}
                                        >
                                          {creatingSurfaceId === area.id ? (
                                            <span className="loading loading-spinner text-current" />
                                          ) : (
                                            "Add Surface"
                                          )}
                                        </button>
                                      </div>

                                      <dialog
                                        id={`add_surface_modal_${area.id}`}
                                        className="modal modal-middle"
                                      >
                                        <div className="modal-box">
                                          <h3 className="font-bold text-lg mb-6">
                                            Provide new surface name:
                                          </h3>
                                          <label className="input floating-label validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                            <span className="dark:text-[#414342] text-[#d2d2d2]">
                                              Surface name
                                            </span>
                                            <input
                                              className=""
                                              placeholder="Surface name"
                                              type="text"
                                              required
                                              value={
                                                activeSurfaceAreaId === area.id
                                                  ? newSurfaceName
                                                  : ""
                                              }
                                              onChange={(e) =>
                                                setNewSurfaceName(
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          </label>
                                          <div className="modal-action flex justify-end gap-y-4">
                                            <form method="dialog">
                                              <button className="btn text-error">
                                                Cancel
                                              </button>
                                            </form>
                                            <button
                                              className="btn"
                                              disabled={
                                                creatingSurfaceId === area.id
                                              }
                                              onClick={(e) => {
                                                e.preventDefault();
                                                submitAddSurface(h.id, area.id);
                                              }}
                                            >
                                              {creatingSurfaceId === area.id ? (
                                                <span className="loading loading-spinner text-current" />
                                              ) : (
                                                "Add"
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      </dialog>

                                      <div className="">
                                        {area.allSurfaces.map((surface) => {
                                          const surfaceNameFieldKey = `${surface.id}_name`;
                                          const surfaceSelectedTileFieldKey = `${surface.id}_selected_tile`;
                                          const surfaceLengthFieldKey = `${surface.id}_surface_length`;
                                          const surfaceWidthFieldKey = `${surface.id}_surface_width`;
                                          const surfaceHeightFieldKey = `${surface.id}_surface_height`;
                                          return (
                                            <div
                                              className="collapse first:collapse-open collapse-arrow bg-base-100 border border-base-content/25 focus-within:outline-0 focus-within:shadow-none mb-3"
                                              key={surface.id}
                                            >
                                              <input
                                                type="checkbox"
                                                className="peer"
                                              />
                                              <div className="collapse-title font-semibold after:inset-s-5 after:inset-e-auto pe-4 ps-12">
                                                {surface.name}
                                              </div>
                                              <div className="collapse-content z-1">
                                                <div className="flex flex-wrap gap-4 grow-0">
                                                  <div className="flex join py-2">
                                                    <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                                      <span className="dark:text-[#414342] text-[#d2d2d2]">
                                                        Surface name
                                                      </span>
                                                      <input
                                                        type="text"
                                                        placeholder="Surface name"
                                                        className=""
                                                        disabled={
                                                          !editingField[
                                                            surfaceNameFieldKey
                                                          ]
                                                        }
                                                        value={
                                                          fieldValues[
                                                            surfaceNameFieldKey
                                                          ] ?? surface.name
                                                        }
                                                        onChange={(e) =>
                                                          setFieldValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceNameFieldKey]:
                                                                e.target.value,
                                                            }),
                                                          )
                                                        }
                                                      />
                                                    </label>
                                                    <button
                                                      className="btn join-item focus-within:outline-0"
                                                      disabled={
                                                        savingField ===
                                                        surfaceNameFieldKey
                                                      }
                                                      onClick={() => {
                                                        if (
                                                          editingField[
                                                            surfaceNameFieldKey
                                                          ]
                                                        ) {
                                                          const nameValue =
                                                            fieldValues[
                                                              surfaceNameFieldKey
                                                            ];
                                                          const nameToSave =
                                                            nameValue &&
                                                            nameValue.trim()
                                                              ? nameValue
                                                              : surface.name;
                                                          handleSaveEntity(
                                                            updateSurface,
                                                            updateSurfaceLocal,
                                                            surface.id,
                                                            surfaceNameFieldKey,
                                                            nameToSave,
                                                            "surface name",
                                                            [h.id, area.id],
                                                          );
                                                        } else {
                                                          setFieldValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceNameFieldKey]:
                                                                "",
                                                            }),
                                                          );
                                                          setEditingField(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceNameFieldKey]: true,
                                                            }),
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      {savingField ===
                                                      surfaceNameFieldKey ? (
                                                        <span className="loading loading-spinner text-current" />
                                                      ) : editingField[
                                                          surfaceNameFieldKey
                                                        ] ? (
                                                        <SaveIcon
                                                          className="w-4 h-4 fill-base-content"
                                                          unique_id={`save_unit_${h.unit_number}_surface_name_field_${surface.id}`}
                                                        />
                                                      ) : (
                                                        <EditIcon className="w-4 h-4 fill-base-content" />
                                                      )}
                                                    </button>
                                                  </div>

                                                  <div className="flex join py-2">
                                                    {/*
                                                      selected_tile: local state intentionally stores the FULL tile
                                                      object (shape matches the `selected_tile(*)` join result), while
                                                      the DB column `surfaces.selected_tile` is a text FK to
                                                      `tiles(sku)`. The split is bridged in handleSaveEntity via the
                                                      `remoteValue` arg: the sku string is sent to the server while the
                                                      object is kept in local state. Keep these in sync if the tile
                                                      object shape changes.
                                                    */}
                                                    <TileCombobox
                                                      key={
                                                        editingField[
                                                          surfaceSelectedTileFieldKey
                                                        ]
                                                          ? `edit_${surface.id}`
                                                          : `view_${surface.id}`
                                                      }
                                                      catalog={tilesCatalog}
                                                      loading={
                                                        !tilesCatalogLoaded
                                                      }
                                                      disabled={
                                                        !editingField[
                                                          surfaceSelectedTileFieldKey
                                                        ]
                                                      }
                                                      initialDisplay={
                                                        surface.selected_tile
                                                          ?.description ?? ""
                                                      }
                                                      onSelect={(tile) =>
                                                        setFieldValues(
                                                          (prev) => ({
                                                            ...prev,
                                                            [surfaceSelectedTileFieldKey]:
                                                              tile,
                                                          }),
                                                        )
                                                      }
                                                    />
                                                    <button
                                                      className="btn join-item focus-within:outline-0"
                                                      disabled={
                                                        savingField ===
                                                        surfaceSelectedTileFieldKey
                                                      }
                                                      onClick={() => {
                                                        if (
                                                          editingField[
                                                            surfaceSelectedTileFieldKey
                                                          ]
                                                        ) {
                                                          handleSaveEntity(
                                                            updateSurface,
                                                            updateSurfaceLocal,
                                                            surface.id,
                                                            surfaceSelectedTileFieldKey,
                                                            fieldValues[
                                                              surfaceSelectedTileFieldKey
                                                            ],
                                                            "selected tile",
                                                            [h.id, area.id],
                                                            fieldValues[
                                                              surfaceSelectedTileFieldKey
                                                            ]?.sku,
                                                          );
                                                        } else {
                                                          ensureTilesCatalog();
                                                          setEditingField(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceSelectedTileFieldKey]: true,
                                                            }),
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      {savingField ===
                                                      surfaceSelectedTileFieldKey ? (
                                                        <span className="loading loading-spinner text-current" />
                                                      ) : editingField[
                                                          surfaceSelectedTileFieldKey
                                                        ] ? (
                                                        <SaveIcon
                                                          className="w-4 h-4 fill-base-content"
                                                          unique_id={`save_unit_${h.unit_number}_selected_tile_field_${surface.id}`}
                                                        />
                                                      ) : (
                                                        <EditIcon className="w-4 h-4 fill-base-content" />
                                                      )}
                                                    </button>
                                                  </div>

                                                  <div className="flex join py-2">
                                                    <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                                      <span className="dark:text-[#414342] text-[#d2d2d2]">
                                                        Surface length
                                                      </span>
                                                      <input
                                                        type="text"
                                                        placeholder="Surface length"
                                                        className=""
                                                        disabled={
                                                          !editingField[
                                                            surfaceLengthFieldKey
                                                          ]
                                                        }
                                                        value={
                                                          fieldValues[
                                                            surfaceLengthFieldKey
                                                          ] ??
                                                          surface.surface_length
                                                        }
                                                        onChange={(e) =>
                                                          setFieldValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceLengthFieldKey]:
                                                                e.target.value,
                                                            }),
                                                          )
                                                        }
                                                      />
                                                    </label>
                                                    <button
                                                      className="btn join-item focus-within:outline-0"
                                                      disabled={
                                                        savingField ===
                                                        surfaceLengthFieldKey
                                                      }
                                                      onClick={() => {
                                                        if (
                                                          editingField[
                                                            surfaceLengthFieldKey
                                                          ]
                                                        ) {
                                                          const lengthValue =
                                                            fieldValues[
                                                              surfaceLengthFieldKey
                                                            ];
                                                          const lengthToSave =
                                                            lengthValue &&
                                                            lengthValue.trim()
                                                              ? lengthValue
                                                              : surface.surface_length;
                                                          handleSaveEntity(
                                                            updateSurface,
                                                            updateSurfaceLocal,
                                                            surface.id,
                                                            surfaceLengthFieldKey,
                                                            lengthToSave,
                                                            "Surface length",
                                                            [h.id, area.id],
                                                          );
                                                        } else {
                                                          setFieldValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceLengthFieldKey]:
                                                                "",
                                                            }),
                                                          );
                                                          setEditingField(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceLengthFieldKey]: true,
                                                            }),
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      {savingField ===
                                                      surfaceLengthFieldKey ? (
                                                        <span className="loading loading-spinner text-current" />
                                                      ) : editingField[
                                                          surfaceLengthFieldKey
                                                        ] ? (
                                                        <SaveIcon
                                                          className="w-4 h-4 fill-base-content"
                                                          unique_id={`save_unit_${h.unit_number}_surface_length_field_${surface.id}`}
                                                        />
                                                      ) : (
                                                        <EditIcon className="w-4 h-4 fill-base-content" />
                                                      )}
                                                    </button>
                                                  </div>

                                                  <div className="flex join py-2">
                                                    <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                                      <span className="dark:text-[#414342] text-[#d2d2d2]">
                                                        Surface width
                                                      </span>
                                                      <input
                                                        type="text"
                                                        placeholder="Surface width"
                                                        className=""
                                                        disabled={
                                                          !editingField[
                                                            surfaceWidthFieldKey
                                                          ]
                                                        }
                                                        value={
                                                          fieldValues[
                                                            surfaceWidthFieldKey
                                                          ] ??
                                                          surface.surface_width
                                                        }
                                                        onChange={(e) =>
                                                          setFieldValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceWidthFieldKey]:
                                                                e.target.value,
                                                            }),
                                                          )
                                                        }
                                                      />
                                                    </label>
                                                    <button
                                                      className="btn join-item focus-within:outline-0"
                                                      disabled={
                                                        savingField ===
                                                        surfaceWidthFieldKey
                                                      }
                                                      onClick={() => {
                                                        if (
                                                          editingField[
                                                            surfaceWidthFieldKey
                                                          ]
                                                        ) {
                                                          const widthValue =
                                                            fieldValues[
                                                              surfaceWidthFieldKey
                                                            ];
                                                          const widthToSave =
                                                            widthValue &&
                                                            widthValue.trim()
                                                              ? widthValue
                                                              : surface.surface_width;
                                                          handleSaveEntity(
                                                            updateSurface,
                                                            updateSurfaceLocal,
                                                            surface.id,
                                                            surfaceWidthFieldKey,
                                                            widthToSave,
                                                            "Surface width",
                                                            [h.id, area.id],
                                                          );
                                                        } else {
                                                          setFieldValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceWidthFieldKey]:
                                                                "",
                                                            }),
                                                          );
                                                          setEditingField(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceWidthFieldKey]: true,
                                                            }),
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      {savingField ===
                                                      surfaceWidthFieldKey ? (
                                                        <span className="loading loading-spinner text-current" />
                                                      ) : editingField[
                                                          surfaceWidthFieldKey
                                                        ] ? (
                                                        <SaveIcon
                                                          className="w-4 h-4 fill-base-content"
                                                          unique_id={`save_unit_${h.unit_number}_surface_width_field_${surface.id}`}
                                                        />
                                                      ) : (
                                                        <EditIcon className="w-4 h-4 fill-base-content" />
                                                      )}
                                                    </button>
                                                  </div>

                                                  <div className="flex join py-2">
                                                    <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                                      <span className="dark:text-[#414342] text-[#d2d2d2]">
                                                        Surface height
                                                      </span>
                                                      <input
                                                        type="text"
                                                        placeholder="Surface height"
                                                        className=""
                                                        disabled={
                                                          !editingField[
                                                            surfaceHeightFieldKey
                                                          ]
                                                        }
                                                        value={
                                                          fieldValues[
                                                            surfaceHeightFieldKey
                                                          ] ??
                                                          surface.surface_height
                                                        }
                                                        onChange={(e) =>
                                                          setFieldValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceHeightFieldKey]:
                                                                e.target.value,
                                                            }),
                                                          )
                                                        }
                                                      />
                                                    </label>
                                                    <button
                                                      className="btn join-item focus-within:outline-0"
                                                      disabled={
                                                        savingField ===
                                                        surfaceHeightFieldKey
                                                      }
                                                      onClick={() => {
                                                        if (
                                                          editingField[
                                                            surfaceHeightFieldKey
                                                          ]
                                                        ) {
                                                          const heightValue =
                                                            fieldValues[
                                                              surfaceHeightFieldKey
                                                            ];
                                                          const heightToSave =
                                                            heightValue &&
                                                            heightValue.trim()
                                                              ? heightValue
                                                              : surface.surface_height;
                                                          handleSaveEntity(
                                                            updateSurface,
                                                            updateSurfaceLocal,
                                                            surface.id,
                                                            surfaceHeightFieldKey,
                                                            heightToSave,
                                                            "Surface height",
                                                            [h.id, area.id],
                                                          );
                                                        } else {
                                                          setFieldValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceHeightFieldKey]:
                                                                "",
                                                            }),
                                                          );
                                                          setEditingField(
                                                            (prev) => ({
                                                              ...prev,
                                                              [surfaceHeightFieldKey]: true,
                                                            }),
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      {savingField ===
                                                      surfaceHeightFieldKey ? (
                                                        <span className="loading loading-spinner text-current" />
                                                      ) : editingField[
                                                          surfaceHeightFieldKey
                                                        ] ? (
                                                        <SaveIcon
                                                          className="w-4 h-4 fill-base-content"
                                                          unique_id={`save_unit_${h.unit_number}_surface_height_field_${surface.id}`}
                                                        />
                                                      ) : (
                                                        <EditIcon className="w-4 h-4 fill-base-content" />
                                                      )}
                                                    </button>
                                                  </div>
                                                </div>

                                                <div className="divider text-sm"></div>
                                                <div className="flex justify-end items-center w-full mb-2">
                                                  <button
                                                    onClick={() => {
                                                      document
                                                        .getElementById(
                                                          `unit_number_${h.unit_number}_delete_surface_modal_${surface.id}`,
                                                        )
                                                        .showModal();
                                                    }}
                                                    className="btn btn-sm btn-error focus-within:outline-0 flex gap-y-4"
                                                  >
                                                    <span className="text-error-content">
                                                      Delete Surface
                                                    </span>
                                                    <DeleteIcon
                                                      unique_id={surface.id}
                                                      className="w-4 h-4 fill-error-content"
                                                    />
                                                  </button>
                                                  <dialog
                                                    id={`unit_number_${h.unit_number}_delete_surface_modal_${surface.id}`}
                                                    className="modal modal-middle"
                                                  >
                                                    <div className="modal-box">
                                                      <h3 className="font-semibold text-lg mb-6">
                                                        Are you sure you want to
                                                        delete{" "}
                                                        <span className="font-bold text-xl">
                                                          {surface.name}
                                                        </span>
                                                        ?
                                                      </h3>
                                                      <p className="">
                                                        This action is permanent
                                                        and not reversable.
                                                      </p>
                                                      <div className="modal-action flex justify-end gap-y-4">
                                                        <form method="dialog">
                                                          <button className="btn btn-sm focus-within:outline-0">
                                                            Cancel
                                                          </button>
                                                        </form>
                                                        <button
                                                          className="btn btn-error btn-sm"
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            submitDeleteSurface(
                                                              h.id,
                                                              area.id,
                                                              surface.id,
                                                              surface.name,
                                                            );
                                                            document
                                                              .getElementById(
                                                                `unit_number_${h.unit_number}_delete_surface_modal_${surface.id}`,
                                                              )
                                                              .close();
                                                          }}
                                                        >
                                                          <span className="text-error-content">
                                                            Confirm
                                                          </span>
                                                          <DeleteIcon
                                                            unique_id={
                                                              surface.id
                                                            }
                                                            className="w-4 h-4 fill-error-content"
                                                          />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </dialog>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    <div className="divider text-sm"></div>
                                    <div className="flex justify-end items-center w-full mb-2">
                                      <button
                                        onClick={() => {
                                          document
                                            .getElementById(
                                              `unit_number_${h.unit_number}_delete_area_modal_${area.id}`,
                                            )
                                            .showModal();
                                        }}
                                        className="btn btn-sm btn-error focus-within:outline-0 flex gap-y-4"
                                      >
                                        <span className="text-error-content">
                                          Delete Area
                                        </span>
                                        <DeleteIcon
                                          unique_id={area.id}
                                          className="w-4 h-4 fill-error-content"
                                        />
                                      </button>
                                      <dialog
                                        id={`unit_number_${h.unit_number}_delete_area_modal_${area.id}`}
                                        className="modal modal-middle"
                                      >
                                        <div className="modal-box">
                                          <h3 className="font-semibold text-lg mb-6">
                                            Are you sure you want to delete{" "}
                                            <span className="font-bold text-xl">
                                              {area.name}
                                            </span>
                                            ?
                                          </h3>
                                          <p className="">
                                            This action is permanent and not
                                            reversable.
                                          </p>
                                          <div className="modal-action flex justify-end gap-y-4">
                                            <form method="dialog">
                                              <button className="btn btn-sm focus-within:outline-0">
                                                Cancel
                                              </button>
                                            </form>
                                            <button
                                              className="btn btn-error btn-sm"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                submitDeleteArea(
                                                  h.id,
                                                  area.id,
                                                  area.name,
                                                );
                                                document
                                                  .getElementById(
                                                    `unit_number_${h.unit_number}_delete_area_modal_${area.id}`,
                                                  )
                                                  .close();
                                              }}
                                            >
                                              <span className="text-error-content">
                                                Confirm
                                              </span>
                                              <DeleteIcon
                                                unique_id={area.id}
                                                className="w-4 h-4 fill-error-content"
                                              />
                                            </button>
                                          </div>
                                        </div>
                                      </dialog>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="divider text-sm"></div>
                        <div className="flex justify-end items-center w-full">
                          <button
                            className="btn btn-sm btn-error focus-within:outline-0 flex gap-y-4"
                            onClick={() => {
                              document
                                .getElementById(
                                  `unit_number_${h.unit_number}_delete_house_modal`,
                                )
                                .showModal();
                            }}
                          >
                            <span className="text-error-content">
                              Delete House
                            </span>
                            <DeleteIcon
                              unique_id={h.id}
                              className="w-4 h-4 fill-error-content"
                            />
                          </button>

                          <dialog
                            id={`unit_number_${h.unit_number}_delete_house_modal`}
                            className="modal modal-middle"
                          >
                            <div className="modal-box">
                              <h3 className="font-semibold text-lg mb-6">
                                Are you sure you want to delete house{" "}
                                <span className="font-bold text-xl">
                                  {h.unit_number}
                                </span>
                                ?
                              </h3>
                              <p className="">
                                This action is permanent and not reversable.
                              </p>
                              <div className="modal-action flex justify-end gap-y-4">
                                <form method="dialog">
                                  <button className="btn btn-sm focus-within:outline-0">
                                    Cancel
                                  </button>
                                </form>
                                <button
                                  className="btn btn-error btn-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    submitDeleteHouse(h.id, h.unit_number);
                                    document
                                      .getElementById(
                                        `unit_number_${h.unit_number}_delete_house_modal`,
                                      )
                                      .close();
                                  }}
                                >
                                  <span className="text-error-content">
                                    Confirm
                                  </span>
                                  <DeleteIcon
                                    unique_id={h.id}
                                    className="w-4 h-4 fill-error-content"
                                  />
                                </button>
                              </div>
                            </div>
                          </dialog>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <input
              className={`tab`}
              type="radio"
              name="my_tabs_2"
              aria-label="Create"
              role="button"
            />
            <div className="tab-content bg-base-100 border-base-300 p-6">
              <div className="flex justify-center text-lg font-semibold my-6">
                Create New house
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                  <span className="dark:text-[#414342] text-[#d2d2d2]">
                    Unit number
                  </span>
                  <input
                    type="text"
                    placeholder="Unit number"
                    className=""
                    required
                  />
                </label>

                <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                  <span className="dark:text-[#414342] text-[#d2d2d2]">
                    Client surname
                  </span>

                  <input
                    type="text"
                    placeholder="Client surname"
                    className=""
                    required
                  />
                </label>

                <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                  <span className="dark:text-[#414342] text-[#d2d2d2]">
                    Client contact number
                  </span>
                  <svg
                    className="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                  >
                    <g fill="none">
                      <path
                        d="M7.25 11.5C6.83579 11.5 6.5 11.8358 6.5 12.25C6.5 12.6642 6.83579 13 7.25 13H8.75C9.16421 13 9.5 12.6642 9.5 12.25C9.5 11.8358 9.16421 11.5 8.75 11.5H7.25Z"
                        fill="currentColor"
                      ></path>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6 1C4.61929 1 3.5 2.11929 3.5 3.5V12.5C3.5 13.8807 4.61929 15 6 15H10C11.3807 15 12.5 13.8807 12.5 12.5V3.5C12.5 2.11929 11.3807 1 10 1H6ZM10 2.5H9.5V3C9.5 3.27614 9.27614 3.5 9 3.5H7C6.72386 3.5 6.5 3.27614 6.5 3V2.5H6C5.44771 2.5 5 2.94772 5 3.5V12.5C5 13.0523 5.44772 13.5 6 13.5H10C10.5523 13.5 11 13.0523 11 12.5V3.5C11 2.94772 10.5523 2.5 10 2.5Z"
                        fill="currentColor"
                      ></path>
                    </g>
                  </svg>

                  <input
                    type="tel"
                    placeholder="Client contact number"
                    className=""
                    required
                    pattern="[0-9]*"
                    minLength="10"
                    maxLength="10"
                  />
                </label>
              </div>

              <div className="flex justify-end items-center w-full mt-6 mb-2">
                <button className="btn focus-within:outline-0 flex gap-y-4">
                  <span className="">Create</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HouseManager;
