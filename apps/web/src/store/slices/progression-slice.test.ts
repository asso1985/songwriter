import { configureStore } from "@reduxjs/toolkit";
import progressionReducer, {
  setCurrentKey,
  startEditingKey,
  selectCurrentKey,
  selectIsEditingKey,
} from "./progression-slice";
import graphReducer from "./graph-slice";
import audioReducer from "./audio-slice";
import aiReducer from "./ai-slice";

function createTestStore() {
  return configureStore({
    reducer: {
      progression: progressionReducer,
      graph: graphReducer,
      audio: audioReducer,
      ai: aiReducer,
    },
  });
}

describe("progressionSlice", () => {
  it("has empty currentKey initially", () => {
    const store = createTestStore();
    expect(selectCurrentKey(store.getState())).toBe("");
  });

  it("setCurrentKey updates the current key", () => {
    const store = createTestStore();
    store.dispatch(setCurrentKey("G_major"));
    expect(selectCurrentKey(store.getState())).toBe("G_major");
  });

  it("setCurrentKey can change to a different key", () => {
    const store = createTestStore();
    store.dispatch(setCurrentKey("C_major"));
    store.dispatch(setCurrentKey("A_minor"));
    expect(selectCurrentKey(store.getState())).toBe("A_minor");
  });

  it("setCurrentKey sets isEditingKey to false", () => {
    const store = createTestStore();
    store.dispatch(startEditingKey());
    expect(selectIsEditingKey(store.getState())).toBe(true);
    store.dispatch(setCurrentKey("C_major"));
    expect(selectIsEditingKey(store.getState())).toBe(false);
  });

  it("startEditingKey sets isEditingKey to true", () => {
    const store = createTestStore();
    expect(selectIsEditingKey(store.getState())).toBe(false);
    store.dispatch(startEditingKey());
    expect(selectIsEditingKey(store.getState())).toBe(true);
  });
});
