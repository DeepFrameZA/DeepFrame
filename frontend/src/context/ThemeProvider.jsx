import { useCallback, useMemo, useState } from "react";

import ThemeContext from "./ThemeContext";

import {
  applyTheme,
  getStoredDarkTheme,
  getStoredLightTheme,
  normalizeTheme,
  storeDarkTheme,
  storeLightTheme,
} from "../lib/theme";

export default function ThemeProvider({ children, initialTheme }) {
  const [theme, setThemeState] = useState(() => normalizeTheme(initialTheme));

  const [lightTheme, setLightThemeState] = useState(() =>
    getStoredLightTheme(),
  );

  const [darkTheme, setDarkThemeState] = useState(() => getStoredDarkTheme());

  const setTheme = useCallback((themeName) => {
    const appliedTheme = applyTheme(themeName);

    setThemeState(appliedTheme);

    return appliedTheme;
  }, []);

  const setLightTheme = useCallback(
    (themeName) => {
      const previousLightTheme = lightTheme;

      const storedTheme = storeLightTheme(themeName);

      setLightThemeState(storedTheme);

      // If the user is currently using their
      // preferred light theme, immediately switch
      // to their newly selected light theme.
      if (theme === previousLightTheme) {
        const appliedTheme = applyTheme(storedTheme);

        setThemeState(appliedTheme);
      }

      return storedTheme;
    },
    [theme, lightTheme],
  );

  const setDarkTheme = useCallback(
    (themeName) => {
      const previousDarkTheme = darkTheme;

      const storedTheme = storeDarkTheme(themeName);

      setDarkThemeState(storedTheme);

      // Same behavior for the dark preference.
      if (theme === previousDarkTheme) {
        const appliedTheme = applyTheme(storedTheme);

        setThemeState(appliedTheme);
      }

      return storedTheme;
    },
    [theme, darkTheme],
  );

  const isLightMode = theme === lightTheme;

  const isDarkMode = theme === darkTheme;

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === darkTheme ? lightTheme : darkTheme;

    setTheme(nextTheme);
  }, [theme, lightTheme, darkTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,

      lightTheme,
      darkTheme,

      isLightMode,
      isDarkMode,

      setTheme,
      setLightTheme,
      setDarkTheme,
      toggleTheme,
    }),
    [
      theme,
      lightTheme,
      darkTheme,
      isLightMode,
      isDarkMode,
      setTheme,
      setLightTheme,
      setDarkTheme,
      toggleTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
