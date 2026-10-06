import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { formatDate } from "../../../../lib/formatDate";
import RequiredBadge from "../../../RequiredBadge";

const propertyTypes = [
  ["freestanding_house", "Freestanding house"],
  ["estate", "Home in an estate"],
  ["complex", "Unit in a complex"],
  ["farm", "Farm"],
  ["business", "Business"],
  ["office_park", "Business in an office park"],
  ["other", "Other"],
];

const contextLabels = {
  estate: "Estate",
  complex: "Complex",
  office_park: "Office park",
};

const contextPlurals = {
  estate: "estates",
  complex: "complexes",
  office_park: "office parks",
};

const normalizeAddress = (address) =>
  Object.fromEntries(
    Object.entries(address).map(([key, value]) => [key, value.trim() || null]),
  );

function TextField({ label, value, onChange, required = false }) {
  return (
    <label className="floating-label input validator w-full">
      <input
        className="min-w-0 flex-1"
        type="text"
        placeholder={label}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
      <span>{label}</span>
      {required && <RequiredBadge />}
    </label>
  );
}

const PropertyForm = ({
  property = null,
  onClose,
  saveProperty,
  listPropertyContexts,
}) => {
  const editing = property !== null;

  const [propertyType, setPropertyType] = useState(
    property?.property_type ?? "",
  );
  const [businessName, setBusinessName] = useState(
    property?.business_name ?? "",
  );
  const [unitIdentifier, setUnitIdentifier] = useState(
    property?.unit_identifier ?? "",
  );
  const [address, setAddress] = useState(() => ({
    street_address: property?.address?.street_address ?? "",
    suburb_or_locality: property?.address?.suburb_or_locality ?? "",
    city_or_town: property?.address?.city_or_town ?? "",
    postal_code: property?.address?.postal_code ?? "",
  }));
  const [contextSelection, setContextSelection] = useState(
    property?.property_context_id ?? "",
  );
  const [contextName, setContextName] = useState("");
  const [contextStreetAddress, setContextStreetAddress] = useState("");
  const [contexts, setContexts] = useState([]);
  const [contextsLoading, setContextsLoading] = useState(true);
  const [contextsError, setContextsError] = useState(false);
  const [contextsAttempt, setContextsAttempt] = useState(0);
  const [saving, setSaving] = useState(false);

  const submittingRef = useRef(false);

  /*
   * The dashboard panel is outside the route provider.
   * Request callbacks are supplied by the Properties page.
   */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rows = await listPropertyContexts();

        if (!cancelled) {
          setContexts(rows);
          setContextsError(false);
        }
      } catch {
        if (!cancelled) {
          setContexts([]);
          setContextsError(true);
        }
      } finally {
        if (!cancelled) {
          setContextsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [contextsAttempt, listPropertyContexts]);

  const isComplex = propertyType === "complex";

  const needsContext = ["estate", "complex", "office_park"].includes(
    propertyType,
  );

  const needsBusinessName = ["business", "office_park"].includes(propertyType);

  const newContext = needsContext && contextSelection === "new";

  const contextLabel = contextLabels[propertyType] ?? "Development";
  const contextArticle = isComplex ? "a" : "an";

  /*
   * Existing developments supply their shared address details.
   * Enter additional details only for standalone properties
   * or when creating a new development.
   */
  const showAddressDetails = !needsContext || newContext;

  const availableContexts = contexts.filter(
    (context) => context.context_type === propertyType,
  );

  const selectedContext = availableContexts.find(
    (context) => context.id === contextSelection,
  );

  const selectedContextAddress = [
    selectedContext?.address?.street_address,
    selectedContext?.address?.suburb_or_locality,
    selectedContext?.address?.city_or_town,
    selectedContext?.address?.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  const canSubmit = Boolean(
    propertyType &&
    (isComplex || address.street_address.trim()) &&
    (!needsBusinessName || businessName.trim()) &&
    (!needsContext ||
      (unitIdentifier.trim() &&
        (newContext
          ? contextName.trim() && contextStreetAddress.trim()
          : selectedContext))),
  );

  const updateAddress = (key, value) => {
    setAddress((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleTypeChange = (event) => {
    setPropertyType(event.target.value);
    setContextSelection("");
    setContextName("");
    setContextStreetAddress("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    if (!canSubmit) {
      toast.error(
        "Complete all required fields and select a valid development.",
      );
      return;
    }

    submittingRef.current = true;
    setSaving(true);

    const normalizedAddress = normalizeAddress(address);

    try {
      await saveProperty({
        propertyType,

        /*
         * Complex units use the complete development address.
         * Estate and office-park properties submit only their own street;
         * the backend supplies the development's additional details.
         */
        address: isComplex
          ? null
          : needsContext
            ? { street_address: normalizedAddress.street_address }
            : normalizedAddress,

        unitIdentifier: unitIdentifier.trim() || null,
        businessName: needsBusinessName ? businessName.trim() : null,
        contextId: needsContext && !newContext ? selectedContext.id : null,

        newContext: newContext
          ? {
              name: contextName.trim(),
              address: {
                ...normalizedAddress,
                street_address: contextStreetAddress.trim(),
              },
            }
          : null,
      });
    } catch {
      toast.error(
        "Unable to confirm the save. Close this panel and refresh the property list before retrying.",
        { duration: 7000 },
      );

      submittingRef.current = false;
      setSaving(false);
      return;
    }

    toast.success(editing ? "Property updated." : "Property created.");
    onClose();
  };

  return (
    <form
      className="flex flex-col flex-1 overflow-hidden w-full"
      onSubmit={handleSubmit}
      aria-busy={saving}
    >
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-3 p-3 px-5">
        <fieldset className="fieldset gap-4" disabled={saving}>
          <legend className="fieldset-legend mb-2 text-sm">
            Complete all required fields below.
          </legend>

          <div className="grid gap-2">
            <label
              className="flex items-center justify-between gap-2"
              htmlFor="property-form-type"
            >
              Property type <RequiredBadge />
            </label>

            <select
              id="property-form-type"
              className="select w-full space-y-1"
              value={propertyType}
              onChange={handleTypeChange}
              required
            >
              <option value="" disabled>
                Select a property type
              </option>

              {propertyTypes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {editing && (
            <p className="text-xs opacity-70">
              Created {formatDate(property.created_at)}
            </p>
          )}

          {needsBusinessName && (
            <TextField
              label="Business name"
              value={businessName}
              onChange={setBusinessName}
              required
            />
          )}

          {needsContext && (
            <>
              <div className="grid gap-2">
                <label
                  className="flex items-center justify-between gap-2"
                  htmlFor="property-form-context"
                >
                  {contextLabel} <RequiredBadge />
                </label>

                <select
                  id="property-form-context"
                  className="select w-full space-y-1"
                  value={contextSelection}
                  onChange={(event) => setContextSelection(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select {contextArticle} {contextLabel.toLowerCase()}
                  </option>

                  {availableContexts.map((context) => (
                    <option key={context.id} value={context.id}>
                      {context.name} —{" "}
                      {context.address?.street_address ?? "Address unavailable"}
                    </option>
                  ))}

                  <option value="new">
                    Create a new {contextLabel.toLowerCase()}
                  </option>
                </select>

                {contextsLoading ? (
                  <p role="status">Loading existing developments…</p>
                ) : contextsError ? (
                  <div
                    role="alert"
                    className="flex flex-wrap items-center gap-2"
                  >
                    <span>Unable to load existing developments.</span>

                    <button
                      type="button"
                      className="link"
                      onClick={() => {
                        setContextsLoading(true);
                        setContextsError(false);
                        setContextsAttempt((attempt) => attempt + 1);
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : availableContexts.length === 0 ? (
                  <p>
                    No existing {contextPlurals[propertyType]}. Choose Create a
                    new {contextLabel.toLowerCase()}.
                  </p>
                ) : (
                  <p>
                    Choose an existing {contextLabel.toLowerCase()} or create a
                    new one.
                  </p>
                )}
              </div>

              {!newContext && selectedContext && (
                <div className="space-y-1">
                  <p className="font-medium">{contextLabel} address</p>

                  <p>{selectedContextAddress || "Address unavailable"}</p>

                  <p className="text-xs opacity-70">
                    {isComplex
                      ? "This unit uses the complex address. Editing the unit does not change the shared address."
                      : `Suburb or locality, city or town, and postal code come from this ${contextLabel.toLowerCase()}. Enter the individual property's street address below. Editing this property does not change the shared details.`}
                  </p>
                </div>
              )}

              {newContext && (
                <>
                  <TextField
                    label={`${contextLabel} name`}
                    value={contextName}
                    onChange={setContextName}
                    required
                  />

                  <TextField
                    label={`${contextLabel} street address`}
                    value={contextStreetAddress}
                    onChange={setContextStreetAddress}
                    required
                  />

                  {isComplex ? (
                    <p>This unit will use the complex address.</p>
                  ) : (
                    <div className="divider my-0 opacity-50" />
                  )}
                </>
              )}
            </>
          )}

          {!isComplex && (
            <>
              <TextField
                label="Property street address"
                value={address.street_address}
                onChange={(value) => updateAddress("street_address", value)}
                required
              />

              {needsContext && (
                <p>
                  Enter the individual property's address above, even if it
                  shares the {contextLabel.toLowerCase()} address.
                </p>
              )}
            </>
          )}

          <TextField
            label={isComplex ? "Unit number" : "Unit or building identifier"}
            value={unitIdentifier}
            onChange={setUnitIdentifier}
            required={needsContext}
          />

          {showAddressDetails && (
            <details className="collapse collapse-arrow">
              <summary className="collapse-title text-sm">
                Additional address details
              </summary>

              <div className="collapse-content grid gap-4">
                {newContext && (
                  <p>
                    {isComplex
                      ? "These details belong to the complex address used by its units."
                      : `These details apply to both the property and the new ${contextLabel.toLowerCase()}.`}
                  </p>
                )}

                <TextField
                  label="Suburb or locality"
                  value={address.suburb_or_locality}
                  onChange={(value) =>
                    updateAddress("suburb_or_locality", value)
                  }
                />

                <TextField
                  label="City or town"
                  value={address.city_or_town}
                  onChange={(value) => updateAddress("city_or_town", value)}
                />

                <TextField
                  label="Postal code"
                  value={address.postal_code}
                  onChange={(value) => updateAddress("postal_code", value)}
                />
              </div>
            </details>
          )}
        </fieldset>
      </div>

      <div className="divider my-0 px-5 opacity-50" />

      <div className="flex gap-2 border-base-300 p-4">
        <button
          type="button"
          className="btn btn-outline flex-1"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-accent flex-1"
          disabled={saving}
        >
          {saving && <span className="loading loading-bars loading-xs" />}
          {editing ? "Save changes" : "Create property"}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
