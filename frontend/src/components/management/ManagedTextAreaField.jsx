import FloatingInput from "./FloatingInput";
import EditSaveButton from "./EditSaveButton";

const ManagedTextAreaField = ({
  label,
  value,
  fallback,
  editing,
  saving,
  uniqueId,
  onChange,
  onBeginEdit,
  onSave,
}) => {
  return (
    <div className="flex join py-2">
      <FloatingInput label={label} textarea>
        <textarea
          placeholder={label}
          className=" resize-none h-10 w-48"
          required
          disabled={!editing}
          value={value ?? fallback | ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </FloatingInput>
      <EditSaveButton
        editing={editing}
        saving={saving}
        uniqueId={uniqueId}
        onToggle={() => (editing ? onSave() : onBeginEdit())}
      />
    </div>
  );
};

export default ManagedTextAreaField;
