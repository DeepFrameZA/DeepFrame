import { BUILT_IN_THEMES, CUSTOM_THEMES } from "./themes";
import { useTheme } from "../../hooks/useTheme";

const ALL_THEMES = [...CUSTOM_THEMES, ...BUILT_IN_THEMES];

function formatThemeName(theme) {
  return theme
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      className="h-2 w-2 shrink-0 fill-current opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2048 2048"
      aria-hidden="true"
    >
      <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
    </svg>
  );
}

function ThemeColors() {
  return (
    <span className="flex shrink-0 gap-1">
      <span className="bg-primary h-3 w-3 rounded-full" />
      <span className="bg-secondary h-3 w-3 rounded-full" />
      <span className="bg-accent h-3 w-3 rounded-full" />
    </span>
  );
}

function ThemeOption({ themeName, currentTheme, onThemeChange }) {
  const isSelected = currentTheme === themeName;

  return (
    <li>
      <label
        data-theme={themeName}
        className={`
          bg-base-100
          text-base-content
          border-base-300
          flex
          w-full
          cursor-pointer
          items-center
          gap-3
          rounded-btn
          border
          p-2
          my-2
          whitespace-nowrap
          transition
          hover:inset-ring-2
          inset-ring-primary
          ${isSelected ? "inset-ring-primary inset-ring-2" : ""}
        `}
      >
        <input
          type="radio"
          name="theme-dropdown"
          value={themeName}
          checked={isSelected}
          onChange={() => onThemeChange(themeName)}
          className="theme-controller"
        />

        <span className="min-w-0 flex-1 text-left">
          {formatThemeName(themeName)}
        </span>

        <ThemeColors />
      </label>
    </li>
  );
}

function ThemeDropdown() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown relative grid w-max">
      {/*
        Invisible sizing element.

        It measures:
        - longest theme name
        - theme color dots
        - chevron
        - spacing/padding
        - small safety buffer
      */}
      <div
        aria-hidden="true"
        className="btn invisible pointer-events-none col-start-1 row-start-1"
      >
        <span className="grid">
          {ALL_THEMES.map((themeName) => (
            <span
              key={themeName}
              className="col-start-1 row-start-1 whitespace-nowrap"
            >
              {formatThemeName(themeName)}
            </span>
          ))}
        </span>

        <ThemeColors />

        <ChevronIcon />

        {/* Small width safety buffer */}
        <span className="w-8 shrink-0" />
      </div>

      {/* Visible trigger */}
      <div
        tabIndex={0}
        role="button"
        className="btn col-start-1 row-start-1 w-full"
      >
        <span className="flex-1 whitespace-nowrap text-left">
          {formatThemeName(theme)}
        </span>

        {/* Preview the currently selected theme */}
        <span data-theme={theme} className="contents">
          <ThemeColors />
        </span>

        <ChevronIcon />
      </div>

      {/* Dropdown */}
      <ul
        tabIndex={-1}
        className="
          dropdown-content
          bg-base-200
          absolute
          top-full
          left-0
          z-10
          mt-1
          max-h-56
          w-full
          overflow-y-auto
          p-2
        "
      >
        {CUSTOM_THEMES.length > 0 && (
          <>
            <li>
              <div className="divider max-w-[95%] text-xs opacity-50">
                Custom
              </div>
            </li>

            {CUSTOM_THEMES.map((themeName) => (
              <ThemeOption
                key={themeName}
                themeName={themeName}
                currentTheme={theme}
                onThemeChange={setTheme}
              />
            ))}
          </>
        )}

        <li>
          <div className="divider max-w-[95%] text-xs opacity-50">Built in</div>
        </li>

        {BUILT_IN_THEMES.map((themeName) => (
          <ThemeOption
            key={themeName}
            themeName={themeName}
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        ))}
      </ul>
    </div>
  );
}

export default ThemeDropdown;
