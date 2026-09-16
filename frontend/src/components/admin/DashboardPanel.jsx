import { ModalCloseIcon } from "../Icons";

const DashboardPanel = ({ open, title, description, children, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <dialog
      className="modal modal-open"
      aria-labelledby="dashboard-panel-title"
    >
      <div
        className="
          absolute
          inset-y-0
          right-0
          flex
          h-dvh
          w-full
          flex-col
          border-l
          border-base-300
          bg-base-100
          sm:max-w-md
        "
      >
        <div className="flex justify-between gap-4 p-5">
          <div>
            <h2 id="dashboard-panel-title" className="text-xl font-semibold">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm opacity-50">{description}</p>
            )}
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={onClose}
            aria-label="Close panel"
          >
            <ModalCloseIcon />
          </button>
        </div>
        <div className="divider justify-self-center px-5 my-0"></div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>

      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close panel"
        onClick={onClose}
      />
    </dialog>
  );
};

export default DashboardPanel;
