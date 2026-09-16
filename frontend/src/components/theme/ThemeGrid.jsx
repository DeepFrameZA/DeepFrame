import { BUILT_IN_THEMES, CUSTOM_THEMES } from "./themes";

import { useTheme } from "../../hooks/useTheme";
import { formatThemeName } from "../../lib/theme";

const ALL_THEMES = [...CUSTOM_THEMES, ...BUILT_IN_THEMES];

function ThemeColors() {
  return (
    <div className="flex shrink-0 gap-1">
      <span className="bg-primary h-3 w-3 rounded-full" />
      <span className="bg-secondary h-3 w-3 rounded-full" />
      <span className="bg-accent h-3 w-3 rounded-full" />
    </div>
  );
}

function ThemeRadio({ themeName, selectedTheme, onChange, name }) {
  const isSelected = selectedTheme === themeName;

  return (
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
        gap-2
        border
        p-2
        whitespace-nowrap
        hover:inset-ring-2
        inset-ring-primary

        sm:w-auto
        sm:flex-none

        ${isSelected ? "inset-ring-primary inset-ring-2" : ""}
      `}
    >
      <input
        type="radio"
        name={name}
        value={themeName}
        checked={isSelected}
        onChange={() => onChange(themeName)}
        className="radio radio-xs shrink-0"
      />

      {/*
        This grid establishes a shared text width.

        The visible theme name and the invisible
        list of every possible theme name occupy
        the same grid cell.
      */}
      <span className="grid flex-1">
        {/* Visible name */}
        <span className="col-start-1 row-start-1 whitespace-nowrap">
          {formatThemeName(themeName)}
        </span>

        {/* Invisible width sizer */}
        <span
          aria-hidden="true"
          className="
            invisible
            pointer-events-none
            col-start-1
            row-start-1
            grid
          "
        >
          {ALL_THEMES.map((sizingThemeName) => (
            <span
              key={sizingThemeName}
              className="
                  col-start-1
                  row-start-1
                  whitespace-nowrap
                "
            >
              {formatThemeName(sizingThemeName)}
            </span>
          ))}
        </span>
      </span>

      <ThemeColors />
    </label>
  );
}

function ThemeSection({ title, themes, name, selectedTheme, onChange }) {
  if (themes.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="mb-3 font-semibold">{title}</h3>

      <div className="flex flex-wrap gap-2">
        {themes.map((themeName) => (
          <ThemeRadio
            key={themeName}
            name={name}
            themeName={themeName}
            selectedTheme={selectedTheme}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function ThemeGrid() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <ThemeSection
        title="Custom"
        themes={CUSTOM_THEMES}
        name="theme-grid"
        selectedTheme={theme}
        onChange={setTheme}
      />

      <ThemeSection
        title="Built in"
        themes={BUILT_IN_THEMES}
        name="theme-grid"
        selectedTheme={theme}
        onChange={setTheme}
      />
    </div>
  );
}

export default ThemeGrid;
