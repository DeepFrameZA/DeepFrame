import { useRef, useState } from "react";
import InvitationPropertySelector from "./InvitationPropertySelector";
import toast from "react-hot-toast";
import RequiredBadge from "../../../RequiredBadge";

const CreateInvitationForm = ({ onClose, createInvitation }) => {
  const [invitedEmail, setInvitedEmail] = useState("");
  const [role, setRole] = useState("resident");
  const [creating, setCreating] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState(null);
  const [propertyIds, setPropertyIds] = useState([]);
  const submittingRef = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setCreating(true);

    try {
      const result = await createInvitation({
        invitedEmail: invitedEmail.trim(),
        role,
        propertyIds,
      });

      setCreatedInvitation(result);
      toast.success("Invitation created.");
    } catch {
      toast.error("Unable to create invitation. Please try again.");
    } finally {
      submittingRef.current = false;
      setCreating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!createdInvitation?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdInvitation.code);
      toast.success("Invitation code copied.");
    } catch {
      toast.error("Unable to copy invitation code.");
    }
  };

  if (createdInvitation) {
    return (
      <>
        <div className="flex min-h-full flex-col w-full">
          <div className="flex-1 p-5 justify-end">
            <div className="flex items-center mb-2">
              <div className="font-semibold uppercase">Invitation created</div>
            </div>

            <div className="grid grid-cols-2 space-y-2">
              <span className="">Email:</span>
              <span className="text-end grow">
                {createdInvitation.invited_email}
              </span>
              <span className="">Role:</span>
              <span className="text-end capitalize">
                {createdInvitation.role}
              </span>
              <span>Properties:</span>

              <span className="text-end">
                {propertyIds.length === 0
                  ? "None assigned"
                  : `${propertyIds.length} selected`}
              </span>
            </div>

            <div className="divider my-0 opacity-50" />
            <div className="">
              <label className="font-semibold">Invitation code</label>

              <div className="mt-3 flex gap-2">
                <input
                  className="input flex-1 font-mono"
                  value={createdInvitation.code}
                  readOnly
                />

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCopyCode}
                >
                  Copy
                </button>
              </div>

              <p className="mt-2 text-xs opacity-50">
                This code is shown once. Copy it before closing this panel.
              </p>
            </div>
          </div>

          <div className="divider my-0 justify-self-center px-5" />
          <div className="flex justify-end p-4">
            <button type="button" className="btn btn-accent" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <form className="flex min-h-full flex-col w-full" onSubmit={handleSubmit}>
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-3 p-3 px-5">
        <fieldset className="fieldset">
          <h3 className="label pb-2">Who do you want to invite?</h3>
          <label className="floating-label input validator w-full">
            <input
              type="email"
              className="input w-full"
              placeholder="Email"
              value={invitedEmail}
              onChange={(event) => setInvitedEmail(event.target.value)}
              disabled={creating}
              required
              autoFocus
            />

            <span>Email</span>
            <RequiredBadge />
          </label>
        </fieldset>

        <fieldset className="fieldset">
          <h3 className="label pb-2">
            Select the role assigned by this invitation.
          </h3>
          <select
            className="select w-full pb-2 space-y-1"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            disabled={creating}
          >
            <option value="resident">Resident</option>
            <option value="contractor">Contractor</option>
          </select>
        </fieldset>
        <InvitationPropertySelector
          propertyIds={propertyIds}
          onChange={setPropertyIds}
          disabled={creating}
        />
      </div>
      <div className="divider my-0 px-5 opacity-50" />

      <div className="flex gap-2 border-base-300 p-4">
        <button
          type="button"
          className="btn btn-outline flex-1"
          onClick={onClose}
          disabled={creating}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-accent flex-1"
          disabled={creating || !invitedEmail.trim()}
        >
          {creating && <span className="loading loading-bars loading-xs" />}
          Create invite
        </button>
      </div>
    </form>
  );
};

export default CreateInvitationForm;
