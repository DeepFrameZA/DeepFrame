import { useState } from "react";
import CreateField from "../management/CreateField";
import { createHouse } from "../../core/services/houseService";
import { useHouses } from "../../core/HouseContext";
import toast from "react-hot-toast";

const ContactIcon = () => (
  <svg
    className="h-[1em] opacity-50"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
  >
    <g fill="none">
      <path
        d="M7.25 11.5C6.83579 11.5 6.5 11.8358 6.5 12.25C6.5 12.6642 6.83579 13 7.25 13H8.75C9.16421 13 9.5 12.6642 9.5 12.25C9.5 11.8358 9.16421 11.5 8.75 11.5H7.25Z"
        fill="currentColor"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 1C4.61929 1 3.5 2.11929 3.5 3.5V12.5C3.5 13.8807 4.61929 15 6 15H10C11.3807 15 12.5 13.8807 12.5 12.5V3.5C12.5 2.11929 11.3807 1 10 1H6ZM10 2.5H9.5V3C9.5 3.27614 9.27614 3.5 9 3.5H7C6.72386 3.5 6.5 3.27614 6.5 3V2.5H6C5.44771 2.5 5 2.94772 5 3.5V12.5C5 13.0523 5.44772 13.5 6 13.5H10C10.5523 13.5 11 13.0523 11 12.5V3.5C11 2.94772 10.5523 2.5 10 2.5Z"
        fill="currentColor"
      ></path>
    </g>
  </svg>
);

const CreateDrawer = ({ onClose }) => {
  const { addHouseLocal } = useHouses();
  const [newHouse, setNewHouse] = useState({
    unit_number: "",
    client_surname: "",
    client_contact_number: "",
  });
  const [creatingHouse, setCreatingHouse] = useState(false);

  const submitCreateHouse = async () => {
    const { unit_number, client_surname, client_contact_number } = newHouse;
    if (
      !unit_number.trim() ||
      !client_surname.trim() ||
      !client_contact_number.trim()
    ) {
      toast.error(
        "Please provide unit number, client surname and contact number",
      );
      return;
    }
    if (!/^\d{10}$/.test(client_contact_number.trim())) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }

    setCreatingHouse(true);
    const payload = {
      unit_number: unit_number.trim(),
      client_surname: client_surname.trim(),
      client_contact_number: client_contact_number.trim(),
    };
    const createPromise = createHouse(payload);

    try {
      const created = await toast.promise(createPromise, {
        loading: "Creating house...",
        success: "House created!",
        error: (err) => err?.message ?? "Create failed",
      });
      addHouseLocal(created);
      setNewHouse({
        unit_number: "",
        client_surname: "",
        client_contact_number: "",
      });
      onClose?.();
    } catch (error) {
      console.error("Create house failed:", error);
    } finally {
      setCreatingHouse(false);
    }
  };

  return (
    <div className="bg-base-100 min-h-full w-120 max-w-[95vw] h-full overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create House</h2>
        <button
          className="btn btn-sm btn-ghost focus-within:outline-0"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <CreateField
          label="Unit number"
          value={newHouse.unit_number}
          onChange={(v) => setNewHouse((p) => ({ ...p, unit_number: v }))}
        />

        <CreateField
          label="Client surname"
          value={newHouse.client_surname}
          onChange={(v) => setNewHouse((p) => ({ ...p, client_surname: v }))}
        />

        <CreateField
          label="Client contact number"
          value={newHouse.client_contact_number}
          onChange={(v) =>
            setNewHouse((p) => ({ ...p, client_contact_number: v }))
          }
          type="tel"
          pattern="[0-9]*"
          minLength="10"
          maxLength="10"
          icon={<ContactIcon />}
        />
      </div>

      <div className="flex justify-end items-center w-full mt-6 mb-2">
          <button
            className="btn btn-primary focus-within:outline-0 flex gap-y-4"
            disabled={creatingHouse}
          onClick={(e) => {
            e.preventDefault();
            submitCreateHouse();
          }}
        >
          {creatingHouse ? (
            <span className="loading loading-spinner text-current" />
          ) : (
            <span className="">Create</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateDrawer;
