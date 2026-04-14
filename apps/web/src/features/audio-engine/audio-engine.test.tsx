import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import audioReducer from "../../store/slices/audio-slice";
import graphReducer, {
  setSelectedNode,
} from "../../store/slices/graph-slice";
import progressionReducer, {
  addChord,
} from "../../store/slices/progression-slice";
import aiReducer from "../../store/slices/ai-slice";
import { AudioEngine } from "./audio-engine";

// Mock the useAudioContext hook
const mockPlayChord = vi.fn();
const mockPlaySequence = vi.fn();
const mockStopAll = vi.fn();

vi.mock("./use-audio-context", () => ({
  useAudioContext: () => ({
    playChord: mockPlayChord,
    playSequence: mockPlaySequence,
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
    mockPlaySequence.mockClear();
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

  it("plays single chord with preview duration when no progression context exists", () => {
    render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );

    act(() => {
      store.dispatch(setSelectedNode("Am"));
    });

    expect(mockPlayChord).toHaveBeenCalledWith("Am", 2000);
    expect(mockPlaySequence).not.toHaveBeenCalled();
  });

  it("plays sequence when progression has chords", () => {
    render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );

    act(() => {
      store.dispatch(addChord("C"));
      store.dispatch(addChord("F"));
    });

    act(() => {
      store.dispatch(setSelectedNode("G"));
    });

    expect(mockPlaySequence).toHaveBeenCalledWith(["C", "F"], "G");
    expect(mockPlayChord).not.toHaveBeenCalled();
  });

  it("uses last 3 chords as context when progression is longer", () => {
    render(
      <Provider store={store}>
        <AudioEngine />
      </Provider>,
    );

    act(() => {
      store.dispatch(addChord("C"));
      store.dispatch(addChord("Am"));
      store.dispatch(addChord("F"));
      store.dispatch(addChord("G"));
    });

    act(() => {
      store.dispatch(setSelectedNode("Em"));
    });

    expect(mockPlaySequence).toHaveBeenCalledWith(["Am", "F", "G"], "Em");
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
    mockPlaySequence.mockClear();

    act(() => {
      store.dispatch(setSelectedNode(null));
    });

    expect(mockPlayChord).not.toHaveBeenCalled();
    expect(mockPlaySequence).not.toHaveBeenCalled();
  });
});
