import { describe, it, expect } from "vitest";
import aiReducer, {
  setMode,
  setSelectedChordId,
  fetchExplanation,
  selectMode,
  selectSelectedChordId,
  selectExplanation,
  selectAiStatus,
  selectAiError,
} from "./ai-slice";
import type { RootState } from "..";

const initialState = aiReducer(undefined, { type: "unknown" });

describe("ai-slice reducers", () => {
  it("has flow as default mode", () => {
    expect(initialState.mode).toBe("flow");
  });

  it("setMode changes to learn", () => {
    const state = aiReducer(initialState, setMode("learn"));
    expect(state.mode).toBe("learn");
  });

  it("setMode changes back to flow", () => {
    const learnState = aiReducer(initialState, setMode("learn"));
    const state = aiReducer(learnState, setMode("flow"));
    expect(state.mode).toBe("flow");
  });

  it("setSelectedChordId sets the chord", () => {
    const state = aiReducer(initialState, setSelectedChordId("Am"));
    expect(state.selectedChordId).toBe("Am");
  });

  it("setSelectedChordId to null clears explanation and resets status", () => {
    const loadedState = {
      ...initialState,
      selectedChordId: "Am",
      explanation: {
        explanation: "test",
        chordFunction: "vi",
        chordCharacter: "sad",
      },
      status: "idle" as const,
    };
    const state = aiReducer(loadedState, setSelectedChordId(null));
    expect(state.selectedChordId).toBeNull();
    expect(state.explanation).toBeNull();
    expect(state.status).toBe("idle");
  });

  it("fetchExplanation.pending sets status to loading", () => {
    const state = aiReducer(initialState, fetchExplanation.pending("", {} as any));
    expect(state.status).toBe("loading");
    expect(state.error).toBeNull();
  });

  it("fetchExplanation.fulfilled stores explanation", () => {
    const response = {
      explanation: "Am is the relative minor",
      chordFunction: "vi — Relative Minor",
      chordCharacter: "Melancholy",
    };
    const state = aiReducer(
      initialState,
      fetchExplanation.fulfilled(response, "", {} as any),
    );
    expect(state.status).toBe("idle");
    expect(state.explanation).toEqual(response);
  });

  it("fetchExplanation.rejected sets error", () => {
    const state = aiReducer(
      initialState,
      fetchExplanation.rejected(new Error("Network error"), "", {} as any),
    );
    expect(state.status).toBe("error");
    expect(state.error).toBe("Network error");
  });
});

describe("ai-slice selectors", () => {
  const mockState = {
    ai: {
      mode: "learn" as const,
      selectedChordId: "G",
      explanation: {
        explanation: "dominant",
        chordFunction: "V",
        chordCharacter: "bright",
      },
      status: "idle" as const,
      error: null,
    },
  } as RootState;

  it("selectMode returns mode", () => {
    expect(selectMode(mockState)).toBe("learn");
  });

  it("selectSelectedChordId returns chord id", () => {
    expect(selectSelectedChordId(mockState)).toBe("G");
  });

  it("selectExplanation returns explanation", () => {
    expect(selectExplanation(mockState)?.chordFunction).toBe("V");
  });

  it("selectAiStatus returns status", () => {
    expect(selectAiStatus(mockState)).toBe("idle");
  });

  it("selectAiError returns error", () => {
    expect(selectAiError(mockState)).toBeNull();
  });
});
