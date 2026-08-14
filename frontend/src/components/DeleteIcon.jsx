const DeleteIcon = ({ className = "" }) => {
  const pathClass = "";

  return (
    <>
      <svg
        className={` ${className}`}
        viewBox="0 0 16 16"
        version="1.1"
        id="svg2"
        xmlspace="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlnssvg="http://www.w3.org/2000/svg"
      >
        <defs id="defs2" />
        <g id="g2" transform="scale(16)">
          <path
            className={pathClass}
            d="M 0.55249023,0.39998372 V 0.79996745 H 0.6574707 V 0.39998372 Z"
            id="path5"
          />
          <path
            className={pathClass}
            d="M 0.3425293,0.39998372 V 0.79996745 H 0.44750977 V 0.39998372 Z"
            id="path4"
          />
          <path
            className={pathClass}
            d="M 0.23746745,0 V 0.20003255 H 0 v 0.0999349 H 0.13248698 V 1 H 0.86751302 V 0.29996745 H 1 V 0.20003255 H 0.76253255 V 0 Z M 0.3425293,0.10001628 H 0.6574707 V 0.20003255 H 0.3425293 Z M 0.23746745,0.29996745 h 0.5250651 v 0.60001627 h -0.5250651 z"
            id="path3"
          />
        </g>
      </svg>
    </>
  );
};

export default DeleteIcon;
