import { HouseProvider } from "./core/HouseContext";
import { Routes, Route } from "react-router";
import Dashboard from "./routes/dashboard/Dashboard";
import Overview from "./routes/dashboard/Overview";
import HouseManager from "./routes/management/HouseManager";
import InventoryManager from "./routes/management/InventoryManager";
import InventoryList from "./routes/inventory_list/InventoryList";

function App() {
  return (
    <>
      <HouseProvider>
        <Routes>
          <Route path="" element={<Dashboard />}>
            <Route index element={<Overview className="" />} />
            <Route path="management">
              <Route
                path="manage_houses"
                element={<HouseManager className="" />}
              />
              <Route
                path="manage_inventory"
                element={<InventoryManager className="" />}
              />
            </Route>
            <Route
              path="inventory_list"
              element={<InventoryList className="" />}
            />
          </Route>
        </Routes>
      </HouseProvider>
    </>
  );
}

export default App;
