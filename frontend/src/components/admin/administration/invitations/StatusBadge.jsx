const badgeClasses = {
  pending: "badge-info",
  used: "badge-success",
  expired: "badge-warning",
  revoked: "badge-error",
};

const statusClasses = {
  pending: "status-info",
  used: "status-success",
  expired: "status-warning",
  revoked: "status-error",
};

const StatusBadge = ({ status }) => {
  const badgeClass = badgeClasses[status] ?? "badge-ghost";
  const statusClass = statusClasses[status] ?? "";

  return (
    <>
      <div className={`badge badge-soft min-w-23 capitalize ${badgeClass}`}>
        <div className={`status ${statusClass}`}></div>
        {status}
      </div>
    </>
  );
};

export default StatusBadge;
