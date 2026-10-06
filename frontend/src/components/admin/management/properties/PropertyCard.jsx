import {
  HouseIcon,
  EstateIcon,
  ComplexIcon,
  FarmIcon,
  BusinessIcon,
  OfficeParkIcon,
  OtherPropertyIcon,
  UnitIdentifierIcon,
  PropertyEditIcon,
  AddressIcon,
} from "../../../Icons";

const propertyTypes = {
  freestanding_house: { label: "House", Icon: HouseIcon },
  estate: { label: "Estate", Icon: EstateIcon },
  complex: { label: "Complex", Icon: ComplexIcon },
  farm: { label: "Farm", Icon: FarmIcon },
  business: { label: "Business", Icon: BusinessIcon },
  office_park: { label: "Office park", Icon: OfficeParkIcon },
  other: { label: "Other", Icon: OtherPropertyIcon },
};

const PropertyDetail = ({ icon, label, value }) => (
  <li className="list-row">
    <div>{icon}</div>
    <div className="list-col-grow">
      <div>{value}</div>
      <div className="text-xs font-semibold opacity-60">{label}</div>
    </div>
  </li>
);

const PropertyCard = ({ property, onEdit, cardClass = "" }) => {
  const type = propertyTypes[property.property_type] ?? propertyTypes.other;
  const TypeIcon = type.Icon;

  const streetAddress =
    property.address?.street_address?.trim() || "Address unavailable";

  const locality = [
    property.address?.suburb_or_locality?.trim(),
    property.address?.city_or_town?.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  const contextName = property.context?.name?.trim();
  const unitIdentifier = property.unit_identifier?.trim();
  const businessName = property.business_name?.trim();

  const isOfficePark = property.property_type === "office_park";
  const isBusiness = property.property_type === "business" || isOfficePark;
  const isResidentialDevelopment = ["estate", "complex"].includes(
    property.property_type,
  );

  const usesNameAsTitle = isBusiness || isResidentialDevelopment;

  const title = isBusiness
    ? businessName || "Business name unavailable"
    : isResidentialDevelopment
      ? contextName || `${type.label} name unavailable`
      : streetAddress;

  const showOfficePark = Boolean(isOfficePark && contextName);
  const hasDetails = Boolean(unitIdentifier || showOfficePark);
  const hasMiddleSection = hasDetails || usesNameAsTitle;

  return (
    <div
      className={`card bg-base-100 border border-base-300 transition ${cardClass}`}
    >
      <div className="card-body flex flex-col">
        <div className="card-title flex items-start justify-between">
          <div className="flex flex-col">
            <div className="text-md font-bold">{title}</div>

            {!usesNameAsTitle && locality && (
              <span className="text-sm opacity-70">{locality}</span>
            )}
          </div>

          <span className="badge badge-outline badge-soft gap-2">
            <TypeIcon className="size-4" />
            {type.label}
          </span>
        </div>

        {hasMiddleSection && (
          <>
            <div className="divider text-xs opacity-50 my-0" />

            <ul className="list">
              {hasDetails && (
                <>
                  {showOfficePark && (
                    <PropertyDetail
                      icon={<OfficeParkIcon className="size-8" />}
                      label="Office park"
                      value={contextName}
                    />
                  )}

                  {unitIdentifier && (
                    <PropertyDetail
                      icon={<UnitIdentifierIcon className="size-8" />}
                      label="Unit / building"
                      value={unitIdentifier}
                    />
                  )}
                </>
              )}

              {usesNameAsTitle && (
                <li className="list-row">
                  <div>
                    <AddressIcon className="size-8" />
                  </div>
                  <div className="flex flex-col list-col-grow">
                    <p className="text-sm">{streetAddress}</p>

                    {locality && (
                      <p className="text-xs opacity-70">{locality}</p>
                    )}
                  </div>
                </li>
              )}
            </ul>
          </>
        )}

        <div className="divider text-xs opacity-50 my-0" />

        <div className="card-actions">
          <button
            type="button"
            className="btn btn-secondary btn-outline btn-block"
            onClick={() => onEdit(property)}
            aria-label={`Edit ${title}${
              unitIdentifier ? `, unit ${unitIdentifier}` : ""
            }`}
          >
            <PropertyEditIcon className="size-5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
