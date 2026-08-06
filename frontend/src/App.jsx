import { HouseProvider } from "./hooks/supabase/context/HouseContext";
import { Routes, Route } from "react-router";
import Dashboard from "./routes/dashboard/Dashboard";
import Overview from "./routes/dashboard/Overview";
import ListView from "./routes/list_view/ListView";
import HouseManager from "./routes/house_manager/HouseManager";
import DataManager from "./routes/data_manager/DataManager";

function App() {
  return (
    <>
      <HouseProvider>
        <Routes>
          <Route path="" element={<Dashboard />}>
            <Route index element={<Overview className="" />} />
            <Route path="list" element={<ListView className="" />} />
            <Route
              path="house_management"
              element={<HouseManager className="" />}
            />
            <Route
              path="data_management"
              element={<DataManager className="" />}
            />
          </Route>
        </Routes>
      </HouseProvider>
    </>
  );
}

export default App;
