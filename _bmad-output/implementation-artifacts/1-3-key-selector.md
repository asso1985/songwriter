# Story 1.3: Key Selector

Status: done

## Story

As a **user**,
I want to select a musical key to start exploring chords,
So that the chord graph is initialized with the right harmonic context for my music.

## Acceptance Criteria

1. **Initial state — centered and prominent** — When the app loads with no key selected, the key selector is displayed centered in the graph area. No graph nodes are visible yet.

2. **Key selection dispatches Redux action** — When the user selects a key root (C, C#, D, D#, E, F, F#, G, G#, A, A#, B) and quality (Major / Minor), the graph area dispatches `progression/setCurrentKey` with the selected key. The key selector transitions to a compact display in the top-left corner showing the current key (e.g., "G Major").

3. **Compact state allows key changes** — When a key has been selected and the compact key selector is visible, clicking it expands to allow changing the key. Selecting a new key updates the Redux state.

4. **Keyboard accessible** — The key selector uses Radix UI Select component, is fully navigable via keyboard (arrow keys to browse, Enter to select), and has `aria-label="Select musical key"`.

5. **Tests cover all states** — Unit tests for: initial centered state, key selection dispatching action, compact display after selection, key change flow. E2E test for the full key selection journey.

## Tasks / Subtasks

- [x] Task 1: Add `setCurrentKey` reducer to progression slice (AC: #2)
  - [x] Add `setCurrentKey` reducer accepting a key string (e.g., "C Major", "G Minor")
  - [x] Add `selectCurrentKey` selector
  - [x] Add `startEditingKey` action and `selectIsEditingKey` selector for state coordination
  - [x] Export actions and selectors from the slice
  - [x] Write tests: 5 tests verifying reducers and selectors

- [x] Task 2: Create KeySelector component — initial state (AC: #1, #4)
  - [x] Create `apps/web/src/features/key-selector/key-selector.tsx`
  - [x] Build key root selector using Radix UI `Select` with 12 chromatic notes
  - [x] Build quality selector (Major / Minor) using Radix UI `Select`
  - [x] Initial state: centered in graph area, prominent sizing
  - [x] Add `aria-label="Select musical key"` to the component group
  - [x] Write tests: renders centered, shows selectors, has accessible label

- [x] Task 3: Implement key selection and state transition (AC: #2, #3)
  - [x] On key + quality selection, dispatch `progression/setCurrentKey`
  - [x] Transition from centered (graphArea) to compact (topBar) using shared Redux state
  - [x] Compact display shows current key label and is clickable via `startEditingKey`
  - [x] Write tests: compact renders, click triggers editing mode

- [x] Task 4: Integrate into app shell (AC: #1, #2, #3)
  - [x] Pass KeySelectorCentered as `graphArea` and KeySelector (compact) as `topBar`
  - [x] AppContent reads `currentKey` from Redux to determine which state to show
  - [x] Updated `apps/web/src/app.tsx` with AppContent component
  - [x] Write tests: 5 app-level tests covering both states

- [x] Task 5: E2E test for key selection journey (AC: #5)
  - [x] Create `apps/web/e2e/key-selector.spec.ts` — 5 E2E tests
  - [x] Test: full journey (load → select G Major → compact → change key)
  - [x] Test: keyboard navigation (focus, Enter to open, Enter to select)
  - [x] Test: accessibility attributes (group label, combobox roles)

- [x] Task 6: Run full test suite and verify (AC: #5)
  - [x] `pnpm turbo run check-types` — all pass
  - [x] `pnpm turbo run test` — 50 unit tests pass (Stories 1.1 + 1.2 + 1.3)
  - [x] `pnpm turbo run build` — succeeds
  - [x] `pnpm turbo run test:e2e` — 13 E2E tests pass

### Review Findings

- [x] [Review][Patch] Added cancel button and `stopEditingKey` action — user can abort key change and keep old key
- [x] [Review][Patch] Key prop forces remount of KeySelectorExpanded — local root/quality state resets on re-open
- [x] [Review][Patch] GraphAreaContent shows "Chord graph for {key} will appear here" after selection — no blank area
- [x] [Review][Defer] Duplicate hasKey/selector logic across 3 components — acceptable for now, refactor when more features are added — deferred

## Dev Notes

### Architecture Compliance

- **Feature location:** `apps/web/src/features/key-selector/` — the key selector is its own feature, NOT in `components/shared/` (it's feature-specific)
- **File naming:** `kebab-case` — `key-selector.tsx`, `key-selector.test.tsx`
- **Component naming:** `PascalCase` — `KeySelector`
- **Co-located tests:** `key-selector.test.tsx` next to `key-selector.tsx`
- **Redux communication only:** Features communicate through Redux store — no direct imports between features

### Redux Integration

The progression slice already exists at `apps/web/src/store/slices/progression-slice.ts` with:
```typescript
interface ProgressionState {
  chords: string[];
  currentKey: string;  // Initially ""
}
```

Add these to the existing slice — do NOT create a new slice:
- **Reducer:** `setCurrentKey(state, action: PayloadAction<string>)` — sets `state.currentKey = action.payload`
- **Selector:** `selectCurrentKey(state: RootState) => state.progression.currentKey`
- **Action naming:** `progression/setCurrentKey` (follows `domain/verb` convention)

### Radix UI Select — Usage Pattern

```typescript
import { Select } from "radix-ui";

// CORRECT — unified package import
<Select.Root value={value} onValueChange={handleChange}>
  <Select.Trigger aria-label="Select musical key" className="...tailwind classes...">
    <Select.Value placeholder="Choose a key" />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content className="...tailwind classes...">
      <Select.Viewport>
        <Select.Item value="C">
          <Select.ItemText>C</Select.ItemText>
        </Select.Item>
        {/* ... more items */}
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

Style entirely with Tailwind utility classes. Radix handles ARIA attributes and keyboard navigation automatically.

### Key Data — Musical Keys

12 chromatic root notes: `C, C#, D, D#, E, F, F#, G, G#, A, A#, B`
2 qualities: `Major, Minor`
Format: `"{root} {quality}"` — e.g., `"G Major"`, `"Bb Minor"`

Define the key data as a constant in the key-selector feature directory (not in shared types — this is UI-specific data).

### Visual States

**Initial (no key selected):**
- Centered in graph area (`graphArea` slot of Layout)
- Prominent sizing — large text, generous padding
- Background matches surface (#FAFAF8) with subtle visual invitation
- Two selectors side-by-side: root note + quality

**Compact (key selected):**
- Positioned in the header (`topBar` slot of Layout)
- Shows current key as a clickable label (e.g., "G Major")
- Clicking expands to allow changing the key
- Styled as a compact button/badge with primary colors

**Transition:**
- 250-300ms ease-out animation from centered → compact
- Use CSS transitions or Tailwind `transition-all duration-300 ease-out`

### Layout Integration

The Layout component in `apps/web/src/components/shared/layout.tsx` accepts:
```typescript
interface LayoutProps {
  topBar?: ReactNode;
  graphArea?: ReactNode;
  progressionBar?: ReactNode;
}
```

**Before key selection:** Pass the KeySelector as `graphArea` (centered in main area). Leave `topBar` as default placeholder.

**After key selection:** Pass compact KeySelector as part of `topBar`. The `graphArea` will be empty (placeholder for Story 1.4's chord graph).

### App.tsx Wiring

The current `app.tsx` structure:
```typescript
<ErrorBoundary fallback={...}>
  <DesktopGate>
    <Layout />
  </DesktopGate>
</ErrorBoundary>
```

Update to read `currentKey` from Redux and conditionally pass KeySelector to the correct Layout slot.

### Testing Strategy

**Unit tests (Vitest):**
- Progression slice: `setCurrentKey` reducer, `selectCurrentKey` selector
- KeySelector component: renders initial state, handles selection, transitions to compact, handles key change
- Integration: app renders correctly in both states

**E2E tests (Playwright):**
- Full key selection journey: load → select → compact → change
- Keyboard navigation: Tab to selector, arrow keys, Enter to select

### Previous Story Learnings (1.1 + 1.2)

- Use `@vitejs/plugin-react` v6 for Vite 8
- `tsconfig.build.json` excludes `__tests__/` for build
- Exclude `e2e/**` from vitest config
- Radix UI: import from unified `radix-ui` package, NOT `@radix-ui/react-*`
- Tailwind v4: CSS-first config in `@theme`, no `tailwind.config.js`
- Top-level ErrorBoundary wraps entire app
- Layout uses semantic HTML with skip links and tabindex
- Shared components: Button (3 variants), ErrorBoundary, Layout, DesktopGate
- `@testing-library/user-event` available for interaction tests

### Anti-Patterns to Avoid

- Do NOT put the KeySelector in `components/shared/` — it's a feature component
- Do NOT create a new Redux slice — extend the existing `progression-slice.ts`
- Do NOT use `useEffect` + `fetch` for any data — use Redux patterns
- Do NOT override Radix UI ARIA attributes — they handle accessibility automatically
- Do NOT use individual `@radix-ui/react-select` — use unified `radix-ui` package
- Do NOT create `tailwind.config.js` — Tailwind v4 uses CSS-first `@theme`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Redux State Shape, Component Structure, Naming Patterns, Data Flow]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Key Selector anatomy, states, transitions, accessibility]
- [Source: _bmad-output/implementation-artifacts/1-2-design-system-and-app-shell.md — Layout component interface, established patterns, review findings]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Added `isEditingKey` to progression slice to coordinate state between KeySelector (compact in topBar) and KeySelectorCentered (expanded in graphArea) — separate local `isChanging` state didn't work because the two components don't share state
- Radix UI Select has `hasPointerCapture` issues in jsdom — adjusted unit tests to avoid clicking Select portals, relying on E2E tests for full interaction coverage
- Used `exact: true` in E2E tests for Playwright `getByRole("option", { name: "C" })` to avoid matching "C#"
- Updated store test to include `isEditingKey: false` in expected initial state

### Completion Notes List
- Added `setCurrentKey`, `startEditingKey` reducers and `selectCurrentKey`, `selectIsEditingKey` selectors to progression slice
- Created KeySelector feature with 3 sub-components: KeySelectorExpanded (centered, two Radix Select dropdowns), KeySelectorCompact (button in top bar), KeySelectorCentered (wrapper for graph area)
- Integrated into app shell via AppContent component that reads Redux state to determine which Layout slots to populate
- Full keyboard accessibility via Radix UI Select primitives (arrow keys, Enter, Tab)
- 50 unit tests + 13 E2E tests all pass

### File List
- apps/web/src/store/slices/progression-slice.ts (modified — added setCurrentKey, startEditingKey, isEditingKey, selectors)
- apps/web/src/store/slices/progression-slice.test.ts (new — 5 tests)
- apps/web/src/features/key-selector/key-selector.tsx (new — KeySelector, KeySelectorCentered, KeySelectorExpanded, KeySelectorCompact)
- apps/web/src/features/key-selector/key-selector.test.tsx (new — 9 tests)
- apps/web/src/app.tsx (modified — AppContent component with Redux-driven layout slots)
- apps/web/src/__tests__/app.test.tsx (modified — 5 tests covering both key states)
- apps/web/src/__tests__/store.test.ts (modified — added isEditingKey to expected state)
- apps/web/e2e/app.spec.ts (modified — updated for key selector in graph area)
- apps/web/e2e/key-selector.spec.ts (new — 5 E2E tests)

### Change Log
- 2026-04-13: Story 1.3 implemented — Key Selector with Radix UI Select, Redux integration, two visual states, full keyboard accessibility
