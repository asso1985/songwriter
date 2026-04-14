import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import progressionReducer, {
  addChord,
} from "../../store/slices/progression-slice";
import graphReducer from "../../store/slices/graph-slice";
import audioReducer from "../../store/slices/audio-slice";
import aiReducer from "../../store/slices/ai-slice";
import ProgressionBar from "./progression-bar";

// Mock useAudioContext since ProgressionBar uses it for playback
vi.mock("../audio-engine/use-audio-context", () => ({
  useAudioContext: () => ({
    playChord: vi.fn(),
    playSequence: vi.fn(),
    playLoop: vi.fn(),
    stopLoop: vi.fn(),
    stopAll: vi.fn(),
    isReady: true,
  }),
}));

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

function renderWithStore(store: ReturnType<typeof createTestStore>) {
  return render(
    <Provider store={store}>
      <ProgressionBar />
    </Provider>,
  );
}

describe("ProgressionBar", () => {
  it("shows placeholder text when progression is empty", () => {
    const store = createTestStore();
    renderWithStore(store);
    expect(
      screen.getByText("Click a chord to start building"),
    ).toBeInTheDocument();
  });

  it("shows disabled play button placeholder when empty", () => {
    const store = createTestStore();
    renderWithStore(store);
    const playBtn = screen.getByRole("button", { name: /play/i });
    expect(playBtn).toBeDisabled();
  });

  it("hides placeholder when chords exist", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    renderWithStore(store);
    expect(
      screen.queryByText("Click a chord to start building"),
    ).not.toBeInTheDocument();
  });

  it("renders chord chips when chords exist", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    store.dispatch(addChord("F"));
    renderWithStore(store);

    expect(screen.getByRole("button", { name: "C" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Am" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "F" })).toBeInTheDocument();
  });

  it("renders correct number of chips", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("G"));
    renderWithStore(store);

    const chips = screen.getAllByTestId("chord-chip");
    expect(chips).toHaveLength(2);
  });

  it("shows Clear button when chords exist", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    renderWithStore(store);
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("hides Clear button when progression is empty", () => {
    const store = createTestStore();
    renderWithStore(store);
    expect(
      screen.queryByRole("button", { name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it("Clear button dispatches clearChords after animation", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    renderWithStore(store);

    await user.click(screen.getByRole("button", { name: /clear/i }));

    // Simulate CSS transition end (jsdom doesn't fire transitions)
    const chipContainer = screen.getAllByTestId("chord-chip")[0].parentElement!;
    fireEvent.transitionEnd(chipContainer);

    expect(store.getState().progression.chords).toEqual([]);
  });

  it("clicking a chip dispatches setSelectedNode", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    renderWithStore(store);

    await user.click(screen.getByRole("button", { name: "Am" }));
    expect(store.getState().graph.selectedNode).toBe("Am");
  });

  it("shows X button on chip hover", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(addChord("C"));
    renderWithStore(store);

    const chip = screen.getByTestId("chord-chip");
    await user.hover(chip);

    const removeBtn = within(chip).getByRole("button", { name: /remove/i });
    expect(removeBtn).toBeInTheDocument();
  });

  it("X button is accessible with remove label", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(addChord("C"));
    renderWithStore(store);

    const chip = screen.getByTestId("chord-chip");
    await user.hover(chip);

    const removeBtn = within(chip).getByRole("button", { name: /remove c/i });
    expect(removeBtn).toHaveAccessibleName("Remove C");
  });

  it("Play button has aria-label 'Play progression' when stopped", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    renderWithStore(store);
    const playBtn = screen.getByRole("button", { name: "Play progression" });
    expect(playBtn).toBeInTheDocument();
    expect(playBtn).not.toBeDisabled();
  });

  it("Play button is disabled with fewer than 2 chords", () => {
    const store = createTestStore();
    store.dispatch(addChord("C"));
    renderWithStore(store);
    const playBtn = screen.getByRole("button", { name: "Play progression" });
    expect(playBtn).toBeDisabled();
  });

  it("clicking Play dispatches setIsPlaying(true)", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    renderWithStore(store);

    await user.click(screen.getByRole("button", { name: "Play progression" }));
    expect(store.getState().audio.isPlaying).toBe(true);
  });

  it("Play button shows stop icon and label when playing", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    renderWithStore(store);

    await user.click(screen.getByRole("button", { name: "Play progression" }));
    const stopBtn = screen.getByRole("button", { name: "Stop playback" });
    expect(stopBtn).toBeInTheDocument();
  });

  it("clicking Stop dispatches setIsPlaying(false)", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(addChord("C"));
    store.dispatch(addChord("Am"));
    renderWithStore(store);

    await user.click(screen.getByRole("button", { name: "Play progression" }));
    await user.click(screen.getByRole("button", { name: "Stop playback" }));
    expect(store.getState().audio.isPlaying).toBe(false);
  });
});
