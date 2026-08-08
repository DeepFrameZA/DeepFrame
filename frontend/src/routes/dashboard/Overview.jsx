import UnitInfoCard from "../../components/UnitInfoCard";
import { useHouses } from "../../hooks/supabase/context/HouseContext";
// import SearchBar from "../../components/SearchBar";

const Overview = ({ className = "" }) => {
  const { houses } = useHouses();
  // if (loading) return <span className="loading loading-spinner" />;
  return (
    <>
      <div className={`${className} py-6 max-w-[95%] lg:relative lg:top-14`}>
        {/* <SearchBar className="sticky top-0 lg:top-14 z-50 mb-6" /> */}

        <div className="flex flex-wrap justify-center gap-6">
          {houses.map((h) => (
            <div className="lg:hover-3d">
                <UnitInfoCard
                  className=""
                  key={h.id}
                  unit_number={h.unit_number}
                  client_surname={h.client_surname}
                  client_contact_number={h.client_contact_number}
                  notes={h.notes}
                  areas={h.areas}
                  surfaces={h.areas?.flatMap(a => a.surfaces || []) || []}
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
