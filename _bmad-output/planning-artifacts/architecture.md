---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-04-13'
inputDocuments: ['prd.md', 'ux-design-specification.md']
workflowType: 'architecture'
project_name: 'Songwriter'
user_name: 'Omar'
date: '2026-04-13'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

29 FRs across 6 categories, all targeting MVP (Phase 1):

- **Chord Navigation & Discovery (FR1–FR7):** Interactive graph with spatial harmonic layout, zoom levels, chord type palette (major, minor, 7th, aug, dim). Architecturally, this is the most complex frontend component — requires a force-directed or pre-computed graph layout engine with smooth zoom/pan and dynamic node emphasis.
- **Progression Building (FR8–FR13):** Sequential chord selection, reorder, remove, clear. Standard list/state management but tightly coupled to graph selection and audio playback.
- **Audio Playback (FR14–FR18):** Contextual playback (chord heard *within* current progression), seamless looping, preview-before-commit. Requires a dedicated audio engine managing Web Audio API scheduling, buffer management, and playback state.
- **AI Music Theory Guidance (FR19–FR23):** Flow Mode (emoji cues) and Learn Mode (full theory). Backend LLM integration with caching. Explanations must reference harmonic context (key, chord function, relationships).
- **Accessibility (FR24–FR27):** Full keyboard navigation of graph and controls, screen reader support, non-color-dependent information display.
- **Onboarding (FR28–FR29):** Zero-friction entry, spatial metaphor must be self-evident or quickly taught.

**Non-Functional Requirements:**

- **Performance:** Graph interaction <100ms, audio onset <200ms, loop seamless, AI explanations <2s, initial load <3s, animations at 60fps
- **Security:** API keys server-side only, backend proxy with rate limiting, HTTPS enforced
- **Scalability:** 100 concurrent users baseline, caching to reduce LLM costs, client-heavy architecture minimizes server load
- **Accessibility:** WCAG 2.1 AA, 4.5:1 contrast, visual equivalents for audio content

**Scale & Complexity:**

- Primary domain: Full-stack web (frontend-heavy SPA + thin backend proxy)
- Complexity level: Medium
- Estimated architectural components: 5 major subsystems (graph engine, audio engine, AI service, state management, UI shell)

### Technical Constraints & Dependencies

- Web Audio API requires user gesture for audio context initialization — first interaction must activate audio
- Graph visualization library must support Canvas/WebGL rendering at 60fps with smooth zoom, pan, and dynamic edge rendering
- LLM API dependency for theory explanations — latency and cost must be managed through caching
- No offline requirement — always-connected assumption acceptable
- Desktop-first (1024px+ minimum) — no mobile optimization for MVP
- Solo developer with AI assistance — architecture must favor simplicity and minimize operational overhead

### Cross-Cutting Concerns Identified

- **State synchronization:** Graph position, current progression, audio playback state, and AI explanation context must stay in sync as users navigate and build
- **Accessibility:** Touches every component — graph, audio controls, AI explanations, mode toggle. Must be designed in, not bolted on
- **Audio context lifecycle:** Browser policies require careful management of audio context creation, suspension, and resumption across the entire app
- **Caching strategy:** Spans client (graph data, chord relationships) and server (AI explanation responses for common chord pairs)
- **Error handling for AI:** LLM failures must degrade gracefully — the graph and audio should work even if AI explanations are temporarily unavailable

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web (frontend-heavy SPA + thin backend proxy) based on project requirements analysis. Monorepo structure to share TypeScript types between frontend and backend.

### User Technical Preferences

- **Language:** TypeScript
- **Frontend:** React (SPA via Vite)
- **Backend:** Express (thin AI proxy)
- **Caching:** Redis (AI explanation caching)
- **Deployment:** Railway
- **Structure:** Monorepo
- **Testing:** Vitest (unit/integration), Playwright (E2E)

### Starter Options Considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Turborepo + Vite React + Express** | Matches all preferences, Vercel-native, shared types, SPA-friendly | Requires manual customization after scaffold | Selected |
| **Next.js (T3/Turbo)** | Rich ecosystem, Vercel-native | SSR/file routing unnecessary, fights SPA architecture | Rejected |
| **Vite React + Separate Express repo** | Simple per-app setup | No shared types, violates monorepo preference | Rejected |

