import FloatingInput from "./FloatingInput";
import EditSaveButton from "./EditSaveButton";

const ManagedTextField = ({
  label,
  value,
  fallback,
  editing,
  saving,
  uniqueId,
  onChange,
  onBeginEdit,
  onSave,
  type = "text",
  pattern,
  minLength,
  maxLength,
  icon,
}) => {
  return (
    <div className="flex join py-2">
      <FloatingInput label={label} icon={icon}>
        <input
          type={type}
          placeholder={label}
          className=""
          required
          disabled={!editing}
          value={value ?? fallback}
          onChange={(e) => onChange(e.target.value)}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
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

export default ManagedTextField;
