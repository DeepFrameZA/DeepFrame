import TileCombobox from "../TileCombobox";
import EditSaveButton from "./EditSaveButton";

const ManagedTileField = ({
  fieldKey,
  editing,
  saving,
  uniqueId,
  catalog,
  loading,
  initialDisplay,
  onSelect,
  onBeginEdit,
  onSave,
}) => {
  return (
    <div className="flex join py-2">
      <TileCombobox
        key={editing ? `edit_${fieldKey}` : `view_${fieldKey}`}
        catalog={catalog}
        loading={loading}
        disabled={!editing}
        initialDisplay={initialDisplay}
        onSelect={onSelect}
      />
      <EditSaveButton
        editing={editing}
        saving={saving}
        uniqueId={uniqueId}
        onToggle={() => (editing ? onSave() : onBeginEdit())}
      />
    </div>
  );
};

export default ManagedTileField;
