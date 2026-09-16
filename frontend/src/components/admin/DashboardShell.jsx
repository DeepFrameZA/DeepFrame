import { NavLink, Outlet } from "react-router";
import { useCallback, useState } from "react";
import SignOutButton from "../auth/SignOutButton";
import ThemeSwap from "../theme/ThemeSwap";
import DashboardPanel from "./DashboardPanel";

const DashboardShell = () => {
  const [panel, setPanel] = useState(null);

  const openPanel = useCallback((panelConfig) => {
    setPanel(panelConfig);
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
  }, []);
  return (
    <>
      <div className="drawer lg:drawer-open">
        <input
          id="dashboard-drawer"
          type="checkbox"
          className="drawer-toggle inline"
        />
        <div className="drawer-content flex flex-col h-screen overflow-hidden">
          {/* Navbar */}
          <nav className="navbar w-full bg-base-300">
            <div className="flex flex-1">
              <label
                htmlFor="dashboard-drawer"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost drawer-button"
              >
                {/* Sidebar toggle icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="my-1.5 inline-block size-5"
                >
                  <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                  <path d="M9 4v16"></path>
                  <path d="M14 10l2 2l-2 2"></path>
                </svg>
              </label>
              <div className="text-2xl font-bold">DeepFrame</div>
            </div>
            <div className="flex-none mx-2">
              <ThemeSwap />
            </div>
          </nav>

          {/* Page content here */}
          <main className="flex-1 overflow-hidden flex flex-col">
            <Outlet
              context={{
                openPanel,
                closePanel,
              }}
            />
          </main>
        </div>

        <div className="drawer-side is-drawer-close:overflow-visible">
          <label
            htmlFor="dashboard-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
            {/* Sidebar content here */}
            <ul className="menu w-full grow">
              {/* List item */}
              <div className="flex flex-col gap-1">
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "menu-active" : ""}`
                    }
                    data-tip="Overview"
                    to="/admin/overview"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="my-1.5 inline-block size-4"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="4" />
                      <rect x="14" y="10" width="7" height="11" />
                      <rect x="3" y="13" width="7" height="8" />
                    </svg>
                    <span className="is-drawer-close:hidden">Overview</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "menu-active" : ""}`
                    }
                    data-tip="Management"
                    to="/admin/management"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="my-1.5 inline-block size-4"
                      aria-hidden="true"
                    >
                      <rect x="8" y="3" width="8" height="5" rx="1" />
                      <rect x="2.5" y="16" width="7" height="5" rx="1" />
                      <rect x="14.5" y="16" width="7" height="5" rx="1" />

                      <path d="M12 8v4" />
                      <path d="M6 12h12" />
                      <path d="M6 12v4" />
                      <path d="M18 12v4" />
                    </svg>
                    <span className="is-drawer-close:hidden">Management</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "menu-active" : ""}`
                    }
                    data-tip="Catalogue"
                    to="/admin/catalogue"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="my-1.5 inline-block size-4"
                      aria-hidden="true"
                    >
                      <path d="m12 3 7 4-7 4-7-4 7-4z" />
                      <path d="m5 12 7 4 7-4" />
                      <path d="m5 17 7 4 7-4" />
                    </svg>
                    <span className="is-drawer-close:hidden">Catalogue</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "menu-active" : ""}`
                    }
                    data-tip="Administration"
                    to="/admin/administration"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="my-1.5 inline-block size-4"
                      aria-hidden="true"
                    >
                      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="is-drawer-close:hidden">
                      Administration
                    </span>
                  </NavLink>
                </li>
              </div>

              {/* List item */}
              <div className="divider text-xs opacity-50 max-w-[95%]" />
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "menu-active" : ""}`
                  }
                  data-tip="Settings"
                  to="/admin/settings"
                >
                  {/* Settings icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2"
                    fill="none"
                    stroke="currentColor"
                    className="my-1.5 inline-block size-4"
                  >
                    <path d="M20 7h-9"></path>
                    <path d="M14 17H5"></path>
                    <circle cx="17" cy="17" r="3"></circle>
                    <circle cx="7" cy="7" r="3"></circle>
                  </svg>
                  <span className="is-drawer-close:hidden">Settings</span>
                </NavLink>
              </li>
            </ul>
            <div className="w-full pb-4 is-drawer-open:px-4 is-drawer-close:px-1">
              <div className="divider text-xs opacity-50 max-w-[95%] mb-2" />
              <SignOutButton buttonClass="btn-block is-drawer-open:btn-secondary" />
            </div>
          </div>
        </div>
      </div>
      <DashboardPanel
        open={Boolean(panel)}
        title={panel?.title}
        description={panel?.description}
        onClose={closePanel}
      >
        {panel?.content}
      </DashboardPanel>
    </>
  );
};

export default DashboardShell;