### Selected Starter: Turborepo + Vite 8 + Express

**Rationale for Selection:**

Turborepo (v2.9) is Vercel's own monorepo tool — natural deployment alignment. Vite 8 with Rolldown provides fast builds without SSR overhead. Express stays as a thin proxy without framework opinions that conflict with the SPA architecture. Shared TypeScript packages keep chord models and API contracts in sync across frontend and backend.

**Initialization Command:**

```bash
npx create-turbo@latest songwriter --package-manager pnpm
```

Then customize the scaffold to establish the target structure.

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript across all packages
- Node.js 20.19+ (Vite 8 requirement)
- pnpm workspaces for dependency management

**Project Structure:**

```
songwriter/
├── apps/
│   ├── web/          # Vite 8 + React SPA
│   └── api/          # Express AI proxy + Redis caching
├── packages/
│   └── shared/       # Shared TypeScript types (chord models, API contracts)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**Build Tooling:**
- Vite 8 (Rolldown bundler) for frontend
- TypeScript compiler for backend
- Turborepo for orchestrated builds, caching, and task pipelines

**Testing Framework:**
- Vitest for unit and integration tests (both apps)
- Playwright for end-to-end tests

**Development Experience:**
- Turborepo `dev` pipeline runs both apps concurrently
- Vite HMR for frontend hot reloading
- pnpm workspace protocol for cross-package imports
- Turborepo remote caching available via Vercel

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State management: Redux Toolkit
- Graph visualization: D3.js + Canvas
- Data model: Static JSON bundled with frontend
- AI caching: Redis keyed by chord-pair + context
- API design: REST (Express proxy)

**Important Decisions (Shape Architecture):**
- Styling: Tailwind CSS v4
- Routing: React Router v7
- Hosting: Railway (all services)
- CI/CD: GitHub Actions

**Deferred Decisions (Post-MVP):**
- Authentication (no user accounts for MVP)
- CDN / edge caching (Railway static hosting sufficient for MVP)
- Advanced monitoring / APM tooling

### Data Architecture

| Decision | Choice | Version | Rationale |
|---|---|---|---|
| Chord relationship data | Static JSON bundled with frontend | N/A | Finite, deterministic dataset — music theory doesn't change. Zero latency, no network round-trip. |
| AI explanation caching | Redis | Railway managed | Key format: `{chordA}->{chordB}:{key}:{context_hash}`. Reduces LLM costs and hits <2s latency target for repeat queries. |
| Client state | Redux Toolkit | 2.11.x | Familiar to developer, excellent DevTools, proven at scale. Manages progression, graph view, playback state, mode toggle, and AI explanation cache. |
| Server-side persistence | None for MVP | N/A | All user state lives client-side per PRD. |

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| Authentication | Deferred | No user accounts for MVP |
| API key protection | Express proxy | All LLM calls route through backend — keys never reach client |
| Rate limiting | `express-rate-limit` | Simple middleware, sufficient for 100 concurrent users |
| CORS | Origin-locked | API accepts requests only from the frontend origin |
| HTTPS | Enforced | Railway provides this by default |

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| API style | REST | Tiny API surface — only 2 endpoints needed |
| Endpoints | `POST /api/explain`, `GET /api/health` | Explain takes chord context and returns AI explanation; health for monitoring |
| Error format | `{ error: string, code: number }` | Standardized across all endpoints |
| Graceful degradation | Frontend works without API | Graph and audio function independently; explanation panel shows retry on failure |

### Frontend Architecture

| Decision | Choice | Version | Rationale |
|---|---|---|---|
| State management | Redux Toolkit | 2.11.x | Developer familiarity, strong DevTools, structured patterns |
| Graph visualization | D3.js force layout + Canvas | 7.9.x | Force simulation maps naturally to harmonic distance; Canvas rendering hits 60fps target |
| Styling | Tailwind CSS | 4.2.x | Utility-first, fast for MVP iteration, small bundle with purging |
| Routing | React Router | 7.14.x | Standard React SPA routing, minimal routes for MVP |
| Bundle optimization | Vite 8 (Rolldown) | 8.0.x | Rust-based bundler, 10-30x faster builds |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Hosting (all services) | Railway | Single platform for frontend static site, Express API, and Redis. Always-on server eliminates cold start concerns. |
| Frontend serving | Railway static site | Serves Vite SPA build. CDN deferrable — desktop-first MVP on standard broadband. |
| Backend serving | Railway service | Always-on Express server, no cold start latency stacking with LLM calls. |
| Redis | Railway managed Redis | Same platform, built-in integration, no extra vendor. |
| CI/CD | GitHub Actions | Run Vitest + Playwright before deploy. Railway auto-deploys on push to main. |
| Monitoring | Railway built-in | Logging and metrics sufficient for MVP. Defer APM tooling. |

### Decision Impact Analysis

**Implementation Sequence:**
1. Turborepo monorepo scaffold with pnpm
2. Vite React app + Tailwind CSS + React Router setup
3. Express API with rate limiting and CORS
4. Redis connection and caching layer
5. Static chord relationship JSON data model
6. D3.js + Canvas graph engine
7. Web Audio API engine
8. Redux Toolkit state management connecting all subsystems
9. AI explanation integration (LLM proxy + caching)
10. Railway deployment configuration
11. GitHub Actions CI pipeline (Vitest + Playwright)

**Cross-Component Dependencies:**
- Redux store is the central hub — graph, audio, and AI explanation components all read/write shared state
- D3 graph selections trigger audio previews and AI explanation requests
- Redis caching sits between the Express proxy and LLM API — transparent to the frontend
- Playwright E2E tests depend on both frontend and API running together

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 5 categories — naming, structure, format, communication, process

### Naming Patterns

**Code Naming Conventions:**

| Element | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `chord-graph.tsx`, `audio-engine.ts` |
| React components | `PascalCase` | `ChordGraph`, `ProgressionPanel` |
| Functions/variables | `camelCase` | `getCurrentChord`, `harmonicDistance` |
| Redux slices | `camelCase` | `progressionSlice`, `graphSlice` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PROGRESSION_LENGTH`, `DEFAULT_KEY` |
| Types/interfaces | `PascalCase` | `ChordNode`, `ProgressionState` |

