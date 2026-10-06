import { useEffect, useState } from "react";
import { listPropertiesRequest } from "../../../../lib/property";

const typeLabels = {
  freestanding_house: "House",
  estate: "Estate",
  complex: "Complex",
  farm: "Farm",
  business: "Business",
  office_park: "Office park",
  other: "Other",
};

function describeProperty(property) {
  const title =
    property.business_name ||
    property.context?.name ||
    property.address?.street_address ||
    "Property";

  const details = [
    ...new Set(
      [
        typeLabels[property.property_type] ?? "Other",
        property.unit_identifier,
        property.context?.name,
        property.address?.street_address,
        property.address?.suburb_or_locality,
        property.address?.city_or_town,
        property.address?.postal_code,
      ].filter((value) => value && value !== title),
    ),
  ].join(" · ");

  return { title, details };
}

export default function InvitationPropertySelector({
  propertyIds,
  onChange,
  disabled,
}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rows = await listPropertiesRequest();

        if (!cancelled) {
          setProperties(rows);
          setLoadError(false);
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const query = search.trim().toLowerCase();

  const visibleProperties = properties.filter((property) => {
    const { title, details } = describeProperty(property);

    return `${title} ${details} ${property.id}`.toLowerCase().includes(query);
  });

  function toggleProperty(id) {
    onChange(
      propertyIds.includes(id)
        ? propertyIds.filter((selectedId) => selectedId !== id)
        : [...propertyIds, id],
    );
  }

  function retry() {
    setLoading(true);
    setLoadError(false);
    setAttempt((value) => value + 1);
  }

  return (
    <fieldset className="fieldset gap-2" disabled={disabled}>
      <legend className="fieldset-legend">Property access</legend>

      <p>
        Select any properties this person should access after registration. You
        can leave this empty and assign access later.
      </p>

      {loading ? (
        <div className="flex gap-2">
          <span className="loading loading-bars loading-xs" />
          <p role="status">Loading properties…</p>
        </div>
      ) : loadError ? (
        <div className="overflow-y-auto flex-1 scrollbar-none">
          <div className="alert alert-error" role="alert">
            <span>
              Unable to load properties. Retry to select properties, or continue
              without assigning any.
            </span>

            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={retry}
            >
              Retry
            </button>
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="overflow-y-auto flex-1 scrollbar-none">
          <p>
            No properties available. You can create this invitation and assign
            access later.
          </p>
        </div>
      ) : (
        <>
          <label className="floating-label input w-full">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search properties"
            />

            <span>Search properties</span>
          </label>

          <div className="flex items-center justify-between gap-2">
            <p role="status">{propertyIds.length} selected</p>

            <button
              type="button"
              className="link"
              onClick={() => onChange([])}
              disabled={disabled || propertyIds.length === 0}
            >
              Clear selection
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-base-300">
            {visibleProperties.length === 0 ? (
              <p className="p-3">No properties match your search.</p>
            ) : (
              visibleProperties.map((property) => {
                const { title, details } = describeProperty(property);

                return (
                  <label
                    key={property.id}
                    className="flex cursor-pointer items-start gap-2 border-b border-base-300 p-3 last:border-b-0 hover:bg-base-200"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm mt-1"
                      checked={propertyIds.includes(property.id)}
                      onChange={() => toggleProperty(property.id)}
                    />

                    <span className="min-w-0">
                      <span className="block font-medium">{title}</span>

                      <span className="block text-xs opacity-70">
                        {details}
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </>
      )}
    </fieldset>
  );
}
