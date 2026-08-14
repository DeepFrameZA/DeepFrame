import UnitInfoCard from "../../components/UnitInfoCard";
import { useHouses } from "../../core/HouseContext";

const Overview = ({ className = "" }) => {
  const { houses } = useHouses();
  // const { houses, loading } = useHouses();
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <span className="loading loading-spinner loading-lg text-primary"></span>
  //     </div>
  //   );
  // }
  return (
    <>
      <div className={`${className} py-6 max-w-[95%] relative top-14`}>
        <div className="flex flex-wrap justify-center gap-6">
          {houses.map((h) => (
            <div className="" key={h.id}>
              <UnitInfoCard
                className=""
                unit_number={h.unit_number}
                client_surname={h.client_surname}
                client_contact_number={h.client_contact_number}
                notes={h.notes}
                areas={h.areas}
                surfaces={h.allSurfaces}
                selected_tiles={h.selectedTiles.map((t) => t.description)}
              />
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Overview;
