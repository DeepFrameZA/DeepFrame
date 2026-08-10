import { useEffect, useState } from "react";

const defaultTheme = "df_dark";

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

  return theme; // "df_light" or "df_dark"
};

export default useTheme;
