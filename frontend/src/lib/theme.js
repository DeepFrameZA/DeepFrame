import {
  DARK_THEME_STORAGE_KEY,
  DEFAULT_DARK_THEME,
  DEFAULT_LIGHT_THEME,
  DEFAULT_THEME,
  LIGHT_THEME_STORAGE_KEY,
  THEMES,
  THEME_STORAGE_KEY,
} from "../components/theme/themes.js";

export function isValidTheme(theme) {
  return THEMES.includes(theme);
}

export function normalizeTheme(theme, fallback = DEFAULT_THEME) {
  return isValidTheme(theme) ? theme : fallback;
}

export function formatThemeName(theme) {
  return theme
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getStoredTheme() {
  return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY), DEFAULT_THEME);
}

export function getStoredLightTheme() {
  return normalizeTheme(
    localStorage.getItem(LIGHT_THEME_STORAGE_KEY),
    DEFAULT_LIGHT_THEME,
  );
}

export function getStoredDarkTheme() {
  return normalizeTheme(
    localStorage.getItem(DARK_THEME_STORAGE_KEY),
    DEFAULT_DARK_THEME,
  );
}

export function applyTheme(theme) {
  const normalizedTheme = normalizeTheme(theme);

  document.documentElement.setAttribute("data-theme", normalizedTheme);

  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);

  return normalizedTheme;
}

export function storeLightTheme(theme) {
  const normalizedTheme = normalizeTheme(theme, DEFAULT_LIGHT_THEME);

  localStorage.setItem(LIGHT_THEME_STORAGE_KEY, normalizedTheme);

  return normalizedTheme;
}

export function storeDarkTheme(theme) {
  const normalizedTheme = normalizeTheme(theme, DEFAULT_DARK_THEME);

  localStorage.setItem(DARK_THEME_STORAGE_KEY, normalizedTheme);

  return normalizedTheme;
}

export function initializeTheme() {
  return applyTheme(getStoredTheme());
}
