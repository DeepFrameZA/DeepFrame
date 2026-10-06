export const ManagementCard = ({ title, description, icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        card
        bg-base-100
        hover:bg-base-200
        border
        border-base-300
        text-left
        transition
      "
    >
      <div className="card-body flex flex-row items-center justify-between">
        <div className="">
          <div className="flex flex-row items-center gap-4">
            <div className="">{icon}</div>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <p className="mt-1 text-sm opacity-70">{description}</p>
        </div>
        <div className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default ManagementCard;
