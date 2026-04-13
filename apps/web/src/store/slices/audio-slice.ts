import { createSlice } from "@reduxjs/toolkit";

interface AudioState {
  isPlaying: boolean;
  isLooping: boolean;
  previewChord: string | null;
}

const initialState: AudioState = {
  isPlaying: false,
  isLooping: false,
  previewChord: null,
};

export const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {},
});

export default audioSlice.reducer;
