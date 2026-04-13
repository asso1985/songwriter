import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLlmService } from "../services/llm-service.factory.js";
import { MockLlmService } from "../services/llm-service.mock.js";
import { RealLlmService } from "../services/llm-service.js";

describe("createLlmService", () => {
  const originalEnv = process.env.LLM_PROVIDER;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.LLM_PROVIDER;
    } else {
      process.env.LLM_PROVIDER = originalEnv;
    }
  });

  it("returns MockLlmService by default", () => {
    delete process.env.LLM_PROVIDER;
    const service = createLlmService();
    expect(service).toBeInstanceOf(MockLlmService);
  });

  it("returns MockLlmService when LLM_PROVIDER=mock", () => {
    process.env.LLM_PROVIDER = "mock";
    const service = createLlmService();
    expect(service).toBeInstanceOf(MockLlmService);
  });

  it("returns RealLlmService when LLM_PROVIDER=real", () => {
    process.env.LLM_PROVIDER = "real";
    const service = createLlmService();
    expect(service).toBeInstanceOf(RealLlmService);
  });
});
