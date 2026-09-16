export const CUSTOM_THEMES = [
  "DeepFrame Light",
  "DeepFrame Dark",
  "Greige Light",
  "Greige Dark",
];

export const BUILT_IN_THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
];

export const THEMES = [...BUILT_IN_THEMES, ...CUSTOM_THEMES];

export const DEFAULT_THEME = "DeepFrame Dark";
export const DEFAULT_LIGHT_THEME = "DeepFrame Light";
export const DEFAULT_DARK_THEME = "DeepFrame Dark";

export const THEME_STORAGE_KEY = "theme";
export const LIGHT_THEME_STORAGE_KEY = "preferred-light-theme";
export const DARK_THEME_STORAGE_KEY = "preferred-dark-theme";
