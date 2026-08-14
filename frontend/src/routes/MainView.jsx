import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

const MainView = () => {
  return (
    <>
      <div className="">
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

export default MainView;
