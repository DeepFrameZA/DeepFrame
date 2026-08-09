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
      <div class="aura aura-glow text-accent/75">
        <div
          className={`${className}card w-85 bg-base-200 text-base-content ring ring-accent/30`}
        >
          <div className="card-body">
            <h2 className="card-title text-xl font-extbold text-center text-accent">
              {unit_number ? `MH_${unit_number}` : "Unit Number"}
            </h2>
            <div className="grid grid-cols-2 h-30 overflow-y-scroll">
              <div className="">
                <p className="pl-2 mb-3 font-bold text-base-contet">
                  Residents:
                </p>
                <p className="pl-2 mb-3 font-bold">Contact Number:</p>
                <p className="pl-2 mb-3 font-bold">Areas:</p>
                <p className="pl-2 mb-3 font-bold">Surfaces:</p>
                <p className="pl-2 mb-3 font-bold">Selected Tiles:</p>
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
                <p className="pr-2 mb-3 text-end">
                  {selected_tiles.length > 0
                    ? selected_tiles.join(", ")
                    : "None Selected"}
                </p>
              </div>
            </div>
            <div class="aura aura-glow text-accent/75">
              <div>
                <p className="h-40 p-2 text-base-content ring ring-accent/30 bg-base-200">
                  {notes || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitInfoCard;
