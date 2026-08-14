import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import { useHouses } from "../../core/HouseContext";
import EditIcon from "../../components/EditIcon";
import SaveIcon from "../../components/SaveIcon";

const HouseManager = ({ className = "className" }) => {
  const { houses } = useHouses();
  const [editingField, setEditingField] = useState({});

  return (
    <>
      <div className={`${className} w-[95%] relative top-16.25`}>
        <div className="flex justify-center px-1.5 py-3">
          <h2 className="text-2xl font-bold">House Manager</h2>
        </div>
        <div className="">
          <div className="tabs tabs-box justify-end tabs-xl mb-3">
            <input
              className={`tab`}
              type="radio"
              name="my_tabs_2"
              aria-label="Manage"
              defaultChecked
            />

            <div className="tab-content bg-base-100 border-base-300 p-6">
              <div className="flex justify-center">
                <SearchBar className="lg:w-96 mb-6" />
              </div>

              <div className="">
                {houses.map((h) => {
                  const unitNumberFieldKey = `${h.id}_unit_number`;
                  const clientSurnameFieldKey = `${h.id}_client_surname`;
                  const clientContactNumberFieldKey = `${h.id}_client_contact_number`;

                  return (
                    <div
                      className="collapse first:collapse-open collapse-arrow mb-3 bg-base-100 border border-base-300 focus-within:outline-0 focus-within:shadow-none"
                      key={h.id}
                    >
                      <input type="checkbox" className="peer" />
                      <div className="collapse-title font-semibold after:inset-s-5 after:inset-e-auto pe-4 ps-12">
                        {h.unit_number}
                      </div>
                      <div className="collapse-content z-1">
                        <section className="">
                          <div className="flex justify-center font-semibold text-sm mb-2">
                            GENERAL INFORMATION
                          </div>

                          <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex join">
                              <label className="input join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                <input
                                  type="text"
                                  className=""
                                  required
                                  disabled={!editingField[unitNumberFieldKey]}
                                  placeholder="Unit number"
                                  defaultValue={h.unit_number}
                                />
                              </label>
                              <label className="swap btn join-item focus-within:outline-0">
                                <input type="checkbox" />
                                <div
                                  className="swap-on"
                                  onClick={() =>
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [unitNumberFieldKey]: true,
                                    }))
                                  }
                                >
                                  <EditIcon className="z-10 w-4 h-4 fill-base-content" />
                                </div>
                                <div
                                  className="swap-off"
                                  onClick={() =>
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [unitNumberFieldKey]: false,
                                    }))
                                  }
                                >
                                  <SaveIcon className="z-10 w-4 h-4 fill-base-content" />
                                </div>
                              </label>
                            </div>

                            <div className="flex join">
                              <label className="input join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                <input
                                  type="text"
                                  className=""
                                  required
                                  disabled={
                                    !editingField[clientSurnameFieldKey]
                                  }
                                  placeholder="Client surname"
                                  defaultValue={h.client_surname}
                                />
                              </label>
                              <label className="swap btn join-item focus-within:outline-0">
                                <input type="checkbox" />
                                <div
                                  className="swap-on"
                                  onClick={() =>
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [clientSurnameFieldKey]: true,
                                    }))
                                  }
                                >
                                  <EditIcon className="z-10 w-4 h-4 fill-base-content" />
                                </div>
                                <div
                                  className="swap-off"
                                  onClick={() =>
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [clientSurnameFieldKey]: false,
                                    }))
                                  }
                                >
                                  <SaveIcon className="z-10 w-4 h-4 fill-base-content" />
                                </div>
                              </label>
                            </div>

                            <div className="flex join">
                              <label className="input join-item validator focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
                                <svg
                                  className="h-[1em] opacity-50"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 16 16"
                                >
                                  <g fill="none">
                                    <path
                                      d="M7.25 11.5C6.83579 11.5 6.5 11.8358 6.5 12.25C6.5 12.6642 6.83579 13 7.25 13H8.75C9.16421 13 9.5 12.6642 9.5 12.25C9.5 11.8358 9.16421 11.5 8.75 11.5H7.25Z"
                                      fill="currentColor"
                                    ></path>
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M6 1C4.61929 1 3.5 2.11929 3.5 3.5V12.5C3.5 13.8807 4.61929 15 6 15H10C11.3807 15 12.5 13.8807 12.5 12.5V3.5C12.5 2.11929 11.3807 1 10 1H6ZM10 2.5H9.5V3C9.5 3.27614 9.27614 3.5 9 3.5H7C6.72386 3.5 6.5 3.27614 6.5 3V2.5H6C5.44771 2.5 5 2.94772 5 3.5V12.5C5 13.0523 5.44772 13.5 6 13.5H10C10.5523 13.5 11 13.0523 11 12.5V3.5C11 2.94772 10.5523 2.5 10 2.5Z"
                                      fill="currentColor"
                                    ></path>
                                  </g>
                                </svg>

                                <input
                                  type="tel"
                                  className=""
                                  required
                                  disabled={
                                    !editingField[clientContactNumberFieldKey]
                                  }
                                  placeholder="Contact number"
                                  pattern="[0-9]*"
                                  minLength="10"
                                  maxLength="10"
                                  defaultValue={h.client_contact_number}
                                />
                              </label>
                              <label className="swap btn join-item focus-within:outline-0">
                                <input type="checkbox" />
                                <div
                                  className="swap-on"
                                  onClick={() =>
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [clientContactNumberFieldKey]: true,
                                    }))
                                  }
                                >
                                  <EditIcon className="z-10 w-4 h-4 fill-base-content" />
                                </div>
                                <div
                                  className="swap-off"
                                  onClick={() =>
                                    setEditingField((prev) => ({
                                      ...prev,
                                      [clientContactNumberFieldKey]: false,
                                    }))
                                  }
                                >
                                  <SaveIcon className="z-10 w-4 h-4 fill-base-content" />
                                </div>
                              </label>
                            </div>
                          </div>
                        </section>
                        <div className="divider"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <input
              className={`tab`}
              type="radio"
              name="my_tabs_2"
              aria-label="Create"
              role="button"
            />
            <div className="tab-content bg-base-100 border-base-300 p-6">
              <div className="flex justify-center">Tab 2</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HouseManager;
