---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: ['brainstorming/brainstorming-session-2026-04-13-1030.md']
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
classification:
  projectType: web_app
  domain: edtech
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - Songwriter

**Author:** Omar
**Date:** 2026-04-13

## Executive Summary

Songwriter is a web-based interactive chord navigation tool that helps songwriters and music learners break out of basic major/minor chord patterns by making the full harmonic landscape visual, explorable, and understandable. Users click through an interactive chord network graph where spatial distance represents harmonic closeness, hear contextual audio previews of transitions, and receive AI-powered explanations of why each chord choice works — covering tension, resolution, modal color, and other music theory concepts. The product targets aspiring songwriters, self-taught musicians, and music students who want to write more harmonically interesting music without years of formal theory study.

### What Makes This Special

Most chord tools present static charts or isolated chord references. Songwriter turns harmonic relationships into a navigable spatial map — close nodes are safe moves, distant nodes are adventurous ones — so users intuitively grasp theory by exploring rather than studying. The key differentiator is AI-powered contextual guidance delivered at the moment of creative decision-making: when a user discovers a chord they'd never have picked, the app explains exactly why it works in that context. This closes the theory-to-practice gap that keeps most songwriters confined to familiar patterns. Current AI capabilities make this real-time, adaptive music theory guidance feasible for the first time at consumer scale.

## Project Classification

- **Type:** Web application (SPA with rich interactive visualization)
- **Domain:** EdTech — music education and creative tool
- **Complexity:** Medium — AI music theory engine, real-time audio, interactive graph visualization; no heavy regulatory requirements
- **Context:** Greenfield — new product, no existing codebase

## Success Criteria

### User Success

- Users create their first chord progression that surprises them — a sequence they wouldn't have discovered without the app — within their first session
- Users return to build additional progressions, indicating the tool has become part of their creative workflow
- Users report understanding *why* chord choices work, not just that they sound good

### Business Success