**API Naming Conventions:**

| Element | Convention | Example |
|---|---|---|
| Endpoints | `kebab-case` | `/api/explain`, `/api/health` |
| JSON fields | `camelCase` | `{ chordName, harmonicDistance, keySignature }` |
| Query params | `camelCase` | `?currentKey=G&chordId=Bbmaj7` |

### Structure Patterns

**Project Organization: By Feature**

Components, hooks, Redux slices, and tests co-located within feature directories. Shared code lives in dedicated top-level directories.

```
apps/web/src/
├── features/
│   ├── chord-graph/        # D3 Canvas graph, zoom, node interaction
│   ├── progression-builder/ # Chord sequence management
│   ├── audio-engine/       # Web Audio API playback, looping
│   ├── ai-explanation/     # Flow/Learn mode, explanation display
│   └── onboarding/         # First-use guidance
├── components/
│   └── shared/             # Buttons, modals, layout, common UI
├── utils/                  # Shared utilities
├── store/                  # Redux store configuration, root reducer
├── data/                   # Static chord relationship JSON
├── types/                  # App-wide TypeScript types (beyond shared package)
└── app.tsx                 # Root component, router setup
```

**Test File Location: Co-located**

```
features/chord-graph/
├── chord-graph.tsx
├── chord-graph.test.tsx
├── use-graph-zoom.ts
├── use-graph-zoom.test.ts
└── graph-slice.ts
```

### Format Patterns

**API Response Format:**

```typescript
// Success
{ data: T }

// Error
{ error: { message: string, code: string } }
```

**Data Formats:**
- Date/time: ISO 8601 strings in JSON (`2026-04-13T10:30:00Z`)
- Booleans: `true`/`false` (never `1`/`0`)
- Null: explicit `null` for absent optional fields, omit key for undefined

