# Story 2.5: Tempo Control & Tap Tempo

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to adjust the playback tempo via BPM input or by tapping a rhythm,
so that I can match the progression's feel to my creative intent without knowing an exact BPM number.

## Acceptance Criteria

1. **BPM input visible** — A number input shows the current BPM (default 120) with a "BPM" label alongside. A Tap tempo button is visible next to the BPM input.

2. **BPM edit updates display and applies next cycle** — When the user edits the BPM input (e.g., 90), the value updates immediately. The tempo change applies on the next loop cycle (current cycle finishes at the old BPM).

3. **Tap tempo calculates BPM from 4+ taps** — When the user clicks the Tap button 4+ times, BPM is calculated by averaging the intervals between taps. The BPM input updates to reflect the calculated value. Each tap briefly highlights the tap button.

4. **Fewer than 4 taps — no change** — If the user taps fewer than 4 times and stops, no BPM change is applied.

5. **Mid-loop BPM change is seamless** — When BPM changes while looping at 120, the current cycle completes at 120 and the next cycle begins at the new BPM. No audio artifacts.

6. **Accessible controls** — BPM input has `aria-label="Tempo in beats per minute"`. Tap button has `aria-label="Tap to set tempo"`.

7. **Tests** — Unit tests for: BPM input dispatch, tap tempo calculation, tap threshold (< 4 = no change). E2E test for BPM controls visibility.

## Tasks / Subtasks

