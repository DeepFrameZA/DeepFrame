import Navbar from "../../components/Navbar";

const Home = () => {
  return (
    <>
      <Navbar
        content={
          <>
            <div class="min-h-screen flex flex-col overflow-hidden">
              <main class="flex-1 flex">
                <section class="flex-1 border-l"></section>
                <section class="h-full border-r shrink-0 grid grid-cols-5 grid-rows-5">
                  <div class="col-span-3 row-span-3 border">1</div>

                  <div class="col-start-4 col-span-2 row-span-2 border">2</div>

                  <div class="col-start-4 row-start-3 col-span-1 row-span-1 border">
                    3
                  </div>

                  <div class="col-start-5 row-start-3 col-span-1 row-span-1 border">
                    4
                  </div>

                  <div class="col-start-4 col-span-2 row-start-4 row-span-2 border">
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
