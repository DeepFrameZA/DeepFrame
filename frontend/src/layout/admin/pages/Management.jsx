import { useNavigate } from "react-router";
import ManagementCard from "../../../components/admin/management/ManagementCard";
import { PropertiesIcon } from "../../../components/Icons";

const Management = () => {
  const navigate = useNavigate();
  return (
    <>
      <section className="flex flex-col gap-4 p-4">
        <div>
          <h3 className="text-xl font-bold">Management</h3>
          <p className="mt-1 text-sm opacity-70">
            Manage properties and project resources.
          </p>
        </div>
        <div className="divider my-0 opacity-50" />
        {/* <div className="flex flex-col md:flex-row gap-4 w-full"> */}
        <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <ManagementCard
            title="Properties"
            description="Create, review and archive properties."
            icon={<PropertiesIcon className="size-5" />}
            onClick={() => navigate("/admin/management/properties")}
          />
        </div>
      </section>
    </>
  );
};

export default Management;
