import { Router } from "express";
import type { ExplainRequest } from "@songwriter/shared";
import { createLlmService } from "../services/llm-service.factory.js";
import {
  getCachedExplanation,
  cacheExplanation,
} from "../services/cache-service.js";

const router = Router();
const llmService = createLlmService();

function isValidExplainRequest(body: unknown): body is ExplainRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.chordId === "string" &&
    Array.isArray(b.progressionContext) &&
    typeof b.key === "string" &&
    (b.mode === "flow" || b.mode === "learn")
  );
}

router.post("/explain", async (req, res) => {
  if (!isValidExplainRequest(req.body)) {
    res.status(400).json({
      error: {
        message:
          "Invalid request: chordId, progressionContext, key, and mode are required",
        code: "VALIDATION_ERROR",
      },
    });
    return;
  }

  try {
    // Check cache first
    const cached = await getCachedExplanation(req.body);
    if (cached) {
      res.json({ data: cached });
      return;
    }

    // Call LLM service
    const response = await llmService.getExplanation(req.body);

    // Cache the result
    await cacheExplanation(req.body, response);

    res.json({ data: response });
  } catch (err) {
    console.error("Explain endpoint error:", err);
    res.status(500).json({
      error: {
        message: "Failed to generate explanation",
        code: "LLM_ERROR",
      },
    });
  }
});

export default router;
