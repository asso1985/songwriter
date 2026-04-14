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
    addChord(state, action: PayloadAction<string>) {
      state.chords.push(action.payload);
    },
    removeChord(state, action: PayloadAction<number>) {
      state.chords.splice(action.payload, 1);
    },
    clearChords(state) {
      state.chords = [];
    },
  },
});

export const {
  setCurrentKey,
  startEditingKey,
  stopEditingKey,
  addChord,
  removeChord,
  clearChords,
} = progressionSlice.actions;

export const selectCurrentKey = (state: RootState) =>
  state.progression.currentKey;

export const selectIsEditingKey = (state: RootState) =>
  state.progression.isEditingKey;

export const selectChords = (state: RootState) => state.progression.chords;

export default progressionSlice.reducer;
