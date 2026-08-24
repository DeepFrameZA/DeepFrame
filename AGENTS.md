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
- Auth: `AuthProvider`/`useAuth` mounted in `main.jsx`. Client `signUp`
  inserts ONLY `id` + `display_name` into `profiles` — role is assigned
  server-side (profiles trigger / permissions), so never set `role` from the
  client. `signUp` requires an invite code (see Gotchas).
- `ProtectedRoute` is defined inline in `App.jsx` (not a file) and gates on
  `useAuth().role`: management routes (`DocumentManager`, `InventoryManager`)
  require `admin`; the main app requires `admin`/`contractor`/`owner`.
  `withAuth.js`'s `requireAuthSession()` is a separate server-side guard used by
  the `houseService` mutators, not for route gating.
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
- `tiles` table is read-only to authenticated clients (authenticated gets
  `select` only per `permissions.sql`; write goes through `service_role`).
  Note: `houseService.js` still exports `createTile`/`updateTile`/`deleteTile`,
  but they will fail from the browser — don't call them client-side.
- `user_id` is never sent from the client: a BEFORE INSERT trigger
  (`set_owner_user_id`, `security invoker`) fills it from `auth.uid()`, and RLS
  enforces per-user isolation on houses/areas/surfaces.
- Signup requires a valid invite code. The `before_user_created` auth hook
  (enabled in `config.toml`, `supabase/schemas/before_user_created.sql`)
  validates and consumes an `invite_codes` row; `signUp` throws if none is
  supplied. You cannot register without one.
- Bundle exceeds ~500 kB because `@supabase/supabase-js` is in the initial chunk
  (HouseProvider imports it). Lazy routes won't fix it; a manualChunks vendor
  split would.
- `client_contact_number` is validated by `validatePhone` (`utils/validation.js`)
  using `libphonenumber-js` (region `ZA`) and requires international format,
  e.g. `+27 82 123 4567`. Do NOT reimplement it as a 10-digit `/^\d{10}$/` regex.
- Git: active branch is `main` (`auth` was merged in; remote `origin/main`
  exists). No PR workflow — work lands via local merge/commit.
