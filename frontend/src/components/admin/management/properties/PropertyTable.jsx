const PropertyTable = ({ properties, onEdit }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm xl:table-md table-pin-rows">
        <thead>
          <tr className="bg-base-200">
            <th>Address</th>
            <th>Type</th>
            <th>Development</th>
            <th>Unit / building</th>
            <th>Business</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {properties.map((property) => {
            const locality = [
              property.address?.suburb_or_locality,
              property.address?.city_or_town,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <tr className="hover:bg-base-300" key={property.id}>
                <td>
                  <div className="font-medium">
                    {property.address?.street_address ?? "Address unavailable"}
                  </div>

                  {locality && <p className="text-xs opacity-70">{locality}</p>}
                </td>

                <td className="capitalize">
                  {property.property_type.replaceAll("_", " ")}
                </td>

                <td>{property.context?.name ?? "—"}</td>
                <td>{property.unit_identifier ?? "—"}</td>
                <td>{property.business_name ?? "—"}</td>

                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-secondary btn-outline btn-block min-w-23"
                    onClick={() => onEdit(property)}
                    aria-label={`Edit ${property.address?.street_address ?? "property"}`}
                  >
                    Edit
                  </button>
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
