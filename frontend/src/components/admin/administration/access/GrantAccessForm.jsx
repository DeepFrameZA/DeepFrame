import { useEffect, useState } from "react";
import { useAccess } from "../../../../hooks/useAccess";
import RequiredBadge from "../../../RequiredBadge";
import { propertyDescription, propertyLabel } from "./accessLabels";

function GrantAccessForm({ properties, memberships, busy, onSubmit, onClose }) {
  const { listPropertyAccessAccounts } = useAccess();

  const [accountResult, setAccountResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [profileId, setProfileId] = useState("");
  const [propertyIds, setPropertyIds] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      try {
        const accounts = await listPropertyAccessAccounts();

        if (!cancelled) {
          setAccountResult({ attempt, accounts, error: false });
        }
      } catch {
        if (!cancelled) {
          setAccountResult({ attempt, accounts: [], error: true });
        }
      }
    }

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [attempt, listPropertyAccessAccounts]);

  const loading = accountResult?.attempt !== attempt;
  const accounts = loading ? [] : accountResult.accounts;
  const loadError = !loading && accountResult.error;

  const accountSelected = accounts.some(
    (account) => account.profile_id === profileId,
  );

  const disabled = busy || loading || loadError || !accountSelected;

  const membershipByProperty = new Map(
    memberships
      .filter((membership) => membership.profile_id === profileId)
      .map((membership) => [membership.property_id, membership]),
  );

  /*
   * Existing active assignments cannot be selected again.
   * Properties without a membership or with revoked access can.
   */
  const availableIds = new Set(
    properties
      .filter(
        (property) =>
          membershipByProperty.get(property.id)?.revoked_at !== null,
      )
      .map((property) => property.id),
  );

  /*
   * Recheck against the latest props before submitting.
   * Search filtering never removes selected properties.
   */
  const selectedIds = propertyIds.filter((id) => availableIds.has(id));

  const selectedSet = new Set(selectedIds);

  const restoreCount = selectedIds.filter((id) =>
    membershipByProperty.has(id),
  ).length;

  const newCount = selectedIds.length - restoreCount;
  const canSubmit = !disabled && selectedIds.length > 0;
  const query = search.trim().toLowerCase();

  const visibleProperties = properties.filter((property) =>
    [
      propertyLabel(property),
      propertyDescription(property),
      property.property_type.replaceAll("_", " "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  function toggleProperty(propertyId, checked) {
    if (disabled || !availableIds.has(propertyId)) {
      return;
    }

    setPropertyIds((current) =>
      checked
        ? [...new Set([...current, propertyId])]
        : current.filter((id) => id !== propertyId),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (canSubmit) {
      void onSubmit({
        profileId,
        propertyIds: selectedIds,
      });
    }
  }

  return (
    <form className="flex w-full flex-1 flex-col" onSubmit={handleSubmit}>
      <fieldset
        disabled={busy}
        className="flex-1 space-y-6 overflow-y-auto p-5"
      >
        {loading ? (
          <p role="status" className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="loading loading-bars loading-xs"
            />
            Loading accounts…
          </p>
        ) : loadError ? (
          <div className="alert alert-error" role="alert">
            <div>
              <p>Unable to load accounts.</p>

              <button
                type="button"
                className="btn btn-sm mt-2"
                onClick={() => setAttempt((value) => value + 1)}
              >
                Retry
              </button>
            </div>
          </div>
        ) : accounts.length === 0 ? (
          <p role="status" className="alert">
            No registered resident or contractor accounts yet.
          </p>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm">Account</span>
              <RequiredBadge />
            </div>

            <select
              className="select w-full"
              value={profileId}
              onChange={(event) => {
                setProfileId(event.target.value);
                setPropertyIds([]);
                setSearch("");
              }}
              required
            >
              <option value="" disabled>
                Select an account
              </option>

              {accounts.map((account) => (
                <option key={account.profile_id} value={account.profile_id}>
                  {account.email} — {account.role}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span id="access-properties-label" className="text-sm">
              Properties
            </span>
            <RequiredBadge />
          </div>

          {!accountSelected ? (
            <p className="text-sm opacity-70">
              Select an account to choose its properties.
            </p>
          ) : properties.length === 0 ? (
            <p className="text-sm opacity-70">
              Create a property in Management before granting access.
            </p>
          ) : (
            <>
              <label className="floating-label">
                <span>Search properties</span>

                <input
                  type="search"
                  className="input w-full"
                  placeholder="Search properties"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  disabled={disabled}
                />
              </label>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span aria-live="polite">{selectedIds.length} selected</span>

                <button
                  type="button"
                  className="link"
                  onClick={() => setPropertyIds([])}
                  disabled={disabled || selectedIds.length === 0}
                >
                  Clear selection
                </button>
              </div>

              <div
                className="space-y-2"
                role="group"
                aria-labelledby="access-properties-label"
              >
                {visibleProperties.length === 0 && (
                  <p
                    role="status"
                    className="py-4 text-center text-sm opacity-70"
                  >
                    No matching properties.
                  </p>
                )}

                {visibleProperties.map((property) => {
                  const membership = membershipByProperty.get(property.id);

                  const active = membership?.revoked_at === null;
                  const selected = selectedSet.has(property.id);

                  return (
                    <label
                      key={property.id}
                      className={`flex items-start gap-3 border p-3 ${
                        active
                          ? "cursor-not-allowed border-base-300 opacity-60"
                          : selected
                            ? "cursor-pointer border-primary bg-base-200"
                            : "cursor-pointer border-base-300 hover:bg-base-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm mt-1"
                        checked={active || selected}
                        disabled={disabled || active}
                        onChange={(event) =>
                          toggleProperty(property.id, event.target.checked)
                        }
                      />

                      <span className="flex-1">
                        <span className="block font-semibold">
                          {propertyLabel(property)}
                        </span>

                        <span className="block text-xs opacity-70">
                          {propertyDescription(property)}
                        </span>

                        {active ? (
                          <span className="badge badge-success badge-outline badge-xs mt-2">
                            Already active
                          </span>
                        ) : membership ? (
                          <span className="badge badge-warning badge-outline badge-xs mt-2">
                            Restore access
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>

              {availableIds.size === 0 && (
                <p role="status" className="text-sm opacity-70">
                  This account already has active access to every property.
                </p>
              )}
            </>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="border border-base-300 p-4 text-sm" role="status">
            <p>
              {newCount} new assignment{newCount === 1 ? "" : "s"}
            </p>
            <p>
              {restoreCount} assignment
              {restoreCount === 1 ? "" : "s"} to restore
            </p>
            <p className="mt-2 opacity-70">
              All selected properties will be saved together. Existing active
              access stays unchanged.
            </p>
          </div>
        )}
      </fieldset>

      <div className="divider px-5 my-0 opacity-50" />
      <div className="flex justify-between gap-3 p-5 pt-3">
        <button
          type="button"
          className="btn btn-ghost min-w-23"
          onClick={onClose}
          disabled={busy}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-accent btn-outline min-w-23"
          disabled={!canSubmit}
          aria-label={`Grant access to ${selectedIds.length} propert${
            selectedIds.length === 1 ? "y" : "ies"
          }`}
          aria-busy={busy}
        >
          {busy ? (
            <span
              aria-hidden="true"
              className="loading loading-bars loading-xs"
            />
          ) : (
            `Grant access (${selectedIds.length})`
          )}
        </button>
      </div>
    </form>
  );
}

export default GrantAccessForm;
