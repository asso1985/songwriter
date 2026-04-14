import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import progressionReducer from "../../store/slices/progression-slice";
import graphReducer from "../../store/slices/graph-slice";
import audioReducer from "../../store/slices/audio-slice";
import aiReducer from "../../store/slices/ai-slice";
import ChordGraph from "./chord-graph";

function createTestStore() {
  return configureStore({
    reducer: {
      progression: progressionReducer,
      graph: graphReducer,
      audio: audioReducer,
      ai: aiReducer,
    },
  });
}

function renderWithStore(ui: React.ReactElement) {
  const store = createTestStore();
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
}

describe("ChordGraph", () => {
  it("renders the graph container", () => {
    renderWithStore(<ChordGraph currentKey="C_major" />);
    expect(screen.getByTestId("chord-graph")).toBeInTheDocument();
  });

  it("renders a canvas element for supported key", () => {
    renderWithStore(<ChordGraph currentKey="C_major" />);
    const canvas = screen.getByRole("img", { name: "Chord network graph" });
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("shows error message for unsupported key", () => {
    renderWithStore(<ChordGraph currentKey="Z Major" />);
    expect(screen.getByText("No chord data available for Z Major")).toBeInTheDocument();
  });
});
