import { useState } from "react";
import ManagedTextField from "../management/ManagedTextField";
import ManagedTileField from "../management/ManagedTileField";
import ManagedTextAreaField from "../management/ManagedTextAreaField";
import DeleteButton from "../management/DeleteButton";
import FloatingInput from "../management/FloatingInput";
import { useHouses } from "../../core/HouseContext";
import useHouseMutations from "../../core/hooks/useHouseMutations";

const AddAreaRow = ({ onSubmit, creating }) => {
  const [name, setName] = useState("");
  return (
    <div className="flex gap-2 items-end mb-3">
      <FloatingInput label="New area name">
        <input
          type="text"
          placeholder="New area name"
          className=""
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FloatingInput>
      <button
        className="btn btn-primary focus-within:outline-0"
        disabled={creating}
        onClick={() => {
          onSubmit(name);
          setName("");
        }}
      >
        {creating ? (
          <span className="loading loading-spinner text-current" />
        ) : (
          "Add Area"
        )}
      </button>
    </div>
  );
};

const AddSurfaceRow = ({ onSubmit, creating }) => {
  const [name, setName] = useState("");
  return (
    <div className="flex gap-2 items-end mb-3">
      <FloatingInput label="New surface name">
        <input
          type="text"
          placeholder="New surface name"
          className=""
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FloatingInput>
      <button
        className="btn btn-primary focus-within:outline-0"
        disabled={creating}
        onClick={() => {
          onSubmit(name);
          setName("");
        }}
      >
        {creating ? (
          <span className="loading loading-spinner text-current" />
        ) : (
          "Add Surface"
        )}
      </button>
    </div>
  );
};

