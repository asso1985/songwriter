import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

interface ProgressionState {
  chords: string[];
  currentKey: string;
  isEditingKey: boolean;
}

const initialState: ProgressionState = {
  chords: [],
  currentKey: "",
  isEditingKey: false,
};

export const progressionSlice = createSlice({
  name: "progression",
  initialState,
  reducers: {
    setCurrentKey(state, action: PayloadAction<string>) {
      state.currentKey = action.payload;
      state.isEditingKey = false;
    },
    startEditingKey(state) {
      state.isEditingKey = true;
    },
    stopEditingKey(state) {
      state.isEditingKey = false;
    },
  },
});

export const { setCurrentKey, startEditingKey, stopEditingKey } =
  progressionSlice.actions;

export const selectCurrentKey = (state: RootState) =>
  state.progression.currentKey;

export const selectIsEditingKey = (state: RootState) =>
  state.progression.isEditingKey;

export default progressionSlice.reducer;
