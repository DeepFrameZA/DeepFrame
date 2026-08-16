const EditIcon = ({ className = "" }) => {
  const pathClass = "";

  return (
    <>
      <svg
        className={` ${className}`}
        viewBox="0 0 16 16"
        version="1.1"
        id="svg2"
        xmlSpace="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlnssvg="http://www.w3.org/2000/svg"
      >
        <defs id="defs2" />
        <g id="g4">
          <path
            className={pathClass}
            d="m 3.9695996,12.475767 h 3.4528 L 15.348,4.1076772 12.0304,0.39157403 3.9695996,8.1417432 Z m 1.6,-3.6730308 L 11.9872,2.507679 13.230401,4.106111 6.7368016,10.909439 h -1.167202 z"
            id="path2"
          />
          <path
            className={pathClass}
            d="M 16,7.9999949 V 16 H 0 V 0 H 8.0000016 V 1.5999935 H 1.6000003 V 14.399997 H 14.4 V 7.9999949 Z"
            id="edit_cover-[#1481]"
          />
        </g>
      </svg>
    </>
  );
};

export default EditIcon;
