import SignOutButton from "../../components/auth/SignOutButton";

const navigation = [
  { number: "01", label: "Overview", icon: "overview", active: true },
  { number: "02", label: "Houses", icon: "house" },
  { number: "03", label: "Residents", icon: "users" },
  { number: "04", label: "Areas", icon: "square" },
  { number: "05", label: "Surfaces", icon: "layers" },
  { number: "06", label: "Tiles", icon: "grid" },
  { number: "07", label: "Selections", icon: "document" },
];

const resourceStats = [
  { label: "Houses", value: "248", change: "+6 today", icon: "house" },
  { label: "Residents", value: "317", change: "+9 today", icon: "users" },
  { label: "Areas", value: "36", change: "No change", icon: "square" },
  { label: "Surfaces", value: "12", change: "+2 today", icon: "layers" },
  { label: "Tiles", value: "1 420", change: "+18 today", icon: "grid" },
  {
    label: "Selections",
    value: "284",
    change: "+11 today",
    icon: "document",
  },
];

const records = [
  {
    id: "H-001",
    type: "House",
    name: "Riverside House",
    information: "3 beds · 210 m²",
    status: "Active",
    updated: "Today, 10:24",
    swatch: "#d7cdbd",
  },
  {
    id: "H-002",
    type: "House",
    name: "Maple Residence",
    information: "4 beds · 320 m²",
    status: "Active",
    updated: "Today, 09:18",
    swatch: "#cbc4b8",
  },
  {
    id: "T-4401",
    type: "Tile",
    name: "Carrara White",
    information: "600 × 600 mm",
    status: "Draft",
    updated: "Today, 08:31",
    swatch: "#e4e0d8",
  },
  {
    id: "T-4402",
    type: "Tile",
    name: "Basalt Grey",
    information: "600 × 600 mm",
    status: "Active",
    updated: "Today, 07:12",
    swatch: "#777975",
  },
  {
    id: "A-2201",
    type: "Area",
    name: "Living Room",
    information: "42 m²",
    status: "Active",
    updated: "Yesterday, 16:20",
    swatch: "#d6d0c5",
  },
  {
    id: "A-2202",
    type: "Area",
    name: "Kitchen",
    information: "28 m²",
    status: "Active",
    updated: "Yesterday, 14:11",
    swatch: "#c3b8a7",
  },
  {
    id: "S-3301",
    type: "Surface",
    name: "Polished",
    information: "Porcelain",
    status: "Active",
    updated: "Yesterday, 12:03",
    swatch: "#d9d7d0",
  },
  {
    id: "R-5501",
    type: "Resident",
    name: "Emma Turner",
    information: "Owner",
    status: "Active",
    updated: "23 Apr, 09:42",
    swatch: "#bfc5bb",
  },
];

const pendingReviews = [
  { id: "H-001", area: "Kitchen", age: "2h ago", swatch: "#d9d1c5" },
  { id: "H-004", area: "Ensuite", age: "4h ago", swatch: "#c9b9a4" },
  { id: "H-006", area: "Living Room", age: "1d ago", swatch: "#8f918d" },
  { id: "S-3302", area: "Shower Wall", age: "1d ago", swatch: "#dfdcd4" },
];

const tiles = [
  { id: "TL-001", name: "Limestone", color: "#d8d0c1" },
  { id: "TL-002", name: "Sandstone", color: "#c9bca9" },
  { id: "TL-003", name: "Concrete", color: "#a6a39d" },
  { id: "TL-004", name: "Clay", color: "#a9694e" },
  { id: "TL-005", name: "Ivory", color: "#e3ddd2" },
  { id: "TL-006", name: "Graphite", color: "#555955" },
  { id: "TL-007", name: "Terrazzo", color: "#c9c1b5" },
  { id: "TL-008", name: "Forest", color: "#66776c" },
];

