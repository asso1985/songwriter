import type { ExplainRequest, ExplainResponse } from "@songwriter/shared";
import { getRedisClient } from "./redis-client.js";

const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

function buildCacheKey(request: ExplainRequest): string {
  const contextHash = request.progressionContext.join(",");
  return `explain:${request.chordId}:${request.key}:${request.mode}:${contextHash}`;
}

export async function getCachedExplanation(
  request: ExplainRequest,
): Promise<ExplainResponse | null> {
  try {
    const client = await getRedisClient();
    const key = buildCacheKey(request);
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached) as ExplainResponse;
    }
    return null;
  } catch {
    // Redis unavailable — graceful degradation
    return null;
  }
}

export async function cacheExplanation(
  request: ExplainRequest,
  response: ExplainResponse,
): Promise<void> {
  try {
    const client = await getRedisClient();
    const key = buildCacheKey(request);
    await client.set(key, JSON.stringify(response), { EX: CACHE_TTL });
  } catch {
    // Redis unavailable — skip caching silently
  }
}