- [x] Task 1: Create BPM input control (AC: #1, #2, #6)
  - [x] Replaced "BPM" placeholder with `type="number"` input, min 40, max 240, step 1
  - [x] Compact styling: `w-14 text-center text-sm border border-border rounded`
  - [x] Reads `selectBpm`, dispatches `setBpm` on change with clamping
  - [x] `aria-label="Tempo in beats per minute"`, "BPM" label alongside
  - [x] `onBlur` validation fallback to 120 if invalid
  - [x] Unit tests: shows default 120, editing dispatches setBpm

- [x] Task 2: Create Tap Tempo button (AC: #1, #3, #4, #6)
  - [x] "Tap" button with `aria-label="Tap to set tempo"`
  - [x] Tracks timestamps in ref, resets after 2s gap, keeps last 8 taps
  - [x] After 4+ taps: calculates average interval → BPM, dispatches `setBpm`
  - [x] Visual feedback: `isTapping` state adds `bg-primary-100` for 150ms
  - [x] Unit test: < 4 taps does not change BPM

- [x] Task 3: Wire BPM to playLoop via ref (AC: #2, #5)
  - [x] Changed `playLoop` param from `bpm: number` to `bpmRef: React.RefObject<number>`
  - [x] `scheduleCycle` reads `bpmRef.current` each cycle for live BPM updates
  - [x] ProgressionBar passes `bpmRef` to `playLoop`

- [x] Task 4: E2E test and full verification (AC: #7)
  - [x] Created `apps/web/e2e/tempo-control.spec.ts` — 4 E2E tests
  - [x] `pnpm turbo run check-types` — all pass
  - [x] `pnpm turbo run test` — 177 unit tests pass
  - [x] `pnpm turbo run build` — succeeds
  - [x] `pnpm turbo run test:e2e` — 39 E2E tests pass

## Dev Notes

### Architecture Compliance

- **Feature location:** BPM input and Tap button live in `apps/web/src/features/progression-builder/` alongside ProgressionBar
- **Redux:** Use existing `setBpm`/`selectBpm` from `audio-slice.ts` — no new actions needed
- **No new components:** BPM input and Tap button are simple enough to inline in ProgressionBar, or extract as a small `tempo-controls.tsx` if needed
- **File naming:** `kebab-case` if extracted: `tempo-controls.tsx`

### Technical Requirements

**BPM Input:**
- `type="number"` with constraints: `min={40}`, `max={240}` (reasonable musical range)
- On `onChange`: parse value, clamp to range, dispatch `setBpm(clamped)`
- On `onBlur`: ensure value is valid (fallback to 120 if NaN)
- Compact styling to fit in the footer bar: `w-14 text-center text-sm border border-border rounded px-1 py-0.5`

**Tap Tempo Algorithm:**
```
tapTimestamps = [t1, t2, t3, t4, ...]
intervals = [t2-t1, t3-t2, t4-t3, ...]
avgInterval = sum(intervals) / intervals.length
bpm = Math.round(60000 / avgInterval)
```
- Reset timestamps if gap > 2000ms between taps
- Only update BPM when 4+ taps (3+ intervals)
- Keep last 8 taps max to prevent old taps from skewing the average

**BPM Ref for Live Updates:**
- Currently `playLoop(chordsRef, bpm, onChordChange)` takes `bpm` as a number
- Change to `playLoop(chordsRef, bpmRef, onChordChange)` where `bpmRef` is `React.RefObject<number>`
- Inside `scheduleCycle`: `const beatDuration = 60000 / bpmRef.current`
- This mirrors the `chordsRef` pattern already used for live chord updates

**Tap Button Highlight:**
- On tap: set `isTapping` state to true for 150ms via setTimeout
- `isTapping` adds `bg-primary-100` or similar brief visual feedback
- Use `useRef` for the timeout ID and clean up on unmount

### Existing Code to Reuse

- **`setBpm`/`selectBpm`** in `audio-slice.ts` — already exist, used by ProgressionBar
- **`bpm` in ProgressionBar** — already read from Redux, passed to `playLoop`
- **`playLoop` in `use-audio-context.ts`** — needs param change from `bpm: number` to `bpmRef: RefObject<number>`
- **`progression-bar.tsx`** — the "BPM" span placeholder at line 155 is the insertion point

### Previous Story Learnings (Story 2.4)

- `playLoop` reads `chordsRef.current` each cycle for live updates — use same pattern for `bpmRef`
- `stopPlayback()` helper consolidates stop logic — reuse
- `useAudioContext` hook returns `playLoop`/`stopLoop` — update signature
- setTimeout refs with cleanup pattern established — reuse for tap highlight

### Anti-Patterns to Avoid

- Do NOT pass `bpm` by value to `playLoop` — use a ref for live updates
- Do NOT use `onChange` alone on number input — also handle `onBlur` for validation
- Do NOT apply BPM mid-cycle — let the current cycle finish (handled by ref read at cycle start)
- Do NOT allow BPM outside 40-240 range — clamp on input
- Do NOT create a new Redux slice for tap tempo — keep tap state local (it's transient UI)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.5 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — BPM control, tap tempo, UX-DR9]
- [Source: _bmad-output/implementation-artifacts/2-4-full-progression-playback-and-looping.md — playLoop implementation, bpm usage]
- [Source: apps/web/src/features/progression-builder/progression-bar.tsx — BPM placeholder, playLoop call]
- [Source: apps/web/src/store/slices/audio-slice.ts — setBpm, selectBpm, bpm default 120]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- playLoop signature changed from `bpm: number` to `bpmRef: React.RefObject<number>` — reads fresh BPM each cycle
- Tap tempo uses Date.now() timestamps with 2s gap reset and max 8 taps window
- BPM input onChange clamps to 40-240 on each keystroke, onBlur falls back to 120 if invalid

### Completion Notes List

- BPM number input: type="number" with 40-240 range, compact styling, aria-label, onBlur validation
- Tap Tempo button: 4+ tap threshold, average interval → BPM, 150ms visual feedback, 2s gap reset
- playLoop refactored to accept bpmRef for live BPM updates during playback
- 4 new unit tests + 4 new E2E tests
- Total: 177 unit tests + 39 E2E tests passing. Build and type-check clean.

### File List

- apps/web/src/features/audio-engine/use-audio-context.ts (modified — playLoop accepts bpmRef)
- apps/web/src/features/audio-engine/use-audio-context.test.ts (modified — updated API shape test)
- apps/web/src/features/progression-builder/progression-bar.tsx (modified — BPM input, Tap button, bpmRef)
- apps/web/src/features/progression-builder/progression-bar.test.tsx (modified — 4 new tests)
- apps/web/e2e/tempo-control.spec.ts (new — 4 E2E tests)

### Change Log

- 2026-04-14: Story 2.5 implemented — BPM number input, tap tempo with 4+ tap threshold, live BPM via ref
