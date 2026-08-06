import { Outlet } from "react-router";
import Dock from "../../components/Dock";
import Navbar from "../../components/Navbar";
import ThemeSwitch from "../../components/ThemeSwitch";

const Dashboard = () => {
  return (
    <>
      <div className="h-dvh">
        <Navbar className="bg-base-200 h-14" />
        <div className="flex justify-center">
          <ThemeSwitch className="lg:hidden fixed top-0 left-0 pb-4 pr-4 bg-base-200 z-50 h-14 w-14 rounded-br-full" />
          <Outlet />
        </div>
        <Dock className="lg:hidden sticky bottom-0 z-50 bg-base-200 shadow-t shadow-sm shadow-base-content dark:shadow-none dark:border-t dark:border-base-300" />
      </div>
    </>
  );
};

export default Dashboard;
