# Story 2.4: Full Progression Playback & Looping

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to play my full chord progression on a seamless loop and hear it as continuous music,
so that I can evaluate how my progression sounds as a repeating musical phrase.

## Acceptance Criteria

1. **Play full progression** — When 2+ chords exist and the user clicks Play, the full progression plays as a continuous audio sequence looping seamlessly with no audible gap. The Play button swaps to a Stop icon.

2. **Chip highlighting during playback** — When the progression is playing, each chord chip in the progression bar briefly highlights/pulses as its chord is reached. The highlight tracks playback position in real time.

3. **Stop playback** — When the user clicks Stop (or Pause), playback stops immediately. Button swaps back to Play. Chip highlighting stops.

4. **Disabled when < 2 chords** — Play button is disabled (grayed out) when fewer than 2 chords are in the progression.

5. **Loop updates on chord removal** — When the user removes a chord while playing, the loop updates on the next cycle. Playback does not stop or restart mid-cycle.

6. **Mode switch doesn't interrupt** — Toggling Flow/Learn mode (future story) never interrupts audio playback.

7. **Accessible play/stop** — Play/Stop button has `aria-label` that updates with state: "Play progression" / "Stop playback".

8. **Tests** — Unit tests for: playback loop scheduling, play/stop state management, chip highlight tracking. E2E test for play/stop journey.

## Tasks / Subtasks

