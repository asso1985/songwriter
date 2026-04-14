# Story 4.1: Keyboard Navigation & Shortcuts

Status: done

## Story

As a **keyboard-only user**,
I want to navigate and operate the entire app using keyboard shortcuts and tab navigation,
so that I can complete the full chord discovery and progression building journey without a mouse.

## Acceptance Criteria

1. **Tab order** — Tab cycles between major UI areas: top bar → graph area → progression bar → playback controls. Visible high-contrast focus ring on focused element.

2. **Arrow key graph navigation** — When graph area is focused, arrow keys move focus between chord nodes spatially. Focused node shows high-contrast focus ring. Screen reader announces chord name, type, and distance.

3. **Enter to preview/commit** — When a node is focused, Enter enters preview state (audio plays). Enter again commits to progression.

4. **Keyboard shortcuts** — Space: play/stop. M: toggle mode. +/=: zoom in. -: zoom out. Backspace: remove last chord. Escape: dismiss preview. (Some already implemented.)

5. **Skip links** — Already exist. "Skip to chord graph" and "Skip to progression" as first focusable elements.

6. **Focus indicators** — All interactive elements have visible focus ring meeting WCAG 2.1 AA contrast.

7. **No screen reader conflicts** — Shortcuts don't conflict with VoiceOver/NVDA/JAWS common shortcuts.

8. **Tests** — Unit tests for keyboard handlers. E2E tests for tab order and shortcuts.

## Tasks / Subtasks

- [ ] Task 1: Add global keyboard shortcuts handler (AC: #4)
  - [ ] Create `apps/web/src/features/keyboard-shortcuts/use-keyboard-shortcuts.ts`
  - [ ] Space: toggle play/stop (dispatch `setIsPlaying` + call `playLoop`/`stopLoop`)
  - [ ] M: toggle Flow/Learn mode (dispatch `setMode`)
  - [ ] Backspace: remove last chord (dispatch `removeChord(chords.length - 1)`)
  - [ ] +/= and - already handled in chord-graph.tsx — leave as-is
  - [ ] Escape already handled in chord-graph.tsx — leave as-is
  - [ ] Guard: skip when focus is in input/textarea/combobox
  - [ ] Mount hook in `app.tsx`
  - [ ] Unit tests: each shortcut dispatches correct action

- [ ] Task 2: Add arrow key node navigation in graph (AC: #2, #3)
  - [ ] Add `focusedNodeId` state to graph-slice (separate from selectedNode/hoveredNode)
  - [ ] When graph area receives focus (tabIndex={0}), set initial focusedNodeId to root node
  - [ ] Arrow keys: find nearest node in the pressed direction from current focusedNodeId
  - [ ] Focused node gets a distinct focus ring (e.g., 3px dashed white outline)
  - [ ] Enter on focused node: dispatch `setSelectedNode(focusedNodeId)` to trigger preview
  - [ ] Enter again while previewing: dispatch `addChord` to commit
  - [ ] Add `aria-label` to canvas describing focused node: `"{name}, {type}, distance {d}"`
  - [ ] Unit tests: arrow key navigation logic, Enter preview/commit

- [ ] Task 3: Ensure visible focus indicators on all interactive elements (AC: #1, #6)
  - [ ] Add `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2` to: key selector button, zoom buttons, mode toggle, play/stop, BPM input, tap button, clear, chord chips
  - [ ] Verify focus ring contrast meets 3:1 minimum (WCAG 2.1 AA for non-text)
  - [ ] Ensure tab order matches visual layout (already mostly correct via DOM order)

- [ ] Task 4: Make graph area keyboard-focusable (AC: #1, #2)
  - [ ] Add `tabIndex={0}` to graph container div in chord-graph.tsx
  - [ ] Add `role="application"` to graph container (signals custom keyboard handling)
  - [ ] On focus: show a visible focus outline on the graph area
  - [ ] On blur: clear focusedNodeId

- [ ] Task 5: E2E test and full verification (AC: #8)
  - [ ] Create `apps/web/e2e/keyboard-nav.spec.ts`
  - [ ] Test: Tab cycles through major UI areas
  - [ ] Test: Space toggles play (with 2+ chords)
  - [ ] Test: M toggles mode
  - [ ] Test: Escape dismisses preview
  - [ ] Run full test suite

## Dev Notes

### Architecture Compliance

- **Feature location:** Global shortcuts in new `features/keyboard-shortcuts/` directory
- **Graph keyboard nav:** Stays in `features/chord-graph/` (graph-specific concern)
- **Redux:** Add `focusedNodeId` to graph-slice, reuse existing actions for shortcuts
- **No cross-feature imports:** Keyboard shortcuts hook reads/dispatches via Redux

### Technical Requirements

**Arrow Key Spatial Navigation:**
- Find the nearest node in the pressed direction from the currently focused node
- Algorithm: filter nodes by direction (e.g., ArrowRight → nodes with x > currentX), then pick closest by distance
- If no node in that direction, stay on current node (don't wrap)

**Focus Ring Styling:**
- Use `focus-visible` (not `focus`) to avoid showing ring on mouse click
- Ring: `ring-2 ring-primary-500 ring-offset-2 ring-offset-surface`
- Canvas focus: draw the ring via canvas rendering (not CSS) since the node is inside canvas

**Screen Reader Announcement:**
- Update canvas `aria-label` dynamically when focusedNodeId changes
- Format: `"Chord network graph. Focused: G, major, root chord"` or `"Focused: Am, minor, distance 1"`

### Existing Code to Reuse

- **Skip links** in `layout.tsx` — already exist, targets `#graph-area` and `#progression-bar`
- **+/-/Escape shortcuts** in `chord-graph.tsx` — already implemented, leave as-is
- **`setSelectedNode`** — triggers preview (reuse for Enter key)
- **`addChord`** — commits chord (reuse for Enter-while-previewing)
- **`setMode`** — toggles mode (reuse for M key)
- **`setIsPlaying`/`playLoop`/`stopLoop`** — play/stop (reuse for Space)
- **Focus ring classes** — Tailwind's `focus-visible:ring-*` utilities

### Anti-Patterns to Avoid

- Do NOT intercept shortcuts when focus is in text inputs (BPM input, key selector)
- Do NOT use single-key shortcuts that conflict with screen readers (avoid Ctrl/Alt combos)
- Do NOT add tabIndex to every canvas node — use a roving tabindex pattern on the container
- Do NOT remove mouse interaction — keyboard adds to, doesn't replace, mouse behavior

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR10 keyboard shortcuts]
- [Source: apps/web/src/components/shared/layout.tsx — skip links, tabIndex]
- [Source: apps/web/src/features/chord-graph/chord-graph.tsx — existing +/-/Escape handlers]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
