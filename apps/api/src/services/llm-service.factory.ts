import type { LlmService } from "./llm-service.interface.js";
import { MockLlmService } from "./llm-service.mock.js";
import { RealLlmService } from "./llm-service.real.js";

export function createLlmService(): LlmService {
  const provider = process.env.LLM_PROVIDER ?? "mock";

  if (provider === "real") {
    return new RealLlmService();
  }

  return new MockLlmService();
}
