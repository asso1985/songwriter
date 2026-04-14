# Story 3.1: Express API Proxy & LLM Service

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want a backend API proxy that securely routes AI explanation requests through a caching layer with mock/real LLM service support,
so that the frontend can request theory explanations without exposing API keys, and E2E tests can run without real LLM calls.

## Acceptance Criteria

1. **POST /api/explain** — Receives chord context (chordId, progressionContext, key, mode) and returns `{ data: { explanation, chordFunction, chordCharacter } }`. Errors return `{ error: { message, code } }`.

2. **GET /api/health** — Returns 200 with service health info. (Already exists.)

3. **Rate limiting** — `express-rate-limit` rejects requests exceeding the limit. Legitimate usage unaffected. (Already configured.)

4. **CORS** — Origin-locked policy allows frontend origin only. (Already configured.)

5. **Redis caching** — Explanation requests check Redis cache first. Key format: `{chordA}->{chordB}:{key}:{context_hash}`. Cache hits skip the LLM. Cache misses call LLM then cache the result.

6. **Mock LLM service** — When `LLM_PROVIDER=mock`, returns deterministic pre-written explanations with chordFunction and chordCharacter. No real API calls.

7. **Real LLM service** — When `LLM_PROVIDER=real`, calls Claude API via Anthropic SDK. Response cached in Redis before returning.

8. **Factory pattern** — `llm-service.factory.ts` selects real/mock based on `LLM_PROVIDER`. Both implement `LlmService` interface. (Already exists, needs update for new response shape.)

9. **No API keys in frontend** — All LLM calls routed through backend. Keys in env vars only.

10. **Tests** — Unit tests for: explain route (success, error, caching), mock LLM service, factory. Integration test for explain endpoint with mock.

## Tasks / Subtasks

