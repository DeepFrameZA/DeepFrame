import { useState, useMemo } from "react";
import useSearch from "../core/hooks/useSearch";

const TILE_SEARCH_KEYS = [
  "sku",
  "description",
  "price_per_sqm",
  "price_per_box",
  "box_coverage_sqm",
  "unit",
];

const MAX_RESULTS = 50;

const TileCombobox = ({
  catalog = [],
  loading = false,
  disabled = false,
  initialDisplay = "",
  onSelect,
  label = "Selected tile",
  placeholder = "Search for a tile",
}) => {
  const [open, setOpen] = useState(false);

  const { filteredData, searchQuery, setSearchQuery } = useSearch(
    catalog,
    TILE_SEARCH_KEYS,
  );

  const results = useMemo(
    () => filteredData.slice(0, MAX_RESULTS),
    [filteredData],
  );

  const handleSelect = (tile) => {
    setSearchQuery(tile.description ?? tile.sku);
    setOpen(false);
    onSelect?.(tile);
  };

  const isEditing = !disabled;

  return (
    <div
      className={`dropdown dropdown-bottom w-full ${open ? "dropdown-open" : ""}`}
    >
      <label className="input floating-label join-item w-full focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
        <span className="dark:text-[#414342] text-[#d2d2d2]">{label}</span>
        <input
          type="text"
          tabIndex={0}
          role="button"
          className="truncate"
          placeholder={placeholder}
          disabled={disabled}
          value={isEditing ? searchQuery : initialDisplay}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => isEditing && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
        />
      </label>
      {isEditing && (
        <ul
          tabIndex="-1"
          className="dropdown-content scrollbar-none w-full h-25 lg:min-w-max bg-base-200 z-1 p-2 shadow-md shadow-base-300 dark:shadow-none dark:border dark:border-base-300 overflow-y-auto"
        >
          {loading ? (
            <li className="menu-title">
              <span className="loading loading-spinner loading-sm text-current" />
            </li>
          ) : results.length === 0 ? (
            <li className="menu-title">
              <span>No tiles found</span>
            </li>
          ) : (
            results.map((tile) => (
              <li className="" key={tile.sku}>
                <button
                  className=" text-xs"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(tile)}
                >
                  <span className="truncate">{tile.description}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default TileCombobox;
