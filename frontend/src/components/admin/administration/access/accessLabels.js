export function propertyLabel(property) {
  if (!property) return "Property unavailable";

  const type = property.property_type;
  const title = ["business", "office_park"].includes(type)
    ? property.business_name
    : ["estate", "complex"].includes(type)
      ? property.context?.name
      : property.address?.street_address;

  return [title || "Unnamed property", property.unit_identifier]
    .filter(Boolean)
    .join(" · ");
}

export function propertyDescription(property) {
  if (!property) return "";

  return [
    property.property_type === "office_park" && property.context?.name,
    property.address?.street_address,
    property.address?.suburb_or_locality,
    property.address?.city_or_town,
    property.address?.postal_code,
  ]
    .filter(Boolean)
    .join(", ");
}
