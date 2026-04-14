import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import progressionReducer from "../../store/slices/progression-slice";
import graphReducer from "../../store/slices/graph-slice";
import audioReducer from "../../store/slices/audio-slice";
import aiReducer from "../../store/slices/ai-slice";
import ZoomControls from "./zoom-controls";

function createTestStore(viewMode: "zoomed-in" | "zoomed-out" = "zoomed-in") {
  return configureStore({
    reducer: {
      progression: progressionReducer,
      graph: graphReducer,
      audio: audioReducer,
      ai: aiReducer,
    },
    preloadedState: {
      graph: { zoomLevel: 1, selectedNode: null, hoveredNode: null, viewMode },
    },
  });
}

function renderWithStore(viewMode: "zoomed-in" | "zoomed-out" = "zoomed-in") {
  const store = createTestStore(viewMode);
  return { ...render(<Provider store={store}><ZoomControls /></Provider>), store };
}

describe("ZoomControls", () => {
  it("renders + and - buttons", () => {
    renderWithStore();
    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
  });

  it("has accessible group label", () => {
    renderWithStore();
    expect(screen.getByRole("group", { name: "Zoom controls" })).toBeInTheDocument();
  });

  it("+ button is disabled when already zoomed in", () => {
    renderWithStore("zoomed-in");
    expect(screen.getByLabelText("Zoom in")).toBeDisabled();
    expect(screen.getByLabelText("Zoom out")).not.toBeDisabled();
  });

  it("- button is disabled when already zoomed out", () => {
    renderWithStore("zoomed-out");
    expect(screen.getByLabelText("Zoom out")).toBeDisabled();
    expect(screen.getByLabelText("Zoom in")).not.toBeDisabled();
  });

  it("clicking - dispatches zoom out", async () => {
    const { store } = renderWithStore("zoomed-in");
    await userEvent.click(screen.getByLabelText("Zoom out"));
    expect(store.getState().graph.viewMode).toBe("zoomed-out");
  });

  it("clicking + dispatches zoom in", async () => {
    const { store } = renderWithStore("zoomed-out");
    await userEvent.click(screen.getByLabelText("Zoom in"));
    expect(store.getState().graph.viewMode).toBe("zoomed-in");
  });

  it("buttons have correct size classes", () => {
    renderWithStore();
    const zoomIn = screen.getByLabelText("Zoom in");
    expect(zoomIn.className).toContain("w-8");
    expect(zoomIn.className).toContain("h-8");
  });
});
