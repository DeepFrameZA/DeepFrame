import { DisabledButtonIcon } from "../../../../components/Icons";
import { formatDate } from "../../../../lib/formatDate";
import StatusBadge from "./StatusBadge";

const InvitationTable = ({ invitations, onRevoke }) => {
  return (
    <div className="">
      <table className="table table-sm xl:table-md table-pin-rows">
        <thead>
          <tr className="bg-base-200">
            <th className="font-bold">Email</th>
            <th className="font-bold">Role</th>
            <th className="font-bold text-center">Status</th>
            <th className="font-bold text-center">Created</th>
            <th className="font-bold text-center">Expires</th>
            <th className="font-bold text-center">Revoke</th>
          </tr>
        </thead>

        <tbody className="">
          {invitations.map((invitation) => {
            const canRevoke = invitation.derived_status === "pending";

            return (
              <tr className="hover:bg-base-300" key={invitation.invitation_id}>
                <td className="">{invitation.invited_email}</td>

                <td className="capitalize">{invitation.role}</td>

                <td className="text-center capitalize">
                  <StatusBadge status={invitation.derived_status} />
                </td>

                <td className="text-center">
                  {formatDate(invitation.created_at)}
                </td>

                <td className="text-center">
                  {formatDate(invitation.expires_at)}
                </td>

                <td className="flex items-center justify-center text-center">
                  <button
                    type="button"
                    className="btn btn-error btn-outline btn-block min-w-23"
                    aria-label={`Revoke invitation for ${invitation.invited_email}`}
                    onClick={() => onRevoke(invitation)}
                    disabled={!canRevoke}
                  >
                    {canRevoke ? (
                      "Revoke"
                    ) : (
                      <DisabledButtonIcon className="size-5" />
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvitationTable;
