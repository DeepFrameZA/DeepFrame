import { BUILT_IN_THEMES, CUSTOM_THEMES, THEMES } from "./themes";

import { useTheme } from "../../hooks/useTheme";
import { formatThemeName } from "../../lib/theme";

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

function ThemePreferenceOption({
  themeName,
  selectedTheme,
  disabledTheme,
  onChange,
  name,
}) {
  const isSelected = selectedTheme === themeName;

  const isDisabled = disabledTheme === themeName;

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
          items-center
          gap-3
          border
          p-2
          my-2
          whitespace-nowrap
          transition
          inset-ring-primary

          ${
            isDisabled
              ? "cursor-not-allowed opacity-40"
              : "cursor-pointer hover:inset-ring-2"
          }

          ${isSelected ? "inset-ring-primary inset-ring-2" : ""}
        `}
      >
        <input
          type="radio"
          name={name}
          value={themeName}
          checked={isSelected}
          disabled={isDisabled}
          onChange={() => onChange(themeName)}
          className="radio radio-xs"
        />

        <span className="min-w-0 flex-1 text-left">
          {formatThemeName(themeName)}
        </span>

        <ThemeColors />
      </label>
    </li>
  );
}

function ThemePreferenceDropdown({
  label,
  value,
  disabledTheme,
  onChange,
  name,
}) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>

      <div className="dropdown relative grid w-max">
        {/* Invisible width measurement */}
        <div
          aria-hidden="true"
          className="btn invisible pointer-events-none col-start-1 row-start-1"
        >
          <span className="grid">
            {THEMES.map((themeName) => (
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

          <span className="w-8 shrink-0" />
        </div>

        {/*
          The ENTIRE trigger now uses the
          selected preference theme.
        */}
        <div
          data-theme={value}
          tabIndex={0}
          role="button"
          className="
            btn
            bg-base-100
            text-base-content
            border-base-300
            col-start-1
            row-start-1
            w-full
          "
        >
          <span className="flex-1 whitespace-nowrap text-left">
            {formatThemeName(value)}
          </span>

          <ThemeColors />

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
                <ThemePreferenceOption
                  key={themeName}
                  name={name}
                  themeName={themeName}
                  selectedTheme={value}
                  disabledTheme={disabledTheme}
                  onChange={onChange}
                />
              ))}
            </>
          )}

          <li>
            <div className="divider max-w-[95%] text-xs opacity-50">
              Built in
            </div>
          </li>

          {BUILT_IN_THEMES.map((themeName) => (
            <ThemePreferenceOption
              key={themeName}
              name={name}
              themeName={themeName}
              selectedTheme={value}
              disabledTheme={disabledTheme}
              onChange={onChange}
            />
          ))}
        </ul>
      </div>
    </fieldset>
  );
}

function ThemePreferences() {
  const { lightTheme, darkTheme, setLightTheme, setDarkTheme } = useTheme();

  return (
    <div className="space-y-4">
      <ThemePreferenceDropdown
        label="Light theme"
        name="preferred-light-theme"
        value={lightTheme}
        disabledTheme={darkTheme}
        onChange={setLightTheme}
      />

      <ThemePreferenceDropdown
        label="Dark theme"
        name="preferred-dark-theme"
        value={darkTheme}
        disabledTheme={lightTheme}
        onChange={setDarkTheme}
      />
    </div>
  );
}

export default ThemePreferences;