### Communication Patterns

**Redux Patterns:**

| Pattern | Convention | Example |
|---|---|---|
| Actions | `domain/verb` | `progression/addChord`, `graph/setZoomLevel` |
| Selectors | `selectX` prefix | `selectCurrentProgression`, `selectIsPlaying` |
| Async operations | `createAsyncThunk` | `ai/fetchExplanation` |
| State shape | Slice-per-domain | Each slice owns its state, no cross-slice references |

**Redux State Shape:**

```typescript
{
  progression: { chords: Chord[], currentKey: string },
  graph: { zoomLevel: number, selectedNode: string | null, viewMode: 'zoomed-in' | 'zoomed-out' },
  audio: { isPlaying: boolean, isLooping: boolean, previewChord: string | null },
  ai: { mode: 'flow' | 'learn', explanation: string | null, status: 'idle' | 'loading' | 'succeeded' | 'failed', error: string | null }
}
```

### Process Patterns

**Error Handling:**

| Scope | Pattern |
|---|---|
| React | Error Boundaries at feature level — graph crash doesn't kill audio |
| API errors | Caught in `createAsyncThunk`, stored in slice as `{ error: string \| null }` |
| User-facing | Friendly message in UI, technical detail in `console.error` |
| AI unavailable | Explanation panel shows "Unable to load explanation" + retry. Graph and audio unaffected. |

**Loading States:**

| Pattern | Convention |
|---|---|
| Per-slice status | `status: 'idle' \| 'loading' \| 'succeeded' \| 'failed'` (standard RTK) |
| No global spinner | Each subsystem manages its own loading state |
| Skeleton/placeholder | Feature components render placeholder UI during `loading` state |

### Enforcement Guidelines

**All AI Agents MUST:**

- Follow naming conventions exactly as specified — no exceptions for "personal preference"
- Co-locate test files with their source files
- Organize new code within the correct feature directory
- Use the standardized API response format for all endpoints
- Use `createAsyncThunk` for all async operations — no raw `fetch` in components
- Keep Redux slices self-contained — no cross-slice state access

**Anti-Patterns:**

- Creating a `helpers/` directory (use `utils/`)
- Putting feature-specific components in `components/shared/`
- Using `useEffect` + `fetch` instead of Redux async thunks for API calls
- Mixing `snake_case` in JSON responses
- Creating global loading state that blocks the entire UI

## Project Structure & Boundaries

### Complete Project Directory Structure

