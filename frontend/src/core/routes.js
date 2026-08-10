export const APP_ROUTES = {
  DASHBOARD: "/",
  MANAGEMENT: "/management",
  HOUSE_MANAGER: "/management/manage_houses",
  INVENTORY_MANAGER: "/management/manage_inventory",
  INVENTORY_LIST: "/inventory_list",
};

// Helper to check if a path belongs to a specific section
export const isPathInSection = (currentPath, sectionPath) =>
  currentPath.startsWith(sectionPath);
