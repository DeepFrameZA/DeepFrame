const UnitInfoCard = ({
  className = "",
  unit_number = "",
  client_surname = "",
  client_contact_number = "",
  notes = "",
  areas = [],
  surfaces = [],
  selected_tiles = [],
}) => {
  return (
    <>
      <div
        className={`${className}card w-85 bg-base-200 text-base-content shadow-md shadow-base-300 border dark:shadow-none dark:border-2 border-base-300`}
      >
        <div className="card-body">
          <h2 className="card-title text-xl font-semibold text-center text-base-content underline underline-offset-4">
            {unit_number ? `MH ${unit_number}` : "Unit Number"}
          </h2>
          <div className="grid grid-cols-2">
            <div className="">
              <p className="pl-2 mb-3 font-semibold text-base-contet">
                Residents:
              </p>
              <p className="pl-2 mb-3 font-semibold">Contact Number:</p>
              <p className="pl-2 mb-3 font-semibold">Areas:</p>
              <p className="pl-2 mb-3 font-semibold">Surfaces:</p>
              <p className="pl-2 mb-3 font-semibold">Selected Tiles:</p>
            </div>
            <div>
              <p className="pr-2 mb-3 text-end">
                {client_surname || "Surname"}
              </p>
              <p className="pr-2 mb-3 text-end">
                {client_contact_number || "Contact Number"}
              </p>
              <p className="pr-2 mb-3 text-end">
                {areas.length || "Room Count"}
              </p>
              <p className="pr-2 mb-3 text-end">
                {surfaces.length || "Surface Count"}
              </p>
              {/* <p className="pr-2 mb-3 text-end"> */}
              {/*   {selected_tiles.length || "Surface Count"} */}
              {/* </p> */}
              <ul className="h-25 overflow-y-auto scrollbar-none">
                {selected_tiles.map((tile, index) => (
                  <li key={index}>
                    <p className="pr-2 text-end truncate">{tile}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="h-40 p-2 text-base-content shadow-md shadow-base-300 border dark:shadow-none dark:border-2 border-base-300 bg-base-100">
              {notes || ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitInfoCard;
