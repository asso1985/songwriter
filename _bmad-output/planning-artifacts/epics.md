---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['prd.md', 'architecture.md', 'ux-design-specification.md']
---

# Songwriter - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Songwriter, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can view an interactive chord network graph where chords are displayed as nodes and spatial distance represents harmonic closeness
FR2: Users can select a chord node to set it as the current chord in their progression
FR3: Users can see which chords are strong next moves from their current chord (visually distinguished by proximity and emphasis)
FR4: Users can zoom in on the graph to see only the 3-5 strongest next moves from the current chord
FR5: Users can zoom out on the graph to see the full harmonic landscape with visual weight indicating common vs. rare paths
FR6: Users can navigate chords across major, minor, 7th, augmented, and diminished chord types
FR7: Users can select a starting key/chord to initialize the graph
FR8: Users can build a chord progression by sequentially selecting chords from the graph
FR9: Users can view their current progression as an ordered sequence of chords
FR10: Users can remove chords from their progression
FR11: Users can reorder chords in their progression (DEFERRED from MVP)
FR12: Users can clear their progression and start over
FR13: Users can enter an existing chord as a starting point and build from there
FR14: Users can hear a selected chord played in the context of their current progression (not in isolation)
FR15: Users can play their full progression as a continuous audio sequence
FR16: Users can loop playback of their progression seamlessly with no audible gap
FR17: Users can stop audio playback at any time
FR18: Users can preview a potential next chord before committing it to the progression
FR19: Users can receive AI-generated explanations of why a chord works in the context of their current progression
FR20: Users can switch between Flow Mode (emoji/icon cues indicating chord character — safe, bold, colorful) and Learn Mode (full music theory explanations)
FR21: Users can see Flow Mode cues on chord suggestions without needing to tap each one
FR22: Users can access Learn Mode explanations that use proper music theory terminology (tension, resolution, modal mixture, borrowed chords, etc.)
FR23: Users can view explanations that reference the harmonic context (key, chord function, relationship to previous chords)
FR24: Users can navigate the chord graph and all controls via keyboard
FR25: Users can access all AI theory explanations via screen reader
FR26: Users can distinguish chord relationships on the graph without relying solely on color (shape, size, labels, or patterns used alongside color)
FR27: Users can operate all audio playback controls via keyboard
FR28: Users can start exploring chords immediately without prior music theory knowledge
FR29: Users can understand the graph's spatial metaphor (close = harmonically related, far = adventurous) through initial guidance

### NonFunctional Requirements

NFR1: Graph interaction (click, hover, zoom) responds within 100ms
NFR2: Audio playback begins within 200ms of chord selection
NFR3: Loop playback cycles seamlessly with no audible gap or stutter
NFR4: AI theory explanations return within 2 seconds of request
NFR5: Initial application load is interactive within 3 seconds on standard broadband
NFR6: Graph animation (zoom transitions, node highlighting) maintains 60fps
NFR7: AI API keys are never exposed to the client — all LLM calls route through a backend proxy
NFR8: No user data persisted server-side for MVP — all progression state lives client-side
NFR9: Backend proxy implements rate limiting to prevent API abuse
NFR10: HTTPS enforced for all connections
NFR11: Backend proxy supports 100 concurrent users with no performance degradation
NFR12: AI explanation caching reduces redundant LLM calls for common chord relationships
NFR13: Architecture allows scaling the backend proxy independently if user growth exceeds projections
NFR14: Client-side-first architecture means most load is on the user's browser, not the server
NFR15: WCAG 2.1 AA compliance across all UI elements
NFR16: All interactive elements are keyboard-navigable (graph nodes, playback controls, mode toggle)
NFR17: Screen reader support for AI theory explanations and progression state
NFR18: Color is never the sole indicator of information — shape, size, labels, or patterns supplement color
NFR19: Minimum 4.5:1 contrast ratio for all text elements
NFR20: Audio content has visual equivalents (chord names, progression display) for hearing-impaired users

### Additional Requirements

- **Starter Template:** Turborepo + Vite 8 + Express monorepo scaffold via `npx create-turbo@latest songwriter --package-manager pnpm` — first implementation story
- Docker Compose containerization with three services: web (Vite SPA), api (Express proxy), redis (explanation cache)
- Docker Compose dev overrides with volume mounts and hot reload
- GitHub Actions CI pipeline running Vitest + Playwright before deploy
- Railway deployment configuration: frontend static site, Express API service, managed Redis
- Redis caching layer for AI explanations with key format `{chordA}->{chordB}:{key}:{context_hash}`
- Static JSON chord relationship data bundled with frontend (finite, deterministic dataset)
- LLM service interface with mock/real factory pattern controlled by `LLM_PROVIDER` env var
- Mock LLM service for E2E/CI tests returning deterministic pre-written explanations
- Express proxy with `express-rate-limit` middleware and origin-locked CORS
- Redux Toolkit state management with feature-based slice architecture (progression, graph, audio, ai slices)
- D3.js force layout + Canvas rendering for graph visualization
- Web Audio API synthesis for chord playback (no stored audio files)
- Feature-based project structure with co-located tests
- Shared TypeScript types package (`packages/shared`) for chord models and API contracts

