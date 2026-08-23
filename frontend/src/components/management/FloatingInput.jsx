const FloatingInput = ({
  label,
  icon,
  inputClassName,
  textarea = false,
  children,
}) => {
  return (
    <label
      className={`${textarea ? "textarea" : "input"} ${inputClassName ? inputClassName : ""} floating-label join-item validator focus-within:outline-0 focus-within:border-primary focus-within:shadow-none`}
    >
      <span className="text-base-content/40">{label}</span>
      {icon}
      {children}
    </label>
  );
};

export default FloatingInput;
