import StatusBadge from "./StatusBadge";
import InvitationCardStat from "./InvitationCardStat";

const InvitationCard = ({ invitation, onRevoke, cardClass = "" }) => {
  const canRevoke = invitation.derived_status === "pending";

  return (
    <div
      className={`card bg-base-100 border border-base-300 transition ${cardClass}`}
    >
      <div className="card-body flex flex-col">
        <div className="card-title flex flex-row justify-between">
          <div className="flex flex-col">
            <div className="text-sm font-bold">{invitation.invited_email}</div>
            <span className="text-xs opacity-70 capitalize">
              {invitation.role}
            </span>
          </div>
          <StatusBadge status={invitation.derived_status} />
        </div>
        <div className="divider text-xs opacity-50 my-0" />
        <div className="grid grid-cols-2 my-0">
          <InvitationCardStat invitation={invitation} type="created" />

          {invitation.derived_status === "used" && (
            <InvitationCardStat invitation={invitation} type="used" />
          )}

          {invitation.derived_status === "expired" && (
            <InvitationCardStat invitation={invitation} type="expired" />
          )}

          {invitation.derived_status === "revoked" && (
            <InvitationCardStat invitation={invitation} type="revoked" />
          )}
        </div>
        {canRevoke && (
          <div>
            <div className="divider text-xs opacity-50 my-0" />
            <div className="card-action">
              <button
                type="button"
                className="flex btn btn-error btn-outline btn-sm min-w-23 justify-self-end"
                aria-label={`Revoke invitation for ${invitation.invited_email}`}
                onClick={() => onRevoke(invitation)}
              >
                Revoke
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationCard;
