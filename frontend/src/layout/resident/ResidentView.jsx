import SignOutButton from "../../components/auth/SignOutButton";

const ResidentView = () => {
  return (
    <>
      <main className="flex min-h-dvh items-center justify-center p-4">
        <div className="flex w-full max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resident</h1>

            <p className="mt-1 text-sm opacity-70">Resident view</p>
          </div>

          <SignOutButton />
        </div>
      </main>
    </>
  );
};

export default ResidentView;
