import { configureStore } from "@reduxjs/toolkit";
import progressionReducer from "./slices/progression-slice";
import graphReducer from "./slices/graph-slice";
import audioReducer from "./slices/audio-slice";
import aiReducer from "./slices/ai-slice";

export const store = configureStore({
  reducer: {
    progression: progressionReducer,
    graph: graphReducer,
    audio: audioReducer,
    ai: aiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
