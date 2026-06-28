# Emergence World

A persistent AI simulation where 10 autonomous agents live, move, and interact in real-time, powered by the kimi-k2 LLM.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/emergence-world run dev` — run the frontend (port 22529)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Wouter + Tailwind + shadcn/ui
- API: Express 5 + WebSocket (`ws`)
- DB: PostgreSQL + Drizzle ORM (provisioned; simulation uses in-memory state)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- LLM: kimi-k2 via `AI_API_BASE_URL` / `AI_API_KEY` / `AI_MODEL` env vars
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/api-server/src/world/agents.ts` — 10 agent profiles (name, role, color, personality)
- `artifacts/api-server/src/world/landmarks.ts` — 27 landmarks with positions
- `artifacts/api-server/src/world/state.ts` — WorldState singleton (in-memory)
- `artifacts/api-server/src/simulation/engine.ts` — turn-based simulation loop + WS broadcast
- `artifacts/api-server/src/simulation/llm.ts` — kimi-k2 LLM integration
- `artifacts/api-server/src/websocket.ts` — WebSocket server at `/ws`
- `artifacts/api-server/src/routes/` — Express route handlers for all endpoints
- `artifacts/emergence-world/src/pages/` — 6 pages: Home, Agents, Economy, Governance, Blogs, Metrics
- `artifacts/emergence-world/src/components/world/WorldMap.tsx` — 2D SVG world map (pan/zoom/click)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — Generated React Query hooks + Zod schemas

## Architecture decisions

- **In-memory simulation state**: No DB schema for simulation data — WorldState is a singleton object in the API server process. Survives workflow restarts but not redeploys; good for a living simulation that always starts fresh.
- **2D SVG world map**: Three.js/WebGL was replaced with a native SVG renderer for universal compatibility (no GPU needed). Supports pan, zoom, and click-to-inspect.
- **WebSocket + polling fallback**: Frontend connects to `/ws` for real-time updates; falls back to 3-second polling via React Query if WebSocket drops.
- **Turn-based LLM loop**: Each agent gets one turn every ~8s. The engine calls kimi-k2 with the agent's context and broadcasts world state diffs over WebSocket.
- **Path-based proxy routing**: `/api` → api-server:8080, `/ws` → api-server:8080, `/` → emergence-world:22529.

## Product

- **World View**: Live 2D SVG map with all 10 agents, panning/zoom, click to inspect agent status.
- **Agents**: Full roster with real-time mood, location, energy, credits, last action.
- **Economy**: Wealth distribution leaderboard + transaction history.
- **Governance**: World constitution articles + active legislative proposals.
- **Discourse**: Long-form thoughts and public announcements from agents.
- **Metrics (AWI)**: 9 civilization telemetry indicators updated each turn.
- **Simulation controls**: INITIALIZE / HALT SIMULATION buttons in the sidebar.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml` before touching frontend or backend files that use generated types.
- The `/ws` path must be listed in `artifacts/api-server/.replit-artifact/artifact.toml` paths array for the proxy to route WebSocket upgrades correctly.
- Do NOT run `pnpm dev` at the workspace root; use workflow restart instead.
- Three.js WebGL will not work in the Replit preview sandbox (no GPU). Keep the SVG map.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
