import { render, screen } from "@testing-library/react";
import DesktopGate from "./desktop-gate";

describe("DesktopGate", () => {
  it("renders both the gate message and children", () => {
    render(
      <DesktopGate>
        <div>App Content</div>
      </DesktopGate>,
    );
    expect(
      screen.getByText(
        "Songwriter is designed for desktop. Please visit on a larger screen.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("App Content")).toBeInTheDocument();
  });

  it("gate message container has md:hidden class for mobile-only visibility", () => {
    render(
      <DesktopGate>
        <div>App Content</div>
      </DesktopGate>,
    );
    const gateMessage = screen
      .getByText(
        "Songwriter is designed for desktop. Please visit on a larger screen.",
      )
      .closest("div");
    expect(gateMessage?.className).toContain("md:hidden");
  });

  it("children container has hidden md:contents class for desktop-only visibility", () => {
    const { container } = render(
      <DesktopGate>
        <div>App Content</div>
      </DesktopGate>,
    );
    const desktopContainer = container.querySelector(".md\\:contents");
    expect(desktopContainer).toBeInTheDocument();
    expect(desktopContainer?.className).toContain("hidden");
  });
});
