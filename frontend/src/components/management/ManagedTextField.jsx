import FloatingInput from "./FloatingInput";
import EditSaveButton from "./EditSaveButton";
import { formatPhoneInput } from "../../core/utils/validation";

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
  tel,
  region,
  min,
  max,
  step,
}) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    onChange(tel ? formatPhoneInput(raw, region) : raw);
  };
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
          onChange={handleChange}
          pattern={tel ? undefined : pattern}
          minLength={minLength}
          maxLength={tel ? undefined : maxLength}
          min={min}
          max={max}
          step={step}
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
