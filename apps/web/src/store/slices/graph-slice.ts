import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

interface GraphState {
  zoomLevel: number;
  selectedNode: string | null;
  hoveredNode: string | null;
  viewMode: "zoomed-in" | "zoomed-out";
}

const initialState: GraphState = {
  zoomLevel: 1,
  selectedNode: null,
  hoveredNode: null,
  viewMode: "zoomed-in",
};

export const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: {
    setSelectedNode(state, action: PayloadAction<string | null>) {
      state.selectedNode = action.payload;
    },
    setHoveredNode(state, action: PayloadAction<string | null>) {
      state.hoveredNode = action.payload;
    },
    setZoomLevel(state, action: PayloadAction<number>) {
      state.zoomLevel = action.payload;
    },
    setViewMode(state, action: PayloadAction<"zoomed-in" | "zoomed-out">) {
      state.viewMode = action.payload;
    },
  },
});

export const { setSelectedNode, setHoveredNode, setZoomLevel, setViewMode } =
  graphSlice.actions;

export const selectSelectedNode = (state: RootState) =>
  state.graph.selectedNode;
export const selectHoveredNode = (state: RootState) =>
  state.graph.hoveredNode;
export const selectZoomLevel = (state: RootState) => state.graph.zoomLevel;
export const selectViewMode = (state: RootState) => state.graph.viewMode;

export default graphSlice.reducer;
