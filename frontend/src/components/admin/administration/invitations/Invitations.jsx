import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import { useInvitation } from "../../../../hooks/useInvitation";
import InvitationCard from "../../../../components/admin/administration/invitations/InvitationCard";
import InvitationTable from "../../../../components/admin/administration/invitations/InvitationTable";
import { PlusIcon } from "../../../Icons";
import RevokeInvitationModal from "../../../../components/admin/administration/invitations/RevokeInvitationModal";
import CreateInvitationForm from "../../../../components/admin/administration/invitations/CreateInvitationForm";
import toast from "react-hot-toast";

const pageSize = 10;

const Invitations = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [invitationToRevoke, setInvitationToRevoke] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const { invitations, revokeInvitation, createInvitation } = useInvitation();
  const { openPanel, closePanel } = useOutletContext();

  const filteredInvitations =
    statusFilter === "all"
      ? invitations
      : invitations.filter(
          (invitation) => invitation.derived_status === statusFilter,
        );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredInvitations.length / pageSize),
  );

  /*
   * Keep the displayed page valid if filtering or revoking
   * an invitation reduces the total number of pages.
   */
  const currentPage = Math.min(page, pageCount);

  const visibleInvitations = filteredInvitations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const invitationStatuses = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "used", label: "Used" },
    { value: "expired", label: "Expired" },
    { value: "revoked", label: "Revoked" },
  ];

  const handleRequestRevoke = (invitation) => {
    setInvitationToRevoke(invitation);
  };

  const handleCancelRevoke = () => {
    if (revoking) {
      return;
    }

    setInvitationToRevoke(null);
  };

  const handleConfirmRevoke = async () => {
    if (!invitationToRevoke) {
      return;
    }

    setRevoking(true);

    try {
      await revokeInvitation(invitationToRevoke.invitation_id);
      toast.success("Invitation revoked.");
      setInvitationToRevoke(null);
    } catch {
      toast.error("Unable to revoke invitation. Please try again.");
    } finally {
      setRevoking(false);
    }
  };

  const handleCreateInvitation = () => {
    openPanel({
      title: "Create invitation",
      description: "Invitations are single-use and expire after 7 days.",
      content: (
        <CreateInvitationForm
          onClose={closePanel}
          createInvitation={createInvitation}
        />
      ),
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <section className="flex flex-col flex-1 gap-4 p-4 overflow-hidden">
        <Link
          to="/admin/administration"
          className="link link-hover flex flex-row items-center gap-1 opacity-75"
          aria-label="Back to administration"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>

          <h3 className="text-xs text-base-content">Administration</h3>
        </Link>

        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Invitations</h1>

            <p className={`text-sm opacity-70 md:text-nowrap`}>
              Review, create and revoke invitations.
            </p>
          </div>

          <button
            className="btn btn-accent btn-outline btn-block md:w-auto"
            type="button"
            onClick={handleCreateInvitation}
          >
            <PlusIcon />
            Create invite
          </button>
        </div>

        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
          <div className="flex items-center justify-center md:justify-start">
            <div
              role="tablist"
              className="tabs tabs-border w-full md:w-auto justify-between"
            >
              {invitationStatuses.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === status.value}
                  className={`tab ${
                    statusFilter === status.value ? "tab-active" : ""
                  }`}
                  onClick={() => {
                    setStatusFilter(status.value);
                    setPage(1);
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-none">
            <div className="grid gap-3 md:hidden">
              {visibleInvitations.map((invitation) => (
                <InvitationCard
                  key={invitation.invitation_id}
                  invitation={invitation}
                  onRevoke={handleRequestRevoke}
                  cardClass="bg-base-200"
                />
              ))}
            </div>

            <div className="hidden md:block">
              <InvitationTable
                invitations={visibleInvitations}
                onRevoke={handleRequestRevoke}
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-center pb-2">
            <div className="join">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                className="join-item btn btn-sm"
                aria-label="Previous page"
              >
                «
              </button>

              <button
                className="join-item btn btn-sm pointer-events-none no-animation select-none"
                type="button"
              >
                {currentPage} / {pageCount}
              </button>

              <button
                type="button"
                disabled={currentPage === pageCount}
                onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                className="join-item btn btn-sm"
                aria-label="Next page"
              >
                »
              </button>
            </div>
          </div>

          <RevokeInvitationModal
            invitation={invitationToRevoke}
            open={Boolean(invitationToRevoke)}
            revoking={revoking}
            onCancel={handleCancelRevoke}
            onConfirm={handleConfirmRevoke}
          />
        </div>
      </section>
    </div>
  );
};

export default Invitations;
