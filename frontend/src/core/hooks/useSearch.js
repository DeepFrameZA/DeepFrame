import { useState, useMemo } from "react";

/**
 * A generic search hook that filters an array of data based on a search query
 * and a set of keys to search within.
 * 
 * @param {Array} data - The array of objects to filter.
 * @param {Array<string>} searchKeys - The keys in the objects to search through.
 * @returns {Object} { filteredData, searchQuery, setSearchQuery }
 */
const useSearch = (data = [], searchKeys = []) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase();

    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = getValueByPath(item, key);
        
        if (Array.isArray(value)) {
          return value.some((val) => 
            String(val).toLowerCase().includes(query)
          );
        }
        
        if (value && typeof value === "object") {
          // For nested objects (like selected_tile), search all their values
          return Object.values(value).some((val) => 
            String(val).toLowerCase().includes(query)
          );
        }

        return String(value || "").toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchKeys]);

  return {
    filteredData,
    searchQuery,
    setSearchQuery,
  };
};

/**
 * Helper function to retrieve a value from a nested object using a dot-notation path.
 * e.g., "areas.surfaces.selected_tile.sku"
 */
function getValueByPath(obj, path) {
  return path.split(".").reduce((acc, part) => {
    if (acc && Array.isArray(acc)) {
      // If we hit an array, we return the array of values for that path in all elements
      return acc.map((item) => getValueByPath(item, path.split(part).slice(1).join(".")));
    }
    return acc && acc[part] !== undefined ? acc[part] : undefined;
  }, obj);
}

// Simplified path resolution for common nested structures in DeepFrame
function resolveValue(item, key) {
  // Direct property
  if (item[key] !== undefined) return item[key];
  
  // This is a placeholder for more complex nested resolution 
  // that will be expanded when Fuse.js is implemented.
  return undefined;
}

export default useSearch;
