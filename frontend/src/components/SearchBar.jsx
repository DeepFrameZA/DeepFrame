import ThemeSwitch from "../components/ThemeSwitch";
import SearchInput from "../components/SearchInput";

const SearchBar = ({ className = "" }) => {
  return (
    <>
      <div
        className={`${className} flex flex-row w-full h-14 justify-evenly lg:justify-center bg-base-100`}
      >
        <SearchInput className="md:ml-auto lg:ml-0" />
        <ThemeSwitch className="lg:hidden md:ml-auto md:mr-6" />
      </div>
    </>
  );
};

export default SearchBar;
