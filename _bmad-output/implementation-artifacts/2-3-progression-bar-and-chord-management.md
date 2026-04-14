# Story 2.3: Progression Bar & Chord Management

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to see my chord progression as an interactive horizontal sequence where I can replay and remove chords,
so that I can shape my progression freely without fear of making mistakes.

## Acceptance Criteria

1. **Empty state** — When no chords have been committed, the progression bar shows placeholder text "Click a chord to start building" in muted gray (#999). Playback controls area is disabled (grayed out).

2. **Chord chips** — When one or more chords have been committed, each chord appears as a chip in left-to-right order. Chips have blue accent background (#EBF1FF) with blue text (#5B8DEF).

3. **Hover interaction** — When the user hovers over a chord chip, it lifts slightly (translateY -2px) and a small X button appears on the top-right of the chip.

4. **Click to replay** — When the user clicks a chord chip, audio replays that chord in the context of the full progression. The chip briefly pulses to indicate it was played.

5. **Remove chord** — When the user clicks the X button on a chord chip, the chord is removed immediately (no confirmation). The chip shrinks and fades out (200ms animation). Remaining chips slide to close the gap.

6. **Clear all** — When the user clicks the Clear button (far right, de-emphasized), all chips shrink and fade simultaneously (300ms). The progression resets to empty. The graph recenters on the key root chord. Playback stops if playing. No confirmation dialog.

7. **Add animation** — When a chord is committed via the graph, the new chip animates into the progression bar with a smooth 300ms transition.

8. **Tests** — Unit tests for: ProgressionBar component rendering (empty state, chips, hover, remove, clear). E2E test for progression bar interaction.

## Tasks / Subtasks

- [x] Task 1: Create ProgressionBar component with empty state (AC: #1)
  - [x] Created `apps/web/src/features/progression-builder/progression-bar.tsx`
  - [x] Reads `selectChords` from progression slice
  - [x] When empty: shows "Click a chord to start building" in muted gray
  - [x] Shows disabled Play button and BPM label placeholder

- [x] Task 2: Render chord chips (AC: #2, #7)
  - [x] Created `apps/web/src/features/progression-builder/chord-chip.tsx`
  - [x] Chips: `bg-[#EBF1FF] text-[#5B8DEF]` with rounded-md, horizontal flex layout
  - [x] Hover lifts via `hover:-translate-y-0.5 transition-all`

- [x] Task 3: Implement hover interaction with X button (AC: #3, #5)
  - [x] X button appears on hover at top-right: `w-4 h-4 rounded-full bg-red-100 text-red-500`
  - [x] X click dispatches `removeChord(index)` with `stopPropagation`
  - [x] Accessible with `aria-label="Remove {chordId}"`

- [x] Task 4: Implement click-to-replay on chip (AC: #4)
  - [x] Chip click dispatches `setSelectedNode(chordId)` → AudioEngine plays in context
  - [x] Pulse animation: brief scale 1→1.1→1 over 200ms
  - [x] Auto-clears selectedNode after 100ms so preview doesn't persist

- [x] Task 5: Implement Clear button (AC: #6)
  - [x] Clear button: `text-xs text-text-secondary hover:text-red-500`, far right
  - [x] Dispatches `clearChords()`, `setSelectedNode(null)`, `stopAll()`
  - [x] Only visible when chords exist

- [x] Task 6: Wire ProgressionBar into app shell (AC: #1, #2)
  - [x] Imported and passed `<ProgressionBar />` as `progressionBar` prop to `<Layout />`
  - [x] Updated existing E2E test for new placeholder text

- [x] Task 7: E2E test and full verification (AC: #8)
  - [x] Created `apps/web/e2e/progression-bar.spec.ts` — 4 E2E tests
  - [x] `pnpm turbo run check-types` — all pass
  - [x] `pnpm turbo run test` — 168 unit tests pass
  - [x] `pnpm turbo run build` — succeeds
  - [x] `pnpm turbo run test:e2e` — 32 E2E tests pass

### Review Findings

- [x] [Review][Patch] Fixed: ChordChip refactored from nested button to div[role="button"] + span[role="button"] for remove
- [x] [Review][Patch] Fixed: AC5/AC6/AC7 animations — remove 200ms shrink/fade via isRemoving+onTransitionEnd, clear 300ms container fade, add 300ms entry via isNew+isEntering
- [x] [Review][Patch] Fixed: setTimeout leaks — pulse uses useRef+clearTimeout with cleanup on unmount, replay uses replayTimerRef
- [x] [Review][Patch] Fixed: removed unused vi import
- [x] [Review][Patch] Fixed: replaced text-[#999] with text-text-secondary, bg-[#EBF1FF] with bg-primary-50, text-[#5B8DEF] with text-primary-500
- [x] [Review][Defer] removeChord accepts out-of-bounds index — deferred, no invalid callers
- [x] [Review][Defer] No upper bound on chords array length — deferred, acceptable for MVP
- [x] [Review][Defer] Remove button unreachable on touch devices — deferred, desktop-first MVP
- [x] [Review][Defer] Play button has no onClick — deferred, placeholder for Story 2.4

## Dev Notes

### Architecture Compliance

- **Feature location:** Create `apps/web/src/features/progression-builder/` — this is the designated feature directory from architecture doc
- **File naming:** `kebab-case` — `progression-bar.tsx`, `chord-chip.tsx`
- **Component naming:** `PascalCase` — `ProgressionBar`, `ChordChip`
- **Redux pattern:** Read from `progression` slice via `selectChords`, dispatch `removeChord`/`clearChords` (already exist)
- **No cross-feature imports:** ProgressionBar reads from Redux only, does not import from `chord-graph` or `audio-engine`
- **Co-located tests:** `progression-bar.test.tsx` and `chord-chip.test.tsx` alongside source files

### Technical Requirements

**Layout Integration:**
- `Layout` component (`components/shared/layout.tsx`) already has a `progressionBar` prop slot
- The footer is `h-16` with `px-4` padding, `border-t`, `bg-surface-elevated`
- ProgressionBar should fill this slot — use `flex items-center justify-between w-full h-full`

**App Shell Wiring:**
- `app.tsx` currently doesn't pass `progressionBar` to `<Layout />`
- Add: `progressionBar={<ProgressionBar />}` to the Layout call in `AppContent`
- ProgressionBar should render regardless of key selection (shows placeholder when empty)

**Chip Layout:**
- Horizontal flex container with `gap-2` and `overflow-x-auto` for scrolling long progressions
- Each chip is a button (semantic HTML, not div) for accessibility
- Clear button is right-aligned, separated by `ml-auto`

**Remove Animation Pattern:**
- Use CSS transitions with a `removing` state flag
- On X click: set chip to `removing` state → CSS animates opacity+width to 0 over 200ms → after transition, dispatch `removeChord(index)`
- Use `onTransitionEnd` event to trigger the actual removal

**Click-to-Replay Flow:**
1. User clicks chip → dispatch `setSelectedNode(chordId)`
2. AudioEngine detects change → plays chord in progression context
3. After short delay (~100ms), dispatch `setSelectedNode(null)` to clear preview
4. This reuses the existing AudioEngine flow without new audio code

**Clear Flow:**
1. Dispatch `clearChords()` — empties progression
2. Dispatch `setSelectedNode(null)` — clears any preview
3. Import and dispatch `stopAll` from audio-slice — stops playback
4. Graph naturally shows root chord (already centered on key root)

### Existing Code to Reuse

- **`progression-slice.ts`:** `addChord`, `removeChord`, `clearChords`, `selectChords` — all exist from Story 2.2
- **`layout.tsx`:** `progressionBar` prop slot already exists in the Layout component
- **`AudioEngine`:** Handles `selectedNode` changes automatically — chip click just sets selectedNode
- **`stopAll` from audio-slice:** Dispatch to stop playback on Clear
- **Design tokens:** `bg-surface-elevated`, `border-border`, `text-text-secondary`, `text-primary-500` all available in Tailwind config

### Integration Points

**Progression → Audio (replay):**
1. Chip click → `setSelectedNode(chordId)` dispatched
2. AudioEngine detects → plays chord with progression context
3. After brief delay → `setSelectedNode(null)` to clear preview state

**Graph → Progression (commit):**
- Already wired in Story 2.2: graph "+" button dispatches `addChord()`
- Progression bar reads `selectChords` and reactively renders new chip

**Clear → Graph:**
- `clearChords()` empties progression → graph stays on current key
- No explicit graph action needed — graph reads `selectedNode` (which is cleared)

### Testing Strategy

**Unit tests (Vitest + Testing Library):**
- ProgressionBar: empty state rendering, chip count, placeholder visibility
- ChordChip: hover state (X button visibility), click dispatch, remove dispatch
- Clear button: visibility, dispatch

**E2E tests (Playwright):**
- Full journey: select key → commit chord → chip visible in bar → remove → placeholder returns
- Clear button: commit multiple → clear → all gone

### Previous Story Learnings (Story 2.2)

- `addChord`, `removeChord`, `clearChords` already exist and tested (7 tests)
- AudioEngine bridges selectedNode → audio playback — reuse for chip click replay
- Preview glow has 150ms fade-out on dismiss — consistent with 200ms remove animation
- CSS transitions work well for chip animations (translateY, opacity, scale)
- `playSequence` handles progression context audio — triggered by selectedNode change
- Layout component has skip links for keyboard navigation to progression bar (`#progression-bar`)

### Anti-Patterns to Avoid

- Do NOT use `useEffect` for animations — use CSS transitions and `onTransitionEnd`
- Do NOT create a separate audio replay mechanism — reuse `setSelectedNode` → AudioEngine flow
- Do NOT put ProgressionBar in `components/shared/` — it's a feature component in `features/progression-builder/`
- Do NOT dispatch `removeChord` before the animation completes — animate first, then remove
- Do NOT add confirmation dialogs for remove or clear — the spec explicitly says no confirmation
- Do NOT import from `features/chord-graph/` — communicate through Redux only

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Feature structure: features/progression-builder/, Redux patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Progression bar chip design, hover X, empty state, clear]
- [Source: _bmad-output/implementation-artifacts/2-2-click-to-preview-and-commit-to-progression.md — Progression slice actions, AudioEngine integration]
- [Source: apps/web/src/components/shared/layout.tsx — progressionBar slot, footer structure]
- [Source: apps/web/src/app.tsx — AppContent layout, current prop wiring]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- ChordChip hover uses React state (isHovered) to conditionally render X button — jsdom hover+click on conditional element is fragile, tested via hover showing element + separate accessibility test
- Chip click dispatches setSelectedNode then auto-clears after 100ms setTimeout — reuses AudioEngine for replay
- Clear dispatches three actions: clearChords + setSelectedNode(null) + stopAll
- Updated existing app.spec.ts E2E test from "Progression chords will appear here" to "Click a chord to start building"

### Completion Notes List

- ProgressionBar: horizontal chip layout with placeholder empty state, disabled play button, Clear button
- ChordChip: blue accent styling, hover lift, X remove button, click-to-replay with pulse animation
- Wired into app shell via Layout progressionBar prop slot
- 11 unit tests for ProgressionBar + 4 E2E tests for progression bar interaction
- Total: 168 unit tests + 32 E2E tests passing. Build and type-check clean.

### File List

- apps/web/src/features/progression-builder/progression-bar.tsx (new)
- apps/web/src/features/progression-builder/progression-bar.test.tsx (new — 11 tests)
- apps/web/src/features/progression-builder/chord-chip.tsx (new)
- apps/web/src/app.tsx (modified — added ProgressionBar to Layout)
- apps/web/e2e/app.spec.ts (modified — updated placeholder text assertion)
- apps/web/e2e/progression-bar.spec.ts (new — 4 E2E tests)

### Change Log

- 2026-04-14: Story 2.3 implemented — progression bar with chord chips, hover X remove, click-to-replay, Clear button, wired into app shell
