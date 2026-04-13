import type { ExplainRequest, ExplainResponse } from "@songwriter/shared";
import type { LlmService } from "./llm-service.interface.js";

export class RealLlmService implements LlmService {
  async getExplanation(request: ExplainRequest): Promise<ExplainResponse> {
    // Placeholder — real LLM integration will be added in a later story
    return {
      explanation: `Explanation for ${request.chordId} in key of ${request.key}`,
      emoji: "🎵",
      details: "Real LLM integration pending.",
    };
  }
}
