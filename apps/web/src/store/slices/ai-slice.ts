import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

interface AiState {
  mode: "flow" | "learn";
  explanation: string | null;
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: AiState = {
  mode: "flow",
  explanation: null,
  status: "idle",
  error: null,
};

export const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<"flow" | "learn">) {
      state.mode = action.payload;
    },
  },
});

export const { setMode } = aiSlice.actions;

export const selectMode = (state: RootState) => state.ai.mode;

export default aiSlice.reducer;
