const FloatingInput = ({ label, icon, children }) => {
  return (
    <label className="input floating-label join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
      <span className="dark:text-[#414342] text-[#d2d2d2]">{label}</span>
      {icon}
      {children}
    </label>
  );
};

export default FloatingInput;
