import { useRef, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useAccess } from "../../../../hooks/useAccess";
import { useProperty } from "../../../../hooks/useProperty";
import { PlusIcon, ChevronLeftIcon } from "../../../Icons";
import DashboardPanel from "../../DashboardPanel";
import AccessMembershipList from "./AccessMembershipList";
import GrantAccessForm from "./GrantAccessForm";
import AccessActionModal from "./AccessActionModal";
import { propertyDescription, propertyLabel } from "./accessLabels";

const pageSize = 10;
const statuses = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "revoked", label: "Revoked" },
];

function Access() {
  const {
    memberships,
    loading,
    loadError,
    refreshMemberships,
    grantPropertyAccess,
    grantPropertyAccessBulk,
    revokePropertyAccess,
  } = useAccess();

  const {
    properties,
    loading: propertiesLoading,
    loadError: propertiesError,
    refreshProperties,
  } = useProperty();

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [grantOpen, setGrantOpen] = useState(false);
  const [membershipToChange, setMembershipToChange] = useState(null);
  const [busy, setBusy] = useState(false);

  const busyRef = useRef(false);

  const pending = loading || propertiesLoading;
  const failed = loadError || propertiesError;
  const unavailable = pending || failed || busy;

  const propertyById = new Map(
    properties.map((property) => [property.id, property]),
  );

  const query = search.trim().toLowerCase();

  const filtered = memberships
    .map((membership) => ({
      ...membership,
      property: propertyById.get(membership.property_id),
    }))
    .filter((membership) => {
      const membershipStatus =
        membership.revoked_at === null ? "active" : "revoked";

      const matchesStatus = status === "all" || membershipStatus === status;

      const text = [
        membership.email,
        membership.role,
        propertyLabel(membership.property),
        propertyDescription(membership.property),
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && text.includes(query);
    });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  const currentPage = Math.min(page, pageCount);

  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function closeGrant() {
    if (!busyRef.current) {
      setGrantOpen(false);
    }
  }

  function closeAction() {
    if (!busyRef.current) {
      setMembershipToChange(null);
    }
  }

  async function handleGrant(payload) {
    if (busyRef.current || unavailable) {
      return;
    }

    busyRef.current = true;
    setBusy(true);

    try {
      const results = await grantPropertyAccessBulk(payload);

      setGrantOpen(false);

      toast.success(
        `Access saved for ${results.length} propert${
          results.length === 1 ? "y" : "ies"
        }.`,
      );
    } catch {
      toast.error("Unable to grant property access. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function handleConfirmAction() {
    if (!membershipToChange || busyRef.current || unavailable) {
      return;
    }

    busyRef.current = true;
    setBusy(true);

    const revoking = membershipToChange.revoked_at === null;

    try {
      if (revoking) {
        await revokePropertyAccess(membershipToChange.membership_id);
      } else {
        await grantPropertyAccess({
          profileId: membershipToChange.profile_id,
          propertyId: membershipToChange.property_id,
        });
      }

      setMembershipToChange(null);

      toast.success(
        revoking ? "Property access revoked." : "Property access restored.",
      );
    } catch {
      toast.error(
        `Unable to ${
          revoking ? "revoke" : "restore"
        } property access. Refresh the list and try again.`,
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <section className="flex flex-col flex-1 gap-2 py-2 px-4 overflow-hidden">
        <Link
          to="/admin/administration"
          className="link link-hover flex flex-row items-center max-w-max gap-1 opacity-75"
          aria-label="Back to administration"
        >
          <ChevronLeftIcon className="size-3" />

          <h3 className="text-xs text-base-content">Administration</h3>
        </Link>

        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Access</h1>
            <p className="text-sm opacity-70 md:text-nowrap">
              Manage account access to properties.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-accent btn-outline btn-block md:w-auto"
            disabled={unavailable}
            onClick={() => setGrantOpen(true)}
          >
            <PlusIcon className="size-5" />
            Grant access
          </button>
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-col gap-2 md:flex-row md:justify-between">
            <div role="tablist" className="tabs tabs-border">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="tab"
                  aria-selected={status === s.value}
                  className={`tab ${status === s.value ? "tab-active" : ""}`}
                  onClick={() => {
                    setStatus(s.value);
                    setPage(1);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="search"
                className="input input-sm flex-1 md:w-64"
                aria-label="Search accounts and properties"
                placeholder="Search accounts or properties"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />

              <button
                type="button"
                className="btn btn-sm btn-soft btn-neutral"
                disabled={pending || busy}
                onClick={() => {
                  void refreshMemberships();
                  void refreshProperties();
                }}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none">
          {pending ? (
            <p
              role="status"
              className="flex items-center justify-center gap-2 py-8"
            >
              <span
                aria-hidden="true"
                className="loading loading-bars loading-sm"
              />
              Loading access…
            </p>
          ) : failed ? (
            <div className="alert alert-error" role="alert">
              Unable to load access information. Select Refresh to try again.
            </div>
          ) : (
            <AccessMembershipList
              memberships={visible}
              onAction={setMembershipToChange}
              disabled={unavailable}
            />
          )}
        </div>

        {!pending && !failed && (
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-70">
              {filtered.length} assignment
              {filtered.length === 1 ? "" : "s"}
            </span>

            <div className="join">
              <button
                type="button"
                className="btn btn-xs join-item"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                «
              </button>

              <span className="btn btn-xs join-item pointer-events-none">
                {currentPage} / {pageCount}
              </span>

              <button
                type="button"
                className="btn btn-xs join-item"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                »
              </button>
            </div>
          </div>
        )}

        {grantOpen && (
          <DashboardPanel
            open
            title="Grant property access"
            description="Assign one or more properties to a registered resident or contractor."
            onClose={closeGrant}
          >
            <GrantAccessForm
              properties={properties}
              memberships={memberships}
              busy={busy}
              onSubmit={handleGrant}
              onClose={closeGrant}
            />
          </DashboardPanel>
        )}

        {membershipToChange && (
          <AccessActionModal
            membership={membershipToChange}
            busy={busy}
            onCancel={closeAction}
            onConfirm={handleConfirmAction}
          />
        )}
      </section>
    </div>
  );
}

export default Access;
