import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import audioReducer from "../../store/slices/audio-slice";
import graphReducer, {
  setSelectedNode,
} from "../../store/slices/graph-slice";
import progressionReducer from "../../store/slices/progression-slice";
import aiReducer from "../../store/slices/ai-slice";
import { AudioEngine } from "./audio-engine";

// Mock the useAudioContext hook
const mockPlayChord = vi.fn();
const mockStopAll = vi.fn();

vi.mock("./use-audio-context", () => ({
  useAudioContext: () => ({
    playChord: mockPlayChord,
    stopAll: mockStopAll,
    isReady: true,
  }),
}));

function createTestStore() {
  return configureStore({
    reducer: {
      audio: audioReducer,
      graph: graphReducer,
      progression: progressionReducer,
      ai: aiReducer,
    },
  });
}

describe("AudioEngine", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    mockPlayChord.mockClear();
    mockStopAll.mockClear();
  });

  it("renders nothing (returns null)", () => {
    const { container } = render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("plays chord when selectedNode changes", () => {
    render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );

    act(() => {
      store.dispatch(setSelectedNode("Am"));
    });

    expect(mockPlayChord).toHaveBeenCalledWith("Am");
  });

  it("dispatches setPreviewChord when selectedNode changes", () => {
    render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );

    act(() => {
      store.dispatch(setSelectedNode("G7"));
    });

    expect(store.getState().audio.previewChord).toBe("G7");
  });

  it("does not play when selectedNode is cleared to null", () => {
    render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );

    act(() => {
      store.dispatch(setSelectedNode("Am"));
    });
    mockPlayChord.mockClear();

    act(() => {
      store.dispatch(setSelectedNode(null));
    });

    expect(mockPlayChord).not.toHaveBeenCalled();
  });

  it("calls stopAll when selectedNode is cleared to null", () => {
    render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );

    act(() => {
      store.dispatch(setSelectedNode("Am"));
    });
    mockStopAll.mockClear();

    act(() => {
      store.dispatch(setSelectedNode(null));
    });

    expect(mockStopAll).toHaveBeenCalled();
  });

  it("plays different chords in sequence", () => {
    render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );

    act(() => {
      store.dispatch(setSelectedNode("C"));
    });
    act(() => {
      store.dispatch(setSelectedNode("F"));
    });
    act(() => {
      store.dispatch(setSelectedNode("G7"));
    });

    expect(mockPlayChord).toHaveBeenCalledTimes(3);
    expect(mockPlayChord).toHaveBeenNthCalledWith(1, "C");
    expect(mockPlayChord).toHaveBeenNthCalledWith(2, "F");
    expect(mockPlayChord).toHaveBeenNthCalledWith(3, "G7");
  });
});
