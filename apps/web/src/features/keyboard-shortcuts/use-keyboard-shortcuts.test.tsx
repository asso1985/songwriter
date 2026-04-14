import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import aiReducer from "../../store/slices/ai-slice";
import audioReducer, { setIsPlaying } from "../../store/slices/audio-slice";
import progressionReducer, { addChord } from "../../store/slices/progression-slice";
import graphReducer from "../../store/slices/graph-slice";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import type { ReactNode } from "react";

vi.mock("../audio-engine/use-audio-context", () => ({
  useAudioContext: () => ({
    playChord: vi.fn(),
    playSequence: vi.fn(),
    playLoop: vi.fn(),
    stopLoop: vi.fn(),
    stopAll: vi.fn(),
    isReady: true,
  }),
}));

function createTestStore() {
  return configureStore({
    reducer: {
      ai: aiReducer,
      audio: audioReducer,
      progression: progressionReducer,
      graph: graphReducer,
    },
  });
}

function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

function fireKey(key: string, opts?: Partial<KeyboardEventInit>) {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...opts }),
  );
}

describe("useKeyboardShortcuts", () => {
  it("M toggles mode from flow to learn", () => {
    const store = createTestStore();
    renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(store),
    });

    fireKey("m");
    expect(store.getState().ai.mode).toBe("learn");
  });

  it("M toggles mode back to flow", async () => {
    const store = createTestStore();
    const { rerender } = renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(store),
    });

    fireKey("m");
    expect(store.getState().ai.mode).toBe("learn");

    // Re-render to pick up new mode in closure
    rerender();

    fireKey("m");
    expect(store.getState().ai.mode).toBe("flow");
  });

  it("Backspace removes last chord", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));

    renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(store),
    });

    fireKey("Backspace");
    expect(store.getState().progression.chords).toEqual(["C"]);
  });

  it("Backspace does nothing when no chords", () => {
    const store = createTestStore();
    renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(store),
    });

    fireKey("Backspace");
    expect(store.getState().progression.chords).toEqual([]);
  });

  it("Space toggles play when 2+ chords exist", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));

    renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(store),
    });

    fireKey(" ");
    expect(store.getState().audio.isPlaying).toBe(true);
  });

  it("Space does not play with fewer than 2 chords", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));

    renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(store),
    });

    fireKey(" ");
    expect(store.getState().audio.isPlaying).toBe(false);
  });
});
