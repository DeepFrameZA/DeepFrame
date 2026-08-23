import EditIcon from "../EditIcon";
import SaveIcon from "../SaveIcon";

const EditSaveButton = ({
  buttonClass,
  editing,
  saving,
  uniqueId,
  onToggle,
}) => {
  return (
    <button
      className={`${buttonClass} btn join-item focus-within:outline-0`}
      disabled={saving}
      onClick={onToggle}
    >
      {saving ? (
        <span className="loading loading-spinner text-current" />
      ) : editing ? (
        <SaveIcon className="w-4 h-4 fill-base-content" unique_id={uniqueId} />
      ) : (
        <EditIcon className="w-4 h-4 fill-base-content" />
      )}
    </button>
  );
};

export default EditSaveButton;
