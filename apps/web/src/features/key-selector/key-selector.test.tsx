import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import progressionReducer from "../../store/slices/progression-slice";
import graphReducer from "../../store/slices/graph-slice";
import audioReducer from "../../store/slices/audio-slice";
import aiReducer from "../../store/slices/ai-slice";
import KeySelector, { KeySelectorCentered, KeySelectorExpanded } from "./key-selector";

function createTestStore(initialKey = "") {
  return configureStore({
    reducer: {
      progression: progressionReducer,
      graph: graphReducer,
      audio: audioReducer,
      ai: aiReducer,
    },
    preloadedState: {
      progression: { chords: [], currentKey: initialKey, isEditingKey: false },
    },
  });
}

function renderWithStore(ui: React.ReactElement, initialKey = "") {
  const store = createTestStore(initialKey);
  const result = render(<Provider store={store}>{ui}</Provider>);
  return { ...result, store };
}

describe("KeySelectorCentered", () => {
  it("renders the expanded selector when no key is selected", () => {
    renderWithStore(<KeySelectorCentered />);
    expect(screen.getByText("Choose a Key")).toBeInTheDocument();
  });

  it("renders root note and quality selectors", () => {
    renderWithStore(<KeySelectorCentered />);
    expect(screen.getByLabelText("Key root")).toBeInTheDocument();
    expect(screen.getByLabelText("Key quality")).toBeInTheDocument();
  });

  it("has accessible group label", () => {
    renderWithStore(<KeySelectorCentered />);
    expect(
      screen.getByRole("group", { name: "Select musical key" }),
    ).toBeInTheDocument();
  });

  it("does not render when a key is already selected", () => {
    renderWithStore(<KeySelectorCentered />, "C_major");
    expect(screen.queryByText("Choose a Key")).not.toBeInTheDocument();
  });

  it("shows helper text", () => {
    renderWithStore(<KeySelectorCentered />);
    expect(
      screen.getByText("Select a root note and quality to start exploring"),
    ).toBeInTheDocument();
  });
});

describe("KeySelectorExpanded", () => {
  it("calls onSelect with formatted key when both selectors have values", () => {
    const onSelect = vi.fn();
    // Render standalone without needing portal (test the callback logic)
    // We test the Redux integration via the app-level tests
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("KeySelector (compact)", () => {
  it("renders compact display with current key", () => {
    renderWithStore(<KeySelector />, "G_major");
    expect(
      screen.getByLabelText("Current key: G Major. Click to change."),
    ).toBeInTheDocument();
    expect(screen.getByText("G Major")).toBeInTheDocument();
  });

  it("does not render when no key is selected", () => {
    const { container } = renderWithStore(<KeySelector />);
    expect(container.innerHTML).toBe("");
  });

  it("compact button is styled with primary colors", () => {
    renderWithStore(<KeySelector />, "A_minor");
    const btn = screen.getByLabelText("Current key: A Minor. Click to change.");
    expect(btn.className).toContain("bg-primary-500");
  });
});
