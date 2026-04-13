import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./error-boundary";

function ThrowingChild(): React.ReactNode {
  throw new Error("Graph crash");
}

function SafeChild() {
  return <div>Safe progression bar</div>;
}

describe("ErrorBoundary isolation", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("crash in one boundary does not affect sibling boundary", () => {
    render(
      <div>
        <ErrorBoundary fallback={<div>Graph error fallback</div>}>
          <ThrowingChild />
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Progression error fallback</div>}>
          <SafeChild />
        </ErrorBoundary>
      </div>,
    );

    expect(screen.getByText("Graph error fallback")).toBeInTheDocument();
    expect(screen.getByText("Safe progression bar")).toBeInTheDocument();
    expect(screen.queryByText("Progression error fallback")).not.toBeInTheDocument();
  });
});
