import { createSlice } from "@reduxjs/toolkit";

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
  reducers: {},
});

export default aiSlice.reducer;
