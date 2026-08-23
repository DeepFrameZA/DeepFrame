import FloatingInput from "./FloatingInput";
import { formatPhoneInput } from "../../core/utils/validation";

const CreateField = ({
  label,
  value,
  onChange,
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
    <FloatingInput label={label} icon={icon}>
      <input
        type={type}
        placeholder={label}
        className=""
        required
        value={value}
        onChange={handleChange}
        pattern={tel ? undefined : pattern}
        minLength={minLength}
        maxLength={tel ? undefined : maxLength}
        min={min}
        max={max}
        step={step}
      />
    </FloatingInput>
  );
};

export default CreateField;
