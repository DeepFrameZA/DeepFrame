import { HouseProvider } from "./core/HouseContext";
import { Routes, Route, Navigate } from "react-router";
import MainView from "./routes/MainView";
import Dashboard from "./routes/dashboard/Dashboard";
import DocumentManager from "./routes/management/DocumentManager";
import InventoryManager from "./routes/management/InventoryManager";
import InventoryList from "./routes/inventory_list/InventoryList";
import Login from "./routes/auth/Login";
import Signup from "./routes/auth/Signup";
import ForgotPassword from "./routes/auth/ForgotPassword";
import ResetPassword from "./routes/auth/ResetPassword";
import { useAuth } from "./core/AuthContext";
import Loading from "./components/Loading";

function ProtectedRoute({ children, roles }) {
  const { user, role, loading } = useAuth();
  if (loading)
    return (
      <div className="">
        <Loading className="" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <>
      <HouseProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path=""
            element={
              <ProtectedRoute roles={["admin", "contractor", "owner"]}>
                <MainView />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard className="" />} />
            <Route path="management">
              <Route
                path="manage_documents"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <DocumentManager className="" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manage_inventory"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <InventoryManager className="" />
                  </ProtectedRoute>
                }
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