### UX Design Requirements

UX-DR1: Chord node shape differentiation by chord type — circle (major), rounded square (minor), diamond (7th), hexagon (augmented), triangle (diminished)
UX-DR2: Chord node sizing by harmonic proximity — closer nodes rendered larger, distant nodes smaller
UX-DR3: Hover-to-scan interaction — node scales up 15%, brightness increases, Flow Mode emoji cue fades in; no audio on hover
UX-DR4: Click-to-preview interaction — audio plays progression + previewed chord in context, node enters pulsing glow state, "+" commit button appears
UX-DR5: Graph recentering animation — smooth 300ms pan to newly committed chord with ease-in-out easing
UX-DR6: Progression bar with chord chips — click chip to replay in context, hover reveals X to remove (no confirmation), sequential highlight during playback loop, placeholder text when empty
UX-DR7: Explanation panel — slides in from right (280px width), shows chord name, "Why this works" heading, 1-2 sentence explanation, chord function card, chord character card; skeleton shimmer during loading
UX-DR8: Key selector with state transitions — centered/prominent on first load, compact top-left after selection, clickable to change key later (clears progression)
UX-DR9: BPM control with tap tempo — number input alongside playback controls, tap button that averages BPM after 4+ taps, changes apply on next loop cycle
UX-DR10: Keyboard shortcuts — Space (play/stop), M (mode toggle), +/- (zoom), Backspace (remove last chord), Escape (dismiss preview), arrow keys (navigate graph nodes), Enter (preview/commit), Tab (cycle UI areas), L (list view toggle)
UX-DR11: Keyboard-accessible chord list alternative — hidden-by-default panel activated via L key or visually hidden link, shows same options as graph sorted by harmonic distance, each item shows chord name, type, distance, emoji cue
UX-DR12: Design system implementation — Tailwind CSS + Radix UI (Toggle, Popover, Select, Tooltip, VisuallyHidden), cool blue (#5B8DEF) accent, Nunito font, warm off-white (#FAFAF8) background, defined color token scale (primary-50 through primary-900)
UX-DR13: Loading and empty states — graph bloom animation on key selection (staggered fade-in 200ms), skeleton shimmer for AI loading, "Still thinking..." text after 5s, placeholder text in empty progression bar, disabled playback controls until 2+ chords
UX-DR14: Mobile unsupported message — viewport <768px shows "Songwriter is designed for desktop. Please visit on a larger screen."

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Interactive chord network graph with spatial layout |
| FR2 | Epic 2 | Select chord node for progression |
| FR3 | Epic 1 | Visual emphasis of strong next moves |
| FR4 | Epic 1 | Zoom in (3-5 strongest moves) |
| FR5 | Epic 1 | Zoom out (full landscape) |
| FR6 | Epic 1 | Navigate across chord types (major, minor, 7th, aug, dim) |
| FR7 | Epic 1 | Select starting key/chord |
| FR8 | Epic 2 | Build progression by selecting chords |
| FR9 | Epic 2 | View progression as ordered sequence |
| FR10 | Epic 2 | Remove chords from progression |
| FR11 | DEFERRED | Reorder chords in progression (deferred from MVP) |
| FR12 | Epic 2 | Clear progression |
| FR13 | Epic 2 | Enter existing chord as starting point |
| FR14 | Epic 2 | Contextual audio playback (not isolation) |
| FR15 | Epic 2 | Full progression playback |
| FR16 | Epic 2 | Seamless loop playback |
| FR17 | Epic 2 | Stop playback |
| FR18 | Epic 2 | Preview before committing |
| FR19 | Epic 3 | AI-generated explanations |
| FR20 | Epic 3 | Flow/Learn mode toggle |
| FR21 | Epic 3 | Flow Mode cues visible without tapping |
| FR22 | Epic 3 | Learn Mode with proper theory terminology |
| FR23 | Epic 3 | Explanations reference harmonic context |
| FR24 | Epic 4 | Keyboard navigation for graph and controls |
| FR25 | Epic 4 | Screen reader access for explanations |
| FR26 | Epic 1 | Non-color differentiation (shape, size, labels) |
| FR27 | Epic 4 | Keyboard audio playback controls |
| FR28 | Epic 1 | Zero-friction onboarding |
| FR29 | Epic 1 | Spatial metaphor guidance |

## Epic List

### Epic 1: Explore the Chord Map
Users can select a musical key and explore an interactive chord network graph where spatial distance represents harmonic closeness, discovering chord relationships visually through shape, size, and proximity.
**FRs covered:** FR1, FR3, FR4, FR5, FR6, FR7, FR26, FR28, FR29

### Epic 2: Build and Hear Progressions
Users can build chord progressions by selecting chords from the graph, hear them in context with seamless audio playback and looping, and manage their progression with full editing controls.
**FRs covered:** FR2, FR8, FR9, FR10, FR12, FR13, FR14, FR15, FR16, FR17, FR18

### Epic 3: AI Music Theory Guidance
Users can understand why chord choices work through AI-powered explanations, with Flow Mode emoji cues for creative momentum and Learn Mode for deep music theory learning.
**FRs covered:** FR19, FR20, FR21, FR22, FR23

### Epic 4: Accessibility & Keyboard Navigation
All users can fully navigate and operate the app using keyboard and screen reader, including an alternative chord list view for complete graph accessibility.
**FRs covered:** FR24, FR25, FR27

## Epic 1: Explore the Chord Map

Users can select a musical key and explore an interactive chord network graph where spatial distance represents harmonic closeness, discovering chord relationships visually through shape, size, and proximity.

### Story 1.1: Monorepo Scaffold & Development Environment

As a **developer**,
I want a fully configured Turborepo monorepo with Vite React frontend, Express backend, shared types package, Docker Compose, CI pipeline, and deployment config,
So that all subsequent features have a consistent development and deployment foundation.

**Acceptance Criteria:**

**Given** the project is initialized with `npx create-turbo@latest songwriter --package-manager pnpm`
**When** the scaffold is customized to match the architecture specification
**Then** the monorepo contains `apps/web` (Vite 8 + React), `apps/api` (Express), and `packages/shared` (TypeScript types)
**And** pnpm workspaces are configured and cross-package imports resolve correctly

**Given** the monorepo structure is in place
**When** `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` is run
**Then** the web app is accessible on port 3000, the API on port 4000, and Redis on port 6379
**And** Vite HMR is functional with volume mounts for hot reload

**Given** Docker Compose services are running
**When** a developer makes a change to frontend or backend code
**Then** the change is reflected without restarting containers (hot reload via volume mounts)

**Given** the CI pipeline is configured in `.github/workflows/ci.yml`
**When** code is pushed to the repository
**Then** GitHub Actions runs TypeScript compilation, Vitest tests, and Playwright E2E tests
**And** the pipeline fails if any check fails

**Given** Railway deployment configuration exists
**When** code is merged to main
**Then** Railway deploys the frontend as a static site, the API as a service, and Redis as a managed instance
**And** HTTPS is enforced on all deployed services

**Given** the `packages/shared` package exists
**When** types are defined in `packages/shared/src/types/`
**Then** both `apps/web` and `apps/api` can import and use these types with full TypeScript support

### Story 1.2: Design System & App Shell

As a **user**,
I want to see a polished, warm visual foundation with consistent typography and colors when I open the app,
So that the experience feels professional and inviting from the first moment.

**Acceptance Criteria:**

**Given** Tailwind CSS v4 is configured in the web app
**When** the Tailwind config is inspected
**Then** custom color tokens are defined: `primary-50` through `primary-900` (blue scale based on #5B8DEF), `surface` (#FAFAF8), `surface-elevated` (#FFFFFF), `text-primary` (#2D2D2D), `text-secondary` (#777777), `border` (#D0CDC8)
**And** spacing scale follows 4, 8, 12, 16, 24, 32, 48, 64px increments

**Given** the Nunito font is loaded
**When** any text is rendered in the app
**Then** Nunito is the primary font with the correct weight scale (400, 500, 600, 700)
**And** the type scale follows 12, 14, 16, 20, 24, 32px increments

**Given** Radix UI primitives are installed
**When** interactive components are needed (Toggle, Popover, Select, Tooltip, VisuallyHidden)
**Then** Radix UI components are available and styled with Tailwind utility classes

**Given** the app shell layout is rendered at 1280px+ viewport
**When** a user views the page
**Then** the layout shows a graph area (70-80% of viewport), a top bar area (key selector placeholder, zoom controls placeholder, mode toggle placeholder), and a progression bar area fixed at bottom
**And** the background is warm off-white (#FAFAF8)

**Given** Redux Toolkit store is configured
**When** the app initializes
**Then** the store contains skeleton slices for `progression`, `graph`, `audio`, and `ai` with initial state shapes matching the architecture specification
**And** typed `useAppDispatch` and `useAppSelector` hooks are available

**Given** a user opens the app on a viewport less than 768px wide
**When** the page renders
**Then** a message is displayed: "Songwriter is designed for desktop. Please visit on a larger screen."
**And** the main application UI is not rendered

### Story 1.3: Key Selector

As a **user**,
I want to select a musical key to start exploring chords,
So that the chord graph is initialized with the right harmonic context for my music.

**Acceptance Criteria:**

**Given** the app loads for the first time with no key selected
**When** the page renders
**Then** the key selector is displayed centered and prominent in the graph area
**And** no graph nodes are visible yet

**Given** the key selector is displayed
**When** the user selects a key root (C, C#, D, D#, E, F, F#, G, G#, A, A#, B) and quality (Major / Minor)
**Then** the graph area dispatches an action to initialize with the selected key
**And** the key selector transitions to a compact display in the top-left corner showing the current key (e.g., "G Major")

**Given** a key has been selected and the compact key selector is visible
**When** the user clicks the compact key selector
**Then** the key selector expands to allow changing the key
**And** selecting a new key reinitializes the graph with the new key context

**Given** the key selector uses Radix UI Select component
**When** a keyboard user focuses the selector
**Then** it is fully navigable via keyboard (arrow keys to browse, Enter to select)
**And** has an aria-label of "Select musical key"

### Story 1.4: Interactive Chord Network Graph

As a **user**,
I want to see an interactive chord network graph where chords are displayed as distinctly shaped nodes positioned by harmonic closeness,
So that I can visually discover chord relationships and intuitively understand which chords are strong moves from my current position.

**Acceptance Criteria:**

**Given** a key has been selected (e.g., G Major)
**When** the graph initializes
**Then** chord nodes appear with a staggered fade-in animation from center outward (200ms total bloom)
**And** the root chord appears first and largest at center, with neighbors following by proximity

**Given** the graph is rendered using D3.js force layout + Canvas
**When** nodes are displayed
**Then** chord types are visually differentiated by shape: circle (major), rounded square (minor), diamond (7th), hexagon (augmented), triangle (diminished)
**And** node size varies by harmonic proximity — closer nodes are larger, distant nodes are smaller
**And** graph interaction (click, hover) responds within 100ms

**Given** the graph is populated with chord nodes
**When** the user hovers over a chord node
**Then** the node scales up 15% and brightness increases
**And** no audio plays on hover (visual-only feedback)
**And** hover response is instant (<50ms)

**Given** the static chord relationship JSON data is bundled with the frontend
**When** the graph renders for any supported key
**Then** nodes for major, minor, 7th, augmented, and diminished chords are positioned by harmonic distance from the current chord
**And** visually closer nodes represent harmonically closer (stronger) moves

**Given** the graph is rendered
**When** neighboring nodes of the current chord are displayed
**Then** strong next moves are visually distinguished by proximity and visual emphasis (saturated blue tones for close nodes, desaturated tones for distant nodes)
**And** color is never the sole indicator — shape and size always supplement color

**Given** the graph has just initialized after key selection
**When** the user sees the graph for the first time
**Then** neighboring nodes glow/pulse subtly to invite the first click
**And** no tutorial modal, wizard, or instruction text is required to understand the interaction

**Given** the graph animation involves zoom transitions or node highlighting
**When** animations are running
**Then** the frame rate maintains 60fps with no visible jank

### Story 1.5: Graph Zoom Controls

As a **user**,
I want to zoom in to see only the 3-5 strongest next moves or zoom out to see the full harmonic landscape,
So that I can explore at my comfort level — focused options for when I want guidance, full landscape for when I want adventure.

**Acceptance Criteria:**

**Given** the graph is displaying chord nodes
**When** the user zooms in (via mouse wheel, pinch, or +/- overlay buttons)
**Then** only the 3-5 closest/strongest next moves from the current chord are visible
**And** node sizes increase to fill the available space
**And** the zoom transition is smooth (300ms, ease-in-out)

**Given** the graph is in zoomed-in view
**When** the user zooms out (via mouse wheel, pinch, or +/- overlay buttons)
**Then** the full harmonic landscape becomes visible with all chord nodes
**And** visual weight (size, saturation) indicates common vs. rare paths
**And** the zoom transition is smooth (300ms, ease-in-out)

**Given** the graph is in zoomed-out view
**When** the user clicks and drags on the graph canvas
**Then** the graph pans smoothly to follow the drag
**And** nodes remain interactive during and after panning

**Given** zoom controls are rendered as overlay buttons on the graph area
**When** the controls are visible
**Then** "+" and "-" buttons are available for zoom in/out
**And** the buttons are sized at minimum 44x44px for easy click targeting

**Given** the graph defaults to zoomed-in view after key selection
**When** a beginner user (like Jake) first sees the graph
**Then** they see a manageable 3-5 chord options rather than the full landscape
**And** this reduces overwhelm and invites exploration

## Epic 2: Build and Hear Progressions

Users can build chord progressions by selecting chords from the graph, hear them in context with seamless audio playback and looping, and manage their progression with full editing controls.

### Story 2.1: Web Audio Engine & Chord Synthesis

As a **user**,
I want to hear chords played through synthesized audio when I interact with the app,
So that I can audition chord sounds instantly without waiting for file downloads.

**Acceptance Criteria:**

**Given** the user performs their first click on any interactive element
**When** the Web Audio API context is initialized (browser requires user gesture)
**Then** the audio context is created and ready for playback
**And** no "click to enable audio" banner or extra step is required

**Given** the audio context is initialized
**When** a chord is requested for playback (e.g., "Cmaj", "Am7", "Bdim")
**Then** the chord is synthesized using Web Audio API oscillators/waveforms (no stored audio files)
**And** audio playback begins within 200ms of the request

**Given** the audio engine supports all MVP chord types
**When** any major, minor, 7th, augmented, or diminished chord is requested
**Then** the correct notes for that chord are synthesized and played simultaneously
**And** the synthesis produces a pleasant, musical tone (not raw sine waves)

**Given** audio is currently playing
**When** a new audio request arrives (e.g., user clicks a different chord)
**Then** the previous audio crossfades smoothly into the new audio (no abrupt cuts)

**Given** the audio engine is implemented in `features/audio-engine/`
**When** the audio slice is initialized in Redux
**Then** the state tracks `isPlaying`, `isLooping`, and `previewChord` as defined in the architecture specification

### Story 2.2: Click-to-Preview & Commit to Progression

As a **user**,
I want to click a chord node to hear it in the context of my current progression, then commit it with a "+" button,
So that I can audition chords before deciding to keep them — exploration is free, commitment is deliberate.

**Acceptance Criteria:**

**Given** the graph is populated and the user has a current chord (or starting root)
**When** the user clicks a chord node
**Then** audio plays the current progression context (last 2-3 chords) followed by the clicked chord
**And** the node enters a "previewing" state with a pulsing blue glow
**And** a "+" button appears on or near the node

**Given** a chord node is in previewing state
**When** the user clicks the "+" button
**Then** the chord is added to the end of the progression
**And** the graph smoothly recenters on the newly committed chord (300ms ease-in-out pan)
**And** new neighboring nodes appear around the committed chord
**And** the previewing state is cleared

**Given** a chord node is in previewing state
**When** the user clicks a different chord node
**Then** the previous preview is dismissed and the new chord is previewed
**And** audio plays the progression context followed by the new chord

**Given** a chord node is in previewing state
**When** the user clicks empty space on the graph canvas
**Then** the preview is dismissed (150ms fade)
**And** the node returns to its default state
**And** no chord is added to the progression

**Given** the user has no chords in their progression yet
**When** they click a chord node and then click "+"
**Then** that chord becomes the first chord in the progression
**And** the progression slice updates with `chords: [selectedChord]`

**Given** the user clicks through multiple nodes quickly
**When** each node is clicked without committing
**Then** each click replaces the previous preview seamlessly
**And** users can audition many chords without committing any

### Story 2.3: Progression Bar & Chord Management

As a **user**,
I want to see my chord progression as an interactive horizontal sequence where I can replay and remove chords,
So that I can shape my progression freely without fear of making mistakes.

**Acceptance Criteria:**

**Given** no chords have been committed to the progression
**When** the progression bar is rendered at the bottom of the viewport
**Then** placeholder text "Click a chord to start building" is displayed in muted gray (#999)
**And** playback controls are disabled (grayed out)

**Given** one or more chords have been committed
**When** the progression bar is rendered
**Then** each chord appears as a chip in left-to-right order matching the progression sequence
**And** chips have blue accent background (#EBF1FF) with blue text

**Given** the user hovers over a chord chip in the progression bar
**When** the hover is detected
**Then** the chip lifts slightly (translateY -2px)
**And** a small X button appears on the top-right of the chip

**Given** the user clicks a chord chip in the progression bar
**When** the click is registered
**Then** audio replays that chord in the context of the full progression
**And** the chip briefly pulses to indicate it was played

**Given** the user clicks the X button on a chord chip
**When** the X is clicked
**Then** the chord is removed from the progression immediately (no confirmation dialog)
**And** the chip shrinks and fades out (200ms animation)
**And** remaining chips slide to close the gap

**Given** the user clicks the Clear button (far right, de-emphasized)
**When** the button is clicked
**Then** all chord chips shrink and fade simultaneously (300ms)
**And** the progression is reset to empty
**And** the graph recenters on the key root chord
**And** playback stops immediately if playing
**And** no confirmation dialog is shown

**Given** the user has committed a chord via the graph
**When** the chord chip animates into the progression bar
**Then** the addition animation is smooth (300ms transition)

### Story 2.4: Full Progression Playback & Looping

As a **user**,
I want to play my full chord progression on a seamless loop and hear it as continuous music,
So that I can evaluate how my progression sounds as a repeating musical phrase.

**Acceptance Criteria:**

**Given** 2 or more chords are in the progression
**When** the user clicks the Play button
**Then** the full progression plays as a continuous audio sequence
**And** playback loops seamlessly with no audible gap or stutter between cycles
**And** the Play button icon swaps to a Pause icon

**Given** the progression is playing/looping
**When** each chord is reached during playback
**Then** the corresponding chip in the progression bar briefly highlights/pulses
**And** the highlighting tracks the current playback position in real time

**Given** the progression is playing
**When** the user clicks the Stop button (or Pause)
**Then** playback stops immediately
**And** the button icon swaps back to Play
**And** chip highlighting stops

**Given** fewer than 2 chords are in the progression
**When** the playback controls are rendered
**Then** Play and Loop buttons are disabled (grayed out)
**And** they cannot be clicked

**Given** the progression is playing
**When** the user removes a chord from the progression bar
**Then** the loop updates on the next cycle to reflect the change
**And** playback does not stop or restart mid-cycle

**Given** the progression is playing
**When** the user toggles Flow/Learn mode
**Then** playback continues uninterrupted
**And** mode switching never interrupts audio

**Given** playback controls are rendered
**When** inspected for accessibility
**Then** Play/Stop has aria-label that updates with state ("Play progression" / "Stop playback")

### Story 2.5: Tempo Control & Tap Tempo

As a **user**,
I want to adjust the playback tempo via BPM input or by tapping a rhythm,
So that I can match the progression's feel to my creative intent without knowing an exact BPM number.

**Acceptance Criteria:**

**Given** the playback controls are rendered
**When** the BPM control is visible
**Then** a number input shows the current BPM (default: 120)
**And** a "BPM" label is displayed alongside
**And** a Tap tempo button is visible next to the BPM input

**Given** the user edits the BPM number input
**When** a new value is entered (e.g., 90)
**Then** the BPM value updates immediately in the display
**And** the tempo change applies on the next loop cycle (current cycle finishes at the old BPM)

**Given** the user clicks the Tap tempo button repeatedly
**When** 4 or more taps are registered
**Then** the BPM is calculated by averaging the intervals between taps
**And** the BPM input updates to reflect the calculated value
**And** each tap briefly highlights the tap button for per-tap feedback

**Given** the user taps fewer than 4 times
**When** tapping pauses
**Then** no BPM change is applied (insufficient data)

**Given** the progression is looping at 120 BPM
**When** the user changes BPM to 90 mid-loop
**Then** the current cycle completes at 120 BPM
**And** the next cycle begins at 90 BPM
**And** the transition between tempos is seamless with no audio artifacts

**Given** BPM control is inspected for accessibility
**When** the input and button are focused
**Then** the BPM input has aria-label "Tempo in beats per minute"
**And** the Tap button has aria-label "Tap to set tempo"

## Epic 3: AI Music Theory Guidance

Users can understand why chord choices work through AI-powered explanations, with Flow Mode emoji cues for creative momentum and Learn Mode for deep music theory learning.

### Story 3.1: Express API Proxy & LLM Service

As a **developer**,
I want a backend API proxy that securely routes AI explanation requests through a caching layer with mock/real LLM service support,
So that the frontend can request theory explanations without exposing API keys, and E2E tests can run without real LLM calls.

**Acceptance Criteria:**

**Given** the Express API is configured in `apps/api/`
**When** a `POST /api/explain` request is received with chord context (current chord, progression, key)
**Then** the API processes the request and returns an explanation in `{ data: { explanation, chordFunction, chordCharacter } }` format
**And** errors return `{ error: { message, code } }` format

**Given** the `GET /api/health` endpoint exists
**When** a health check request is made
**Then** the API returns a 200 status with service health information

**Given** `express-rate-limit` middleware is configured
**When** a client exceeds the rate limit
**Then** subsequent requests are rejected with an appropriate error response
**And** legitimate usage within the limit is unaffected

**Given** CORS is configured with origin-locked policy
**When** a request arrives from the frontend origin
**Then** the request is allowed
**And** requests from any other origin are rejected

**Given** the Redis caching layer is configured
**When** an explanation request matches a cached key (`{chordA}->{chordB}:{key}:{context_hash}`)
**Then** the cached response is returned without calling the LLM
**And** cache hits are significantly faster than LLM calls

**Given** the `LLM_PROVIDER` environment variable is set to `mock`
**When** an explanation request is processed
**Then** the mock LLM service returns deterministic pre-written explanations for known chord pairs
**And** no real LLM API calls are made

**Given** the `LLM_PROVIDER` environment variable is set to `real`
**When** an explanation request is processed and no cache hit exists
**Then** the real LLM service calls the Claude API via the Anthropic SDK
**And** the response is cached in Redis before returning

**Given** the LLM service follows the interface contract in `llm-service.interface.ts`
**When** either real or mock implementation is used
**Then** both implement `getExplanation(request: ExplainRequest): Promise<ExplainResponse>`
**And** the factory in `llm-service.factory.ts` selects the implementation based on `LLM_PROVIDER`

**Given** API keys are configured as environment variables
**When** the frontend code is inspected
**Then** no LLM API keys, tokens, or secrets are present in client-side code

### Story 3.2: Flow Mode Emoji Cues

As a **user**,
I want to see emoji cues on chord nodes that quickly indicate the character of each chord move (safe, bold, colorful),
So that I can scan options rapidly during creative flow without needing to read explanations.

**Acceptance Criteria:**

**Given** the app is in Flow Mode (default mode)
**When** the user hovers over a chord node on the graph
**Then** an emoji cue fades in on the node (top-right position) indicating the chord's character
**And** cues use emojis like: thumbs up (safe/natural move), fire (bold move), sparkle (colorful/unusual), etc.

**Given** multiple chord nodes are visible on the graph
**When** the user scans by hovering across several nodes
**Then** emoji cues appear on each hovered node without requiring a click
**And** cues from previously hovered nodes fade out when hover leaves

**Given** the chord's relationship to the current progression context is analyzed
**When** an emoji cue is assigned
**Then** the cue accurately reflects the harmonic distance and character (close = safe, medium = interesting, far = adventurous)

**Given** the app is in Learn Mode
**When** the user hovers over a chord node
**Then** emoji cues still appear on hover (they are not exclusive to Flow Mode)
**And** the emoji serves as a quick visual summary alongside the full explanation

**Given** Flow Mode is the default
**When** a new user opens the app for the first time
**Then** Flow Mode is active
**And** emoji cues are the primary guidance mechanism until the user opts into Learn Mode

### Story 3.3: Learn Mode Toggle & Explanation Panel

As a **user**,
I want to toggle into Learn Mode and see AI-generated music theory explanations for my chord choices,
So that I can understand why a chord works in context and build my theory knowledge through creation.

**Acceptance Criteria:**

**Given** the Flow/Learn mode toggle is rendered (persistent, top-right area)
**When** the user clicks the toggle
**Then** the mode switches between Flow Mode and Learn Mode
**And** the toggle slides with a 250ms ease-out animation
**And** the toggle icon changes (e.g., music note for Flow, book for Learn)
**And** switching modes never interrupts audio playback or resets the graph

**Given** Learn Mode is active
**When** the user clicks a chord in the progression bar
**Then** the explanation panel slides in from the right side (280px width, 250ms ease-out)
**And** the graph area shrinks proportionally to accommodate the panel

**Given** the explanation panel is visible and a chord is selected
**When** the AI explanation loads
**Then** the panel displays: chord name (large, bold), "Why this works" heading, 1-2 sentence explanation using proper music theory terminology (tension, resolution, modal mixture, borrowed chords, etc.)
**And** a chord function card (e.g., "vi — Relative Minor")
**And** a chord character card (e.g., "Melancholy, introspective")
**And** the explanation references the harmonic context (key, chord function, relationship to previous chords)

**Given** an AI explanation is being fetched
**When** the panel is waiting for a response
**Then** a skeleton shimmer animation appears on the text areas (chord name stays visible)
**And** if loading exceeds 5 seconds, subtle "Still thinking..." text appears below the shimmer

**Given** the AI explanation API fails or is unavailable
**When** the panel cannot load an explanation
**Then** the panel displays "Unable to load explanation" with a retry button
**And** the graph and audio continue to function normally (graceful degradation)
**And** the error is logged to `console.error`

**Given** Learn Mode is active
**When** the user clicks the toggle back to Flow Mode
**Then** the explanation panel slides out to the right (250ms ease-out)
**And** the graph area expands back to full width

**Given** the explanation panel is visible
**When** inspected for accessibility
**Then** the panel has role "complementary" (aside)
**And** aria-live is set to "polite" so new explanations are announced to screen readers
**And** all text content is readable by screen reader
**And** the panel is focusable for keyboard users

**Given** an AI explanation is returned within the latency target
**When** the response time is measured
**Then** explanations arrive within 2 seconds of request

## Epic 4: Accessibility & Keyboard Navigation

All users can fully navigate and operate the app using keyboard and screen reader, including an alternative chord list view for complete graph accessibility.

### Story 4.1: Keyboard Navigation & Shortcuts

As a **keyboard-only user**,
I want to navigate and operate the entire app using keyboard shortcuts and tab navigation,
So that I can complete the full chord discovery and progression building journey without a mouse.

**Acceptance Criteria:**

**Given** the app is loaded and interactive
**When** the user presses Tab
**Then** focus cycles between major UI areas in visual order: top bar (key selector, zoom controls, mode toggle) → graph area → progression bar → playback controls
**And** a visible, high-contrast focus ring indicates the currently focused element

**Given** focus is in the graph area
**When** the user presses arrow keys
**Then** focus moves between chord nodes in a spatial direction (up/down/left/right maps to graph position)
**And** the focused node displays a high-contrast focus ring
**And** screen reader announces the focused node's chord name, type, and distance

**Given** a chord node is focused via keyboard
**When** the user presses Enter
**Then** the chord enters previewing state (same as clicking) — audio plays in context, "+" action becomes available
**And** pressing Enter again (or a designated key) commits the chord to the progression

**Given** the app is in any state
**When** keyboard shortcuts are used
**Then** Space toggles play/stop, M toggles Flow/Learn mode, +/= zooms in, - zooms out, Backspace removes the last chord from the progression, Escape dismisses any preview or deselects

**Given** skip links are implemented
**When** the page loads and the user presses Tab
**Then** "Skip to chord graph" and "Skip to progression" links appear as the first focusable elements
**And** activating a skip link moves focus to the target area

**Given** focus is on any interactive element (button, toggle, input, chord chip)
**When** the element is focused
**Then** a visible focus indicator (ring or outline) meets WCAG 2.1 AA contrast requirements
**And** focus order follows visual layout throughout the entire application

**Given** keyboard shortcuts are active
**When** the user is operating a screen reader
**Then** keyboard shortcuts do not conflict with common screen reader shortcuts (VoiceOver, NVDA, JAWS)

### Story 4.2: Chord List Alternative & Screen Reader Support

As a **screen reader user**,
I want an accessible chord list alternative to the visual graph and comprehensive ARIA support throughout the app,
So that I can discover chords, build progressions, and learn music theory with the same quality of experience as sighted users.

**Acceptance Criteria:**

**Given** the chord list alternative is implemented
**When** the user presses L or activates the visually hidden "List view" link
**Then** a list panel appears overlaying the graph area
**And** the list shows the same chord options currently visible on the graph, sorted by harmonic distance from the current chord (closest first)

**Given** the chord list is displayed
**When** each list item is rendered
**Then** it shows: chord name, chord type (major/minor/7th/aug/dim), distance description (close/medium/far), and the Flow Mode emoji cue
**And** each item is formatted as "[Chord name] — [type] — [close/medium/far] [emoji]"

**Given** the chord list is displayed
**When** the user navigates the list via keyboard (arrow keys)
**Then** pressing Enter on an item previews the chord (same audio and preview behavior as clicking a graph node)
**And** pressing Enter again or a designated commit key adds the chord to the progression
**And** the list updates when the graph recenters after a commit

**Given** the chord list panel is active
**When** the user presses L again or Escape
**Then** the list panel closes and focus returns to the graph area

**Given** the progression bar contains chords
**When** a screen reader reads the progression bar
**Then** each chord chip has aria-label: "[Chord name], position [n] of [total]. Click to replay, hover for remove."
**And** the progression bar is announced as a list

**Given** the user commits a chord or modifies the progression
**When** the progression changes
**Then** an aria-live region (polite) announces the change (e.g., "Am added to progression, position 3 of 3")

**Given** Learn Mode is active and an explanation is displayed
**When** a new explanation loads in the explanation panel
**Then** the aria-live region (polite) on the panel announces the new explanation text
**And** the screen reader reads the full explanation content including chord function and character

**Given** the playback controls are rendered
**When** the user operates audio controls via keyboard
**Then** all playback buttons (play, stop), BPM input, and tap tempo are fully operable via keyboard
**And** each has appropriate aria-labels that update with state

**Given** the entire app is rendered
**When** a WCAG 2.1 AA audit is performed
**Then** all text meets 4.5:1 contrast ratio minimum
**And** all interactive targets meet 44x44px minimum size
**And** audio content has visual equivalents (chord names in progression, explanation text)
**And** semantic HTML is used for all non-graph UI (nav, main, aside, button, input — no div-based buttons)
