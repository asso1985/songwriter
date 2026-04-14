# Story 3.3: Learn Mode Toggle & Explanation Panel

Status: done

## Story

As a **user**,
I want to toggle into Learn Mode and see AI-generated music theory explanations for my chord choices,
so that I can understand why a chord works in context and build my theory knowledge through creation.

## Acceptance Criteria

1. **Mode toggle** — Flow/Learn toggle in top-right area. Slides with 250ms ease-out. Icon changes (♪ for Flow, 📖 for Learn). Switching never interrupts audio or resets graph.

2. **Explanation panel slides in** — In Learn Mode, clicking a chord in the progression bar (or previewing on graph) slides in explanation panel from right (280px, 250ms ease-out). Graph area shrinks proportionally.

3. **Panel content** — Chord name (large, bold), "Why this works" heading, 1-2 sentence explanation, chord function card, chord character card.

4. **Loading state** — Skeleton shimmer while fetching. "Still thinking..." text after 5 seconds.

5. **Error state** — "Unable to load explanation" with retry button. Graph/audio continue normally. Error logged to console.

6. **Panel slides out** — Toggling back to Flow Mode slides panel out (250ms ease-out), graph expands.

7. **Accessibility** — Panel has `role="complementary"`, `aria-live="polite"`, focusable for keyboard users.

8. **Tests** — Unit tests for: mode toggle, fetchExplanation thunk, panel states. E2E for toggle.

## Tasks / Subtasks

