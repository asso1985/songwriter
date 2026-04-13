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
  it("renders the Songwriter heading", () => {
    renderApp();
    expect(screen.getByText("Songwriter")).toBeInTheDocument();
  });

  it("renders welcome message", () => {
    renderApp();
    expect(
      screen.getByText(/Welcome to Songwriter/),
    ).toBeInTheDocument();
  });

  it("displays sample chord from shared types", () => {
    renderApp();
    expect(screen.getByText(/C Major/)).toBeInTheDocument();
  });
});
