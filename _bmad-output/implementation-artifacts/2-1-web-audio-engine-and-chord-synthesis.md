# Story 2.1: Web Audio Engine & Chord Synthesis

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to hear chords played through synthesized audio when I interact with the app,
so that I can audition chord sounds instantly without waiting for file downloads.

## Acceptance Criteria

1. **Audio context auto-initializes on first user gesture** — When the user performs their first click on any interactive element, the Web Audio API `AudioContext` is created and resumed. No "click to enable audio" banner or extra step required. Browser autoplay policy is handled transparently.

2. **Chord synthesis via oscillators (no audio files)** — When a chord is requested for playback (e.g., "C", "Am", "G7", "Bdim"), it is synthesized using Web Audio API `OscillatorNode`s — one per note in the chord voicing. Audio playback begins within 200ms of the request.

3. **All MVP chord types supported** — Major, minor, 7th, augmented, and diminished chords are synthesized with correct note frequencies. Each chord type uses a specific voicing (root position or first inversion as appropriate for musical quality).

4. **Pleasant musical tone, not raw oscillators** — Synthesis uses a combination of triangle/sawtooth waveforms with gain envelope (attack 10ms, decay 100ms, sustain 0.6, release 300ms) to produce a warm, musical tone — not harsh raw sine/square waves. A subtle low-pass filter softens high harmonics.

5. **Crossfade between chords** — When a new chord request arrives while audio is playing, the previous chord fades out (50ms) while the new chord fades in (50ms), producing a smooth transition with no abrupt cuts or clicks.

6. **Redux audio slice fully implemented** — The existing skeleton `audio-slice.ts` is populated with actions: `setIsPlaying`, `setIsLooping`, `setPreviewChord`, `stopAll`. State tracks `isPlaying`, `isLooping`, `previewChord`, and `bpm` (default 120).

7. **Tests** — Unit tests for: audio slice actions/reducers, chord-to-frequencies mapping utility, ADSR envelope logic. Integration test for `useAudioContext` hook initialization. No need to test actual Web Audio API output (not available in jsdom) — test the scheduling logic and state management.

## Tasks / Subtasks

