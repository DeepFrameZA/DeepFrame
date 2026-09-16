const Roles = () => {
  return (
    <>
      <dialog
        className={`modal ${open ? "modal-open" : ""}`}
        aria-labelledby="revoke-invitation-title"
      >
        <div className="modal-box max-w-md border border-base-300">
          {/* Heading */}
          <div className="py-2">
            <h2 id="revoke-invitation-title" className="text-lg font-semibold">
              Revoke invitation
            </h2>

            <p className="mb-2 mt-1 text-sm opacity-60">
              This action cannot be undone.
            </p>
          </div>

          {/* Invitation identity */}
          <div className="grid grid-cols-2 space-y-2">
            <span className="">Email:</span>
            <span className="text-end">testemail@test.com</span>
            <span className="">Role:</span>
            <span className="text-end capitalize">Resident</span>
          </div>

          {/* Explanation */}
          <div className="">
            <p className="text-sm leading-relaxed opacity-80">
              This invitation will no longer be valid and cannot be used to
              register an account.
            </p>
          </div>

          <div className="divider my-0 mt-2"></div>
          {/* Actions */}
          <div className="flex justify-end gap-2 p-4">
            <button type="button" className="btn btn-outline min-w-23">
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-error btn-outline min-w-23"
            >
              <span className="loading loading-bars loading-xs" />
              Revoke
            </button>
          </div>
        </div>

        <button
          type="button"
          className="modal-backdrop"
          aria-label="Cancel revocation"
        />
      </dialog>
    </>
  );
};

export default Roles;
