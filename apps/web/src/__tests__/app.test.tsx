import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { configureStore } from "@reduxjs/toolkit";
import progressionReducer from "../store/slices/progression-slice";
import graphReducer from "../store/slices/graph-slice";
import audioReducer from "../store/slices/audio-slice";
import aiReducer from "../store/slices/ai-slice";
import App from "../app";

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

function renderApp(initialKey = "") {
  const store = createTestStore(initialKey);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
  );
}

describe("App", () => {
  it("renders the app shell with layout structure", () => {
    renderApp();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the desktop gate message", () => {
    renderApp();
    expect(
      screen.getByText(
        "Songwriter is designed for desktop. Please visit on a larger screen.",
      ),
    ).toBeInTheDocument();
  });

  it("shows key selector centered when no key selected", () => {
    renderApp();
    expect(screen.getByText("Choose a Key")).toBeInTheDocument();
    expect(screen.getByLabelText("Key root")).toBeInTheDocument();
    expect(screen.getByLabelText("Key quality")).toBeInTheDocument();
  });

  it("shows compact key selector in top bar when key is selected", () => {
    renderApp("G_major");
    expect(
      screen.getByLabelText("Current key: G Major. Click to change."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Choose a Key")).not.toBeInTheDocument();
  });

  it("shows zoom and mode placeholders when key is selected", () => {
    renderApp("C_major");
    expect(screen.getByText("Zoom Controls")).toBeInTheDocument();
    expect(screen.getByText("Flow")).toBeInTheDocument();
  });

  it("shows chord graph when key is selected", () => {
    renderApp("G_major");
    expect(screen.getByTestId("chord-graph")).toBeInTheDocument();
  });
});
