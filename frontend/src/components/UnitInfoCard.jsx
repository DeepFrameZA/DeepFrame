import DeleteButton from "../components/management/DeleteButton";
import { deleteHouse } from "../core/services/houseService";
import toast from "react-hot-toast";
import { useHouses } from "../core/HouseContext";
import EditIcon from "../components/EditIcon";
import { getErrorMessage, getDevErrorMessage } from "../core/utils/message";
import { formatPhoneDisplay } from "../core/utils/validation";

const UnitInfoCard = ({
  className = "",
  unit_number = "",
  client_surname = "",
  client_contact_number = "",
  notes = "",
  uniqueId = "",
  onEdit,
}) => {
  const { deleteHouseLocal } = useHouses();
  const submitDeleteHouse = async (id, unitNumber) => {
    const deletePromise = deleteHouse(id);

    try {
      await toast.promise(deletePromise, {
        loading: `Deleting house ${unitNumber}...`,
        success: `House MH ${unit_number} deleted!`,
        error: (err) =>
          getDevErrorMessage(err) ??
          getErrorMessage(err, "Could not delete house"),
      });
      deleteHouseLocal(id);
    } catch (error) {
      console.error("Delete house failed:", error);
    }
  };
  return (
    <>
      <div
        className={`${className} card w-85 bg-base-200 text-base-content shadow-md shadow-base-300 border dark:shadow-none dark:border border-base-content/10`}
      >
        <div className="card-body">
          <div className="card-title flex justify-between my-2">
            <h2 className="text-2xl font-bold text-center text-base-content">
              {unit_number ? `MH ${unit_number}` : "Unit Number"}
            </h2>
            <DeleteButton
              buttonClass="btn-sm btn-ghost"
              iconClass="fill-error w-5 h-5"
              itemType="house"
              itemName={`MH ${unit_number}`}
              warning="This will also permanently delete all of its areas and surfaces."
              uniqueId={uniqueId}
              onConfirm={() => submitDeleteHouse(uniqueId, unit_number)}
            />
          </div>
          <div className="grid grid-cols-2">
            <div className="">
              <p className="pl-2 mb-3 font-semibold text-base-content">
                Residents:
              </p>
              <p className="pl-2 mb-3 font-semibold">Contact Number:</p>
            </div>
            <div>
              <p className="pr-2 mb-3 text-end">
                {client_surname || "Surname"}
              </p>
              <p className="pr-2 mb-3 text-end">
                {formatPhoneDisplay(client_contact_number)}
              </p>
            </div>
          </div>
          <div>
            <p className="h-40 p-2 text-base-content shadow-md shadow-base-300 border dark:shadow-none dark:border border-base-content/10 bg-base-100">
              {notes || ""}
            </p>
            <div className="flex justify-end items-center w-full mt-6">
              <button
                className="btn btn-xs btn-neutral focus-within:outline-0 flex gap-y-4"
                onClick={() => onEdit?.()}
                aria-label="Edit"
              >
                <EditIcon className="w-4 h-4 fill-neutral-content" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitInfoCard;