```
songwriter/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions: Vitest + Playwright
├── Dockerfile.web                    # Multi-stage build for Vite SPA
├── Dockerfile.api                    # Multi-stage build for Express API
├── docker-compose.yml                # All services: web, api, redis
├── docker-compose.dev.yml            # Dev overrides: volume mounts, hot reload
├── .dockerignore
├── apps/
│   ├── web/                          # Vite 8 + React SPA
│   │   ├── public/
│   │   │   └── favicon.svg
│   │   ├── src/
│   │   │   ├── app.tsx               # Root component, router setup
│   │   │   ├── main.tsx              # Entry point, Redux provider
│   │   │   ├── index.css             # Tailwind directives
│   │   │   ├── features/
│   │   │   │   ├── chord-graph/
│   │   │   │   │   ├── chord-graph.tsx
│   │   │   │   │   ├── chord-graph.test.tsx
│   │   │   │   │   ├── graph-canvas.tsx        # D3 + Canvas rendering
│   │   │   │   │   ├── graph-canvas.test.tsx
│   │   │   │   │   ├── graph-slice.ts          # Redux: zoom, selectedNode, viewMode
│   │   │   │   │   ├── graph-slice.test.ts
│   │   │   │   │   ├── use-graph-zoom.ts
│   │   │   │   │   └── use-graph-zoom.test.ts
│   │   │   │   ├── progression-builder/
│   │   │   │   │   ├── progression-builder.tsx
│   │   │   │   │   ├── progression-builder.test.tsx
│   │   │   │   │   ├── chord-chip.tsx           # Individual chord in sequence
│   │   │   │   │   ├── progression-slice.ts     # Redux: chords[], currentKey
│   │   │   │   │   └── progression-slice.test.ts
│   │   │   │   ├── audio-engine/
│   │   │   │   │   ├── audio-engine.tsx
│   │   │   │   │   ├── audio-engine.test.tsx
│   │   │   │   │   ├── audio-slice.ts           # Redux: isPlaying, isLooping, previewChord
│   │   │   │   │   ├── audio-slice.test.ts
│   │   │   │   │   ├── use-audio-context.ts     # Web Audio API lifecycle
│   │   │   │   │   └── use-audio-context.test.ts
│   │   │   │   ├── ai-explanation/
│   │   │   │   │   ├── ai-explanation.tsx
│   │   │   │   │   ├── ai-explanation.test.tsx
│   │   │   │   │   ├── ai-slice.ts              # Redux: mode, explanation, status
│   │   │   │   │   ├── ai-slice.test.ts
│   │   │   │   │   ├── flow-mode-cue.tsx        # Emoji/icon cues
│   │   │   │   │   └── learn-mode-panel.tsx     # Full theory display
│   │   │   │   └── onboarding/
│   │   │   │       ├── onboarding.tsx
│   │   │   │       └── onboarding.test.tsx
│   │   │   ├── components/
│   │   │   │   └── shared/
│   │   │   │       ├── button.tsx
│   │   │   │       ├── modal.tsx
│   │   │   │       ├── error-boundary.tsx
│   │   │   │       └── layout.tsx
│   │   │   ├── store/
│   │   │   │   ├── index.ts             # configureStore, root reducer
│   │   │   │   └── hooks.ts             # Typed useAppDispatch, useAppSelector
│   │   │   ├── data/
│   │   │   │   └── chord-relationships.json  # Static harmonic graph data
│   │   │   ├── utils/
│   │   │   │   ├── music-theory.ts       # Key detection, chord classification
│   │   │   │   └── music-theory.test.ts
│   │   │   └── types/
│   │   │       └── index.ts              # App-wide types beyond shared package
│   │   ├── e2e/
│   │   │   ├── chord-discovery.spec.ts   # Playwright: core user journey
│   │   │   ├── audio-playback.spec.ts
│   │   │   └── flow-learn-toggle.spec.ts
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── playwright.config.ts
│   │   └── package.json
│   └── api/                            # Express AI proxy
│       ├── src/
│       │   ├── index.ts                 # Express app entry point
│       │   ├── routes/
│       │   │   ├── explain.ts           # POST /api/explain
│       │   │   └── health.ts            # GET /api/health
│       │   ├── middleware/
│       │   │   ├── rate-limit.ts        # express-rate-limit config
│       │   │   ├── cors.ts              # Origin-locked CORS
│       │   │   └── error-handler.ts     # Standardized error responses
│       │   ├── services/
│       │   │   ├── llm-service.interface.ts  # Shared LLM service contract
│       │   │   ├── llm-service.ts            # Real LLM implementation
│       │   │   ├── llm-service.mock.ts       # Deterministic mock for E2E/CI
│       │   │   ├── llm-service.factory.ts    # Selects real/mock via LLM_PROVIDER env
│       │   │   └── cache-service.ts          # Redis caching layer
│       │   └── config/
│       │       └── index.ts             # Environment config
│       ├── tests/
│       │   ├── routes/
│       │   │   ├── explain.test.ts
│       │   │   └── health.test.ts
│       │   └── services/
│       │       ├── llm-service.test.ts
│       │       └── cache-service.test.ts
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       └── package.json
├── packages/
│   └── shared/                         # Shared TypeScript types
│       ├── src/
│       │   ├── types/
│       │   │   ├── chord.ts             # ChordNode, ChordRelationship, ChordType
│       │   │   ├── progression.ts       # Progression, ProgressionChord
│       │   │   ├── api.ts               # ExplainRequest, ExplainResponse, ApiError
│       │   │   └── index.ts             # Re-exports
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── turbo.json                          # Turborepo pipeline config
├── pnpm-workspace.yaml
├── package.json                        # Root workspace config
├── .env.example                        # Template for environment variables
├── .gitignore
└── README.md
```

