import { useState, useMemo } from "react";
import Fuse from "fuse.js";

/**
 * A generic search hook that filters an array of data using Fuse.js for fuzzy matching.
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

    const options = {
      keys: searchKeys,
      threshold: 0.4, // Balance between strictness and fuzziness
      ignoreLocation: true,
    };

    const fuse = new Fuse(data, options);
    return fuse.search(searchQuery).map((result) => result.item);
  }, [data, searchQuery, searchKeys]);

  return {
    filteredData,
    searchQuery,
    setSearchQuery,
  };
};

export default useSearch;

