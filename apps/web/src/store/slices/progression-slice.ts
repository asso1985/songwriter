import { createSlice } from "@reduxjs/toolkit";

interface ProgressionState {
  chords: string[];
  currentKey: string;
}

const initialState: ProgressionState = {
  chords: [],
  currentKey: "",
};

export const progressionSlice = createSlice({
  name: "progression",
  initialState,
  reducers: {},
});

export default progressionSlice.reducer;