function Icon({ name, className = "size-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "house") {
    return (
      <svg {...common}>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-7h6v7" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4.6V20" />
      </svg>
    );
  }

  if (name === "layers") {
    return (
      <svg {...common}>
        <path d="m12 3-9 5 9 5 9-5-9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </svg>
    );
  }

  if (name === "grid" || name === "overview") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }

  if (name === "document") {
    return (
      <svg {...common}>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5M9 12h6M9 16h6" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    );
  }

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }

  if (name === "more") {
    return (
      <svg {...common}>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...common}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="4" y="4" width="16" height="16" />
    </svg>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`badge badge-sm border-0 text-[0.65rem] font-semibold uppercase ${
        active ? "bg-[#dceadf] text-[#173f2c]" : "bg-[#e7e6e2] text-[#565651]"
      }`}
    >
      {status}
    </span>
  );
}

function SearchField() {
  return (
    <label className="input h-11 w-full border-[#d8d6cf] bg-white shadow-none focus-within:border-[#214f3b] focus-within:outline-none">
      <Icon name="search" className="size-4 opacity-60" />
      <input
        type="search"
        className="grow text-xs uppercase tracking-[0.08em]"
        placeholder="Search all records"
        aria-label="Search all records"
      />
    </label>
  );
}

function CreateButton() {
  return (
    <div className="join w-full lg:w-auto">
      <button
        className="btn join-item flex-1 border-[#214f3b] bg-[#214f3b] font-medium tracking-[0.12em] text-white hover:border-[#173f2c] hover:bg-[#173f2c] lg:flex-none"
        type="button"
      >
        <Icon name="plus" className="size-5" />
        Create
      </button>
      <button
        className="btn join-item border-[#214f3b] bg-[#214f3b] px-3 text-white hover:border-[#173f2c] hover:bg-[#173f2c]"
        type="button"
        aria-label="Open create menu"
      >
        <span className="text-xs">⌄</span>
      </button>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden min-h-dvh w-60 shrink-0 flex-col border-r border-[#d6d3cb] bg-[#f8f7f2] lg:flex">
      <div className="border-b border-[#d6d3cb] px-7 py-6">
        <p className="text-2xl font-bold tracking-[-0.04em]">DeepFrame</p>
        <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.3em]">
          Admin
        </p>
      </div>

      <nav className="flex-1 px-4 py-5" aria-label="Admin navigation">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.label}>
              <button
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                  item.active ? "bg-[#214f3b] text-white" : "hover:bg-[#ebe9e2]"
                }`}
                type="button"
                aria-current={item.active ? "page" : undefined}
              >
                <span className="w-6 font-mono text-xs opacity-70">
                  {item.number}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="my-5 border-t border-[#c8c5bc]" />

        <button
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-[#ebe9e2]"
          type="button"
        >
          <span className="w-6 font-mono text-xs opacity-70">08</span>
          <span>Invitations</span>
        </button>

        <button
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-[#ebe9e2]"
          type="button"
        >
          <span className="w-6 text-center">⚙</span>
          <span>Settings</span>
        </button>
      </nav>

      <div className="space-y-5 px-7 pb-7">
        <div className="h-px w-8 bg-[#214f3b]" />
        <p className="text-[0.6rem] uppercase leading-relaxed tracking-[0.28em] opacity-60">
          Homes. People.
          <br />
          Materials. In harmony.
        </p>
        <SignOutButton />
      </div>
    </aside>
  );
}

function ResourceStats() {
  return (
    <section
      className="grid grid-cols-2 border-l border-t border-[#d6d3cb] sm:grid-cols-3 xl:grid-cols-6"
      aria-label="Resource summary"
    >
      <SignOutButton />
      {resourceStats.map((item) => (
        <button
          className="group border-b border-r border-[#d6d3cb] bg-[#faf9f5] p-4 text-left transition-colors hover:bg-white"
          type="button"
          key={item.label}
        >
          <div className="flex items-center justify-between gap-3">
            <Icon name={item.icon} className="size-5" />
            <Icon
              name="chevron"
              className="size-4 opacity-0 transition-opacity group-hover:opacity-60"
            />
          </div>
          <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.12em]">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
            {item.value}
          </p>
          <p
            className={`mt-1 text-xs ${
              item.change === "No change" ? "opacity-50" : "text-[#267346]"
            }`}
          >
            {item.change}
          </p>
        </button>
      ))}
    </section>
  );
}

function RecordFilters() {
  const filters = ["All", "Houses", "Tiles", "Areas", "Surfaces", "Residents"];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter, index) => (
        <button
          className={`btn btn-xs shrink-0 rounded-sm border-0 px-3 font-medium uppercase ${
            index === 0
              ? "bg-[#214f3b] text-white hover:bg-[#173f2c]"
              : "bg-[#eceae4] hover:bg-[#dfdcd4]"
          }`}
          type="button"
          key={filter}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

function DesktopRecordsTable() {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="table table-sm">
        <thead className="bg-[#f0eee8] text-[0.6rem] uppercase tracking-[0.08em] text-[#282824]">
          <tr>
            <th className="w-8">
              <input
                className="checkbox checkbox-xs"
                type="checkbox"
                aria-label="Select all records"
              />
            </th>
            <th>ID</th>
            <th>Type</th>
            <th>Name / title</th>
            <th>Primary info</th>
            <th>Status</th>
            <th>Updated</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr className="border-[#dedbd3] hover:bg-[#f7f5ef]" key={record.id}>
              <td>
                <input
                  className="checkbox checkbox-xs"
                  type="checkbox"
                  aria-label={`Select ${record.name}`}
                />
              </td>
              <td className="font-mono text-xs">{record.id}</td>
              <td className="text-xs opacity-65">{record.type}</td>
              <td className="font-medium">{record.name}</td>
              <td className="text-xs opacity-65">{record.information}</td>
              <td>
                <StatusBadge status={record.status} />
              </td>
              <td className="whitespace-nowrap text-xs opacity-65">
                {record.updated}
              </td>
              <td>
                <div className="flex justify-end gap-1">
                  <button
                    className="btn btn-ghost btn-xs btn-square"
                    type="button"
                    aria-label={`Edit ${record.name}`}
                  >
                    <Icon name="edit" className="size-3.5" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs btn-square"
                    type="button"
                    aria-label={`More actions for ${record.name}`}
                  >
                    <Icon name="more" className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileRecordsList() {
  return (
    <div className="divide-y divide-[#dedbd3] md:hidden">
      {records.slice(0, 5).map((record) => (
        <button
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f7f5ef]"
          type="button"
          key={record.id}
        >
          <span
            className="size-11 shrink-0 border border-black/5"
            style={{ backgroundColor: record.swatch }}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {record.name}
            </span>
            <span className="mt-0.5 block text-xs opacity-55">
              {record.id} · {record.type}
            </span>
          </span>
          <StatusBadge status={record.status} />
          <Icon name="more" className="size-4 shrink-0" />
        </button>
      ))}
    </div>
  );
}

function RecentRecords() {
  return (
    <section className="border border-[#d6d3cb] bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">
          Recent records
        </h2>
        <button
          className="btn btn-ghost btn-sm px-2 text-xs font-normal"
          type="button"
        >
          View all <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="border-y border-[#dedbd3] px-4 py-3">
        <RecordFilters />
      </div>
      <DesktopRecordsTable />
      <MobileRecordsList />
      <div className="hidden items-center justify-between border-t border-[#dedbd3] px-4 py-4 text-xs md:flex">
        <span className="opacity-60">Showing 1–8 of 142 records</span>
        <div className="join">
          {[1, 2, 3, 4].map((page) => (
            <button
              className={`btn join-item btn-xs ${page === 1 ? "border-[#214f3b] bg-[#214f3b] text-white" : "bg-white"}`}
              type="button"
              key={page}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PendingReview() {
  return (
    <section className="border border-[#d6d3cb] bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-semibold tracking-[-0.03em]">
          Pending review
        </h2>
        <button
          className="btn btn-ghost btn-xs px-1 text-[0.65rem] font-normal"
          type="button"
        >
          View all <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="divide-y divide-[#dedbd3] border-t border-[#dedbd3]">
        {pendingReviews.map((item) => (
          <button
            className="flex w-full items-center gap-3 p-3 text-left hover:bg-[#f7f5ef]"
            type="button"
            key={`${item.id}-${item.area}`}
          >
            <span
              className="size-10 shrink-0 border border-black/5"
              style={{ backgroundColor: item.swatch }}
            />
            <span className="min-w-0 flex-1">
              <span className="flex gap-2 text-xs">
                <strong>{item.id}</strong>
                <span className="truncate">{item.area}</span>
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-[#b8582f]">
                <span className="size-1.5 rounded-full bg-[#c96235]" /> Pending
                review
              </span>
            </span>
            <span className="text-[0.65rem] opacity-50">{item.age}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function TileCatalogue() {
  return (
    <section className="border border-[#d6d3cb] bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-semibold tracking-[-0.03em]">
          Tile catalogue
        </h2>
        <button
          className="btn btn-ghost btn-xs px-1 text-[0.65rem] font-normal"
          type="button"
        >
          View all <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 border-t border-[#dedbd3] p-4">
        {tiles.map((tile) => (
          <button className="group text-left" type="button" key={tile.id}>
            <span
              className="block aspect-square border border-black/5 transition-transform group-hover:-translate-y-0.5"
              style={{ backgroundColor: tile.color }}
            />
            <span className="mt-1 block font-mono text-[0.55rem]">
              {tile.id}
            </span>
            <span className="block truncate text-[0.58rem] opacity-65">
              {tile.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MobileBottomNavigation() {
  const items = [
    { label: "Home", icon: "overview", active: true },
    { label: "Houses", icon: "house" },
    { label: "Tiles", icon: "grid" },
    { label: "More", icon: "more" },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#d6d3cb] bg-[#faf9f5]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => (
        <button
          className={`flex flex-col items-center gap-1 text-[0.6rem] ${item.active ? "text-[#214f3b]" : "opacity-65"}`}
          type="button"
          key={item.label}
        >
          <Icon name={item.icon} className="size-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function AdminView() {
  return (
    <div className="min-h-dvh bg-[#efede7] text-[#171815]">
      <div className="mx-auto flex min-h-dvh max-w-[1600px] bg-[#f8f7f2] shadow-sm">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <header className="border-b border-[#d6d3cb] bg-[#faf9f5] px-4 py-4 sm:px-6 lg:px-7">
            <div className="flex items-center justify-between lg:hidden">
              <div>
                <p className="text-xl font-bold tracking-[-0.04em]">
                  DeepFrame
                </p>
                <p className="text-[0.55rem] uppercase tracking-[0.28em]">
                  Admin
                </p>
              </div>
              <button
                className="btn btn-ghost btn-square"
                type="button"
                aria-label="Open navigation"
              >
                <Icon name="menu" />
              </button>
            </div>

            <div className="hidden items-center justify-end gap-4 lg:flex">
              <div className="w-full max-w-xs">
                <SearchField />
              </div>
              <div className="h-8 w-px bg-[#d6d3cb]" />
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#242622] text-xs text-white">
                  AD
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold">Admin</p>
                  <p className="text-[0.65rem] opacity-55">DeepFrame</p>
                </div>
              </div>
            </div>
          </header>

          <main className="pb-24 lg:pb-8">
            <section className="px-4 pb-5 pt-6 sm:px-6 lg:px-7 lg:pb-7 lg:pt-8">
              <p className="text-[0.6rem] uppercase tracking-[0.26em] opacity-55">
                Housing development operations
              </p>
              <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                    Records / Overview
                  </h1>
                  <p className="mt-2 max-w-xl text-sm opacity-60">
                    Manage houses, tiles, areas, surfaces and resident
                    selections.
                  </p>
                </div>
                <div className="lg:hidden">
                  <SearchField />
                </div>
                <CreateButton />
              </div>
            </section>

            <div className="px-4 sm:px-6 lg:px-7">
              <ResourceStats />
            </div>

            <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-7 lg:py-6">
              <RecentRecords />
              <aside className="space-y-4">
                <PendingReview />
                <TileCatalogue />
              </aside>
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNavigation />
    </div>
  );
}

export default AdminView;