- [x] Task 1: Create chord frequency mapping utility (AC: #3)
  - [x] Create `apps/web/src/features/audio-engine/chord-frequencies.ts`
  - [x] Map note names (C, C#, D, ..., B) to frequencies across octaves 3-5 using equal temperament (A4 = 440Hz)
  - [x] Define chord voicings: major [R,M3,P5], minor [R,m3,P5], 7th [R,M3,P5,m7], aug [R,M3,A5], dim [R,m3,d5]
  - [x] Export `getChordFrequencies(chordId: string): number[]` — parses chord ID (e.g., "C", "Am", "G7", "Bdim", "Caug") and returns frequencies
  - [x] Use octave 3 as base (C3 = ~130.8Hz) for warm voicing
  - [x] Unit tests: `chord-frequencies.test.ts` — verify correct frequencies for each chord type (29 tests)

- [x] Task 2: Build `useAudioContext` hook (AC: #1)
  - [x] Create `apps/web/src/features/audio-engine/use-audio-context.ts`
  - [x] Lazily create `AudioContext` on first call to `playChord()`
  - [x] Handle `AudioContext.state === "suspended"` by calling `resume()` after user gesture
  - [x] Return `{ playChord, stopAll, isReady }` interface
  - [x] Store `AudioContext` instance in a ref (singleton per component tree)
  - [x] Unit test: `use-audio-context.test.ts` — test hook API shape and state transitions (7 tests)

- [x] Task 3: Implement chord synthesis engine (AC: #2, #4, #5)
  - [x] Create `apps/web/src/features/audio-engine/synth-engine.ts`
  - [x] `playChord(ctx: AudioContext, frequencies: number[]): ActiveChord` — returns tracked chord for cleanup
  - [x] Per-note signal chain: `OscillatorNode` (triangle) → `GainNode` (ADSR envelope) → `BiquadFilterNode` (lowpass, cutoff ~2000Hz) → master `GainNode` → `destination`
  - [x] ADSR envelope: attack 10ms (`linearRampToValueAtTime`), decay 100ms, sustain level 0.6, release 300ms (`exponentialRampToValueAtTime`)
  - [x] Crossfade: `stopChord()` ramps master gain to 0.001 over 50ms before disconnecting nodes
  - [x] Track active nodes for cleanup — prevent memory leaks by disconnecting on stop via setTimeout
  - [x] Unit tests: `synth-engine.test.ts` — test node creation count, envelope scheduling calls (15 tests)

- [x] Task 4: Populate Redux audio slice (AC: #6)
  - [x] Update `apps/web/src/store/slices/audio-slice.ts`
  - [x] Add `bpm` to state (default: 120)
  - [x] Add reducers: `setIsPlaying`, `setIsLooping`, `setPreviewChord`, `setBpm`, `stopAll`
  - [x] Add selectors: `selectIsPlaying`, `selectIsLooping`, `selectPreviewChord`, `selectBpm`
  - [x] Unit tests: `audio-slice.test.ts` — test all reducers and selectors (13 tests)

- [x] Task 5: Create `AudioEngine` wrapper component (AC: #1, #2, #5)
  - [x] Create `apps/web/src/features/audio-engine/audio-engine.tsx`
  - [x] Listens to `selectedNode` from graph slice — when it changes, dispatches `setPreviewChord` and calls `playChord()`
  - [x] Uses `useAudioContext` hook for Web Audio lifecycle
  - [x] Render-less component (returns `null`) — pure side-effect bridge between Redux and Web Audio
  - [x] Unit tests: `audio-engine.test.tsx` — 6 tests for Redux↔WebAudio bridge behavior

- [x] Task 6: Integration wiring and E2E smoke test (AC: #1, #2)
  - [x] Mount `<AudioEngine />` in `app.tsx`
  - [x] Verified: `setSelectedNode` dispatched on graph click already triggers AudioEngine → `setPreviewChord` → `playChord()` flow
  - [x] Add E2E test: `e2e/audio-engine.spec.ts` — 2 tests verifying AudioContext creation on interaction and app stability with AudioEngine mounted
  - [x] Full test suite: `pnpm turbo run check-types` — all pass, `pnpm turbo run test` — 146 unit tests pass, `pnpm turbo run test:e2e` — 24 E2E tests pass, `pnpm turbo run build` — succeeds

### Review Findings

- [x] [Review][Patch] Fixed: playChord now wraps async IIFE in try/catch, logs errors to console [use-audio-context.ts]
- [x] [Review][Patch] Fixed: race condition resolved with playIdRef counter — stale async calls bail out [use-audio-context.ts]
- [x] [Review][Patch] Fixed: E2E test now asserts audioContextCount >= 1 with longer wait for simulation settle [e2e/audio-engine.spec.ts]
- [x] [Review][Patch] Fixed: master gain starts at 0 and ramps to MASTER_GAIN over 50ms (CROSSFADE_TIME) for symmetric crossfade [synth-engine.ts]
- [x] [Review][Patch] Fixed: AudioEngine now imports and uses selectSelectedNode from graph-slice [audio-engine.tsx]
- [x] [Review][Defer] AudioContext never closed on unmount — resource leak on component remount — deferred, acceptable for MVP single-page app
- [x] [Review][Defer] stopChord does not cancel pending ADSR automation (cancelScheduledValues) — deferred, audible impact minimal
- [x] [Review][Defer] setBpm accepts zero, negative, or NaN without validation — deferred, no consumer yet
- [x] [Review][Defer] stopChord setTimeout uses wall-clock time vs audio-clock drift — deferred, negligible in practice
- [x] [Review][Defer] Redux stopAll and hook stopAll are different things — semantic gap for future consumers — deferred

## Dev Notes

### Architecture Compliance

- **Feature location:** All audio code lives in `apps/web/src/features/audio-engine/` — do NOT create audio code outside this directory
- **File naming:** `kebab-case` — `synth-engine.ts`, `chord-frequencies.ts`, `use-audio-context.ts`
- **Redux pattern:** Update existing `audio-slice.ts` in `store/slices/` — do NOT create a new slice file
- **No cross-slice access:** Audio slice is self-contained. To react to progression changes, read from `progression` slice via selectors in components, not in the slice itself
- **Co-located tests:** All test files next to source files (e.g., `synth-engine.test.ts` alongside `synth-engine.ts`)

### Technical Requirements

**Web Audio API Key Constraints:**
- `AudioContext` requires a user gesture to start (browser autoplay policy). Initialize lazily on first `playChord()` call, not on component mount
- `OscillatorNode` is single-use — create new nodes for each chord, don't reuse
- Always disconnect and dereference nodes after use to prevent memory leaks
- Use `setValueAtTime()` / `linearRampToValueAtTime()` / `exponentialRampToValueAtTime()` for parameter automation — never assign directly to `.value` during playback
- `exponentialRampToValueAtTime` cannot ramp to 0 — use a very small value (0.001) then set to 0

**Chord Frequency Mapping:**
- Equal temperament tuning: `frequency = 440 * 2^((midiNote - 69) / 12)`
- Note-to-MIDI mapping: C3=48, C#3=49, D3=50, ... B5=83
- Chord voicings (semitone intervals from root):
  - Major: [0, 4, 7]
  - Minor: [0, 3, 7]
  - 7th (dominant): [0, 4, 7, 10]
  - Augmented: [0, 4, 8]
  - Diminished: [0, 3, 6]

**Chord ID Parsing:**
- IDs from `chord-relationships.json`: `"C"`, `"Dm"`, `"Em"`, `"G7"`, `"Bdim"`, `"Ab"`, `"Ebm"`, etc.
- Parse pattern: root note (1-2 chars including optional # or b) + suffix (empty=major, "m"=minor, "7"=7th, "dim"=diminished, "aug"=augmented)
- Root note extraction regex: `/^([A-G][#b]?)(.*)/`

**Synthesis Design:**
- Use `triangle` waveform as primary — warmer than sine, less harsh than sawtooth
- Low-pass `BiquadFilterNode` at ~2000Hz cutoff to soften high harmonics
- Master gain at 0.3 to prevent clipping with multiple simultaneous oscillators
- Each note gets its own oscillator → gain → filter chain, all routed to a shared master gain node

### Existing Code to Reuse

- **`audio-slice.ts`** (`apps/web/src/store/slices/audio-slice.ts`): Skeleton exists with `AudioState` interface — extend it, don't recreate
- **`store/hooks.ts`**: Use `useAppDispatch()` and `useAppSelector()` — already typed
- **`store/index.ts`**: Audio reducer already registered in the store
- **`chord-relationships.json`**: Chord IDs follow the pattern described above — no additional data needed
- **`graph-slice.ts`**: `setSelectedNode` action fires when user clicks a chord node — use this as the trigger for `setPreviewChord`

### Integration Points

**Graph → Audio flow:**
1. User clicks chord node in `chord-graph.tsx`
2. `setSelectedNode(chordId)` dispatched (already exists)
3. `AudioEngine` component listens to `selectedNode` changes
4. On change, dispatch `setPreviewChord(chordId)` and trigger Web Audio synthesis
5. Audio plays the chord

**Key detail:** The `selectedNode` in `graph-slice` and `previewChord` in `audio-slice` serve different purposes. `selectedNode` is the visual selection state. `previewChord` is the audio playback trigger. The `AudioEngine` component bridges them.

### Testing Strategy

**jsdom limitation:** Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`) is NOT available in jsdom. Strategy:
- **Mock `AudioContext`** in tests: Create a mock that tracks method calls (`.createOscillator()`, `.createGain()`, `.connect()`, `.start()`, `.stop()`)
- **Test scheduling logic**, not actual audio output — verify correct frequencies, envelope timing, node connections
- **Redux slice tests** are pure state — no Web Audio mocking needed
- **E2E tests** can check `AudioContext` creation via browser evaluate, but don't try to verify audio output

**Test setup:** Add Web Audio mocks to `apps/web/src/__tests__/test-setup.ts` (already has `ResizeObserver` mock from Story 1.4):
```typescript
class MockAudioContext {
  state = 'running';
  currentTime = 0;
  createOscillator() { return new MockOscillatorNode(); }
  createGain() { return new MockGainNode(); }
  createBiquadFilter() { return new MockBiquadFilterNode(); }
  resume() { return Promise.resolve(); }
}
```

### Project Structure Notes

New files to create:
```
apps/web/src/features/audio-engine/
├── audio-engine.tsx           # Render-less Redux↔WebAudio bridge component
├── audio-engine.test.tsx      # Integration tests for bridge component
├── chord-frequencies.ts       # Note-to-frequency mapping, chord voicings
├── chord-frequencies.test.ts  # Unit tests for frequency calculations
├── synth-engine.ts            # Web Audio synthesis (oscillators, envelopes, crossfade)
├── synth-engine.test.ts       # Unit tests for synthesis scheduling logic
├── use-audio-context.ts       # Hook managing AudioContext lifecycle
└── use-audio-context.test.ts  # Hook tests
```

Files to modify:
```
apps/web/src/store/slices/audio-slice.ts  # Add actions, selectors, bpm state
apps/web/src/app.tsx                       # Mount <AudioEngine />
apps/web/src/features/chord-graph/chord-graph.tsx  # Wire selectedNode → previewChord
```

### Previous Story Learnings (Story 1.5)

- Canvas `getContext("2d")` not available in jsdom — same constraint applies to Web Audio; test logic, not rendering/output
- `ResizeObserver` mock already exists in `test-setup.ts` — add Web Audio mocks alongside it
- Graph dispatches `setSelectedNode` on click — confirmed integration point
- Feature directories are self-contained with co-located tests — follow same pattern
- Redux actions use `domain/verb` naming: `audio/setPreviewChord`, `audio/setIsPlaying`, etc.
- Graph canvas uses refs for performance-sensitive state — consider similar pattern for audio node tracking

### Git Intelligence

Recent commits follow pattern: `feat: <description> (Story X.Y)`. Last 5 commits are all Story 1.x implementations. Codebase uses:
- Redux Toolkit with typed hooks
- Feature-based directory structure
- Vitest for unit tests, Playwright for E2E
- All TypeScript, strict mode

### Anti-Patterns to Avoid

- Do NOT use `setTimeout` for audio scheduling — use Web Audio API's built-in scheduling (`setValueAtTime`, etc.)
- Do NOT store `AudioContext` in Redux — it's not serializable; use a ref or module-level singleton
- Do NOT create audio nodes on component mount — wait for user gesture
- Do NOT import from other feature directories — communicate through Redux
- Do NOT add audio libraries (Tone.js, Howler.js, etc.) — use raw Web Audio API as specified in architecture
- Do NOT put audio logic in the graph component — keep it in `features/audio-engine/`
- Do NOT use `useEffect` + `fetch` — this story has no API calls; audio is pure client-side

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.1 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Audio engine architecture, Web Audio API synthesis, Redux state shape]
- [Source: _bmad-output/planning-artifacts/architecture.md — Feature structure: features/audio-engine/]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Audio playback <200ms, contextual playback, no isolated previews]
- [Source: _bmad-output/implementation-artifacts/1-5-graph-zoom-controls.md — Previous story learnings, Canvas/jsdom constraints, test setup patterns]
- [Source: apps/web/src/store/slices/audio-slice.ts — Existing skeleton audio slice]
- [Source: apps/web/src/data/chord-relationships.json — Chord ID format and structure]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Web Audio mocks not needed in test-setup.ts — each test file creates its own mocks locally for precise control
- AudioEngine bridges graph→audio via Redux: selectedNode change → setPreviewChord dispatch + playChord() call
- No modification to chord-graph.tsx needed — existing setSelectedNode dispatch is sufficient integration point
- Updated existing store.test.ts to include new `bpm` field in audio state shape assertion

### Completion Notes List

- chord-frequencies.ts: Equal temperament frequency mapping with chord ID parser supporting all MVP chord types (major, minor, 7th, aug, dim) with sharp/flat roots. 29 unit tests.
- synth-engine.ts: Web Audio synthesis with triangle oscillators, ADSR envelope (10ms attack, 100ms decay, 0.6 sustain, 300ms release), lowpass filter at 2kHz, master gain 0.3, crossfade stop at 50ms. 15 unit tests.
- use-audio-context.ts: Hook with lazy AudioContext creation on first playChord(), suspended state handling, singleton ref pattern. 7 unit tests.
- audio-slice.ts: Fully populated with actions (setIsPlaying, setIsLooping, setPreviewChord, setBpm, stopAll), selectors, and bpm state (default 120). 13 unit tests.
- audio-engine.tsx: Render-less Redux↔WebAudio bridge component listening to graph selectedNode. 6 unit tests.
- E2E: 2 tests verifying AudioContext creation and app stability with AudioEngine.
- Total: 70 new tests (unit) + 2 new E2E tests. All 146 unit + 24 E2E pass. Build and type-check clean.

### File List

- apps/web/src/features/audio-engine/chord-frequencies.ts (new)
- apps/web/src/features/audio-engine/chord-frequencies.test.ts (new)
- apps/web/src/features/audio-engine/synth-engine.ts (new)
- apps/web/src/features/audio-engine/synth-engine.test.ts (new)
- apps/web/src/features/audio-engine/use-audio-context.ts (new)
- apps/web/src/features/audio-engine/use-audio-context.test.ts (new)
- apps/web/src/features/audio-engine/audio-engine.tsx (new)
- apps/web/src/features/audio-engine/audio-engine.test.tsx (new)
- apps/web/src/store/slices/audio-slice.ts (modified — added actions, selectors, bpm state)
- apps/web/src/store/slices/audio-slice.test.ts (new)
- apps/web/src/__tests__/store.test.ts (modified — added bpm to expected audio state)
- apps/web/src/app.tsx (modified — mounted AudioEngine component)
- apps/web/e2e/audio-engine.spec.ts (new)

### Change Log

- 2026-04-14: Story 2.1 implemented — Web Audio engine with chord synthesis, ADSR envelopes, crossfade, Redux audio slice, AudioEngine bridge component
