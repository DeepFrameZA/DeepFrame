const IconFrame = ({ children, className = "size-8" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

//Chevron left
export const ChevronLeftIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="m15 18-6-6 6-6" />
  </IconFrame>
);

//Sidebar Toggle Icon
export const SidebarToggleIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
    <path d="M9 4v16"></path>
    <path d="M14 10l2 2l-2 2"></path>
  </IconFrame>
);

// Address: a folded street map.
export const AddressIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
    <path d="M9 3v15M15 6v15" />
  </IconFrame>
);
// Estate: simple entrance pillars and a double gate.
export const EstateIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="M4 21V5M20 21V5" />
    <path d="M2 5h4M18 5h4" />
    <path d="M4 10h16M4 18h16" />
    <path d="M9 10v8M15 10v8" />
  </IconFrame>
);

// Unit / building: a plain doorway with a handle.
export const UnitIdentifierIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    <path d="M3 21h18" />
    <path d="M14 12h1" />
  </IconFrame>
);

// Business: a shopfront with a simple awning.
export const BusinessIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="m3 9 2-6h14l2 6" />
    <path d="M3 9h18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="M5 12v9h14v-9" />
    <path d="M10 21v-5h4v5" />
  </IconFrame>
);

// Freestanding house: a single pitched roof.
export const HouseIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9v12h14V9" />
    <path d="M9 21v-8h6v8" />
  </IconFrame>
);

// Complex: a residential block with multiple units.
export const ComplexIcon = ({ className }) => (
  <IconFrame className={className}>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M9 7h1M14 7h1" />
    <path d="M9 11h1M14 11h1" />
    <path d="M10 21v-6h4v6" />
    <path d="M3 21h18" />
  </IconFrame>
);

// Farm: a barn with crossed doors.
export const FarmIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="m3 10 3-5 6-3 6 3 3 5" />
    <path d="M4 9v12h16V9" />
    <path d="M8 21v-8h8v8" />
    <path d="m8 13 8 8M16 13l-8 8" />
    <path d="M11 7h2" />
  </IconFrame>
);

// Office park: two staggered office buildings.
export const OfficeParkIcon = ({ className }) => (
  <IconFrame className={className}>
    {/* Shared awning across three businesses. */}
    <path d="m2 10 2-5h16l2 5" />
    <path d="M2 10h20" />

    {/* Three adjoining shopfronts. */}
    <path d="M3 10v10h18V10" />
    <path d="M9 10v10M15 10v10" />

    {/* Individual entrances. */}
    <path d="M6 16v4M12 16v4M18 16v4" />
  </IconFrame>
);

// Other: a location marker for an uncategorized property.
export const OtherPropertyIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </IconFrame>
);

// Card action: a pencil.
export const PropertyEditIcon = ({ className = "size-5" }) => (
  <IconFrame className={className}>
    <path d="m15 5 4 4" />
    <path d="m4 16 12-12a2.83 2.83 0 0 1 4 4L8 20l-5 1 1-5Z" />
  </IconFrame>
);

export const PropertiesIcon = ({ className }) => (
  <IconFrame className={className}>
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
    <path d="M9 21v-8h6v8" />
  </IconFrame>
);

export const ModalCloseIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconFrame>
  );
};
export const RevokedIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
      <path d="m9.5 9.5 5 5" />
      <path d="m14.5 9.5-5 5" />
    </IconFrame>
  );
};

export const UsedIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </IconFrame>
  );
};

export const ExpiredIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <path d="M6 2h12" />
      <path d="M6 22h12" />
      <path d="M8 2v4a4 4 0 0 0 1.17 2.83L12 12l2.83-3.17A4 4 0 0 0 16 6V2" />
      <path d="M8 22v-4a4 4 0 0 1 1.17-2.83L12 12l2.83 3.17A4 4 0 0 1 16 18v4" />
    </IconFrame>
  );
};

export const CalendarIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </IconFrame>
  );
};

export const DisabledButtonIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m6.5 6.5 11 11" />
    </IconFrame>
  );
};

export const InvitationsIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </IconFrame>
  );
};

export const UsersIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconFrame>
  );
};

export const AccessIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
    </IconFrame>
  );
};

export const PlusIcon = ({ className }) => {
  return (
    <IconFrame className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconFrame>
  );
};