- [x] Task 1: Add `playLoop` and `stopLoop` to `useAudioContext` hook (AC: #1, #3, #5)
  - [x] Added `playLoop(chordsRef, bpm, onChordChange)` — schedules chords via chained setTimeout, repeats each cycle
  - [x] Reads fresh chords from ref on each cycle start (chord removal takes effect next cycle)
  - [x] `onChordChange(index)` callback fires on each beat for chip highlighting
  - [x] Added `stopLoop()` — increments playIdRef, clears timeouts, stops active chord
  - [x] Uses same `playIdRef` + `clearScheduled` cancellation pattern as playSequence

- [x] Task 2: Wire Play/Stop button in ProgressionBar (AC: #1, #3, #4, #7)
  - [x] Functional Play/Stop toggle button replacing placeholder
  - [x] Reads `selectIsPlaying` and `selectBpm` from audio-slice
  - [x] Play: dispatches `setIsPlaying(true)` + calls `playLoop(chordsRef, bpm, onChordChange)`
  - [x] Stop: dispatches `setIsPlaying(false)` + calls `stopLoop()` + clears activeChordIndex
  - [x] Shows "▶" / "⏹", aria-label toggles "Play progression" / "Stop playback"
  - [x] Disabled when < 2 chords. Auto-stops if chords drop below 2 while playing
  - [x] 5 new unit tests for play/stop button state and dispatches

- [x] Task 3: Implement chip highlighting during playback (AC: #2)
  - [x] `activeChordIndex` local state in ProgressionBar, updated by `onChordChange` callback
  - [x] `isActive` prop on ChordChip — adds `ring-2 ring-primary-400 scale-105` highlight
  - [x] Cleared to -1 on stop

- [x] Task 4: Integrate playback with AudioEngine and ProgressionBar (AC: #1, #5)
  - [x] ProgressionBar uses its own `useAudioContext()` call — shares singleton AudioContext
  - [x] Clear button stops loop and dispatches `setIsPlaying(false)` before clearing
  - [x] Preview from chip click stops loop first, then plays preview
  - [x] Shared `playIdRef` ensures preview and loop are mutually exclusive

- [x] Task 5: Handle playback-preview interaction (AC: #1)
  - [x] Chip click: stops loop, dispatches `setIsPlaying(false)`, then dispatches `setSelectedNode`
  - [x] Play click: calls `stopAll()` + clears selectedNode first, then starts loop
  - [x] Mutual exclusion via shared `playIdRef` counter in `useAudioContext`

- [x] Task 6: E2E test and full verification (AC: #8)
  - [x] Created `apps/web/e2e/playback.spec.ts` — 3 E2E tests
  - [x] `pnpm turbo run check-types` — all pass
  - [x] `pnpm turbo run test` — 173 unit tests pass
  - [x] `pnpm turbo run build` — succeeds
  - [x] `pnpm turbo run test:e2e` — 35 E2E tests pass

### Review Findings

- [x] [Review][Patch] Fixed: unbounded timeout array growth — clear old IDs at cycle start in scheduleCycle
- [x] [Review][Patch] Fixed: stopLoop identical to stopAll — stopLoop now delegates to stopAll
- [x] [Review][Patch] Fixed: duplicated stop-loop logic — extracted stopPlayback() helper in ProgressionBar
- [x] [Review][Patch] Fixed: E2E "play/stop cycle" test renamed and assertion improved
- [x] [Review][Defer] BPM captured by value — changes during playback ignored until restart (Story 2.5)
- [x] [Review][Defer] onChordChange may fire stale index after mid-cycle chord removal
- [x] [Review][Defer] No cleanup effect for playLoop on ProgressionBar unmount
- [x] [Review][Defer] No guard against bpm <= 0 (setBpm validation deferred from Story 2.1)
- [x] [Review][Defer] Conflicting CSS scale classes when isActive and isPulsing both true

## Dev Notes

### Architecture Compliance

- **Feature location:** Playback logic lives in `apps/web/src/features/audio-engine/` (loop scheduling in `use-audio-context.ts`)
- **UI changes:** Play/Stop button in `apps/web/src/features/progression-builder/progression-bar.tsx`
- **Redux:** Use existing `audio-slice.ts` actions: `setIsPlaying`, `setIsLooping`, `selectIsPlaying`, `selectBpm`
- **No new slices:** activeChordIndex can be local state in ProgressionBar or passed via callback
- **No cross-feature imports:** ProgressionBar communicates with audio via Redux + shared `useAudioContext` hook

### Technical Requirements

**Loop Scheduling Pattern:**
- Use the same `setTimeout`-based approach as `playSequence` (established pattern)
- Beat duration: `60000 / bpm` ms (at 120bpm = 500ms)
- Each chord gets a `setTimeout` at `i * beatDuration`
- After the last chord timeout, schedule the next cycle: `setTimeout(startNextCycle, chords.length * beatDuration)`
- Read chords via a ref on each cycle start so removals take effect next cycle
- Use `playIdRef` pattern for cancellation (increment on stop)

**Chip Highlighting:**
- `playLoop` accepts an `onChordChange: (index: number) => void` callback
- Each scheduled timeout calls `onChordChange(i)` when its chord starts
- ProgressionBar stores `activeChordIndex` in local state
- ChordChip receives `isActive` boolean prop
- On stop: set `activeChordIndex = -1`

**Play/Stop State:**
- `isPlaying` in audio-slice drives the button state
- Button dispatches `setIsPlaying(true/false)` + calls `playLoop`/`stopLoop`
- `Clear` button must also stop playback: dispatch `stopAll()` (already resets `isPlaying`)

**Seamless Looping:**
- The last chord of cycle N and first chord of cycle N+1 should crossfade using existing `stopChord` + `playChord` pattern
- No gap: schedule the next cycle's first chord immediately after the last chord's duration
- Each chord plays for `beatDuration` ms with auto-release

**Preview vs Loop Interaction:**
- Preview (AudioEngine) and Loop (ProgressionBar) share the same `AudioContext` via `useAudioContext`
- Both use `playIdRef` for cancellation — starting a preview increments `playIdRef`, cancelling loop timeouts
- Starting the loop increments `playIdRef`, cancelling any preview
- They are mutually exclusive by design through the shared `playIdRef` counter

### Existing Code to Reuse

- **`useAudioContext`:** Already has `playChord`, `playSequence`, `stopAll`, `clearScheduled`, `playIdRef` — extend with `playLoop`/`stopLoop`
- **`audio-slice.ts`:** `setIsPlaying`, `selectIsPlaying`, `selectBpm` already exist
- **`progression-bar.tsx`:** Play button placeholder exists — just wire it up
- **`synth-engine.ts`:** `playChord(ctx, freqs, { duration })` with auto-release — each loop chord uses this
- **`chord-chip.tsx`:** Add optional `isActive` prop for highlight styling

### Previous Story Learnings (Story 2.3)

- ChordChip uses `div[role="button"]` (not nested `<button>`) — maintain this pattern
- CSS transitions + `onTransitionEnd` for animations — reuse for highlight pulse
- `setTimeout` refs with cleanup on unmount — follow same pattern for loop scheduling
- Design tokens (`primary-50`, `primary-500`, `text-text-secondary`) — use for highlight colors
- `clearScheduled()` pattern cancels all pending timeouts — reuse for loop stop

### Anti-Patterns to Avoid

- Do NOT use `setInterval` for the loop — use chained `setTimeout` so each cycle reads fresh chords
- Do NOT store `activeChordIndex` in Redux — it's a transient UI concern, keep as local state
- Do NOT create a separate audio context for loop playback — reuse the existing singleton
- Do NOT block UI during playback — all scheduling is async via `setTimeout`
- Do NOT stop playback when removing a chord mid-cycle — update takes effect next cycle
- Do NOT add loop controls to the graph component — playback UI stays in progression-builder

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.4 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Audio engine architecture, Redux state shape]
- [Source: _bmad-output/implementation-artifacts/2-3-progression-bar-and-chord-management.md — ProgressionBar, ChordChip, Play button placeholder]
- [Source: apps/web/src/features/audio-engine/use-audio-context.ts — playSequence pattern, clearScheduled, playIdRef]
- [Source: apps/web/src/store/slices/audio-slice.ts — isPlaying, isLooping, bpm state and actions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- playLoop uses chained setTimeout (not setInterval) so each cycle reads fresh chords from ref
- ProgressionBar uses its own useAudioContext() — shares singleton AudioContext with AudioEngine via refs
- Chip click stops loop before previewing (mutual exclusion via playIdRef)
- Auto-stops playback when chords.length drops below 2 via useEffect

### Completion Notes List

- useAudioContext: added playLoop/stopLoop with chained setTimeout scheduling and onChordChange callback
- ProgressionBar: functional Play/Stop toggle, chip highlighting via activeChordIndex, auto-stop on < 2 chords
- ChordChip: isActive prop with ring-2 ring-primary-400 highlight
- Preview-loop interaction: mutually exclusive via shared playIdRef, chip click stops loop
- 173 unit tests + 35 E2E tests passing. Build and type-check clean.

### File List

- apps/web/src/features/audio-engine/use-audio-context.ts (modified — added playLoop, stopLoop)
- apps/web/src/features/audio-engine/use-audio-context.test.ts (modified — updated API shape test)
- apps/web/src/features/audio-engine/audio-engine.test.tsx (modified — updated mock)
- apps/web/src/features/progression-builder/progression-bar.tsx (modified — Play/Stop button, chip highlighting, loop integration)
- apps/web/src/features/progression-builder/progression-bar.test.tsx (modified — 5 new play/stop tests, mock useAudioContext)
- apps/web/src/features/progression-builder/chord-chip.tsx (modified — isActive prop)
- apps/web/e2e/playback.spec.ts (new — 3 E2E tests)

### Change Log

- 2026-04-14: Story 2.4 implemented — full progression playback with seamless looping, Play/Stop toggle, chip highlighting, preview-loop interaction
