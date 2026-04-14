import { describe, it, expect } from "vitest";
import audioReducer, {
  setIsPlaying,
  setIsLooping,
  setPreviewChord,
  setBpm,
  stopAll,
  selectIsPlaying,
  selectIsLooping,
  selectPreviewChord,
  selectBpm,
} from "./audio-slice";
import type { RootState } from "..";

const initialState = {
  isPlaying: false,
  isLooping: false,
  previewChord: null as string | null,
  bpm: 120,
};

describe("audio-slice reducers", () => {
  it("returns initial state", () => {
    const state = audioReducer(undefined, { type: "unknown" });
    expect(state).toEqual(initialState);
  });

  it("setIsPlaying sets playing to true", () => {
    const state = audioReducer(initialState, setIsPlaying(true));
    expect(state.isPlaying).toBe(true);
  });

  it("setIsPlaying sets playing to false", () => {
    const state = audioReducer(
      { ...initialState, isPlaying: true },
      setIsPlaying(false),
    );
    expect(state.isPlaying).toBe(false);
  });

  it("setIsLooping sets looping to true", () => {
    const state = audioReducer(initialState, setIsLooping(true));
    expect(state.isLooping).toBe(true);
  });

  it("setIsLooping sets looping to false", () => {
    const state = audioReducer(
      { ...initialState, isLooping: true },
      setIsLooping(false),
    );
    expect(state.isLooping).toBe(false);
  });

  it("setPreviewChord sets chord ID", () => {
    const state = audioReducer(initialState, setPreviewChord("Am"));
    expect(state.previewChord).toBe("Am");
  });

  it("setPreviewChord sets null to clear", () => {
    const state = audioReducer(
      { ...initialState, previewChord: "Am" },
      setPreviewChord(null),
    );
    expect(state.previewChord).toBeNull();
  });

  it("setBpm updates bpm value", () => {
    const state = audioReducer(initialState, setBpm(90));
    expect(state.bpm).toBe(90);
  });

  it("stopAll resets all playback state", () => {
    const playingState = {
      isPlaying: true,
      isLooping: true,
      previewChord: "G7" as string | null,
      bpm: 90,
    };
    const state = audioReducer(playingState, stopAll());
    expect(state.isPlaying).toBe(false);
    expect(state.isLooping).toBe(false);
    expect(state.previewChord).toBeNull();
    expect(state.bpm).toBe(90); // BPM should be preserved
  });
});

describe("audio-slice selectors", () => {
  const mockState = {
    audio: {
      isPlaying: true,
      isLooping: false,
      previewChord: "Dm",
      bpm: 100,
    },
  } as RootState;

  it("selectIsPlaying returns isPlaying", () => {
    expect(selectIsPlaying(mockState)).toBe(true);
  });

  it("selectIsLooping returns isLooping", () => {
    expect(selectIsLooping(mockState)).toBe(false);
  });

  it("selectPreviewChord returns previewChord", () => {
    expect(selectPreviewChord(mockState)).toBe("Dm");
  });

  it("selectBpm returns bpm", () => {
    expect(selectBpm(mockState)).toBe(100);
  });
});
