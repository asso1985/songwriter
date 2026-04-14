# Story 3.2: Flow Mode Emoji Cues

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to see emoji cues on chord nodes that quickly indicate the character of each chord move (safe, bold, colorful),
so that I can scan options rapidly during creative flow without needing to read explanations.

## Acceptance Criteria

1. **Emoji on hover** — When the user hovers over a chord node, an emoji cue fades in at the top-right of the node indicating the chord's character. Emojis: thumbs up (safe/natural), fire (bold), sparkle (colorful/unusual).

2. **Scan across nodes** — Emoji cues appear on each hovered node without requiring a click. Cues from previously hovered nodes fade out when hover leaves.

3. **Distance-based emoji assignment** — The emoji accurately reflects harmonic distance: distance 0-1 = 👍 (safe), distance 2 = 🔥 (bold), distance 3+ = ✨ (colorful/adventurous).

4. **Works in both modes** — Emoji cues appear on hover in both Flow Mode and Learn Mode. They are not exclusive to Flow Mode.

5. **Flow Mode is default** — When the app loads, Flow Mode is active (already the case — `ai-slice` initialState has `mode: "flow"`).

6. **Tests** — Unit tests for emoji assignment logic. E2E test verifying hover doesn't crash.

## Tasks / Subtasks

- [x] Task 1: Create emoji mapping utility (AC: #3)
  - [x] Created `chord-emoji.ts` with `getChordEmoji(distance)` — 🏠/👍/🔥/✨/🌈 by distance
  - [x] 5 unit tests verifying each distance band

- [x] Task 2: Render emoji on hovered node in canvas (AC: #1, #2)
  - [x] Emoji drawn at `(nx + r*0.6, ny - r*0.6)` when `isHovered && !isPreviewing`
  - [x] Uses `14px sans-serif` font for system emoji rendering
  - [x] Appears with hover, disappears when hover leaves

- [x] Task 3: Populate ai-slice with mode actions (AC: #4, #5)
  - [x] Added `setMode` reducer and `selectMode` selector to ai-slice
  - [x] 4 unit tests: default flow, set learn, set flow, selector

- [x] Task 4: E2E test and full verification (AC: #6)
  - [x] Created `e2e/emoji-cues.spec.ts` — 2 E2E tests
  - [x] `pnpm turbo run check-types` — all pass
  - [x] `pnpm turbo run test` — 186 unit tests pass
  - [x] `pnpm turbo run build` — succeeds
  - [x] `pnpm turbo run test:e2e` — 41 E2E tests pass

## Dev Notes

### Architecture Compliance

- **Feature location:** Emoji mapping in `features/chord-graph/` (it's a graph rendering concern)
- **Redux:** Extend existing `ai-slice.ts` in `store/slices/` with mode actions
- **Canvas rendering:** Emoji drawn as text on the canvas, not as DOM overlay
- **No API calls:** Emoji cues are client-side based on distance, no LLM needed

### Technical Requirements

**Emoji Rendering on Canvas:**
```typescript
if (isHovered) {
  const emoji = getChordEmoji(node.distance);
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, nx + r * 0.6, ny - r * 0.6);
}
```

**Emoji Mapping:**
| Distance | Emoji | Meaning |
|----------|-------|---------|
| 0 | 🏠 | Home/root chord |
| 1 | 👍 | Safe, natural move |
| 2 | 🔥 | Bold, interesting |
| 3 | ✨ | Colorful, unusual |
| 4+ | 🌈 | Adventurous, distant |

### Existing Code to Reuse

- **`graph-canvas.tsx`:** Already has `isHovered` check in render loop, node position (`nx`, `ny`), radius `r`
- **`hoveredNodeId`:** Already tracked via Redux graph-slice
- **`node.distance`:** Available on every GraphNode from force simulation
- **`ai-slice.ts`:** Has `mode: "flow" | "learn"` in initial state — just needs reducers/selectors

### Previous Story Learnings

- Canvas text rendering works well for labels (Nunito font, centered)
- Emoji rendering on canvas uses the system emoji font — use `sans-serif` as fallback
- Hover state already drives 15% scale + color change — emoji is additive

### Anti-Patterns to Avoid

- Do NOT fetch emoji from the API — use client-side distance mapping
- Do NOT create DOM overlays for emoji — draw on canvas
- Do NOT make emoji exclusive to Flow Mode — spec says both modes show emoji on hover

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Flow Mode emoji cues, hover interaction]
- [Source: apps/web/src/features/chord-graph/graph-canvas.tsx — hover rendering, node positions]
- [Source: apps/web/src/store/slices/ai-slice.ts — mode state (flow/learn)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Emoji rendered on canvas via ctx.fillText with sans-serif font (system emoji)
- Not shown when isPreviewing to avoid conflict with "+" commit button at same position

### Completion Notes List

- chord-emoji.ts: distance-to-emoji mapping (🏠👍🔥✨🌈)
- graph-canvas.tsx: emoji drawn on hovered node at top-right position
- ai-slice.ts: setMode reducer + selectMode selector (prep for Story 3.3 mode toggle)
- 9 new unit tests + 2 new E2E tests. 186 unit + 41 E2E total, all passing.

### File List

- apps/web/src/features/chord-graph/chord-emoji.ts (new)
- apps/web/src/features/chord-graph/chord-emoji.test.ts (new — 5 tests)
- apps/web/src/features/chord-graph/graph-canvas.tsx (modified — emoji rendering on hover)
- apps/web/src/store/slices/ai-slice.ts (modified — added setMode, selectMode)
- apps/web/src/store/slices/ai-slice.test.ts (new — 4 tests)
- apps/web/e2e/emoji-cues.spec.ts (new — 2 E2E tests)

### Change Log

- 2026-04-14: Story 3.2 implemented — emoji cues on hovered chord nodes, ai-slice mode actions
