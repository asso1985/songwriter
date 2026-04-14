import { describe, it, expect } from "vitest";
import { MockLlmService } from "../services/llm-service.mock.js";
import type { ExplainRequest } from "@songwriter/shared";

describe("MockLlmService", () => {
  const service = new MockLlmService();

  it("returns pre-written response for known chord (Am)", async () => {
    const request: ExplainRequest = {
      chordId: "Am",
      progressionContext: ["C"],
      key: "C_major",
      mode: "flow",
    };

    const response = await service.getExplanation(request);

    expect(response.explanation).toContain("relative minor");
    expect(response.chordFunction).toBe("vi — Relative Minor");
    expect(response.chordCharacter).toBe("Melancholy, introspective");
    expect(response.emoji).toBe("🌙");
  });

  it("returns pre-written response for G chord", async () => {
    const request: ExplainRequest = {
      chordId: "G",
      progressionContext: [],
      key: "C_major",
      mode: "learn",
    };

    const response = await service.getExplanation(request);

    expect(response.chordFunction).toBe("V — Dominant");
    expect(response.chordCharacter).toBe("Bright, expectant");
  });

  it("returns fallback response for unknown chord", async () => {
    const request: ExplainRequest = {
      chordId: "Bb7",
      progressionContext: [],
      key: "C_major",
      mode: "flow",
    };

    const response = await service.getExplanation(request);

    expect(response.explanation).toContain("Bb7");
    expect(response.chordFunction).toContain("Bb7");
    expect(response.chordCharacter).toBeDefined();
    expect(response.emoji).toBe("🎵");
  });

  it("returns all required fields in every response", async () => {
    const request: ExplainRequest = {
      chordId: "F",
      progressionContext: ["C", "Am"],
      key: "C_major",
      mode: "learn",
    };

    const response = await service.getExplanation(request);

    expect(response).toHaveProperty("explanation");
    expect(response).toHaveProperty("chordFunction");
    expect(response).toHaveProperty("chordCharacter");
    expect(typeof response.explanation).toBe("string");
    expect(typeof response.chordFunction).toBe("string");
    expect(typeof response.chordCharacter).toBe("string");
  });
});
