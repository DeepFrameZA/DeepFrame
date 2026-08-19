import FloatingInput from "./FloatingInput";

const CreateField = ({
  label,
  value,
  onChange,
  type = "text",
  pattern,
  minLength,
  maxLength,
  icon,
}) => {
  return (
    <FloatingInput label={label} icon={icon}>
      <input
        type={type}
        placeholder={label}
        className=""
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
      />
    </FloatingInput>
  );
};

export default CreateField;
