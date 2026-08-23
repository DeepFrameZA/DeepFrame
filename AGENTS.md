# AGENTS.md — DeepFrame

Compact guidance for OpenCode sessions. Every line is something an agent would likely miss.

## Commands
- Frontend (run from `frontend/`): `npm install`, `npm run dev` (Vite),
  `npm run build`, `npm run preview`. Lint: `npm run lint` = `eslint .`.
  There is NO `--fix` script and NO test suite — do not add or invent either.
- Backend: Supabase CLI is a local devDependency (root package.json). Run it as
  `npx supabase ...` (NOT `npm supabase`, which is invalid). `npx supabase start`
  needs Docker. Schema is declarative: edit `supabase/schemas/*.sql`, then
  generate migrations with `npx supabase db diff` into `supabase/migrations/`.
  `npx supabase db reset` applies `schema_paths` in the order listed in
  `supabase/config.toml [db.migrations]`, then `seed.sql`.

## Environment
- `frontend/.env` is gitignored and there is NO `.env.example`. It must define
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (the NEW naming —
  NOT legacy `VITE_SUPABASE_ANON_KEY`). See `frontend/src/core/supabase/supabase.js`.

## Architecture (non-obvious)
- Data hierarchy: House → Area → Surface → Tile. Backend is Supabase
  (Postgres + RLS). NOTE: `frontend/src/core/Axios.jsx` points at a Django
  server (127.0.0.1:8000) and is NOT the active backend — ignore it.
- `HouseContext` (`frontend/src/core/HouseContext.jsx`) is the central store:
  enriched houses + tiles catalog + optimistic `*Local` mutators.
  `enrichHouseData()` in `houseService.js` flattens nested joins and embeds the
  full tile object per surface.
- Mutations flow through `useHouseMutations` → `handleSaveEntity`: local update
  FIRST, then Supabase call wrapped in `toast.promise`, rollback on failure.
  Deliberately NO refetch after save (speed-first). Do not add refetches.
- Auth: `AuthProvider`/`useAuth` mounted in `main.jsx`. `signUp` hard-codes
  `role: 'admin'` on the profiles insert (privilege-escalation smell — don't
  copy). `ProtectedRoute` + `withAuth.js` gate routes; `/management/*` is admin-only.
- UI: `App.jsx` → `MainView` layout with `<Outlet/>`; default route `Dashboard`.
  House CRUD happens in daisyUI `drawer-end` `CreateDrawer`/`ManageDrawer`.
  `DocumentManager`/`InventoryManager` are stubs (heading only).

## Conventions that differ from defaults
- Plain JavaScript, no TypeScript. Components: PascalCase arrow fns,
  default-export, accept `className=''` prop.
- Contexts MUST start with `/* eslint-disable react-refresh/only-export-components */`
  (flat eslint config will error otherwise).
- Styling: Tailwind 4 + daisyUI 5, custom `df_light`/`df_dark` themes. Prefer
  daisyUI components, native elements over heavy libs, minimal comments/animation.
- Searchable selectors use `useSearch` (Fuse.js, threshold 0.4). `TileCombobox`
  is the reusable tile picker.

## Gotchas / constraints
- `tiles` table is read-only to authenticated clients (service role only).
  Never send `user_id` from the client — a SECURITY DEFINER trigger auto-fills
  it and RLS enforces per-user isolation on houses/areas/surfaces.
- Bundle exceeds ~500 kB because `@supabase/supabase-js` is in the initial chunk
  (HouseProvider imports it). Lazy routes won't fix it; a manualChunks vendor
  split would.
- `client_contact_number` must be exactly 10 digits (`/^\d{10}$/`).
- Git: active work is on the `auth` branch; history is linear, no PR workflow.
