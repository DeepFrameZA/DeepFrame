import ThemePreferences from "../../../components/theme/ThemePreferences";

const SettingsAdmin = () => {
  return (
    <>
      <section className="flex flex-col gap-6 p-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <ThemePreferences />
      </section>
    </>
  );
};

export default SettingsAdmin;
