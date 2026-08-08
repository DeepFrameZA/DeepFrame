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
