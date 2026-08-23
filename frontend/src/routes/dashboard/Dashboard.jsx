import { useState } from "react";
import UnitInfoCard from "../../components/UnitInfoCard";
import CreateDrawer from "../../components/dashboard/CreateDrawer";
import ManageDrawer from "../../components/dashboard/ManageDrawer";
import { useHouses } from "../../core/HouseContext";

const Dashboard = ({ className = "" }) => {
  const { houses } = useHouses();
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [managingHouseId, setManagingHouseId] = useState(null);

  const managingHouse = houses.find((h) => h.id === managingHouseId) || null;

  const openCreate = () => setActiveDrawer("create");
  const openManage = (house) => {
    setManagingHouseId(house.id);
    setActiveDrawer("manage");
  };
  const closeDrawer = () => setActiveDrawer(null);

  return (
    <div className={`${className} drawer drawer-end`}>
      <input
        id="dashboard-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={activeDrawer !== null}
        onChange={(e) => {
          if (!e.target.checked) setActiveDrawer(null);
        }}
      />
      <div className="drawer-content flex justify-center">
        <div className="py-6 max-w-[95%] relative top-14">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="fixed bottom-6 left-6 z-2">
              <button
                className="btn btn-md btn-square btn-primary focus-within:outline-0"
                onClick={openCreate}
                aria-label="New"
              >
                <svg
                  aria-label="New"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="size-6 fill-primary-content"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>
            {houses.map((h) => (
              <UnitInfoCard
                key={h.id}
                unit_number={h.unit_number}
                client_surname={h.client_surname}
                client_contact_number={h.client_contact_number}
                notes={h.notes}
                uniqueId={h.id}
                onEdit={() => openManage(h)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="dashboard-drawer"
          aria-label="close drawer"
          className="drawer-overlay"
        ></label>
        {activeDrawer === "create" && <CreateDrawer onClose={closeDrawer} />}
        {activeDrawer === "manage" && managingHouse && (
          <ManageDrawer
            key={managingHouseId}
            house={managingHouse}
            onClose={closeDrawer}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
