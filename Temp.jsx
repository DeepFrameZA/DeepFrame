//
//Properties.jsx
//

import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import { useProperty } from "../../../../hooks/useProperty";
import PropertyCard from "../properties/PropertyCard";
import PropertyTable from "../../../../components/admin/management/properties/PropertyTable";
import { PlusIcon } from "../../../Icons";
import CreatePropertyForm from "../../../../components/admin/management/properties/CreatePropertyForm";
// import toast from "react-hot-toast";

const pageSize = 10;

const Properties = () => {
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const {
    properties,
    loading,
    loadError,
    refreshProperties,
    createProperty,
    listPropertyContexts,
  } = useProperty();
  const { openPanel, closePanel } = useOutletContext();

  const filteredProperties =
    propertyTypeFilter === "all"
      ? properties
      : properties.filter(
          (property) => property.property_type === propertyTypeFilter,
        );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredProperties.length / pageSize),
  );

  const currentPage = Math.min(page, pageCount);

  const visibleProperties = filteredProperties.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const propertyTypes = [
    { value: "all", label: "All" },
    { value: "freestanding_house", label: "House" },
    { value: "estate", label: "Estate" },
    { value: "farm", label: "Farm" },
    { value: "business", label: "Business" },
    { value: "office_park", label: "Office Park" },
    { value: "other", label: "Other" },
  ];

  const handleCreateProperty = () => {
    openPanel({
      title: "Create property",
      description: "Add a property to manage its details and access.",
      content: (
        <CreatePropertyForm
          onClose={closePanel}
          createProperty={createProperty}
          listPropertyContexts={listPropertyContexts}
        />
      ),
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <section className="flex flex-col flex-1 gap-4 p-4 overflow-hidden">
        <Link
          to="/admin/management"
          className="link link-hover flex flex-row items-center gap-1 opacity-75"
          aria-label="Back to management"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>

          <h3 className="text-xs text-base-content">Management</h3>
        </Link>

        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Properties</h1>

            <p className={`text-sm opacity-70 md:text-nowrap`}>
              Review and create properties.
            </p>
          </div>

          <button
            className="btn btn-accent btn-outline btn-block md:w-auto"
            type="button"
            onClick={handleCreateProperty}
          >
            <PlusIcon />
            Create property
          </button>
        </div>

        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
          <div className="flex items-center justify-center md:justify-start">
            <div
              role="tablist"
              className="tabs tabs-xs md:tabs-md tabs-border w-full md:w-auto justify-between"
            >
              {propertyTypes.map((propertyType) => (
                <button
                  key={propertyType.value}
                  type="button"
                  role="tab"
                  aria-selected={propertyTypeFilter === propertyType.value}
                  className={`tab ${
                    propertyTypeFilter === propertyType.value
                      ? "tab-active"
                      : ""
                  }`}
                  onClick={() => {
                    setPropertyTypeFilter(propertyType.value);
                    setPage(1);
                  }}
                >
                  {propertyType.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="overflow-y-auto flex-1 scrollbar-none">
              <div className="flex gap-2">
                <span className="loading loading-bars loading-xs" />
                <p role="status">Loading properties…</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="overflow-y-auto flex-1 scrollbar-none">
              <div className="alert alert-error" role="alert">
                <span>Unable to load properties.</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={refreshProperties}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="overflow-y-auto flex-1 scrollbar-none">
              <p>No properties created yet.</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="overflow-y-auto flex-1 scrollbar-none">
              <p>No properties match this type.</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 scrollbar-none">
              <div className="grid gap-3 md:hidden">
                {visibleProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    cardClass="bg-base-200"
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <PropertyTable properties={visibleProperties} />
              </div>
            </div>
          )}

          <div className="flex w-full items-center justify-center pb-2">
            <div className="join">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                className="join-item btn btn-sm"
                aria-label="Previous page"
              >
                «
              </button>

              <button
                className="join-item btn btn-sm pointer-events-none no-animation select-none"
                type="button"
              >
                {currentPage} / {pageCount}
              </button>

              <button
                type="button"
                disabled={currentPage === pageCount}
                onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                className="join-item btn btn-sm"
                aria-label="Next page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Properties;

//
//CreatePropertyForm.jsx
//

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import RequiredBadge from "../../../RequiredBadge";

const propertyTypes = [
  ["freestanding_house", "Freestanding house"],
  ["estate", "Home in an estate"],
  ["farm", "Farm"],
  ["business", "Business"],
  ["office_park", "Business in an office park"],
  ["other", "Other"],
];

const emptyAddress = () => ({
  street_address: "",
  suburb_or_locality: "",
  city_or_town: "",
  postal_code: "",
});

const normalizeAddress = (address) =>
  Object.fromEntries(
    Object.entries(address).map(([key, value]) => [key, value.trim() || null]),
  );

// These helpers render labels/inputs only, never nested fieldsets.
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

function AddressFields({
  label,
  address,
  onChange,
  children,
  detailsLabel = "Additional property address details",
}) {
  const update = (key, value) => onChange({ ...address, [key]: value });

  return (
    <>
      <TextField
        label={label}
        value={address.street_address}
        onChange={(value) => update("street_address", value)}
        required
      />

      {children}

      <details className="collapse collapse-arrow">
        <summary className="collapse-title text-sm">{detailsLabel}</summary>

        <div className="collapse-content grid gap-4">
          <TextField
            label="Suburb or locality"
            value={address.suburb_or_locality}
            onChange={(value) => update("suburb_or_locality", value)}
          />

          <TextField
            label="City or town"
            value={address.city_or_town}
            onChange={(value) => update("city_or_town", value)}
          />

          <TextField
            label="Postal code"
            value={address.postal_code}
            onChange={(value) => update("postal_code", value)}
          />
        </div>
      </details>
    </>
  );
}

const CreatePropertyForm = ({
  onClose,
  createProperty,
  listPropertyContexts,
}) => {
  const [propertyType, setPropertyType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [unitIdentifier, setUnitIdentifier] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [contextSelection, setContextSelection] = useState("");
  const [contextName, setContextName] = useState("");
  const [contextAddress, setContextAddress] = useState(emptyAddress);
  const [contexts, setContexts] = useState([]);
  const [contextsLoading, setContextsLoading] = useState(true);
  const [contextsError, setContextsError] = useState(false);
  const [contextsAttempt, setContextsAttempt] = useState(0);
  const [creating, setCreating] = useState(false);

  const submittingRef = useRef(false);

  // The panel lives outside the route provider. Its list is local form state,
  // while the create callback is explicitly supplied by the Properties page.
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

  const needsContext =
    propertyType === "estate" || propertyType === "office_park";

  const needsBusinessName =
    propertyType === "business" || propertyType === "office_park";

  const newContext = needsContext && contextSelection === "new";

  const contextLabel =
    propertyType === "office_park" ? "Office park" : "Estate";

  const availableContexts = contexts.filter(
    (context) => context.context_type === propertyType,
  );

  const selectedContext = availableContexts.find(
    (context) => context.id === contextSelection,
  );

  const canSubmit = Boolean(
    propertyType &&
    address.street_address.trim() &&
    (!needsBusinessName || businessName.trim()) &&
    (!needsContext ||
      (unitIdentifier.trim() &&
        (newContext
          ? contextName.trim() && contextAddress.street_address.trim()
          : selectedContext))),
  );

  const handleTypeChange = (event) => {
    setPropertyType(event.target.value);
    setContextSelection("");
    setContextName("");
    setContextAddress(emptyAddress());
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
    setCreating(true);

    try {
      await createProperty({
        propertyType,
        address: normalizeAddress(address),
        unitIdentifier: unitIdentifier.trim() || null,
        businessName: needsBusinessName ? businessName.trim() : null,
        contextId: needsContext && !newContext ? selectedContext.id : null,
        newContext: newContext
          ? {
              name: contextName.trim(),
              address: normalizeAddress(contextAddress),
            }
          : null,
      });
    } catch {
      toast.error(
        "Unable to confirm property creation. Refresh the property list before retrying.",
        { duration: 7000 },
      );

      submittingRef.current = false;
      setCreating(false);
      return;
    }

    // Keep success separate from closing/refreshing so a UI failure does not
    // suggest that the database write failed and encourage another insert.
    toast.success("Property created.");
    onClose();
  };

  return (
    <form
      className="flex flex-col flex-1 overflow-hidden min-h-0 w-full"
      onSubmit={handleSubmit}
      aria-busy={creating}
    >
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none space-y-3 p-3 px-5">
        <fieldset className="fieldset gap-4" disabled={creating}>
          <legend className="fieldset-legend mb-2 text-sm">
            Complete all required fields below.
          </legend>

          <div className="grid gap-2">
            <label
              className="flex items-center justify-between gap-2"
              htmlFor="create-property-type"
            >
              Property type <RequiredBadge />
            </label>

            <select
              id="create-property-type"
              className="select w-full"
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
                  htmlFor="create-property-context"
                >
                  {contextLabel} <RequiredBadge />
                </label>

                <select
                  id="create-property-context"
                  className="select w-full"
                  value={contextSelection}
                  onChange={(event) => setContextSelection(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select an {contextLabel.toLowerCase()}
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
                    No existing{" "}
                    {propertyType === "estate" ? "estates" : "office parks"}.
                    Choose Create a new {contextLabel.toLowerCase()}.
                  </p>
                ) : (
                  <p>
                    Choose an existing {contextLabel.toLowerCase()} or create a
                    new one.
                  </p>
                )}
              </div>

              {newContext && (
                <>
                  <TextField
                    label={`${contextLabel} name`}
                    value={contextName}
                    onChange={setContextName}
                    required
                  />

                  <div className="divider my-0 opacity-50" />
                </>
              )}
            </>
          )}

          <AddressFields
            label="Property street address"
            address={address}
            onChange={setAddress}
          >
            {needsContext && (
              <p>
                Enter the individual property's address above, even if it shares
                the {contextLabel.toLowerCase()} address.
              </p>
            )}

            <TextField
              label="Unit or building identifier"
              value={unitIdentifier}
              onChange={setUnitIdentifier}
              required={needsContext}
            />
          </AddressFields>
        </fieldset>
      </div>

      <div className="divider shrink-0 my-0 px-5 opacity-50" />

      <div className="flex shrink-0 gap-2 border-base-300 p-4">
        <button
          type="button"
          className="btn btn-outline flex-1"
          onClick={onClose}
          disabled={creating}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-accent flex-1"
          disabled={creating}
        >
          {creating && <span className="loading loading-bars loading-xs" />}
          Create property
        </button>
      </div>
    </form>
  );
};

export default CreatePropertyForm;


//
//PropertyTable.jsx
//

import { formatDate } from "../../../../lib/formatDate";

const PropertyTable = ({ properties }) => {
  return (
    <div className="">
      <table className="table table-sm xl:table-md table-pin-rows">
        <thead>
          <tr className="bg-base-200">
            <th className="font-bold">Address</th>
            <th className="font-bold text-center">Type</th>
            <th className="font-bold text-center">Created</th>
          </tr>
        </thead>

        <tbody className="">
          {properties.map((property) => {
            return (
              <tr className="hover:bg-base-300" key={property.id}>
                <td className="">
                  {property.address?.street_address ?? "Address unavailable"}
                </td>

                <td className="capitalize">
                  {property.property_type.replaceAll("_", " ")}
                </td>

                <td className="text-center">
                  {formatDate(property.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyTable;

//
//PropertyCard.jsx
//

import { formatDate } from "../../../../lib/formatDate";

const PropertyCard = ({ property, cardClass = "" }) => (
  <article className={`card card-border ${cardClass}`}>
    <div className="card-body gap-2">
      <h2 className="card-title text-base">
        {property.address?.street_address ?? "Address unavailable"}
      </h2>
      <p className="capitalize">
        {property.property_type.replaceAll("_", " ")}
      </p>
      {property.context && <p>{property.context.name}</p>}
      {property.unit_identifier && <p>Unit: {property.unit_identifier}</p>}
      {property.business_name && <p>{property.business_name}</p>}
      <p className="text-xs opacity-70">
        Created {formatDate(property.created_at)}
      </p>
    </div>
  </article>
);

export default PropertyCard;
