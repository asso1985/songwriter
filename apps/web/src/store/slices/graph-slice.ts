import { createSlice } from "@reduxjs/toolkit";

interface GraphState {
  zoomLevel: number;
  selectedNode: string | null;
  viewMode: "zoomed-in" | "zoomed-out";
}

const initialState: GraphState = {
  zoomLevel: 1,
  selectedNode: null,
  viewMode: "zoomed-in",
};

export const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: {},
});

export default graphSlice.reducer;
