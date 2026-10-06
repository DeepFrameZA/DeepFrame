import PropertyForm from "./PropertyForm";

const CreatePropertyForm = ({
  onClose,
  createProperty,
  listPropertyContexts,
}) => (
  <PropertyForm
    onClose={onClose}
    saveProperty={createProperty}
    listPropertyContexts={listPropertyContexts}
  />
);

export default CreatePropertyForm;