- **3-month target:** 1,000 registered accounts driven primarily through social media and music community sharing
- **12-month target:** 10,000 registered accounts with 30-40% activation rate (users who've completed at least one progression)
- Social media virality: users sharing progressions they've built, driving organic growth

### Technical Success

- Chord network graph renders and responds to interaction smoothly across modern browsers
- AI explanations generate in under 2 seconds to maintain creative flow
- Audio playback is seamless with no perceptible latency between chord transitions
- Application loads and is interactive within 3 seconds on standard broadband

### Measurable Outcomes

- Activation rate: 30-40% of registered users complete at least one progression
- Session engagement: users explore 5+ chord options per session on average
- Return rate: 25%+ of activated users return within 7 days
- Flow/Learn toggle usage indicates both creative and educational value being delivered

## Product Scope

### MVP (Phase 1) — Core Chord Discovery

1. **Interactive Chord Network Graph** — nodes representing major, minor, 7th, augmented, and diminished chords with distance = harmonic closeness
2. **Zoom Levels** — zoomed in (3-5 strongest moves) for beginners, zoomed out (full landscape) for advanced users
3. **Contextual Audio Playback** — hear chord transitions in context of the existing progression with seamless loop playback
4. **Flow/Learn Mode Toggle** — emoji cues for creative flow, full theory explanations for learning

### Phase 2 — Song Structure

- Section-Based Song Builder — verse, pre-chorus, chorus, bridge, special sections with context-aware AI suggestions
- Section Transition Intelligence — AI suggests chords that bridge between song sections
- Full Song Playback — play all sections as one continuous piece
- User feedback mechanism for flagging incorrect AI explanations

### Phase 3 — Depth & Polish

- Section Templates / Starting Points — contextually intelligent defaults per section type
- Progressive Disclosure — layered depth per chord (icon → summary → full theory → audio + explanation)
- Relationship Labels on Edges — theory annotations on graph connections
- Section Energy Curve — visual arc showing energy trajectory across song structure
- Extended chord vocabulary (9ths, 11ths, 13ths, sus chords, altered chords)

### Phase 4 — Community & Growth

- Explanation Style Personas — instrument-aware theory framing (guitarist, pianist, producer)
- Contextual Micro-Lessons — 30-second lessons triggered by interesting chord choices
- History-Aware Explanations — AI adapts explanation depth based on what it's already taught you
- Shareable progressions — export and share songs/progressions to social media
- Community features — discover progressions other users have built

## User Journeys

### Journey 1: Jake — "There's More Than Four Chords?"

**Who:** Jake, 19, self-taught guitarist. Plays campfire songs and bedroom covers. Knows G, C, D, Em and not much else. Bored of sounding the same every time he picks up his guitar.

**Opening Scene:** Jake's scrolling TikTok and sees someone playing a progression that sounds incredible — moody, unexpected, cinematic. He thinks "I could never figure that out." A comment links to Songwriter.

**Rising Action:** Jake opens the app and sees a chord network graph — his current chord (G) is in the center, with nodes radiating outward. The closest ones are familiar (C, D, Em). But further out, there are chords he's never tried. He taps one — Bbmaj7. The app plays his progression so far (G → Em) leading into Bbmaj7. It sounds *amazing*. An emoji cue shows a fire icon — "bold move." He's in Flow Mode, so the app doesn't lecture him, just lets him feel it.

**Climax:** Jake switches to Learn Mode on that same chord. The app explains: "Bbmaj7 is borrowed from G minor — it adds a cinematic, bittersweet quality by introducing a note (Bb) outside your key. This is called modal mixture." For the first time, Jake understands *why* something sounds cool, not just that it does. He didn't need a theory textbook — the graph showed him the way and the AI explained the view.

**Resolution:** Jake finishes a 4-chord verse progression that sounds nothing like anything he's played before. He builds a chorus section, and the AI suggests a transition chord to bridge them. He hits play and hears his first complete original song structure. He loops the verse to jam along. He screenshots the progression and sends it to his bandmate: "dude, listen to this."

**Requirements revealed:** Onboarding must be zero-friction — no theory knowledge assumed. Flow Mode must be the default. Graph zoom should start zoomed in. Audio preview is critical for validation. The "surprise chord" moment must happen within the first 2-3 clicks.

### Journey 2: Maria — "Breaking Through the Wall"

**Who:** Maria, 34, working songwriter with 10 years of experience. She's had songs placed in indie films and writes for a small publishing catalog. Lately every song she starts sounds like the last three. She knows theory — she just can't see past her own habits.

**Opening Scene:** Maria sits at her piano with a half-finished verse that's going nowhere. She's stuck on a IV-V-I resolution that feels predictable but she can't hear an alternative. She opens Songwriter looking for a creative push, not a lesson.

**Rising Action:** Maria enters her current progression into the section builder — verse: I → vi → IV → V. The chord graph shows her where she is and what's nearby. She zooms out to see the full harmonic landscape. She notices a cluster of chords she rarely uses — diminished chords, secondary dominants — shown as distant but connected nodes. She taps a iii chord as an alternative to V. The app plays her progression leading into it. Different. Interesting. She's not sure yet.

**Climax:** Maria switches to Learn Mode. The app explains: "Replacing V with iii creates a deceptive motion — your ear expects resolution but gets something more ambiguous. This keeps the listener leaning forward into the chorus." That's exactly the feeling she wanted but couldn't name. She builds a pre-chorus using the section builder, and the transition intelligence suggests a chord to bridge her verse into the pre-chorus that lifts the energy without the obvious V chord she always reaches for.

**Resolution:** Maria plays back her full song structure — verse → pre-chorus → chorus — and hears a song that sounds like her but *different*. She loops individual sections to test how they feel on repeat. The wall is broken, not because the app told her what to write, but because it showed her the options she'd stopped seeing. She starts a second song immediately, this time starting from the chorus and working backward.

**Requirements revealed:** Section builder must support entering existing progressions, not just building from scratch. Zoom-out view is essential for experienced users. Learn Mode explanations must use proper theory terminology — don't dumb it down. Transition intelligence must feel like a suggestion, not a prescription. Full song playback is the emotional payoff.

### Journey 3: Dev — "Theory Without the Textbook"

**Who:** Dev, 27, hip-hop and R&B producer. Makes beats in his DAW, samples loops, and layers melodies by ear. His progressions sound good but he doesn't know why — and when they don't work, he doesn't know how to fix them. He wants to understand theory to level up, but textbooks and courses feel disconnected from how he actually works.

**Opening Scene:** Dev is building a beat and has a two-chord loop (Fm → Ab) that vibes but feels incomplete. He wants to add a third or fourth chord but every option he tries by ear sounds wrong. He opens Songwriter to find what fits and understand why.

**Rising Action:** Dev enters Fm as his current chord. The graph lights up with options — Ab is right there (close, strong connection), confirming what he already felt. He sees Db nearby and taps it. The app plays Fm → Ab → Db in context. It grooves. The emoji cue shows a thumbs up — "natural move." He wants more, so he looks further out on the graph and taps Bbm7. The contextual playback gives him Fm → Ab → Db → Bbm7. That's the vibe.

**Climax:** Dev toggles to Learn Mode, curious now. The app explains: "You're moving through the key of Ab major — Fm is the vi, Ab is the I, Db is the IV, Bbm7 is the ii. This is a common R&B progression because the vi-start gives it a melancholy feel while the IV-ii motion keeps it moving." Dev realizes he's been writing in Ab major this whole time without knowing it. The graph suddenly makes sense as a *map* of the key, not just random options. Theory clicks — not as abstract rules, but as a description of what he's already doing.

**Resolution:** Dev goes back to his DAW with a 4-chord loop that feels intentional, not accidental. He loops the progression in Songwriter to confirm the feel before transferring it. Next time he's stuck, he knows how to use the graph to find what fits. He starts exploring what happens when he deliberately picks chords *outside* the key — the graph shows them as distant nodes, and the AI explains what each borrowed chord brings emotionally. He's learning theory by making beats, not by studying it.

**Requirements revealed:** Must support entering a starting chord and building from there (not just full progressions). Flow Mode emoji cues must validate choices quickly — producers work fast. Learn Mode must connect theory to genre context (R&B, hip-hop, pop). The graph must make key relationships visually obvious. Contextual audio must loop cleanly for beat-oriented users.

### Journey Requirements Summary

| Capability | Jake | Maria | Dev |
|---|---|---|---|
| Zero-friction onboarding | Critical | — | — |
| Chord network graph | Core | Core | Core |
| Zoom in (beginner) | Default | — | — |
| Zoom out (full landscape) | — | Critical | Useful |
| Contextual audio playback | Critical | Critical | Critical |
| Loop-friendly playback | Critical | Critical | Critical |
| Flow Mode (emoji cues) | Default | Available | Default |
| Learn Mode (full theory) | Discovery | Primary | Discovery |
| Section builder *(Phase 2)* | Later in journey | Immediate | — |
| Section transitions *(Phase 2)* | — | Critical | — |
| Full song playback *(Phase 2)* | Emotional payoff | Emotional payoff | — |
| Enter existing progression | — | Critical | Critical |

## Domain-Specific Requirements

### Privacy & Age Restrictions

- Minimum age: 16+ (no COPPA compliance needed; age gate required when user accounts are introduced in a future phase)
- GDPR considerations for EU users — consent for data collection and AI processing
- No student records or classroom data — standard consumer privacy practices apply

### Accessibility

- WCAG 2.1 AA compliance required — detailed accessibility requirements in Non-Functional Requirements section
- Key domain concern: the chord network graph is the primary interface and must be fully accessible to users who cannot rely on color or mouse interaction

### AI Content Accuracy

- Music theory explanations must be factually correct — incorrect theory undermines the core value proposition and user trust
- AI responses should be validated against established music theory principles (chord function, voice leading, harmonic analysis)
- Edge cases: borrowed chords, modal interchange, and genre-specific conventions must be explained accurately, not approximated
- User feedback mechanism for flagging incorrect explanations planned for Phase 2

## Innovation & Novel Patterns

### Detected Innovation Areas

- **From reference to instrument:** Static chord maps and circle-of-fifths diagrams exist in abundance — as paper tools, images, and basic apps. Songwriter's innovation is transforming this static reference into an interactive creative instrument where the map responds to your choices, plays audio in context, and explains itself through AI.
- **AI-at-the-moment-of-creation:** Music theory education has always been separated from music creation — you study, then you write. Songwriter collapses that gap by delivering contextual AI explanations during composition. The theory arrives when you're curious about a specific chord in a specific context, not as an abstract lesson.
- **Dual-mode interaction (Flow/Learn):** The same interface serves two distinct modes of engagement — creative momentum and educational depth — without requiring separate products or workflows.

### Market Context & Competitive Landscape

- Paper chord wheels, circle-of-fifths posters, and static chord reference apps are abundant and well-known
- Existing digital tools largely replicate the static reference model (chord dictionaries, scale finders)
- DAW plugins offer chord suggestion but without the spatial metaphor or educational AI layer
- No known tool combines interactive spatial navigation + contextual audio preview + AI theory explanation in a single creative flow

### Validation Approach

- Core assumption to validate: AI explanations are accurate and useful enough to deliver the "aha" moment without human curation
- MVP validation: do users actually discover chords they wouldn't have found otherwise? (track "distance from start" in graph)
- Learning validation: do users in Learn Mode retain theory concepts across sessions?
- Creative validation: do users complete full song structures, not just single progressions?

### Risk Mitigation

- **AI accuracy risk (HIGH):** AI-only explanations with no curated fallback means incorrect theory advice directly undermines trust. Mitigation: rigorous prompt engineering, validation against music theory corpus, and user feedback mechanism to flag errors.
- **AI latency risk (MEDIUM):** Explanations must arrive fast enough to maintain creative flow (<2 seconds). Mitigation: pre-compute common chord relationship explanations, cache frequently requested contexts.
- **Novelty vs. utility risk (LOW):** The spatial metaphor is cool but must prove useful beyond the first session. Mitigation: track return usage and progression completion rates as leading indicators.

## Web Application Specific Requirements

### Project-Type Overview

Songwriter is a single-page application (SPA) built for desktop-first usage. The interactive chord network graph and audio engine require sustained client-side state and rich interaction — SPA architecture is the natural fit. No real-time/multiplayer features for MVP. No SEO requirements for the application itself (marketing/landing page is out of MVP scope).

### Technical Architecture Considerations

- **Architecture:** SPA with client-side routing and state management
- **Audio engine:** Web Audio API for chord playback, contextual previews, and seamless looping
- **Graph rendering:** Canvas or WebGL-based visualization for the chord network (DOM-based rendering unlikely to perform at the required interaction fidelity)
- **AI integration:** Backend API calls to LLM for theory explanations, with caching layer for common chord relationships
- **State management:** Client-side state for current progression, graph position, and mode (Flow/Learn)

### Browser Support

| Browser | Support Level |
|---|---|
| Chrome (latest 2 versions) | Full support |
| Firefox (latest 2 versions) | Full support |
| Safari (latest 2 versions) | Full support |
| Edge (latest 2 versions) | Full support |
| Mobile browsers | Not targeted for MVP — functional but not optimized |

### Responsive Design

- **Desktop-first:** Primary design target is 1280px+ viewport width
- **Tablet:** Graceful degradation — usable but not optimized
- **Mobile:** Not a target for MVP. Graph interaction requires screen real estate that mobile viewports can't provide without significant UX rework
- **Minimum supported viewport:** 1024px width

### Implementation Considerations

- Web Audio API requires user gesture to initialize audio context (browser policy) — first interaction should activate audio
- Graph visualization library choice is critical — must support smooth zoom, pan, node highlighting, and dynamic edge rendering at 60fps
- AI explanation caching strategy: pre-compute explanations for common chord pairs within each key to reduce latency and API costs
- Offline capability not required for MVP — always-connected assumption is acceptable

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — the product must deliver the "discover a surprising chord and understand why it works" moment. If that moment doesn't land, nothing else matters.

**Resource Requirements:** Solo developer with AI assistance. This constraint demands a tight MVP — every feature must earn its place. The graph + audio + AI explanation loop is the core experience; everything else builds on top.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Jake (beginner): Full journey — discovers surprising chords, hears them in context, learns why they work
- Dev (producer): Full journey — finds chords that fit, builds loops, understands theory through creation
- Maria (experienced): Partial — gets graph exploration and theory but waits for section builder in Phase 2

**Must-Have Capabilities:**
1. **Interactive Chord Network Graph** — nodes representing major, minor, 7th, augmented, and diminished chords with distance = harmonic closeness. Simplified chord palette keeps the graph readable and the data model manageable.
2. **Zoom Levels** — zoomed in (3-5 strongest next moves) and zoomed out (full harmonic landscape). Serves both beginners and advanced users without separate UX.
3. **Contextual Audio Playback** — hear chord transitions in context of the current progression with seamless loop playback. Loop-friendly is critical for all personas.
4. **Flow/Learn Mode Toggle** — emoji cues for creative momentum, full theory explanations for learning. AI-only explanations, no curated fallback.

**Explicitly Deferred from MVP:**
- Section-based song builder (Phase 2)
- Section transition intelligence (Phase 2)
- Full song playback across sections (Phase 2)
- User accounts and registration (evaluate need before building)

### Post-MVP Features

**Phase 2 — Song Structure (Post-MVP):**
- Section-Based Song Builder — verse, pre-chorus, chorus, bridge, special
- Section Transition Intelligence — AI suggests bridging chords between sections
- Full Song Playback — play all sections as one continuous piece
- This phase completes Maria's journey and elevates the app from chord explorer to song builder

**Phase 3 — Depth & Polish:**
- Section Templates / Starting Points
- Progressive Disclosure (layered explanation depth per chord)
- Relationship Labels on Edges
- Section Energy Curve
- Extended chord vocabulary (9ths, 11ths, 13ths, sus chords, altered chords)

**Phase 4 — Community & Growth:**
- Explanation Style Personas (instrument-aware framing)
- Contextual Micro-Lessons
- History-Aware Explanations
- Shareable progressions / social export
- Community features

### Risk Mitigation Strategy

**Technical Risks:**
- *Graph rendering performance* — Simplified chord palette (major, minor, 7th, aug, dim) keeps node count manageable. Validate Canvas/WebGL performance early with a prototype.
- *AI explanation accuracy* — No curated fallback means bad theory = broken trust. Mitigation: invest heavily in prompt engineering, test against known music theory examples. User feedback mechanism planned for Phase 2.
- *Audio engine complexity* — Web Audio API looping must be seamless. Mitigation: prototype audio loop early, before building UI on top of it.

**Market Risks:**
- *"Is the graph enough without sections?"* — MVP hypothesis is that chord discovery + AI explanation delivers value on its own. Validate by tracking whether users complete progressions and return. If activation is low without sections, accelerate Phase 2.
- *Competitive risk* — Static chord tools exist but none combine interactive graph + contextual audio + AI. Speed to market matters more than feature completeness.

**Resource Risks:**
- *Solo dev bottleneck* — If development takes longer than expected, the 4-feature MVP is already lean. Further fallback: ship graph + audio without Flow/Learn toggle (AI explanations always on, no mode switching).
- *AI API costs* — Caching common chord relationship explanations reduces per-request costs. Monitor usage patterns early.

## Functional Requirements

### Chord Navigation & Discovery

- **FR1:** Users can view an interactive chord network graph where chords are displayed as nodes and spatial distance represents harmonic closeness
- **FR2:** Users can select a chord node to set it as the current chord in their progression
- **FR3:** Users can see which chords are strong next moves from their current chord (visually distinguished by proximity and emphasis)
- **FR4:** Users can zoom in on the graph to see only the 3-5 strongest next moves from the current chord
- **FR5:** Users can zoom out on the graph to see the full harmonic landscape with visual weight indicating common vs. rare paths
- **FR6:** Users can navigate chords across major, minor, 7th, augmented, and diminished chord types
- **FR7:** Users can select a starting key/chord to initialize the graph

### Progression Building

- **FR8:** Users can build a chord progression by sequentially selecting chords from the graph
- **FR9:** Users can view their current progression as an ordered sequence of chords
- **FR10:** Users can remove chords from their progression
- **FR11:** Users can reorder chords in their progression *(Deferred from MVP)*
- **FR12:** Users can clear their progression and start over
- **FR13:** Users can enter an existing chord as a starting point and build from there

### Audio Playback

- **FR14:** Users can hear a selected chord played in the context of their current progression (not in isolation)
- **FR15:** Users can play their full progression as a continuous audio sequence
- **FR16:** Users can loop playback of their progression seamlessly with no audible gap
- **FR17:** Users can stop audio playback at any time
- **FR18:** Users can preview a potential next chord before committing it to the progression

### AI Music Theory Guidance

- **FR19:** Users can receive AI-generated explanations of why a chord works in the context of their current progression
- **FR20:** Users can switch between Flow Mode (emoji/icon cues indicating chord character — safe, bold, colorful) and Learn Mode (full music theory explanations)
- **FR21:** Users can see Flow Mode cues on chord suggestions without needing to tap each one
- **FR22:** Users can access Learn Mode explanations that use proper music theory terminology (tension, resolution, modal mixture, borrowed chords, etc.)
- **FR23:** Users can view explanations that reference the harmonic context (key, chord function, relationship to previous chords)

### Accessibility

- **FR24:** Users can navigate the chord graph and all controls via keyboard
- **FR25:** Users can access all AI theory explanations via screen reader
- **FR26:** Users can distinguish chord relationships on the graph without relying solely on color (shape, size, labels, or patterns used alongside color)
- **FR27:** Users can operate all audio playback controls via keyboard

### Onboarding

- **FR28:** Users can start exploring chords immediately without prior music theory knowledge
- **FR29:** Users can understand the graph's spatial metaphor (close = harmonically related, far = adventurous) through initial guidance

## Non-Functional Requirements

### Performance

- Graph interaction (click, hover, zoom) responds within 100ms
- Audio playback begins within 200ms of chord selection
- Loop playback cycles seamlessly with no audible gap or stutter
- AI theory explanations return within 2 seconds of request
- Initial application load is interactive within 3 seconds on standard broadband
- Graph animation (zoom transitions, node highlighting) maintains 60fps

### Security

- AI API keys are never exposed to the client — all LLM calls route through a backend proxy
- No user data persisted server-side for MVP — all progression state lives client-side
- Backend proxy implements rate limiting to prevent API abuse
- HTTPS enforced for all connections

### Scalability

- Backend proxy supports 100 concurrent users with no performance degradation
- AI explanation caching reduces redundant LLM calls for common chord relationships
- Architecture allows scaling the backend proxy independently if user growth exceeds projections
- Client-side-first architecture means most load is on the user's browser, not the server

### Accessibility

- WCAG 2.1 AA compliance across all UI elements
- All interactive elements are keyboard-navigable (graph nodes, playback controls, mode toggle)
- Screen reader support for AI theory explanations and progression state
- Color is never the sole indicator of information — shape, size, labels, or patterns supplement color
- Minimum 4.5:1 contrast ratio for all text elements
- Audio content has visual equivalents (chord names, progression display) for hearing-impaired users
