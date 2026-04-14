import { describe, it, expect } from "vitest";
import aiReducer, { setMode, selectMode } from "./ai-slice";
import type { RootState } from "..";

describe("ai-slice", () => {
  it("has flow as default mode", () => {
    const state = aiReducer(undefined, { type: "unknown" });
    expect(state.mode).toBe("flow");
  });

  it("setMode changes to learn", () => {
    const state = aiReducer(undefined, setMode("learn"));
    expect(state.mode).toBe("learn");
  });

  it("setMode changes back to flow", () => {
    const learnState = aiReducer(undefined, setMode("learn"));
    const state = aiReducer(learnState, setMode("flow"));
    expect(state.mode).toBe("flow");
  });

  it("selectMode returns the mode", () => {
    const mockState = { ai: { mode: "learn" as const, explanation: null, status: "idle" as const, error: null } } as RootState;
    expect(selectMode(mockState)).toBe("learn");
  });
});
