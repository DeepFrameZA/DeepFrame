import { useEffect, useRef } from "react";
import { propertyDescription, propertyLabel } from "./accessLabels";

function AccessActionModal({ membership, busy, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const revoking = membership.revoked_at === null;
  const action = revoking ? "Revoke" : "Restore";

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog.showModal();

    return () => {
      dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="access-action-title"
      onCancel={(event) => {
        event.preventDefault();

        if (!busy) {
          onCancel();
        }
      }}
    >
      <div className="modal-box max-w-md border border-base-300">
        <h2 id="access-action-title" className="text-lg font-semibold">
          {action} property access
        </h2>

        <p className="mt-3 break-all font-semibold">{membership.email}</p>
        <p className="text-sm capitalize opacity-70">{membership.role}</p>

        <div className="my-4 border-y border-base-300 py-3">
          <p className="font-semibold">{propertyLabel(membership.property)}</p>
          <p className="text-sm opacity-70">
            {propertyDescription(membership.property)}
          </p>
        </div>

        <p className="text-sm">
          {revoking
            ? "This account will lose access to this property. Its account and other property assignments will remain unchanged. You can restore access later."
            : "This account will regain access to this property using its existing assignment."}
        </p>

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`btn btn-outline min-w-23 ${
              revoking ? "btn-error" : "btn-accent"
            }`}
            disabled={busy}
            onClick={onConfirm}
            aria-label={`${action} access`}
            aria-busy={busy}
          >
            {busy ? (
              <span
                aria-hidden="true"
                className="loading loading-bars loading-xs"
              />
            ) : (
              action
            )}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="modal-backdrop"
        onClick={onCancel}
        disabled={busy}
        aria-label="Cancel access change"
      />
    </dialog>
  );
}

export default AccessActionModal;
