import Navbar from "../../components/Navbar";

const Home = () => {
  return (
    <>
      <Navbar
        content={
          <>
            <div className="min-h-screen flex flex-col overflow-hidden">
              <main className="flex-1 flex">
                <section className="flex-1 border-l"></section>
                <section className="h-full border-r shrink-0 grid grid-cols-5 grid-rows-5">
                  <div className="col-span-3 row-span-3 border">1</div>

                  <div className="col-start-4 col-span-2 row-span-2 border">2</div>

                  <div className="col-start-4 row-start-3 col-span-1 row-span-1 border">
                    3
                  </div>

                  <div className="col-start-5 row-start-3 col-span-1 row-span-1 border">
                    4
                  </div>

                  <div className="col-start-4 col-span-2 row-start-4 row-span-2 border">
                    5
                  </div>
                </section>
              </main>
            </div>
          </>
        }
      />
    </>
  );
};

export default Home;
