import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import aiReducer from "../../store/slices/ai-slice";
import graphReducer from "../../store/slices/graph-slice";
import progressionReducer from "../../store/slices/progression-slice";
import audioReducer from "../../store/slices/audio-slice";
import ModeToggle from "./mode-toggle";

function createTestStore() {
  return configureStore({
    reducer: {
      ai: aiReducer,
      graph: graphReducer,
      progression: progressionReducer,
      audio: audioReducer,
    },
  });
}

describe("ModeToggle", () => {
  it("shows Flow mode by default", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ModeToggle />
      </Provider>,
    );
    expect(screen.getByText("Flow")).toBeInTheDocument();
  });

  it("toggles to Learn mode on click", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ModeToggle />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: /switch to learn/i }));
    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(store.getState().ai.mode).toBe("learn");
  });

  it("toggles back to Flow mode", async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ModeToggle />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: /switch to learn/i }));
    await user.click(screen.getByRole("button", { name: /switch to flow/i }));
    expect(screen.getByText("Flow")).toBeInTheDocument();
    expect(store.getState().ai.mode).toBe("flow");
  });

  it("has accessible aria-label", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ModeToggle />
      </Provider>,
    );
    expect(
      screen.getByRole("button", { name: "Switch to Learn Mode" }),
    ).toBeInTheDocument();
  });
});
