const SearchInput = ({ className = "" }) => {
  return (
    <>
      <div className={`${className} flex justify-center items-center`}>
        <laber className="input border-0 dark:border dark:border-base-300 shadow-xs shadow-base-content dark:shadow-none  bg-base-200">
          <svg
            className="h-8 w-8 opacity-50"
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
        </laber>
      </div>
    </>
  );
};

export default SearchInput;
