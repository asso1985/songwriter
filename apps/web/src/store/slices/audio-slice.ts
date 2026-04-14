import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

interface AudioState {
  isPlaying: boolean;
  isLooping: boolean;
  previewChord: string | null;
  bpm: number;
}

const initialState: AudioState = {
  isPlaying: false,
  isLooping: false,
  previewChord: null,
  bpm: 120,
};

export const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setIsLooping(state, action: PayloadAction<boolean>) {
      state.isLooping = action.payload;
    },
    setPreviewChord(state, action: PayloadAction<string | null>) {
      state.previewChord = action.payload;
    },
    setBpm(state, action: PayloadAction<number>) {
      state.bpm = action.payload;
    },
    stopAll(state) {
      state.isPlaying = false;
      state.isLooping = false;
      state.previewChord = null;
    },
  },
});

export const { setIsPlaying, setIsLooping, setPreviewChord, setBpm, stopAll } =
  audioSlice.actions;

export const selectIsPlaying = (state: RootState) => state.audio.isPlaying;
export const selectIsLooping = (state: RootState) => state.audio.isLooping;
export const selectPreviewChord = (state: RootState) =>
  state.audio.previewChord;
export const selectBpm = (state: RootState) => state.audio.bpm;

export default audioSlice.reducer;
