import { store } from "../store";

describe("Redux Store", () => {
  it("has the correct initial state shape", () => {
    const state = store.getState();

    expect(state.progression).toEqual({
      chords: [],
      currentKey: "",
      isEditingKey: false,
    });

    expect(state.graph).toEqual({
      zoomLevel: 1,
      selectedNode: null,
      hoveredNode: null,
      viewMode: "zoomed-in",
    });

    expect(state.audio).toEqual({
      isPlaying: false,
      isLooping: false,
      previewChord: null,
    });

    expect(state.ai).toEqual({
      mode: "flow",
      explanation: null,
      status: "idle",
      error: null,
    });
  });
});