const ManageDrawer = ({ house, onClose }) => {
  const { tilesCatalog, tilesCatalogLoaded, ensureTilesCatalog } = useHouses();
  const mut = useHouseMutations(house);

  if (!house) return null;

  const unitNumberFieldKey = `${house.id}_unit_number`;
  const clientSurnameFieldKey = `${house.id}_client_surname`;
  const clientContactNumberFieldKey = `${house.id}_client_contact_number`;
  const notesFieldKey = `${house.id}_notes`;

  return (
    <div className="bg-base-100 min-h-full w-120 max-w-[95vw] h-full overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {house.unit_number ? `MH ${house.unit_number}` : "Manage House"}
        </h2>
        <button
          className="btn btn-sm btn-ghost focus-within:outline-0"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="font-semibold text-sm mb-6 text-center">
        GENERAL INFORMATION
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <ManagedTextField
          label="Unit number"
          fieldKey={unitNumberFieldKey}
          value={mut.fieldValues[unitNumberFieldKey]}
          fallback={house.unit_number}
          editing={mut.editingField[unitNumberFieldKey]}
          saving={mut.savingField === unitNumberFieldKey}
          uniqueId={`save_unit_number_field_${house.unit_number}`}
          onChange={(v) => mut.setValue(unitNumberFieldKey, v)}
          onBeginEdit={() => mut.beginEdit(unitNumberFieldKey)}
          onSave={() => mut.saveHouseField(unitNumberFieldKey, "unit number")}
        />

        <ManagedTextField
          label="Client surname"
          fieldKey={clientSurnameFieldKey}
          value={mut.fieldValues[clientSurnameFieldKey]}
          fallback={house.client_surname}
          editing={mut.editingField[clientSurnameFieldKey]}
          saving={mut.savingField === clientSurnameFieldKey}
          uniqueId={`save_client_surname_field_${house.unit_number}`}
          onChange={(v) => mut.setValue(clientSurnameFieldKey, v)}
          onBeginEdit={() => mut.beginEdit(clientSurnameFieldKey)}
          onSave={() =>
            mut.saveHouseField(clientSurnameFieldKey, "client surname")
          }
        />

        <ManagedTextField
          label="Client contact number"
          fieldKey={clientContactNumberFieldKey}
          value={mut.fieldValues[clientContactNumberFieldKey]}
          fallback={house.client_contact_number}
          editing={mut.editingField[clientContactNumberFieldKey]}
          saving={mut.savingField === clientContactNumberFieldKey}
          uniqueId={`save_contact_number_field_${house.unit_number}`}
          onChange={(v) => mut.setValue(clientContactNumberFieldKey, v)}
          onBeginEdit={() => mut.beginEdit(clientContactNumberFieldKey)}
          onSave={() =>
            mut.saveHouseField(clientContactNumberFieldKey, "contact number")
          }
          type="tel"
          pattern="[0-9]*"
          minLength="10"
          maxLength="10"
        />

        <ManagedTextAreaField
          label="Notes"
          fieldKey={notesFieldKey}
          value={mut.fieldValues[notesFieldKey]}
          fallback={house.notes}
          editing={mut.editingField[notesFieldKey]}
          saving={mut.savingField === notesFieldKey}
          uniqueId={`save_notes_field_${house.unit_number}`}
          onChange={(v) => mut.setValue(notesFieldKey, v)}
          onBeginEdit={() => mut.beginEdit(notesFieldKey)}
          onSave={() => mut.saveHouseField(notesFieldKey, "notes")}
        />
      </div>

      <div className="divider text-sm my-6">AREAS AND SURFACES</div>

      <div className="flex justify-between items-center w-full mb-6">
        <div className="font-semibold text-sm">Areas</div>
      </div>

      <AddAreaRow
        creating={mut.creatingAreaId === house.id}
        onSubmit={(name) => mut.submitAddArea(name)}
      />

      <div className="">
        {house.allAreas.map((area) => {
          const areaNameFieldKey = `${area.id}_name`;
          return (
            <div
              className="collapse collapse-arrow mb-3 bg-base-100 border border-base-content/25 focus-within:outline-0 focus-within:shadow-none"
              key={area.id}
            >
              <input type="checkbox" className="peer" />
              <div className="collapse-title font-semibold after:inset-s-5 after:inset-e-auto pe-4 ps-12">
                {area.name}
              </div>
              <div className="collapse-content z-1">
                <ManagedTextField
                  label="Area name"
                  fieldKey={areaNameFieldKey}
                  value={mut.fieldValues[areaNameFieldKey]}
                  fallback={area.name}
                  editing={mut.editingField[areaNameFieldKey]}
                  saving={mut.savingField === areaNameFieldKey}
                  uniqueId={`save_unit_${house.unit_number}_area_name_field_${area.id}`}
                  onChange={(v) => mut.setValue(areaNameFieldKey, v)}
                  onBeginEdit={() => mut.beginEdit(areaNameFieldKey)}
                  onSave={() =>
                    mut.saveAreaField(area.id, areaNameFieldKey, "area name")
                  }
                />

                <div className="font-semibold text-sm my-6">Surfaces</div>

                <AddSurfaceRow
                  creating={mut.creatingSurfaceId === area.id}
                  onSubmit={(name) => mut.submitAddSurface(area.id, name)}
                />

                <div className="">
                  {area.allSurfaces.map((surface) => {
                    const surfaceNameFieldKey = `${surface.id}_name`;
                    const surfaceSelectedTileFieldKey = `${surface.id}_selected_tile`;
                    const surfaceLengthFieldKey = `${surface.id}_surface_length`;
                    const surfaceWidthFieldKey = `${surface.id}_surface_width`;
                    const surfaceHeightFieldKey = `${surface.id}_surface_height`;
                    return (
                      <div
                        className="mb-3 rounded-sm border border-base-content/15 p-3"
                        key={surface.id}
                      >
                        <div className="flex flex-wrap gap-4 grow-0">
                          <ManagedTextField
                            label="Surface name"
                            fieldKey={surfaceNameFieldKey}
                            value={mut.fieldValues[surfaceNameFieldKey]}
                            fallback={surface.name}
                            editing={mut.editingField[surfaceNameFieldKey]}
                            saving={mut.savingField === surfaceNameFieldKey}
                            uniqueId={`save_unit_${house.unit_number}_surface_name_field_${surface.id}`}
                            onChange={(v) =>
                              mut.setValue(surfaceNameFieldKey, v)
                            }
                            onBeginEdit={() =>
                              mut.beginEditClear(surfaceNameFieldKey)
                            }
                            onSave={() => {
                              const nameValue =
                                mut.fieldValues[surfaceNameFieldKey];
                              const nameToSave =
                                nameValue && nameValue.trim()
                                  ? nameValue
                                  : surface.name;
                              mut.saveSurfaceField(
                                area.id,
                                surface.id,
                                surfaceNameFieldKey,
                                nameToSave,
                                "surface name",
                              );
                            }}
                          />

                          <ManagedTileField
                            fieldKey={surface.id}
                            editing={
                              mut.editingField[surfaceSelectedTileFieldKey]
                            }
                            saving={
                              mut.savingField === surfaceSelectedTileFieldKey
                            }
                            uniqueId={`save_unit_${house.unit_number}_selected_tile_field_${surface.id}`}
                            catalog={tilesCatalog}
                            loading={!tilesCatalogLoaded}
                            initialDisplay={
                              surface.selected_tile?.description ?? ""
                            }
                            onSelect={(tile) =>
                              mut.setValue(surfaceSelectedTileFieldKey, tile)
                            }
                            onBeginEdit={() => {
                              ensureTilesCatalog();
                              mut.beginEdit(surfaceSelectedTileFieldKey);
                            }}
                            onSave={() =>
                              mut.saveSurfaceField(
                                area.id,
                                surface.id,
                                surfaceSelectedTileFieldKey,
                                mut.fieldValues[surfaceSelectedTileFieldKey],
                                "selected tile",
                                mut.fieldValues[surfaceSelectedTileFieldKey]
                                  ?.sku,
                              )
                            }
                          />

                          <ManagedTextField
                            label="Surface length"
                            fieldKey={surfaceLengthFieldKey}
                            value={mut.fieldValues[surfaceLengthFieldKey]}
                            fallback={surface.surface_length}
                            editing={mut.editingField[surfaceLengthFieldKey]}
                            saving={mut.savingField === surfaceLengthFieldKey}
                            uniqueId={`save_unit_${house.unit_number}_surface_length_field_${surface.id}`}
                            onChange={(v) =>
                              mut.setValue(surfaceLengthFieldKey, v)
                            }
                            onBeginEdit={() =>
                              mut.beginEditClear(surfaceLengthFieldKey)
                            }
                            onSave={() => {
                              const lengthValue =
                                mut.fieldValues[surfaceLengthFieldKey];
                              const lengthToSave =
                                lengthValue && lengthValue.trim()
                                  ? lengthValue
                                  : surface.surface_length;
                              mut.saveSurfaceField(
                                area.id,
                                surface.id,
                                surfaceLengthFieldKey,
                                lengthToSave,
                                "Surface length",
                              );
                            }}
                            type="number"
                          />

                          <ManagedTextField
                            label="Surface width"
                            fieldKey={surfaceWidthFieldKey}
                            value={mut.fieldValues[surfaceWidthFieldKey]}
                            fallback={surface.surface_width}
                            editing={mut.editingField[surfaceWidthFieldKey]}
                            saving={mut.savingField === surfaceWidthFieldKey}
                            uniqueId={`save_unit_${house.unit_number}_surface_width_field_${surface.id}`}
                            onChange={(v) =>
                              mut.setValue(surfaceWidthFieldKey, v)
                            }
                            onBeginEdit={() =>
                              mut.beginEditClear(surfaceWidthFieldKey)
                            }
                            onSave={() => {
                              const widthValue =
                                mut.fieldValues[surfaceWidthFieldKey];
                              const widthToSave =
                                widthValue && widthValue.trim()
                                  ? widthValue
                                  : surface.surface_width;
                              mut.saveSurfaceField(
                                area.id,
                                surface.id,
                                surfaceWidthFieldKey,
                                widthToSave,
                                "Surface width",
                              );
                            }}
                            type="number"
                          />

                          <ManagedTextField
                            label="Surface height"
                            fieldKey={surfaceHeightFieldKey}
                            value={mut.fieldValues[surfaceHeightFieldKey]}
                            fallback={surface.surface_height}
                            editing={mut.editingField[surfaceHeightFieldKey]}
                            saving={mut.savingField === surfaceHeightFieldKey}
                            uniqueId={`save_unit_${house.unit_number}_surface_height_field_${surface.id}`}
                            onChange={(v) =>
                              mut.setValue(surfaceHeightFieldKey, v)
                            }
                            onBeginEdit={() =>
                              mut.beginEditClear(surfaceHeightFieldKey)
                            }
                            onSave={() => {
                              const heightValue =
                                mut.fieldValues[surfaceHeightFieldKey];
                              const heightToSave =
                                heightValue && heightValue.trim()
                                  ? heightValue
                                  : surface.surface_height;
                              mut.saveSurfaceField(
                                area.id,
                                surface.id,
                                surfaceHeightFieldKey,
                                heightToSave,
                                "Surface height",
                              );
                            }}
                            type="number"
                          />
                        </div>

                        <div className="divider text-sm"></div>
                        <div className="flex justify-end items-center w-full mb-2">
                          <DeleteButton
                            buttonLabel="Delete Surface"
                            headingPrefix="Are you sure you want to delete"
                            itemName={surface.name}
                            uniqueId={surface.id}
                            onConfirm={() =>
                              mut.submitDeleteSurface(
                                area.id,
                                surface.id,
                                surface.name,
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="divider text-sm"></div>
                <div className="flex justify-end items-center w-full mb-2">
                  <DeleteButton
                    buttonLabel="Delete Area"
                    headingPrefix="Are you sure you want to delete"
                    itemName={area.name}
                    uniqueId={area.id}
                    onConfirm={() => mut.submitDeleteArea(area.id, area.name)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/**/}
      {/* <div className="divider text-sm"></div> */}
      {/* <div className="flex justify-end items-center w-full"> */}
      {/*   <DeleteButton */}
      {/*     buttonLabel="Delete House" */}
      {/*     headingPrefix="Are you sure you want to delete house" */}
      {/*     itemName={house.unit_number} */}
      {/*     uniqueId={house.id} */}
      {/*     onConfirm={() => { */}
      {/*       mut.submitDeleteHouse(); */}
      {/*       onClose?.(); */}
      {/*     }} */}
      {/*   /> */}
      {/* </div> */}
    </div>
  );
};

export default ManageDrawer;
