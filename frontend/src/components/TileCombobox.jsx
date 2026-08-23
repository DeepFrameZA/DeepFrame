import { useState, useMemo, useRef } from "react";
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
  fieldKey,
  catalog = [],
  loading = false,
  disabled = false,
  initialDisplay = "",
  onSelect,
  label = "Selected tile",
  placeholder = "Search for a tile",
}) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  const { filteredData, searchQuery, setSearchQuery } = useSearch(
    catalog,
    TILE_SEARCH_KEYS,
  );

  const results = useMemo(
    () => filteredData.slice(0, MAX_RESULTS),
    [filteredData],
  );

  const popoverId = `tile_popover_${fieldKey}`;
  const anchorName = `--tile_anchor_${fieldKey}`;

  const showPopover = () => {
    const el = popoverRef.current;
    if (el && !el.matches(":popover-open")) {
      try {
        el.showPopover();
      } catch {
        /* popover already open or unsupported */
      }
    }
    setOpen(true);
  };

  const hidePopover = () => {
    const el = popoverRef.current;
    if (el && el.matches(":popover-open")) {
      try {
        el.hidePopover();
      } catch {
        /* popover already closed or unsupported */
      }
    }
    setOpen(false);
  };

  const handleSelect = (tile) => {
    setSearchQuery(tile.description ?? tile.sku);
    onSelect?.(tile);
    hidePopover();
  };

  const isEditing = !disabled;

  return (
    <div className="w-full">
      <label className="input floating-label join-item w-full focus-within:outline-0 focus-within:border-primary focus-within:shadow-none">
        <span className="text-base-content/40">{label}</span>
        <input
          type="text"
          tabIndex={0}
          role="combobox"
          aria-expanded={open}
          aria-controls={popoverId}
          className="truncate"
          placeholder={placeholder}
          disabled={disabled}
          value={isEditing ? searchQuery : initialDisplay}
          style={isEditing ? { anchorName } : undefined}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            showPopover();
          }}
          onFocus={() => isEditing && showPopover()}
          onBlur={() => setTimeout(hidePopover, 120)}
        />
      </label>
      {isEditing && (
        <ul
          ref={popoverRef}
          popover="manual"
          id={popoverId}
          style={{ positionAnchor: anchorName }}
          className="dropdown dropdown-center menu w-full bg-base-200 z-1 p-2 shadow-md shadow-base-300 dark:shadow-lg dark:shadow-black/40 dark:border dark:border-base-content/10 overflow-y-auto max-h-60"
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
                  className="text-xs hover:bg-base-100"
                  type="button"
                  title={tile.description}
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
