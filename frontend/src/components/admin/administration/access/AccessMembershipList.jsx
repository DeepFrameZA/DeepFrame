import { formatDate } from "../../../../lib/formatDate";
import { propertyDescription, propertyLabel } from "./accessLabels";

function StatusBadge({ active }) {
  return (
    <span
      className={`badge badge-outline badge-sm ${
        active ? "badge-success" : "badge-error"
      }`}
    >
      {active ? "Active" : "Revoked"}
    </span>
  );
}

function AccessAction({ membership, onAction, disabled }) {
  const active = membership.revoked_at === null;

  return (
    <button
      type="button"
      className={`btn btn-sm btn-outline min-w-23 ${
        active ? "btn-error" : "btn-accent"
      }`}
      disabled={disabled}
      onClick={() => onAction(membership)}
      aria-label={`${active ? "Revoke" : "Restore"} access for ${
        membership.email
      } to ${propertyLabel(membership.property)}`}
    >
      {active ? "Revoke" : "Restore"}
    </button>
  );
}

function AccessMembershipList({ memberships, onAction, disabled }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {memberships.length === 0 && (
          <p className="py-5 text-center text-sm opacity-70">
            No data to display.
          </p>
        )}

        {memberships.map((membership) => (
          <article
            key={membership.membership_id}
            className="card border border-base-300 bg-base-200"
          >
            <div className="card-body gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="">
                  <h2 className="font-semibold">{membership.email}</h2>
                  <p className="text-xs capitalize opacity-70">
                    {membership.role}
                  </p>
                </div>

                <StatusBadge active={membership.revoked_at === null} />
              </div>

              <div className="border-y border-base-300 py-3">
                <p className="font-semibold">
                  {propertyLabel(membership.property)}
                </p>
                <p className="text-sm opacity-70">
                  {propertyDescription(membership.property)}
                </p>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="text-xs opacity-70">
                  <p>Created {formatDate(membership.created_at)}</p>

                  {membership.revoked_at && (
                    <p>Revoked {formatDate(membership.revoked_at)}</p>
                  )}
                </div>

                <AccessAction
                  membership={membership}
                  onAction={onAction}
                  disabled={disabled}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="table table-sm xl:table-md table-pin-rows">
          <thead>
            <tr className="bg-base-200">
              <th>Account</th>
              <th>Role</th>
              <th className="grow">Property</th>
              <th className="text-center">Status</th>
              <th className="text-center">Created</th>
              <th className="text-center">Revoked</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {memberships.length === 0 && (
              <tr>
                <td colSpan={7} className="py-5 text-center opacity-70">
                  No data to display.
                </td>
              </tr>
            )}

            {memberships.map((membership) => (
              <tr key={membership.membership_id} className="hover:bg-base-300">
                <td className="">{membership.email}</td>
                <td className="capitalize">{membership.role}</td>

                <td>
                  <p className="font-semibold grow">
                    {propertyLabel(membership.property)}
                  </p>
                  <p className="text-xs opacity-70">
                    {propertyDescription(membership.property)}
                  </p>
                </td>

                <td className="text-center">
                  <StatusBadge active={membership.revoked_at === null} />
                </td>

                <td className="text-center">
                  {formatDate(membership.created_at)}
                </td>

                <td className="text-center">
                  {membership.revoked_at
                    ? formatDate(membership.revoked_at)
                    : "—"}
                </td>

                <td className="text-center">
                  <AccessAction
                    membership={membership}
                    onAction={onAction}
                    disabled={disabled}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AccessMembershipList;
