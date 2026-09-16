import { Navigate, Outlet, Route, Routes } from "react-router";
import AdminView from "./layout/admin/AdminView";
import ForgotPassword from "./layout/auth/ForgotPassword";
import Login from "./layout/auth/Login";
import Register from "./layout/auth/Register";
import ResetPassword from "./layout/auth/ResetPassword";
import ContractorView from "./layout/contractor/ContractorView";
import ResidentView from "./layout/resident/ResidentView";
import { useAuth } from "./hooks/useAuth";

import Administration from "./layout/admin/pages/Administration";
import Invitations from "./components/admin/administration/invitations/Invitations";
import Users from "./components/admin/administration/users/Users";
import Access from "./components/admin/administration/access/Access";
import Catalogue from "./layout/admin/pages/Catalogue";
import Management from "./layout/admin/pages/Management";
import Overview from "./layout/admin/pages/Overview";
import SettingsAdmin from "./layout/admin/pages/SettingsAdmin";

import InvitationProvider from "./context/InvitationProvider";

const roleDestinations = {
  admin: "/admin/overview",
  contractor: "/contractor",
  resident: "/resident",
};

function getRoleDestination(profile) {
  return roleDestinations[profile?.role] ?? null;
}

function RouteLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <span className="loading loading-bars loading-xl" aria-label="Loading" />
    </main>
  );
}

function RouteErrorScreen() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div role="alert" className="alert alert-error max-w-md">
        <div>
          <h1 className="font-bold">Unable to load your account</h1>
          <p className="text-xs">Check your connection and try again.</p>
        </div>

        <button className="btn" type="button" onClick={handleReload}>
          Retry
        </button>
      </div>
    </main>
  );
}

function UnknownRoleScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div role="alert" className="alert alert-error max-w-md">
        <div>
          <h1 className="font-bold">Your account role is not recognized</h1>
          <p className="text-xs">Contact the administrator for assistance.</p>
        </div>
      </div>
    </main>
  );
}

function RouteResolver() {
  const { session, profile, recovery, loading, error } = useAuth();

  if (loading) {
    return <RouteLoadingScreen />;
  }

  if (error) {
    return <RouteErrorScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (recovery) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!profile) {
    return <Navigate to="/register" replace />;
  }

  const destination = getRoleDestination(profile);

  if (!destination) {
    return <UnknownRoleScreen />;
  }

  return <Navigate to={destination} replace />;
}

function PublicOnlyRoute() {
  const { session, profile, recovery, loading, error } = useAuth();

  if (loading) {
    return <RouteLoadingScreen />;
  }

  if (error) {
    return <RouteErrorScreen />;
  }

  if (!session) {
    return <Outlet />;
  }

  if (recovery) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!profile) {
    return <Navigate to="/register" replace />;
  }

  const destination = getRoleDestination(profile);

  if (!destination) {
    return <UnknownRoleScreen />;
  }

  return <Navigate to={destination} replace />;
}

function RegistrationRoute() {
  const { session, profile, recovery, loading, error } = useAuth();

  if (loading) {
    return <RouteLoadingScreen />;
  }

  if (error) {
    return <RouteErrorScreen />;
  }

  if (session && recovery) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!profile) {
    return <Outlet />;
  }

  const destination = getRoleDestination(profile);

  if (!destination) {
    return <UnknownRoleScreen />;
  }

  return <Navigate to={destination} replace />;
}

function RecoveryRoute() {
  const { session, profile, recovery, loading, error } = useAuth();

  if (loading) {
    return <RouteLoadingScreen />;
  }

  if (error) {
    return <RouteErrorScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (recovery) {
    return <Outlet />;
  }

  if (!profile) {
    return <Navigate to="/register" replace />;
  }

  const destination = getRoleDestination(profile);

  if (!destination) {
    return <UnknownRoleScreen />;
  }

  return <Navigate to={destination} replace />;
}

function RoleRoute({ allowedRole }) {
  const { session, profile, recovery, loading, error } = useAuth();

  if (loading) {
    return <RouteLoadingScreen />;
  }

  if (error) {
    return <RouteErrorScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (recovery) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!profile) {
    return <Navigate to="/register" replace />;
  }

  const destination = getRoleDestination(profile);

  if (!destination) {
    return <UnknownRoleScreen />;
  }

  /*
   * Admins can open every role view.
   *
   * Residents and contractors remain limited to their own
   * respective view.
   */
  if (profile.role !== "admin" && profile.role !== allowedRole) {
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<RegistrationRoute />}>
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<RecoveryRoute />}>
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<RoleRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AdminView />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="management" element={<Management />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="administration">
            <Route index element={<Administration />} />
            <Route
              path="invitations"
              element={
                <InvitationProvider>
                  <Invitations />
                </InvitationProvider>
              }
            />
            <Route path="users" element={<Users />} />
            <Route path="access" element={<Access />} />
          </Route>
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allowedRole="contractor" />}>
        <Route path="/contractor" element={<ContractorView />} />
      </Route>

      <Route element={<RoleRoute allowedRole="resident" />}>
        <Route path="/resident" element={<ResidentView />} />
      </Route>

      <Route path="/" element={<RouteResolver />} />
      <Route path="*" element={<RouteResolver />} />
    </Routes>
  );
}

export default App;
