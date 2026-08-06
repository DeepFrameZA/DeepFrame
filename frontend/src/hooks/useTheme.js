import { useEffect, useState } from "react";

const defaultTheme = "ssa_dark";

const getCurrentTheme = () => {
  return (
    document.documentElement.getAttribute("data-theme") ||
    localStorage.getItem("theme") ||
    defaultTheme // default
  );
};

const useTheme = () => {
  const [theme, setTheme] = useState(getCurrentTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getCurrentTheme();
      setTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme; // "ssa_light" or "ssa_dark"
};

export default useTheme;
