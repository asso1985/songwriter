import { configureStore } from "@reduxjs/toolkit";
import progressionReducer, {
  setCurrentKey,
  startEditingKey,
  addChord,
  removeChord,
  clearChords,
  selectCurrentKey,
  selectIsEditingKey,
  selectChords,
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

  it("has empty chords initially", () => {
    const store = createTestStore();
    expect(selectChords(store.getState())).toEqual([]);
  });

  it("addChord appends a chord to the progression", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    expect(selectChords(store.getState())).toEqual(["C"]);
  });

  it("addChord appends multiple chords in order", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    store.dispatch(addChord("F"));
    expect(selectChords(store.getState())).toEqual(["C", "Am", "F"]);
  });

  it("removeChord removes chord at the given index", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    store.dispatch(addChord("F"));
    store.dispatch(removeChord(1));
    expect(selectChords(store.getState())).toEqual(["C", "F"]);
  });

  it("removeChord at index 0 removes first chord", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    store.dispatch(removeChord(0));
    expect(selectChords(store.getState())).toEqual(["Am"]);
  });

  it("clearChords resets chords to empty", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    store.dispatch(clearChords());
    expect(selectChords(store.getState())).toEqual([]);
  });

  it("selectChords returns the chords array", () => {
    const store = createTestStore();
    store.dispatch(addChord("G"));
    store.dispatch(addChord("Em"));
    expect(selectChords(store.getState())).toEqual(["G", "Em"]);
  });
});
