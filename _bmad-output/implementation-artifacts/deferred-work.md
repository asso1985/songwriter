# Deferred Work

## Deferred from: code review of 1-1-monorepo-scaffold-and-development-environment (2026-04-13)

- CORS origin is a single string, not a list — will need allowlist validation for multi-origin support in production
- LLM service instantiated at module load, not per-request — acceptable for now, revisit when adding real LLM integration
- `currentKey` initialized to empty string in progression slice — no consumers yet, address in Story 1.3 Key Selector
- Docker Compose exposes Redis port 6379 to host — acceptable for local dev, lock down before production deployment
- Railway config is API-only — missing frontend static site, Redis managed instance, and HTTPS enforcement (AC6) — finalize during actual deployment

## Deferred from: code review of 1-2-design-system-and-app-shell (2026-04-13)

- ErrorBoundary has no reset mechanism — acceptable for MVP, add retry/reset in later story
- DesktopGate renders full app tree on mobile via CSS-only hiding — JS conditional rendering is optimization for later
- Self-host Nunito font for reliability — Google Fonts CDN acceptable for MVP
