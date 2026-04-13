import { render, screen } from "@testing-library/react";
import Layout from "./layout";

describe("Layout", () => {
  it("renders the app shell with header, main, and footer", () => {
    render(<Layout />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders placeholder content when no props given", () => {
    render(<Layout />);
    expect(screen.getByText("Chord graph will appear here")).toBeInTheDocument();
    expect(
      screen.getByText("Progression chords will appear here"),
    ).toBeInTheDocument();
  });

  it("renders custom topBar content", () => {
    render(<Layout topBar={<div>Custom Top Bar</div>} />);
    expect(screen.getByText("Custom Top Bar")).toBeInTheDocument();
  });

  it("renders custom graphArea content", () => {
    render(<Layout graphArea={<div>Custom Graph</div>} />);
    expect(screen.getByText("Custom Graph")).toBeInTheDocument();
  });

  it("renders custom progressionBar content", () => {
    render(<Layout progressionBar={<div>Custom Progression</div>} />);
    expect(screen.getByText("Custom Progression")).toBeInTheDocument();
  });

  it("includes skip links for accessibility", () => {
    render(<Layout />);
    expect(screen.getByText("Skip to chord graph")).toBeInTheDocument();
    expect(screen.getByText("Skip to progression")).toBeInTheDocument();
  });

  it("has graph area and progression bar with correct IDs for skip links", () => {
    render(<Layout />);
    expect(document.getElementById("graph-area")).toBeInTheDocument();
    expect(document.getElementById("progression-bar")).toBeInTheDocument();
  });
});
