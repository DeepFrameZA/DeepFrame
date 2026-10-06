import { useNavigate } from "react-router";
import AdministrationCard from "../../../components/admin/administration/AdministrationCard";
import {
  InvitationsIcon,
  UsersIcon,
  AccessIcon,
} from "../../../components/Icons";

const Administration = () => {
  const navigate = useNavigate();
  return (
    <>
      <section className="flex flex-col gap-4 p-4">
        <div>
          <h3 className="text-xl font-bold">Administration</h3>
          <p className="mt-1 text-sm opacity-70">
            Manage invitations, users, roles and access.
          </p>
        </div>
        <div className="divider my-0 opacity-50" />
        {/* <div className="flex flex-col md:flex-row gap-4 w-full"> */}
        <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <AdministrationCard
            title="Invitations"
            description="Create, review and revoke invitations."
            icon={<InvitationsIcon className="size-5" />}
            onClick={() => navigate("/admin/administration/invitations")}
          />
          <AdministrationCard
            title="Users"
            description="Manage user accounts and profiles."
            icon={<UsersIcon className="size-5" />}
            onClick={() => navigate("/admin/administration/users")}
          />
          <AdministrationCard
            title="Accesss"
            description="Manage resident and contractor access to properties."
            icon={<AccessIcon className="size-5" />}
            onClick={() => navigate("/admin/administration/access")}
          />
        </div>
      </section>
    </>
  );
};

export default Administration;
