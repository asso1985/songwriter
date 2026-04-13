import { describe, it, expect } from "vitest";
import { MockLlmService } from "../services/llm-service.mock.js";
import type { ExplainRequest } from "@songwriter/shared";

describe("MockLlmService", () => {
  const service = new MockLlmService();

  it("returns mock explanation in flow mode", async () => {
    const request: ExplainRequest = {
      chordId: "c-major",
      progressionContext: [],
      key: "C",
      mode: "flow",
    };

    const response = await service.getExplanation(request);

    expect(response.explanation).toContain("c-major");
    expect(response.explanation).toContain("C");
    expect(response.emoji).toBe("✨");
  });

  it("returns mock explanation in learn mode", async () => {
    const request: ExplainRequest = {
      chordId: "g-major",
      progressionContext: [],
      key: "C",
      mode: "learn",
    };

    const response = await service.getExplanation(request);

    expect(response.explanation).toContain("g-major");
    expect(response.details).toBeDefined();
  });
});
