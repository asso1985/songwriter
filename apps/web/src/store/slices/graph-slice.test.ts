import { configureStore } from "@reduxjs/toolkit";
import graphReducer, {
  setSelectedNode,
  setHoveredNode,
  setZoomLevel,
  setViewMode,
  selectSelectedNode,
  selectHoveredNode,
  selectZoomLevel,
  selectViewMode,
} from "./graph-slice";
import progressionReducer from "./progression-slice";
import audioReducer from "./audio-slice";
import aiReducer from "./ai-slice";

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

describe("graphSlice", () => {
  it("has correct initial state", () => {
    const store = createTestStore();
    const state = store.getState();
    expect(selectSelectedNode(state)).toBeNull();
    expect(selectHoveredNode(state)).toBeNull();
    expect(selectZoomLevel(state)).toBe(1);
    expect(selectViewMode(state)).toBe("zoomed-in");
  });

  it("setSelectedNode updates selected node", () => {
    const store = createTestStore();
    store.dispatch(setSelectedNode("Am"));
    expect(selectSelectedNode(store.getState())).toBe("Am");
  });

  it("setSelectedNode can clear selection", () => {
    const store = createTestStore();
    store.dispatch(setSelectedNode("Am"));
    store.dispatch(setSelectedNode(null));
    expect(selectSelectedNode(store.getState())).toBeNull();
  });

  it("setHoveredNode updates hovered node", () => {
    const store = createTestStore();
    store.dispatch(setHoveredNode("G"));
    expect(selectHoveredNode(store.getState())).toBe("G");
  });

  it("setZoomLevel updates zoom", () => {
    const store = createTestStore();
    store.dispatch(setZoomLevel(2));
    expect(selectZoomLevel(store.getState())).toBe(2);
  });

  it("setViewMode updates view mode", () => {
    const store = createTestStore();
    store.dispatch(setViewMode("zoomed-out"));
    expect(selectViewMode(store.getState())).toBe("zoomed-out");
  });
});