### Architectural Boundaries

**API Boundary:**
- Frontend → API communication: REST over HTTPS only
- Single integration point: `POST /api/explain`
- Frontend never calls LLM directly
- API response always wrapped in `{ data }` or `{ error }` format

**Component Boundaries:**
- Each feature directory is self-contained — owns its components, hooks, slice, and tests
- Features communicate only through Redux store — no direct imports between features
- `components/shared/` is the only place for cross-feature UI components
- `packages/shared` is the only place for cross-app TypeScript types

**Data Boundaries:**
- Static chord data: bundled JSON, read-only, frontend only
- Client state: Redux store, frontend only, no server sync
- AI cache: Redis, server only, transparent to frontend
- LLM API: accessed only through `llm-service.ts`, never directly from routes

### Requirements to Structure Mapping

| FR Category | Primary Location | Supporting Files |
|---|---|---|
| Chord Navigation (FR1–FR7) | `features/chord-graph/` | `data/chord-relationships.json`, `utils/music-theory.ts` |
| Progression Building (FR8–FR13) | `features/progression-builder/` | `packages/shared/types/progression.ts` |
| Audio Playback (FR14–FR18) | `features/audio-engine/` | — |
| AI Guidance (FR19–FR23) | `features/ai-explanation/` | `apps/api/routes/explain.ts`, `apps/api/services/` |
| Accessibility (FR24–FR27) | Cross-cutting | Every feature + `components/shared/` |
| Onboarding (FR28–FR29) | `features/onboarding/` | — |

### Data Flow

```
User clicks chord → graph-slice updates selectedNode
                  → audio-engine plays preview (Web Audio API)
                  → ai-slice dispatches fetchExplanation (createAsyncThunk)
                      → Express API → Redis cache check
                          → cache hit: return cached explanation
                          → cache miss: LLM API → cache result → return
                      → ai-slice stores explanation
                  → UI renders Flow cue or Learn explanation based on mode
```

### Containerization

**Docker Compose Services:**

| Service | Image | Ports | Notes |
|---|---|---|---|
| `web` | `Dockerfile.web` (multi-stage: build + nginx/static serve) | 3000 | Vite SPA static build |
| `api` | `Dockerfile.api` (multi-stage: build + node runtime) | 4000 | Express AI proxy |
| `redis` | `redis:7-alpine` | 6379 | AI explanation cache |

**Development:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` — volume mounts for hot reload, Vite HMR, no build step needed.

**Production:** Railway deploys each service from its Dockerfile. Redis as Railway managed service.

**CI:** GitHub Actions builds and tests inside containers for environment parity with production.

### Testing Strategy: LLM Mock Service

E2E and CI tests use a mock LLM service to avoid external API dependency, cost, and flakiness.

**Interface contract** (all implementations must follow):

```typescript
// apps/api/src/services/llm-service.interface.ts
interface LlmService {
  getExplanation(request: ExplainRequest): Promise<ExplainResponse>
}
```

**Service files:**

| File | Purpose |
|---|---|
| `llm-service.interface.ts` | Shared contract — both real and mock implement this |
| `llm-service.ts` | Real implementation — calls LLM API |
| `llm-service.mock.ts` | Mock — returns deterministic pre-written explanations for known chord pairs |
| `llm-service.factory.ts` | Reads `LLM_PROVIDER` env var, returns real or mock instance |

**Environment configuration:**

| Environment | `LLM_PROVIDER` | Behavior |
|---|---|---|
| Production | `real` | Calls actual LLM API |
| Development (default) | `mock` | Fast, free, deterministic |
| CI / E2E tests | `mock` | No API key needed, tests are fast and reliable |
| Local with real LLM | `real` | Developer opts in by setting env var |

### Development Workflow

| Command | What It Does |
|---|---|
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` | Start all services with hot reload |
| `pnpm turbo run test` | Run Vitest across all apps |
| `pnpm turbo run build` | Build all apps |
| `pnpm --filter web run e2e` | Run Playwright E2E tests |
| `pnpm turbo run lint` | Lint all apps |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices verified compatible — Turborepo + Vite 8 + Express + Redux Toolkit + D3.js + Tailwind CSS + React Router. Docker Compose + Railway deployment aligned. No conflicts found.

