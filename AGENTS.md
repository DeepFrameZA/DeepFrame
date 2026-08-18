# Agents Guide: DeepFrame

## Architecture
- **Frontend**: React + Vite app located in `/frontend`.
- **Backend/Database**: Supabase project. Schema and migrations are in `/supabase`.
- **Entrypoint**: `frontend/src/main.jsx`.

## Developer Commands
### Frontend
Run from `/frontend`:
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint.

### Supabase
- Supabase CLI is used for database management. Configuration is in `/supabase/config.toml`.
- Migrations are located in `/supabase/migrations`.

## Project Conventions
- **Styling**: Tailwind CSS 4 with DaisyUI.
- **State/Data**: Supabase JS client for backend interactions.
- **Routing**: `react-router` v8.
- **Structure**: 
  - Components: `frontend/src/components`
  - Hooks: `frontend/src/hooks`
  - Routes: `frontend/src/routes`

## Data Patterns & Implementation Conventions
- **Hierarchy**: `House` → `Area` → `Surface` → `Tile` (selected_tile). All nested data is enriched in `houseService.js` via `enrichHouseData()`.
- **Optimistic UI**: All mutations use local context updaters (`*Local` functions) for instant feedback, then sync via Supabase service calls wrapped in `toast.promise`.
- **Fuzzy Search**: Use `Fuse.js` (threshold ~0.4) for all searchable selectors on large catalogs (tiles, sanware, kitchenware). The `useSearch` hook wraps Fuse.js for consistent behavior.
- **Context API**: `HouseContext` provides full CRUD local updaters for all three levels (`add*Local`, `update*Local`, `delete*Local`).
- **Number Inputs**: Hide browser spinners via global CSS (`input[type=number] { -moz-appearance: textfield; }` and `::-webkit-outer-spin-button`).
- **Performance Priority**: Minimal/no animations, non-blocking interactions. Prefer native HTML elements (select, input) over heavy libraries.

## Key Files
- `frontend/src/core/HouseContext.jsx` - Central state & local mutations
- `frontend/src/core/services/houseService.js` - Supabase API & data enrichment
- `frontend/src/core/hooks/useSearch.js` - Fuse.js search abstraction
- `frontend/src/routes/management/HouseManager.jsx` - Main management UI