- [ ] Task 1: Add fetchExplanation async thunk to ai-slice (AC: #3, #4, #5)
  - [ ] Add `createAsyncThunk` that calls `POST /api/explain` with chord context
  - [ ] Store full `ExplainResponse` in state (explanation, chordFunction, chordCharacter, emoji)
  - [ ] Handle pending → `status: "loading"`, fulfilled → `status: "idle"` + store response, rejected → `status: "error"` + store error
  - [ ] Add `selectedChordId` to AiState for tracking which chord's explanation is shown
  - [ ] Add selectors: `selectExplanation`, `selectAiStatus`, `selectAiError`, `selectSelectedChordId`
  - [ ] Unit tests: thunk states, selectors

- [ ] Task 2: Create ModeToggle component (AC: #1)
  - [ ] Create `apps/web/src/features/ai-explanation/mode-toggle.tsx`
  - [ ] Read `selectMode` from ai-slice, dispatch `setMode` on click
  - [ ] Toggle button: ♪ (Flow) / 📖 (Learn) with 250ms CSS transition
  - [ ] Label: "Flow" / "Learn" text alongside icon
  - [ ] Switching does NOT dispatch any audio or graph actions
  - [ ] Wire into app.tsx top bar (replace "Mode Toggle" placeholder)
  - [ ] Unit tests: renders, toggles mode, shows correct icon

- [ ] Task 3: Create ExplanationPanel component (AC: #2, #3, #6, #7)
  - [ ] Create `apps/web/src/features/ai-explanation/explanation-panel.tsx`
  - [ ] Only visible when `mode === "learn"` AND a chord is selected/previewed
  - [ ] Slides in from right: `transition-transform duration-250 ease-out`, `translate-x-0` when visible, `translate-x-full` when hidden
  - [ ] Width: 280px, background: `bg-surface-elevated`, border-left
  - [ ] Content: chord name (text-xl font-bold), "Why this works" heading, explanation text, function card, character card
  - [ ] `role="complementary"`, `aria-live="polite"`, `tabIndex={0}`
  - [ ] Unit tests: renders content, hides in flow mode, accessibility attributes

- [ ] Task 4: Implement loading and error states (AC: #4, #5)
  - [ ] Loading: skeleton shimmer animation (pulsing bg-gray-200 bars), chord name stays visible
  - [ ] After 5 seconds loading: show "Still thinking..." text
  - [ ] Error: "Unable to load explanation" message + Retry button
  - [ ] Retry dispatches `fetchExplanation` again
  - [ ] Error logged to `console.error` via thunk rejected handler
  - [ ] Unit tests: loading shimmer, still thinking text, error + retry

- [ ] Task 5: Wire explanation fetch to chord selection (AC: #2, #3)
  - [ ] When mode is "learn" and selectedNode changes (or chip click): dispatch `fetchExplanation`
  - [ ] ExplanationPanel reads state from ai-slice and renders accordingly
  - [ ] API URL: `http://localhost:4000/api/explain` (or env var `VITE_API_URL`)
  - [ ] Pass current key, chord, progression context, mode to the request

- [ ] Task 6: Integrate into app layout (AC: #2, #6)
  - [ ] Modify Layout component or app.tsx to render ExplanationPanel alongside graph area
  - [ ] When panel is visible, graph area gets `flex-1` and panel gets `w-[280px] shrink-0`
  - [ ] Smooth transition on graph area width change

- [ ] Task 7: E2E test and full verification (AC: #8)
  - [ ] Create `apps/web/e2e/learn-mode.spec.ts`
  - [ ] Test: mode toggle visible, clicking toggles between Flow/Learn
  - [ ] Test: app functional in both modes
  - [ ] Run full test suite

## Dev Notes

### Architecture Compliance

- **Feature location:** `apps/web/src/features/ai-explanation/` — new feature directory
- **Redux:** Extend `ai-slice.ts` with async thunk and new state fields
- **API call:** Use `createAsyncThunk` (architecture pattern) — no raw `fetch` in components
- **No cross-feature imports:** Panel reads from ai-slice via selectors

### Technical Requirements

**fetchExplanation thunk:**
```typescript
const fetchExplanation = createAsyncThunk(
  "ai/fetchExplanation",
  async (params: { chordId: string; progressionContext: string[]; key: string; mode: "flow" | "learn" }) => {
    const res = await fetch(`${API_URL}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to fetch explanation");
    const json = await res.json();
    return json.data as ExplainResponse;
  }
);
```

**Panel layout:**
```
┌─────────────────────────────────────┬──────────┐
│           Graph Area (flex-1)       │ Panel    │
│                                     │ (280px)  │
│                                     │          │
└─────────────────────────────────────┴──────────┘
```

### Existing Code to Reuse

- **`ai-slice.ts`:** Has `mode`, `status`, `error` fields + `setMode` action — extend with async thunk
- **`ExplainResponse` type:** In `packages/shared` — has explanation, chordFunction, chordCharacter
- **`selectSelectedNode`:** From graph-slice — triggers explanation fetch
- **`selectChords`/`selectCurrentKey`:** From progression-slice — provides context for API call
- **Layout component:** Can be modified to include panel slot, or panel rendered in app.tsx

### Anti-Patterns to Avoid

- Do NOT use `useEffect` + raw `fetch` — use `createAsyncThunk`
- Do NOT put the explanation panel inside the graph component — it's a separate feature
- Do NOT block the UI while loading — show skeleton shimmer
- Do NOT reset graph or audio state when toggling modes

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — createAsyncThunk pattern, ai-slice shape, feature structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Explanation panel 280px, skeleton shimmer, mode toggle]
- [Source: apps/web/src/store/slices/ai-slice.ts — current state with mode/status/error]
- [Source: packages/shared/src/types/api.ts — ExplainResponse type]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Completion Notes List

- ai-slice: fetchExplanation async thunk, selectedChordId state, pending/fulfilled/rejected handlers, 12 tests
- ModeToggle: Flow/Learn toggle button with ♪/📖 icons, 250ms transition, 4 tests
- ExplanationPanel: 280px aside with chord name, explanation, function/character cards, skeleton loading, "Still thinking..." after 5s, error+retry
- useExplanationTrigger: hook syncs graph selectedNode → ai-slice selectedChordId → fetchExplanation in Learn mode
- Wired into app.tsx: ModeToggle replaces placeholder, ExplanationPanel alongside graph area
- 199 unit + 45 E2E tests passing. Build and type-check clean.

### File List

- apps/web/src/store/slices/ai-slice.ts (modified — fetchExplanation thunk, selectedChordId, selectors)
- apps/web/src/store/slices/ai-slice.test.ts (modified — 12 tests for thunk states and selectors)
- apps/web/src/__tests__/store.test.ts (modified — added selectedChordId to expected state)
- apps/web/src/__tests__/app.test.tsx (modified — "Mode Toggle" → "Flow")
- apps/web/src/features/ai-explanation/mode-toggle.tsx (new)
- apps/web/src/features/ai-explanation/mode-toggle.test.tsx (new — 4 tests)
- apps/web/src/features/ai-explanation/explanation-panel.tsx (new)
- apps/web/src/features/ai-explanation/use-explanation-trigger.ts (new)
- apps/web/src/app.tsx (modified — ModeToggle, ExplanationPanel, useExplanationTrigger)
- apps/web/e2e/learn-mode.spec.ts (new — 4 E2E tests)
