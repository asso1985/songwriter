import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ExplainRequest, ExplainResponse } from "@songwriter/shared";
import type { RootState } from "..";

interface AiState {
  mode: "flow" | "learn";
  selectedChordId: string | null;
  explanation: ExplainResponse | null;
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: AiState = {
  mode: "flow",
  selectedChordId: null,
  explanation: null,
  status: "idle",
  error: null,
};

export const fetchExplanation = createAsyncThunk(
  "ai/fetchExplanation",
  async (params: ExplainRequest) => {
    const res = await fetch("http://localhost:4000/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(
        errorBody?.error?.message ?? `API error: ${res.status}`,
      );
    }
    const json = (await res.json()) as { data: ExplainResponse };
    return json.data;
  },
);

export const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<"flow" | "learn">) {
      state.mode = action.payload;
    },
    setSelectedChordId(state, action: PayloadAction<string | null>) {
      state.selectedChordId = action.payload;
      if (!action.payload) {
        state.explanation = null;
        state.status = "idle";
        state.error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExplanation.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExplanation.fulfilled, (state, action) => {
        state.status = "idle";
        state.explanation = action.payload;
      })
      .addCase(fetchExplanation.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Failed to fetch explanation";
        console.error("fetchExplanation failed:", action.error.message);
      });
  },
});

export const { setMode, setSelectedChordId } = aiSlice.actions;

export const selectMode = (state: RootState) => state.ai.mode;
export const selectSelectedChordId = (state: RootState) =>
  state.ai.selectedChordId;
export const selectExplanation = (state: RootState) => state.ai.explanation;
export const selectAiStatus = (state: RootState) => state.ai.status;
export const selectAiError = (state: RootState) => state.ai.error;

export default aiSlice.reducer;