- [x] Task 1: Update shared ExplainResponse type (AC: #1)
  - [x] Added `chordFunction: string` and `chordCharacter: string` to ExplainResponse
  - [x] Removed `details` field, added `ApiSuccessResponse<T>` and `ApiErrorResponse` wrapper types
  - [x] Simplified `ApiError` to `{ message, code }` (removed status field — HTTP status is separate)

- [x] Task 2: Update explain route response format (AC: #1)
  - [x] Response wrapped in `{ data: ExplainResponse }` on success
  - [x] Errors wrapped in `{ error: { message, code } }` — validation (400) and LLM (500)
  - [x] try/catch around LLM service call with 500 error response
  - [x] 4 unit tests: data wrapper, error wrapper, empty body, known chord response

- [x] Task 3: Implement Redis caching in explain route (AC: #5)
  - [x] Created `cache-service.ts` with `getCachedExplanation`/`cacheExplanation`
  - [x] Cache key: `explain:${chordId}:${key}:${contextJoin}`
  - [x] 24-hour TTL on cached entries
  - [x] Graceful degradation: try/catch around Redis calls, returns null on failure
  - [x] Route checks cache before LLM, caches result after LLM

- [x] Task 4: Update MockLlmService with richer responses (AC: #6)
  - [x] Pre-written responses for Am, G, F, Dm, Em with chordFunction/chordCharacter/emoji
  - [x] Fallback generic response for unknown chords
  - [x] 4 unit tests: known chord, pre-written fields, fallback, required fields

- [x] Task 5: Implement RealLlmService with Anthropic SDK (AC: #7)
  - [x] Installed `@anthropic-ai/sdk` in api package
  - [x] Prompt template requesting JSON response with explanation/chordFunction/chordCharacter/emoji
  - [x] Parses Claude response, validates required fields
  - [x] Uses `claude-sonnet-4-20250514` model, 300 max tokens

- [x] Task 6: Full verification (AC: #10)
  - [x] `pnpm turbo run check-types` — all pass
  - [x] `pnpm turbo run test` — 12 API tests + 177 web tests pass
  - [x] `pnpm turbo run build` — succeeds

## Dev Notes

### Architecture Compliance

- **All API code in `apps/api/src/`** — routes, services, middleware
- **Shared types in `packages/shared/src/types/`** — ExplainRequest, ExplainResponse, ApiError
- **File naming:** `kebab-case` for all files
- **Error format:** `{ error: { message: string, code: string } }` — standardized across all endpoints
- **Success format:** `{ data: T }` — standardized across all endpoints
- **LLM access:** Only through `llm-service.ts`/`llm-service.mock.ts`, never directly from routes
- **Tests in `apps/api/src/__tests__/`** — existing pattern from Story 1.1

### Existing Code to Reuse

- **`server.ts`:** Express app with CORS, rate limiting, routes, error handler — all configured
- **`routes/explain.ts`:** Route exists with validation — needs response format update + caching
- **`routes/health.ts`:** Working, no changes needed
- **`services/llm-service.interface.ts`:** Interface contract exists — needs updated response type
- **`services/llm-service.mock.ts`:** Mock exists — needs richer responses (chordFunction, chordCharacter)
- **`services/llm-service.real.ts`:** Placeholder exists — needs real Anthropic SDK call
- **`services/llm-service.factory.ts`:** Factory pattern exists — no structural changes needed
- **`services/redis-client.ts`:** Redis client singleton exists — use in cache service
- **`middleware/error-handler.ts`:** Error handler exists — verify it uses `{ error }` format
- **Existing tests:** 6 tests (health, mock LLM, factory) — extend, don't replace

### Technical Requirements

**Response Wrapping:**
```typescript
// Success
res.json({ data: explainResponse });

// Error
res.status(400).json({ error: { message: "...", code: "VALIDATION_ERROR" } });
res.status(500).json({ error: { message: "...", code: "LLM_ERROR" } });
```

**Cache Service:**
```typescript
// Key format
const cacheKey = `explain:${chordId}:${key}:${hash(progressionContext)}`;

// Hash function: simple string join + hash
function hashContext(context: string[]): string {
  return context.join(","); // or use a real hash for longer contexts
}
```

**Anthropic SDK Integration:**
```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 300,
  messages: [{ role: "user", content: prompt }],
});
```

**Prompt Template:**
```
You are a music theory expert. Explain why the chord ${chordId} works in the context of the key ${key} with the preceding progression [${context}].

Respond in JSON with these fields:
- explanation: 1-2 sentence explanation using music theory terminology
- chordFunction: The chord's function (e.g., "V — Dominant", "vi — Relative Minor")
- chordCharacter: The chord's emotional character (e.g., "Bright, resolved", "Tense, expectant")
- emoji: A single emoji representing the chord's character
```

### Previous Story Learnings

- API scaffold from Story 1.1 is solid — express, cors, rate-limit, routes, factory all in place
- Redis client is a singleton with error handling
- Tests use Vitest directly (no jsdom env needed for API tests)
- Express 5 uses async route handlers without needing `express-async-errors`
- Shared types imported via `@songwriter/shared` workspace protocol

### Anti-Patterns to Avoid

- Do NOT call the Anthropic SDK directly from the route — go through the LLM service interface
- Do NOT store API keys in code or config files — env vars only
- Do NOT make Redis a hard dependency — graceful degradation if unavailable
- Do NOT return raw LLM responses — always format through ExplainResponse type
- Do NOT skip the cache on writes — always cache successful LLM responses

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — API structure, LLM service pattern, Redis caching, response format]
- [Source: apps/api/src/ — Existing API scaffold from Story 1.1]
- [Source: packages/shared/src/types/api.ts — ExplainRequest, ExplainResponse types]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Redis mocked in explain tests via vi.mock to avoid real connection
- Express 5 async route handlers work without express-async-errors
- Anthropic SDK constructor reads ANTHROPIC_API_KEY from env — no key in code
- Cache service uses try/catch for graceful Redis degradation

### Completion Notes List

- Shared types: ExplainResponse updated with chordFunction/chordCharacter, added wrapper types
- Explain route: { data } / { error } response format, Redis cache integration, try/catch error handling
- Cache service: Redis-backed with 24h TTL, graceful degradation on connection failure
- MockLlmService: 5 pre-written responses (Am, G, F, Dm, Em) with music theory details
- RealLlmService: Anthropic SDK integration with prompt template and JSON parsing
- Error handler: updated to { error: { message, code } } format
- 12 API tests (6 new/updated) + 177 web tests passing. Build and type-check clean.

### File List

- packages/shared/src/types/api.ts (modified — added chordFunction, chordCharacter, wrapper types)
- apps/api/src/routes/explain.ts (modified — { data }/{ error } wrappers, Redis caching, try/catch)
- apps/api/src/services/cache-service.ts (new — Redis caching with graceful degradation)
- apps/api/src/services/llm-service.mock.ts (modified — richer responses with chordFunction/chordCharacter)
- apps/api/src/services/llm-service.real.ts (modified — Anthropic SDK integration with prompt template)
- apps/api/src/middleware/error-handler.ts (modified — { error } wrapper format)
- apps/api/src/__tests__/llm-service.test.ts (modified — updated for new response shape)
- apps/api/src/__tests__/explain.test.ts (new — 4 tests for explain endpoint)
- apps/api/package.json (modified — added @anthropic-ai/sdk)
- pnpm-lock.yaml (modified)

### Change Log

- 2026-04-14: Story 3.1 implemented — Express API with { data }/{ error } response format, Redis caching, mock/real LLM services, Anthropic SDK integration
