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

## Deferred from: code review of 1-5-graph-zoom-controls (2026-04-14)

- getMousePos/findNodeAt not in useCallback deps — works via refs, lint-only concern
- render callback relies on refs instead of proper deps — works but fragile if refactored
- No rAF batching for rapid pan updates — optimization if jank observed on low-end machines
- Canvas not scaled for devicePixelRatio — HiDPI/Retina enhancement for later

## Deferred from: code review of 1-4-interactive-chord-network-graph (2026-04-14)

- Canvas not scaled for devicePixelRatio — blurry on HiDPI/Retina displays
- findNodeAt uses circular hit-test for all shapes — inaccurate for diamonds/triangles/hexagons
- Keyboard shortcuts intercept +/- globally — may conflict with Radix combobox; address in Epic 4 accessibility
- No unit test for useForceSimulation hook — tested indirectly via E2E; jsdom limitations
- No unit test for GraphCanvas rendering logic — Canvas 2D not testable in jsdom
- hoveredNode/selectedNode not cleared in Redux on key change — pre-existing state management gap
- D3 simulation mutates useMemo-cached objects — works in practice but violates React immutability expectations

## Deferred from: code review of 2-1-web-audio-engine-and-chord-synthesis (2026-04-14)

- AudioContext never closed on unmount — resource leak on component remount; acceptable for MVP single-page app
- stopChord does not cancel pending ADSR automation (cancelScheduledValues) — audible impact minimal
- setBpm accepts zero, negative, or NaN without validation — no consumer yet
- stopChord setTimeout uses wall-clock time vs audio-clock drift — negligible in practice
- Redux stopAll and hook stopAll are different things — semantic gap for future consumers
