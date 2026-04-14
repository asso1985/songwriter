import type { ExplainRequest, ExplainResponse } from "@songwriter/shared";
import type { LlmService } from "./llm-service.interface.js";

// Pre-written responses for common chord pairs
const MOCK_RESPONSES: Record<string, ExplainResponse> = {
  "Am": {
    explanation:
      "Am is the relative minor of C major. It adds a melancholic, introspective quality while staying closely related to the home key.",
    chordFunction: "vi — Relative Minor",
    chordCharacter: "Melancholy, introspective",
    emoji: "🌙",
  },
  "G": {
    explanation:
      "G is the dominant chord, creating strong tension that naturally resolves back to the tonic. It's the strongest pull back home.",
    chordFunction: "V — Dominant",
    chordCharacter: "Bright, expectant",
    emoji: "⚡",
  },
  "F": {
    explanation:
      "F is the subdominant, providing a warm, open sound that contrasts gently with the tonic. Often precedes the dominant.",
    chordFunction: "IV — Subdominant",
    chordCharacter: "Warm, open",
    emoji: "☀️",
  },
  "Dm": {
    explanation:
      "Dm is the supertonic minor, commonly used in ii-V-I progressions. It creates a gentle pre-dominant pull toward the dominant.",
    chordFunction: "ii — Supertonic",
    chordCharacter: "Gentle, flowing",
    emoji: "🌊",
  },
  "Em": {
    explanation:
      "Em is the mediant minor, bridging tonic and dominant functions. It adds color without strong directional pull.",
    chordFunction: "iii — Mediant",
    chordCharacter: "Ethereal, colorful",
    emoji: "✨",
  },
};

export class MockLlmService implements LlmService {
  async getExplanation(request: ExplainRequest): Promise<ExplainResponse> {
    // Check for a pre-written response
    const prewritten = MOCK_RESPONSES[request.chordId];
    if (prewritten) {
      return { ...prewritten };
    }

    // Fallback generic response
    return {
      explanation: `${request.chordId} adds harmonic interest to the progression in the key of ${request.key}. It creates a ${request.mode === "flow" ? "distinctive" : "theoretically rich"} sound.`,
      chordFunction: `Chord ${request.chordId}`,
      chordCharacter: "Interesting, colorful",
      emoji: request.mode === "flow" ? "🎵" : undefined,
    };
  }
}
