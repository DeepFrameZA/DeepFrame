import { useRef } from "react";
import DeleteIcon from "../DeleteIcon";

const DeleteButton = ({
  buttonLabel,
  headingPrefix,
  itemName,
  uniqueId,
  onConfirm,
}) => {
  const dialogRef = useRef(null);

  return (
    <>
      <button
        className="btn btn-sm btn-error focus-within:outline-0 flex gap-y-4"
        onClick={() => dialogRef.current?.showModal()}
      >
        <span className="text-error-content">{buttonLabel}</span>
        <DeleteIcon unique_id={uniqueId} className="w-4 h-4 fill-error-content" />
      </button>
      <dialog ref={dialogRef} className="modal modal-middle">
        <div className="modal-box">
          <h3 className="font-semibold text-lg mb-6">
            {headingPrefix}{" "}
            <span className="font-bold text-xl">{itemName}</span>?
          </h3>
          <p className="">This action is permanent and not reversible.</p>
          <div className="modal-action flex justify-end gap-y-4">
            <form method="dialog">
              <button className="btn btn-sm focus-within:outline-0">
                Cancel
              </button>
            </form>
            <button
              className="btn btn-error btn-sm"
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
                dialogRef.current?.close();
              }}
            >
              <span className="text-error-content">Confirm</span>
              <DeleteIcon
                unique_id={uniqueId}
                className="w-4 h-4 fill-error-content"
              />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default DeleteButton;
