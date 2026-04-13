import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./error-boundary";

function ThrowingComponent(): React.ReactNode {
  throw new Error("Test error");
}

function SafeComponent() {
  return <div>Safe content</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary fallback={<div>Fallback</div>}>
        <SafeComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Safe content")).toBeInTheDocument();
    expect(screen.queryByText("Fallback")).not.toBeInTheDocument();
  });

  it("renders fallback when child throws", () => {
    render(
      <ErrorBoundary fallback={<div>Fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Fallback")).toBeInTheDocument();
    expect(screen.queryByText("Safe content")).not.toBeInTheDocument();
  });
});
