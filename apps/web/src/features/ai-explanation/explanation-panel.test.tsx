import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import aiReducer from "../../store/slices/ai-slice";
import graphReducer from "../../store/slices/graph-slice";
import progressionReducer from "../../store/slices/progression-slice";
import audioReducer from "../../store/slices/audio-slice";
import ExplanationPanel from "./explanation-panel";

function createTestStore(aiOverrides?: Record<string, unknown>) {
  return configureStore({
    reducer: {
      ai: aiReducer,
      graph: graphReducer,
      progression: progressionReducer,
      audio: audioReducer,
    },
    preloadedState: {
      ai: {
        mode: "flow" as const,
        selectedChordId: null,
        explanation: null,
        status: "idle" as const,
        error: null,
        ...aiOverrides,
      },
    },
  });
}

function renderPanel(aiOverrides?: Record<string, unknown>) {
  const store = createTestStore(aiOverrides);
  return render(
    <Provider store={store}>
      <ExplanationPanel />
    </Provider>,
  );
}

describe("ExplanationPanel", () => {
  it("does not reserve layout space in flow mode", () => {
    renderPanel({ mode: "flow", selectedChordId: "Cmaj" });
    const aside = screen.getByRole("complementary");
    expect(aside.className).toContain("w-0");
    expect(aside.className).not.toContain("w-[280px]");
  });

  it("does not reserve layout space when no chord is selected in learn mode", () => {
    renderPanel({ mode: "learn", selectedChordId: null });
    const aside = screen.getByRole("complementary");
    expect(aside.className).toContain("w-0");
    expect(aside.className).not.toContain("w-[280px]");
  });

  it("shows panel with full width in learn mode with selected chord", () => {
    renderPanel({ mode: "learn", selectedChordId: "Cmaj" });
    const aside = screen.getByRole("complementary");
    expect(aside.className).toContain("w-[280px]");
    expect(aside.className).not.toContain("w-0");
  });

  it("displays chord name when visible", () => {
    renderPanel({ mode: "learn", selectedChordId: "Dm" });
    expect(screen.getByText("Dm")).toBeInTheDocument();
  });

  it("does not display content when hidden", () => {
    renderPanel({ mode: "flow", selectedChordId: "Dm" });
    expect(screen.queryByText("Dm")).not.toBeInTheDocument();
  });
});
