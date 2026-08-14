const SearchBar = ({ className = "" }) => {
  return (
    <>
      <div className={`${className} join`}>
        <label className="input floating-label focus-within:outline-0 dark:focus-within:border-[#414342] focus-within:border-[#d2d2d2] focus-within:shadow-none">
          <span className="dark:text-[#414342] text-[#d2d2d2]">Search</span>
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input className="" type="search" required placeholder="Search" />
        </label>
        <div className="border border-base-300">
          <button className="btn join-item focus:outline-0">Search</button>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
