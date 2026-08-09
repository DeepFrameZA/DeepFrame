import { Outlet } from "react-router";
import Navbar from "../../components/Navbar";

const Dashboard = () => {
  return (
    <>
      <div className="h-dvh">
        <Navbar
          className=""
          content={
            <div className="flex justify-center">
              <Outlet />
            </div>
          }
        />
      </div>
    </>
  );
};

export default Dashboard;
