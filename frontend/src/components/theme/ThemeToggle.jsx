import { useTheme } from "../../hooks/useTheme";
import { formatThemeName } from "../../lib/theme";

function ThemeToggle() {
  const { lightTheme, darkTheme, isDarkMode, toggleTheme } = useTheme();

  return (
    <label className="flex items-center gap-3">
      <span className="text-sm">{formatThemeName(lightTheme)}</span>

      <input
        type="checkbox"
        className="toggle"
        checked={isDarkMode}
        onChange={toggleTheme}
        aria-label="Toggle light and dark theme"
      />

      <span className="text-sm">{formatThemeName(darkTheme)}</span>
    </label>
  );
}

export default ThemeToggle;
