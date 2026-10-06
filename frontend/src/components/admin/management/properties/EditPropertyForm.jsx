import PropertyForm from "./PropertyForm";

const EditPropertyForm = ({
  property,
  onClose,
  updateProperty,
  listPropertyContexts,
}) => (
  <PropertyForm
    key={property.id}
    property={property}
    onClose={onClose}
    saveProperty={(payload) => updateProperty(property.id, payload)}
    listPropertyContexts={listPropertyContexts}
  />
);

export default EditPropertyForm;
