import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useProperty } from "../../../../hooks/useProperty";
import { PlusIcon } from "../../../Icons";
import PropertyCard from "./PropertyCard";
import PropertyTable from "./PropertyTable";

const pageSize = 10;

const propertyTypes = [
  { value: "all", label: "All" },
  { value: "freestanding_house", label: "House" },
  { value: "estate", label: "Estate" },
  { value: "complex", label: "Complex" },
  { value: "farm", label: "Farm" },
  { value: "business", label: "Business" },
  { value: "office_park", label: "Office Park" },
  { value: "other", label: "Other" },
];

const Properties = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedType = searchParams.get("type") ?? "all";

  const propertyTypeFilter = propertyTypes.some(
    (type) => type.value === requestedType,
  )
    ? requestedType
    : "all";

  const requestedPage = Number(searchParams.get("page") ?? 1);

  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const { properties, loading, loadError, refreshProperties } = useProperty();

  function changeFilter(value) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      if (value === "all") {
        next.delete("type");
      } else {
        next.set("type", value);
      }

      next.delete("page");

      return next;
    });
  }

  function setPage(value) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      if (value === 1) {
        next.delete("page");
      } else {
        next.set("page", String(value));
      }

      return next;
    });
  }

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

  const handleCreateProperty = () => {
    navigate(`/admin/management/properties/new${search}`);
  };

  const handleEditProperty = (property) => {
    navigate(`/admin/management/properties/${property.id}/edit${search}`);
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

            <p className="text-sm opacity-70 md:text-nowrap">
              Review, create and edit properties.
            </p>
          </div>

          <button
            className="btn btn-accent btn-outline btn-block md:w-auto"
            type="button"
            onClick={handleCreateProperty}
          >
            <PlusIcon className="size-5" />
            Create property
          </button>
        </div>

        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
          <div className="shrink-0">
            {/* Mobile: full-width property type selector */}
            <div className="grid gap-2 md:hidden">
              <label
                htmlFor="property-type-filter"
                className="text-sm opacity-70"
              >
                Property type
              </label>

              <select
                id="property-type-filter"
                className="select w-full"
                value={propertyTypeFilter}
                onChange={(event) => changeFilter(event.target.value)}
              >
                {propertyTypes.map((propertyType) => (
                  <option key={propertyType.value} value={propertyType.value}>
                    {propertyType.value === "all"
                      ? "All properties"
                      : propertyType.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop: existing property type tabs */}
            <div className="hidden md:flex items-center justify-start">
              <div
                role="tablist"
                aria-label="Property type"
                className="tabs tabs-md tabs-border w-auto justify-between"
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
                    onClick={() => changeFilter(propertyType.value)}
                  >
                    {propertyType.label}
                  </button>
                ))}
              </div>
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
                    onEdit={handleEditProperty}
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <PropertyTable
                  properties={visibleProperties}
                  onEdit={handleEditProperty}
                />
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
      <Outlet />
    </div>
  );
};

export default Properties;
