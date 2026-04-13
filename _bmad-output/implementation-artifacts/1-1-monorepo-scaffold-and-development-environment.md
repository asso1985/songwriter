# Story 1.1: Monorepo Scaffold & Development Environment

Status: done

## Story

As a **developer**,
I want a fully configured Turborepo monorepo with Vite React frontend, Express backend, shared types package, Docker Compose, CI pipeline, and deployment config,
So that all subsequent features have a consistent development and deployment foundation.

## Acceptance Criteria

1. **Monorepo structure matches architecture spec** — The project contains `apps/web` (Vite 8 + React), `apps/api` (Express), and `packages/shared` (TypeScript types) initialized via `npx create-turbo@latest songwriter --package-manager pnpm`, then customized to match the architecture document.

2. **pnpm workspaces resolve cross-package imports** — `packages/shared` exports TypeScript types that both `apps/web` and `apps/api` can import with full type checking. Verify with `pnpm turbo run build` succeeding across all packages.

3. **Docker Compose dev environment works** — Running `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` starts web (port 3000), api (port 4000), and Redis (port 6379). Vite HMR works through volume mounts. Code changes reflect without container restart.

4. **Docker Compose production build works** — `Dockerfile.web` (multi-stage: build + nginx/static serve) and `Dockerfile.api` (multi-stage: build + node runtime) build successfully. `docker compose up` runs all three services.

5. **CI pipeline configured** — `.github/workflows/ci.yml` runs TypeScript compilation, Vitest tests, and Playwright E2E tests. Pipeline fails if any check fails.

6. **Railway deployment config exists** — Configuration for deploying frontend as static site, API as service, and Redis as managed instance. HTTPS enforced on all services.

7. **Shared types package functional** — Types defined in `packages/shared/src/types/` (chord, progression, api types with initial placeholder interfaces) are importable by both apps with full TypeScript support.

## Tasks / Subtasks

