import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { store } from "../store";
import App from "../app";

function renderApp() {
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

  it("renders graph area placeholder", () => {
    renderApp();
    expect(
      screen.getByText("Chord graph will appear here"),
    ).toBeInTheDocument();
  });

  it("renders progression bar placeholder", () => {
    renderApp();
    expect(
      screen.getByText("Progression chords will appear here"),
    ).toBeInTheDocument();
  });
});
