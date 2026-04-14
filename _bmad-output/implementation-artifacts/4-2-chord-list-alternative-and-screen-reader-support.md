# Story 4.2: Chord List Alternative & Screen Reader Support

Status: done

## Story

As a **screen reader user**,
I want an accessible chord list alternative to the visual graph and comprehensive ARIA support throughout the app,
so that I can discover chords, build progressions, and learn music theory with the same quality of experience as sighted users.

## Acceptance Criteria

1. **Chord list panel via L key** — Pressing L or activating hidden "List view" link shows a list panel overlaying the graph. List shows chords sorted by harmonic distance (closest first).

2. **List item format** — Each item: "[Chord name] — [type] — [close/medium/far] [emoji]"

3. **Keyboard navigation in list** — Arrow keys navigate, Enter previews (same as graph click), Enter again commits. List updates after commit.

4. **Close list** — L again or Escape closes the panel, focus returns to graph.

5. **Progression bar aria-labels** — Each chip: "[Chord name], position [n] of [total]". Bar announced as list.

6. **Progression change announcements** — aria-live polite region announces changes (e.g., "Am added to progression, position 3 of 3").

7. **Explanation panel aria-live** — Already has `role="complementary"` and `aria-live="polite"` from Story 3.3.

8. **Playback controls keyboard-operable** — Already implemented in Story 4.1.

9. **WCAG 2.1 AA** — 4.5:1 contrast, 44x44px targets, semantic HTML, visual equivalents for audio.

10. **Tests** — Unit tests for chord list, aria-labels. E2E for L key toggle.

## Tasks / Subtasks

- [ ] Task 1: Create ChordList overlay component (AC: #1, #2, #3, #4)
  - [ ] Create `apps/web/src/features/chord-graph/chord-list.tsx`
  - [ ] Read chord data from `getChordsByKey(currentKey)`, sort by distance
  - [ ] Render as `<ul role="listbox">` with `<li role="option">` items
  - [ ] Format: "[name] — [type] — [distance label] [emoji]"
  - [ ] Distance labels: 0="root", 1="close", 2="medium", 3="far", 4+="distant"
  - [ ] Arrow up/down navigates (roving tabindex), Enter previews/commits
  - [ ] Position absolute over graph area, bg-surface-elevated, z-20
  - [ ] Unit tests: renders sorted list, correct format, keyboard nav

- [ ] Task 2: Wire L key to toggle chord list (AC: #1, #4)
  - [ ] Add L key handler in `use-keyboard-shortcuts.ts`
  - [ ] Add `showChordList` state (local in chord-graph or in graph-slice)
  - [ ] L toggles visibility, Escape also closes
  - [ ] On open: focus first list item. On close: focus graph container
  - [ ] Add visually hidden "List view" link in graph area for discoverability

- [ ] Task 3: Enhanced progression bar ARIA (AC: #5, #6)
  - [ ] Add `role="list"` to progression chip container
  - [ ] Add `role="listitem"` to each ChordChip wrapper
  - [ ] Update ChordChip `aria-label`: "[name], position [n] of [total]"
  - [ ] Add `aria-live="polite"` region that announces progression changes
  - [ ] On addChord: set announcement text "[name] added to progression, position [n] of [total]"
  - [ ] On removeChord: set announcement "[name] removed from progression"
  - [ ] Unit tests: aria-labels, announcement text

- [ ] Task 4: WCAG audit and semantic HTML fixes (AC: #9)
  - [ ] Audit all `div[role="button"]` elements — convert chord chips to `<button>` where possible (or ensure proper keyboard handling)
  - [ ] Verify 44x44px minimum on all interactive targets (zoom buttons already 44px, check others)
  - [ ] Verify contrast ratios on text colors (design tokens should be compliant)
  - [ ] Ensure `<nav>`, `<main>`, `<aside>`, `<footer>` semantic elements used (Layout already uses header/main/footer)

- [ ] Task 5: E2E test and full verification (AC: #10)
  - [ ] Create `apps/web/e2e/screen-reader.spec.ts`
  - [ ] Test: L key toggles chord list panel
  - [ ] Test: progression bar has role="list"
  - [ ] Test: chord chips have descriptive aria-labels
  - [ ] Run full test suite

## Dev Notes

### Architecture Compliance

- **Feature location:** ChordList in `features/chord-graph/` (graph-specific accessibility alternative)
- **ARIA improvements:** In `features/progression-builder/` (progression-specific)
- **No new Redux state:** `showChordList` can be local state in chord-graph.tsx
- **Keyboard:** Extend existing `use-keyboard-shortcuts.ts` with L key

### Existing Code to Reuse

- **`getChordsByKey()`** — returns chords sorted by data order, need to sort by distance
- **`getChordEmoji()`** — already maps distance to emoji
- **`setSelectedNode`/`addChord`** — reuse for Enter preview/commit
- **Layout semantic HTML** — already uses header/main/footer/aside
- **`aria-live="polite"`** — already on ExplanationPanel

### Anti-Patterns to Avoid

- Do NOT remove the canvas graph — the list is an alternative, not replacement
- Do NOT put the list outside the graph area — it overlays the graph
- Do NOT use div-based buttons in new code — use semantic `<button>` elements

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR11 chord list alternative]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
