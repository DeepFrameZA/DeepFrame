import { NavLink, useLocation } from "react-router";
import ThemeSwitch from "../components/ThemeSwitch";
import useHasScrolled from "../hooks/useHasScrolled";

const Navbar = ({ className = "", content }) => {
  const location = useLocation();
  const isListActive = location.pathname.startsWith("/management");

  const hasScrolled = useHasScrolled();
  return (
    <>
      <div className={`${className} drawer`}>
        <input
          id="my-drawer-2"
          type="checkbox"
          className="drawer-toggle z-30"
        />
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <div
            className={`navbar bg-base-200 w-full fixed top-0 z-10 ${hasScrolled ? " shadow-b shadow-sm shadow-base-content:950 dark:shadow-none dark:border-b dark:border-base-300" : "border-0 shadow-none"}`}
          >
            <div className="navbar-start">
              <div className="flex-none lg:hidden">
                {" "}
                <label
                  htmlFor="my-drawer-2"
                  aria-label="open sidebar"
                  className="btn btn-square btn-ghost drawer-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block h-6 w-6 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </label>
              </div>
              <a
                href={hasScrolled ? "#" : "#"}
                className="btn btn-ghost text-xl"
              >
                Deep Frame
              </a>
            </div>
            <div className="navbar-center">
              <div className="hidden flex-none lg:block">
                <ul className="menu menu-horizontal gap-2">
                  {/* Navbar menu content here */}
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        isActive ? "menu-active bg-accent" : ""
                      }
                      to="/"
                      end
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li className="dropdown dropdown-center dropdown-bottom">
                    <div
                      className={isListActive ? "menu-active bg-accent" : ""}
                      tabIndex={0}
                      role="button"
                    >
                      Management
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <ul
                      className="dropdown-content menu bg-base-200 z-1 p-2 shadow-sm shadow-base-content:950 dark:shadow-none dark:border dark:border-base-300"
                      tabIndex="-1"
                    >
                      <li>
                        <NavLink
                          className={({ isActive }) =>
                            isActive ? "menu-active bg-accent" : ""
                          }
                          to="/management/manage_houses"
                          end
                        >
                          House Manager
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          className={({ isActive }) =>
                            isActive ? "menu-active bg-accent" : ""
                          }
                          to="/management/manage_inventory"
                          end
                        >
                          Inventory Manager
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        isActive ? "menu-active bg-accent" : ""
                      }
                      to="/inventory_list"
                      end
                    >
                      Inventory List
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
            <div className="navbar-end pr-2">
              <ThemeSwitch />
            </div>
          </div>
          {/* Page content here */}
          {content}
        </div>
        <div className="drawer-side z-20">
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-200 min-h-full w-80 p-4 gap-2">
            {/* Sidebar content here */}
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "menu-active bg-accent" : ""
                }
                onClick={() => {
                  document.getElementById("my-drawer-3").checked = false;
                }}
                to="/"
                end
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <div
                className={isListActive ? "menu-active bg-accent" : ""}
                tabIndex={0}
                role="button"
              >
                Management
              </div>
              <ul className="mt-2 p-2">
                <li className="mb-2">
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "menu-active bg-accent" : ""
                    }
                    onClick={() => {
                      document.getElementById("my-drawer-3").checked = false;
                    }}
                    to="/management/manage_houses"
                    end
                  >
                    House Manager
                  </NavLink>
                </li>
                <li className="">
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "menu-active bg-accent" : ""
                    }
                    onClick={() => {
                      document.getElementById("my-drawer-3").checked = false;
                    }}
                    to="/management/manage_inventory"
                    end
                  >
                    Inventory Manager
                  </NavLink>
                </li>
              </ul>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "menu-active bg-accent" : ""
                }
                onClick={() => {
                  document.getElementById("my-drawer-3").checked = false;
                }}
                to="/inventory_list"
                end
              >
                Inventory List
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