**Pattern Consistency:** Naming conventions (kebab-case files, PascalCase components, camelCase functions) follow standard React/TypeScript conventions. Redux patterns (domain/verb actions, selectX selectors, createAsyncThunk) are standard RTK. API response format consistent across endpoints.

**Structure Alignment:** Feature directories map 1:1 to PRD functional requirement categories. Docker Compose services mirror monorepo app structure. LLM service interface/factory cleanly separates real/mock implementations.

### Requirements Coverage Validation

**Functional Requirements Coverage:**

| FR Category | Architectural Support | Status |
|---|---|---|
| FR1–FR7 (Chord Navigation) | `features/chord-graph/` + D3 Canvas + static JSON | Covered |
| FR8–FR13 (Progression Building) | `features/progression-builder/` + Redux slice | Covered |
| FR14–FR18 (Audio Playback) | `features/audio-engine/` + Web Audio API synthesis | Covered |
| FR19–FR23 (AI Guidance) | `features/ai-explanation/` + Express proxy + Redis + Claude API | Covered |
| FR24–FR27 (Accessibility) | Cross-cutting — error boundaries, shared components | Covered |
| FR28–FR29 (Onboarding) | `features/onboarding/` | Covered |

**Non-Functional Requirements Coverage:**

| NFR | Architectural Support | Status |
|---|---|---|
| Graph <100ms | D3 + Canvas, static bundled data | Covered |
| Audio <200ms | Web Audio API, client-side scheduling | Covered |
| AI <2s | Redis caching, always-on Express | Covered |
| <3s load | Vite 8 Rolldown, static SPA | Covered |
| 60fps | Canvas rendering | Covered |
| API keys hidden | Express proxy, Docker env vars | Covered |
| Rate limiting | `express-rate-limit` | Covered |
| HTTPS | Railway default | Covered |
| 100 concurrent | Client-heavy, Redis caching | Covered |
| WCAG 2.1 AA | Cross-cutting concern | Covered |

### Implementation Readiness Validation

**Decision Completeness:** All critical decisions documented with verified versions. Rationale recorded for every choice. LLM provider specified (Claude via Anthropic API).

**Structure Completeness:** Full project tree with annotated files. Feature directories, shared packages, Docker configuration, CI pipeline, LLM mock service — all specified.

**Pattern Completeness:** All five pattern categories (naming, structure, format, communication, process) defined with examples and anti-patterns.

### Gap Analysis Results

**Critical Gaps:** None.

**Resolved Gaps:**

| Gap | Resolution |
|---|---|
| LLM provider unspecified | Claude via Anthropic API SDK |
| Audio sample strategy | Web Audio API synthesis — no stored audio files. Supports future instrument switching (guitar/piano timbre via waveform config) and chord vocabulary expansion without asset management. |

**Deferred (non-blocking):**

| Gap | Rationale for Deferral |
|---|---|
| Chord data model schema | Implementation detail — architecture only requires static JSON. Schema defined when building chord-graph feature. |

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

**Testing & DevOps**

- [x] Testing strategy defined (Vitest + Playwright)
- [x] LLM mock service for E2E/CI
- [x] Containerization (Docker Compose)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Deployment target (Railway)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clear separation of concerns — 5 independent feature subsystems communicating through Redux
- LLM abstraction from day one — testable, swappable, cost-controlled
- Single-command local dev via Docker Compose
- Web Audio API synthesis — no audio asset management, scales with new chords and instruments
- No over-engineering — thin backend, client-heavy, minimal server state

**Areas for Future Enhancement:**
- CDN for static assets if load times become an issue
- Authentication system when user accounts are introduced
- Advanced monitoring/APM beyond Railway built-in
- Chord data model schema to be detailed during implementation

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Use the LLM service interface — never call Claude API directly from routes
- Refer to this document for all architectural questions

**First Implementation Priority:**

```bash
npx create-turbo@latest songwriter --package-manager pnpm
```

Scaffold the monorepo, then customize to match the project structure defined in this document.
