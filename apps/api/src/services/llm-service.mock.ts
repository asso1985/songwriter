import type { ExplainRequest, ExplainResponse } from "@songwriter/shared";
import type { LlmService } from "./llm-service.interface.js";

export class MockLlmService implements LlmService {
  async getExplanation(request: ExplainRequest): Promise<ExplainResponse> {
    return {
      explanation: `Mock explanation for ${request.chordId} in key of ${request.key}`,
      emoji: request.mode === "flow" ? "✨" : undefined,
      details:
        request.mode === "learn"
          ? `This is a mock detailed explanation for ${request.chordId}.`
          : undefined,
    };
  }
}
