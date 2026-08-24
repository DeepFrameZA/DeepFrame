import { useRef, useState } from "react";
import DeleteIcon from "../DeleteIcon";

const DeleteButton = ({
  buttonLabel,
  itemType = "item",
  itemName,
  warning,
  uniqueId,
  onConfirm,
  buttonClass,
  iconClass,
}) => {
  const dialogRef = useRef(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (deleting) return;
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      dialogRef.current?.close();
    }
  };

  return (
    <>
      <button
        className={`${buttonClass ? buttonClass : "btn-sm btn-error"} btn focus-within:outline-0 flex gap-y-4`}
        onClick={() => dialogRef.current?.showModal()}
      >
        <span className={`text-error-content ${buttonLabel ? "" : "hidden"}`}>
          {buttonLabel}
        </span>
        <DeleteIcon
          unique_id={uniqueId}
          className={`${iconClass ? iconClass : "w-4 h-4 fill-error-content"}`}
        />
      </button>
      <dialog ref={dialogRef} className="modal modal-middle">
        <div className="modal-box">
          <h3 className="font-semibold text-lg mb-6">
            Delete {itemType}{" "}
            <span className="font-bold text-xl">{itemName}</span>?
          </h3>
          <p className="">This action is permanent and cannot be undone.</p>
          {warning ? (
            <p className="mt-2 text-sm opacity-80">{warning}</p>
          ) : null}
          <div className="modal-action flex justify-end gap-y-4">
            <form method="dialog">
              <button
                className="btn btn-sm focus-within:outline-0"
                disabled={deleting}
              >
                Cancel
              </button>
            </form>
            <button
              className="btn btn-error btn-sm"
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <span className="loading loading-spinner text-current" />
              ) : (
                <>
                  <span className="text-error-content">Delete</span>
                  <DeleteIcon
                    unique_id={uniqueId}
                    className="w-4 h-4 fill-error-content"
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default DeleteButton;