- [x] Task 1: Initialize Turborepo monorepo (AC: #1)
  - [x] Run `npx create-turbo@latest songwriter --package-manager pnpm`
  - [x] Restructure to match architecture: `apps/web`, `apps/api`, `packages/shared`
  - [x] Configure `turbo.json` with build, test, lint, dev pipelines
  - [x] Configure `pnpm-workspace.yaml` for all packages

- [x] Task 2: Configure `apps/web` — Vite 8 + React SPA (AC: #1, #2)
  - [x] Set up Vite 8 with `@vitejs/plugin-react`
  - [x] Configure TypeScript with strict mode
  - [x] Install and configure Tailwind CSS v4 using `@tailwindcss/vite` plugin (CSS-first config, NOT PostCSS — v4 is a complete rewrite)
  - [x] Install `radix-ui` unified package (v1.4.3 — use `import { Toggle } from "radix-ui"` NOT `@radix-ui/react-toggle`)
  - [x] Install Redux Toolkit and configure skeleton store with typed hooks
  - [x] Install React Router v7
  - [x] Set up Vitest config
  - [x] Set up Playwright config
  - [x] Add `packages/shared` as workspace dependency and verify imports

- [x] Task 3: Configure `apps/api` — Express backend (AC: #1, #2)
  - [x] Set up Express 5 (v5.2.x — Express 5 is now the npm default, do NOT use Express 4)
  - [x] Configure TypeScript compilation
  - [x] Add `express-rate-limit` middleware
  - [x] Add CORS middleware (origin-locked)
  - [x] Add standardized error handler middleware
  - [x] Create placeholder routes: `POST /api/explain`, `GET /api/health`
  - [x] Create LLM service interface, mock implementation, and factory pattern
  - [x] Add Redis client placeholder (connection config, not full caching logic)
  - [x] Set up Vitest config
  - [x] Add `packages/shared` as workspace dependency and verify imports

- [x] Task 4: Configure `packages/shared` — TypeScript types (AC: #7)
  - [x] Create `src/types/chord.ts` — `ChordNode`, `ChordRelationship`, `ChordType` placeholder interfaces
  - [x] Create `src/types/progression.ts` — `Progression`, `ProgressionChord` placeholder interfaces
  - [x] Create `src/types/api.ts` — `ExplainRequest`, `ExplainResponse`, `ApiError` interfaces
  - [x] Create `src/types/index.ts` and `src/index.ts` re-exports
  - [x] Configure `tsconfig.json` and `package.json` for workspace consumption

- [x] Task 5: Docker Compose setup (AC: #3, #4)
  - [x] Create `Dockerfile.web` — multi-stage build (build stage with pnpm + Vite, serve stage with nginx)
  - [x] Create `Dockerfile.api` — multi-stage build (build stage with pnpm + tsc, runtime stage with node)
  - [x] Create `docker-compose.yml` — web (3000), api (4000), redis:7-alpine (6379)
  - [x] Create `docker-compose.dev.yml` — volume mounts for hot reload, Vite HMR passthrough
  - [x] Create `.dockerignore`
  - [x] Verify `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` works end-to-end

- [x] Task 6: CI pipeline (AC: #5)
  - [x] Create `.github/workflows/ci.yml`
  - [x] Configure: checkout, pnpm install, TypeScript check, Vitest, Playwright
  - [x] Use `LLM_PROVIDER=mock` for CI to avoid API key dependency
  - [x] Ensure pipeline fails on any check failure

- [x] Task 7: Railway deployment config (AC: #6)
  - [x] Create `railway.toml` or equivalent Railway config
  - [x] Document deployment setup in `.env.example`
  - [x] Configure environment variables: `LLM_PROVIDER`, `REDIS_URL`, `CORS_ORIGIN`, `PORT`

- [x] Task 8: Verify end-to-end (AC: all)
  - [x] `pnpm turbo run build` succeeds across all packages
  - [x] `pnpm turbo run test` runs (even if no real tests yet, framework executes)
  - [x] Docker Compose dev starts all services
  - [x] `GET /api/health` returns 200
  - [x] Vite dev server loads React app at localhost:3000

### Review Findings

- [x] [Review][Defer] Railway config is API-only — missing frontend static site config, Redis managed instance, and HTTPS enforcement (AC6) — deferred, will finalize during actual deployment
- [x] [Review][Patch] No input validation on `/explain` request body — added runtime validation with proper 400 response
- [x] [Review][Patch] Error handler leaks internal error messages to clients — now returns generic "Internal server error"
- [x] [Review][Patch] Rate limiter applied globally including `/api/health` — health route now registered before rate limiter
- [x] [Review][Patch] Redis client created but never used or connected — refactored to lazy singleton with `getRedisClient()` and `await client.connect()`
- [x] [Review][Patch] `corepack prepare pnpm@latest` in Dockerfiles is non-deterministic — changed to `corepack enable` (reads `packageManager` field)
- [x] [Review][Patch] Docker dev build runs unnecessary production build — added dedicated `dev` stage in Dockerfiles, dev compose targets `dev` stage
- [x] [Review][Patch] Real LLM service file renamed to `llm-service.real.ts` — naming symmetry restored
- [x] [Review][Patch] Health test now actually tests the endpoint — real HTTP request verifying 200 status and response body
- [x] [Review][Defer] CORS origin is a single string, not a list — will need allowlist for multi-origin in production — deferred, pre-existing design choice
- [x] [Review][Defer] LLM service instantiated at module load, not per-request — acceptable for now, address when adding real LLM integration — deferred
- [x] [Review][Defer] `currentKey` initialized to empty string — no consumers yet, will be addressed in Story 1.3 Key Selector — deferred
- [x] [Review][Defer] Docker Compose exposes Redis port 6379 to host — acceptable for local dev, review before production deployment — deferred

## Dev Notes

### Architecture Compliance

- **File naming:** `kebab-case` for all files (e.g., `chord-graph.tsx`, `audio-engine.ts`)
- **Project structure:** Feature-based with co-located tests (see architecture doc for full tree)
- **Package manager:** pnpm exclusively — no npm or yarn
- **Node.js:** 20.19+ required (Vite 8 requirement)

### Critical Technology Versions (Verified April 2026)

| Package | Version | Notes |
|---|---|---|
| Turborepo | 2.9.x | `npx create-turbo@latest` |
| Vite | 8.0.8 | Rolldown bundler is default. Released March 12, 2026. |
| React | 19.x | Stable. Use with `@vitejs/plugin-react` |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.2.x | **BREAKING from v3:** Complete rewrite. CSS-first config (no `tailwind.config.js`). Use `@tailwindcss/vite` plugin for Vite, NOT PostCSS. Custom tokens defined in CSS with `@theme`. No more `content` array. |
| Radix UI | 1.4.3 | **BREAKING:** Use unified `radix-ui` package. Import as `import { Toggle } from "radix-ui"` NOT `@radix-ui/react-toggle`. Tree-shakable. |
| Redux Toolkit | 2.11.x | Standard RTK patterns. `createAsyncThunk` for async ops. |
| Express | 5.2.x | **BREAKING from v4:** Express 5 is now npm default. Path route matching changes, removed deprecated methods. |
| D3.js | 7.9.0 | Stable, no recent breaking changes |
| React Router | 7.14.x | Standard SPA routing |
| pnpm | latest | Workspaces for monorepo |
| Redis | 7-alpine | Docker image for local dev |

### Tailwind CSS v4 Setup (Critical — Different from v3)

Tailwind v4 does NOT use `tailwind.config.js`. Configuration is CSS-first:

```css
/* apps/web/src/index.css */
@import "tailwindcss";

@theme {
  --color-primary-50: #EBF1FD;
  --color-primary-100: #D6E3FB;
  --color-primary-500: #5B8DEF;
  --color-primary-900: #1A3A6B;
  --color-surface: #FAFAF8;
  --color-surface-elevated: #FFFFFF;
  --color-text-primary: #2D2D2D;
  --color-text-secondary: #777777;
  --color-border: #D0CDC8;
  --font-family-sans: 'Nunito', sans-serif;
}
```

Use the `@tailwindcss/vite` plugin in `vite.config.ts`:
```typescript
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Radix UI Unified Package (Critical — Different from older docs)

Use the unified `radix-ui` package, not individual `@radix-ui/react-*` packages:
```typescript
// CORRECT (2026)
import { Toggle, Popover, Select, Tooltip, VisuallyHidden } from "radix-ui"

// WRONG (outdated)
import * as Toggle from "@radix-ui/react-toggle"
```

### Express 5 Notes

Express 5 is now the default on npm. Key differences from v4:
- Path route matching uses new algorithm
- Removed deprecated methods (`res.json(obj, status)` signature, etc.)
- Promise-based error handling — rejected promises in route handlers are automatically caught
- Use `express-rate-limit` v7+ which supports Express 5

### Redux Store Skeleton

Initialize the store with empty slices matching the architecture state shape:
```typescript
{
  progression: { chords: [], currentKey: '' },
  graph: { zoomLevel: 1, selectedNode: null, viewMode: 'zoomed-in' },
  audio: { isPlaying: false, isLooping: false, previewChord: null },
  ai: { mode: 'flow', explanation: null, status: 'idle', error: null }
}
```

Typed hooks in `store/hooks.ts`:
```typescript
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

### LLM Service Pattern

```
apps/api/src/services/
├── llm-service.interface.ts  # interface LlmService { getExplanation(req): Promise<res> }
├── llm-service.ts            # Real implementation (placeholder for now)
├── llm-service.mock.ts       # Returns deterministic responses
└── llm-service.factory.ts    # Reads LLM_PROVIDER env, returns real or mock
```

Default `LLM_PROVIDER=mock` for development and CI.

### Docker Dev Workflow

`docker-compose.dev.yml` must:
- Volume-mount `apps/web/src` into the web container for Vite HMR
- Volume-mount `apps/api/src` into the api container for nodemon/tsx watch
- Expose Vite HMR WebSocket port (typically 3000 or 24678)
- NOT run build steps — use dev servers directly

### Environment Variables

```env
# .env.example
LLM_PROVIDER=mock          # mock | real
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
PORT=4000
# LLM_API_KEY=             # Only needed when LLM_PROVIDER=real
```

### Anti-Patterns to Avoid

- Do NOT create a `helpers/` directory — use `utils/`
- Do NOT use npm or yarn — pnpm only
- Do NOT install individual `@radix-ui/react-*` packages — use unified `radix-ui`
- Do NOT create `tailwind.config.js` — Tailwind v4 uses CSS-first configuration
- Do NOT use PostCSS for Tailwind — use `@tailwindcss/vite` plugin
- Do NOT use Express 4 — Express 5 is the npm default now
- Do NOT put feature-specific components in `components/shared/`
- Do NOT use `useEffect` + `fetch` for API calls — use Redux `createAsyncThunk`

### Project Structure Notes

The full project structure is defined in the architecture document. This story creates the skeleton — empty feature directories are NOT needed yet. Only create:
- The monorepo scaffold (`apps/web`, `apps/api`, `packages/shared`)
- Configuration files (turbo.json, vite.config.ts, tsconfig files, etc.)
- Docker files
- CI pipeline
- Placeholder routes and service interfaces in API
- Redux store skeleton with empty slices in web
- Shared types package with placeholder interfaces

Subsequent stories (1.2 Design System, 1.3 Key Selector, 1.4 Graph, etc.) will create the feature directories and components.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Starter Template Evaluation, Project Structure, Containerization, Testing Strategy]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.1 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — Technical Architecture Considerations, Implementation Considerations]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design System Foundation (Tailwind + Radix UI)]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Fixed @vitejs/plugin-react peer dependency by upgrading from v4 to v6 (v6 supports Vite 8)
- Fixed TS2742 errors in API by removing `declaration: true` (private app, not consumed as package)
- Fixed tsconfig project references error by switching to single tsconfig with vitest types
- Fixed vitest picking up Playwright e2e tests by adding exclude pattern
- Fixed tsc build failing on test files by creating tsconfig.build.json that excludes __tests__

### Completion Notes List
- Turborepo monorepo initialized with apps/web, apps/api, packages/shared
- Web app: Vite 8 + React 19 + TypeScript strict + Tailwind CSS v4 (CSS-first) + Radix UI 1.4.3 + Redux Toolkit + React Router v7 + Vitest + Playwright
- API app: Express 5 + TypeScript + rate limiting + CORS + error handler + health/explain routes + LLM service factory pattern (mock/real) + Redis client placeholder
- Shared package: ChordNode, ChordRelationship, ChordType, Progression, ProgressionChord, ExplainRequest, ExplainResponse, ApiError types
- Docker: multi-stage Dockerfiles for web (nginx) and api (node), docker-compose.yml (prod), docker-compose.dev.yml (dev with volume mounts)
- CI: GitHub Actions pipeline with TypeScript check, Vitest, Playwright, LLM_PROVIDER=mock
- Railway: railway.toml with health check config
- All 10 tests pass (4 web + 6 api), full build succeeds, API health endpoint returns 200

### File List
- package.json (root monorepo config)
- pnpm-workspace.yaml
- pnpm-lock.yaml
- turbo.json
- .gitignore
- .env.example
- .dockerignore
- Dockerfile.web
- Dockerfile.api
- docker-compose.yml
- docker-compose.dev.yml
- railway.toml
- .github/workflows/ci.yml
- packages/shared/package.json
- packages/shared/tsconfig.json
- packages/shared/src/index.ts
- packages/shared/src/types/index.ts
- packages/shared/src/types/chord.ts
- packages/shared/src/types/progression.ts
- packages/shared/src/types/api.ts
- apps/web/package.json
- apps/web/index.html
- apps/web/tsconfig.json
- apps/web/tsconfig.build.json
- apps/web/tsconfig.node.json
- apps/web/vite.config.ts
- apps/web/vitest.config.ts
- apps/web/playwright.config.ts
- apps/web/nginx.conf
- apps/web/src/main.tsx
- apps/web/src/app.tsx
- apps/web/src/index.css
- apps/web/src/test-setup.ts
- apps/web/src/store/index.ts
- apps/web/src/store/hooks.ts
- apps/web/src/store/slices/progression-slice.ts
- apps/web/src/store/slices/graph-slice.ts
- apps/web/src/store/slices/audio-slice.ts
- apps/web/src/store/slices/ai-slice.ts
- apps/web/src/__tests__/app.test.tsx
- apps/web/src/__tests__/store.test.ts
- apps/web/e2e/app.spec.ts
- apps/api/package.json
- apps/api/tsconfig.json
- apps/api/vitest.config.ts
- apps/api/src/server.ts
- apps/api/src/routes/health.ts
- apps/api/src/routes/explain.ts
- apps/api/src/middleware/error-handler.ts
- apps/api/src/services/llm-service.interface.ts
- apps/api/src/services/llm-service.ts
- apps/api/src/services/llm-service.mock.ts
- apps/api/src/services/llm-service.factory.ts
- apps/api/src/services/redis-client.ts
- apps/api/src/__tests__/health.test.ts
- apps/api/src/__tests__/llm-service.test.ts
- apps/api/src/__tests__/llm-service-factory.test.ts

### Change Log
- 2026-04-13: Story 1.1 implemented — full monorepo scaffold with all 8 tasks completed
