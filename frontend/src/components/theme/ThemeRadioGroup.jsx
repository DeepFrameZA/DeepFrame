import { BUILT_IN_THEMES, CUSTOM_THEMES } from "./themes";

import { useTheme } from "../../hooks/useTheme";
import { formatThemeName } from "../../lib/theme.js";

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
        cursor-pointer
        items-center
        gap-2
        border
        p-2
        hover:inset-ring-2
        inset-ring-primary
        ${isSelected ? "inset-ring-primary inset-ring-2" : ""}
        `}
    >
      <input
        type="radio"
        name={name}
        value={themeName}
        checked={selectedTheme === themeName}
        onChange={() => onChange(themeName)}
        className="radio radio-xs"
      />

      <span className="flex-1">{formatThemeName(themeName)}</span>

      <div className="flex gap-1">
        <span className="bg-primary h-3 w-3 rounded-full" />
        <span className="bg-secondary h-3 w-3 rounded-full" />
        <span className="bg-accent h-3 w-3 rounded-full" />
      </div>
    </label>
  );
}

function ThemeRadioGroup() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {CUSTOM_THEMES.length > 0 && (
        <section>
          <h3 className="mb-3 font-semibold">Custom</h3>

          <div className="grid gap-2">
            {CUSTOM_THEMES.map((themeName) => (
              <ThemeRadio
                key={themeName}
                name="resident-theme"
                themeName={themeName}
                selectedTheme={theme}
                onChange={setTheme}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 font-semibold">Built in</h3>

        <div className="grid gap-2">
          {BUILT_IN_THEMES.map((themeName) => (
            <ThemeRadio
              key={themeName}
              name="resident-theme"
              themeName={themeName}
              selectedTheme={theme}
              onChange={setTheme}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ThemeRadioGroup;
