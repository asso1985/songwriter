import Anthropic from "@anthropic-ai/sdk";
import type { ExplainRequest, ExplainResponse } from "@songwriter/shared";
import type { LlmService } from "./llm-service.interface.js";

function buildPrompt(request: ExplainRequest): string {
  const context =
    request.progressionContext.length > 0
      ? `preceding progression [${request.progressionContext.join(" → ")}]`
      : "no preceding chords";

  return `You are a music theory expert explaining chord choices to a songwriter.

Explain why the chord ${request.chordId} works in the key of ${request.key} with ${context}.

Respond ONLY with valid JSON (no markdown, no backticks) in this exact format:
{
  "explanation": "1-2 sentence explanation using music theory terminology (tension, resolution, modal mixture, borrowed chords, etc.)",
  "chordFunction": "The chord's function, e.g. 'V — Dominant' or 'vi — Relative Minor'",
  "chordCharacter": "The chord's emotional character, e.g. 'Bright, resolved' or 'Tense, expectant'",
  "emoji": "A single emoji representing the chord's character"
}`;
}

export class RealLlmService implements LlmService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async getExplanation(request: ExplainRequest): Promise<ExplainResponse> {
    const message = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: buildPrompt(request) }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from LLM");
    }

    // Strip markdown fences if present (LLMs sometimes wrap JSON in ```json ... ```)
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    let parsed: ExplainResponse;
    try {
      parsed = JSON.parse(jsonText) as ExplainResponse;
    } catch {
      throw new Error(`Failed to parse LLM response as JSON: ${jsonText.slice(0, 100)}`);
    }

    // Validate required fields
    if (!parsed.explanation || !parsed.chordFunction || !parsed.chordCharacter) {
      throw new Error("LLM response missing required fields");
    }

    return {
      explanation: parsed.explanation,
      chordFunction: parsed.chordFunction,
      chordCharacter: parsed.chordCharacter,
      emoji: parsed.emoji,
    };
  }
}
