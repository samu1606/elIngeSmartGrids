# AGENTS.md

## Monorepo structure

```
elinge-smartgrids/
├── frontend/          # Next.js 16 App Router (TypeScript + Tailwind v4)
├── backend/           # FastAPI (Python 3.11) — stateless calc microservice
└── docker-compose.yml # orchestration for Dokploy deploy
```

Boundaries:
- `frontend/` owns the UI, routing, Supabase auth, and DB reads/writes.
- `backend/` is a pure calculation API: no DB, no auth, stateless. Only called via `POST /api/calculos/*`.
- `calculos_log.md` (repo root) is the API contract between backend and frontend — full request/response schemas for all 7 endpoints.
- Supabase (external) is the source of truth for auth, profiles, and all business data.

## Dev commands

```bash
# Frontend (runs on localhost:3000)
cd frontend && npm run dev

# Backend (runs on localhost:8000)
cd backend && uvicorn app.main:app --reload --port 8000
# Or from backend/ with venv active:
source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Docker Compose (full stack, production-like)
docker compose up --build
# Ports: frontend → :3005, backend → :8005
```

**No test commands exist** — there are no test files in either package.

## Critical framework gotchas

### Tailwind CSS v4 (NOT v3)
- No `tailwind.config.ts` — config lives in `globals.css` via `@theme { ... }`.
- PostCSS uses `@tailwindcss/postcss`, not the old `tailwindcss` plugin.
- Custom colors use `--color-*` syntax in `@theme` (e.g., `--color-primary-green: #1DB954`).
- Do NOT install `tailwind.config.ts` or old plugin syntax.

### Next.js 16 (not 14/15)
- Breaking changes from Next 14/15. See `frontend/AGENTS.md` for the rule about checking `node_modules/next/dist/docs/`.
- Uses `allowedDevOrigins` in `next.config.ts` instead of older CORS/domain configs.
- Server Actions with `useActionState` for auth forms (not route handlers).

## Environment setup

Copy `frontend/.env.local.example` to `frontend/.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)

Root `.env` (for docker-compose) needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`.

## Architecture conventions

### Route groups (frontend)
- `(landing)/` — public pages (`/`)
- `(auth)/` — login/register (no layout wrapping, standalone pages)
- `(dashboard)/` — all authenticated routes under `/dashboard/*`

### Auth flow
- **Middleware** (`src/middleware.ts`): edge-level redirect — `/dashboard*` → login if no session; `/login` → dashboard if session exists.
- **Server guard** (`(dashboard)/layout.tsx`): server-side `getUser()` as fallback, fetches profile from `profiles` table.
- **Server Actions** (`(auth)/actions.ts`): `signInAction`, `signUpAction`, `signOutAction` — called from client forms via `useActionState`.

### Mock data fallback pattern
Every Supabase-dependent component follows this pattern:
```ts
try { data = await supabase.from("table").select(); }
catch { data = MOCK_DATA; setIsMock(true); }
```
When `isMock` is true, components show a "Modo Local (Mock)" badge. This lets the UI work without Supabase connected.

### API calls to backend
- URL resolved by `lib/api.ts` → `getApiUrl()`:
  - Production: `https://api.elingesmartgrids.cloud`
  - Dev: `NEXT_PUBLIC_API_URL` env var or `http://localhost:8000`
- All calls use plain `fetch()` with JSON body — no Axios or wrapping library.

### Supabase clients
- Browser: `lib/supabase/client.ts` — `createBrowserClient` for `"use client"` components.
- Server: `lib/supabase/server.ts` — `createServerClient` with Next.js cookie store for server components.
- Middleware: `lib/supabase/middleware.ts` — used in `src/middleware.ts`.

## Database notes
- RLS is enabled on all tables (`profiles`, `clients`, `projects`, `budgets`, `events`).
- All tables are scoped by `user_id` FK to `profiles(id)`.
- The full schema is documented in `planmaestroV1.md`.

## Deploy
- Dokploy on VPS Hostinger, auto-deploy from `main` branch.
- `docker-compose.yml` uses an external network `dokploy-network`.
- Backend connects to Ollama at `host.docker.internal:11434` for LLM-based normative justifications (motor endpoint only).

## UI conventions
- Spanish language throughout (UI labels, error messages).
- Colombian electrical standards: NTC 2050 (code) + RETIE (regulation).
- Icons: `lucide-react` only.
- Charts: `recharts` with `ResponsiveContainer`.
- Fonts: Inter (body) + Outfit (headings), loaded via CSS variables.
