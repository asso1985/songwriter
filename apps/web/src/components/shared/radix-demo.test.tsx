import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadixToggleDemo } from "./radix-demo";

describe("Radix UI Integration", () => {
  it("renders Toggle component from unified radix-ui package", () => {
    render(<RadixToggleDemo />);
    expect(screen.getByRole("button", { name: "Toggle mode" })).toBeInTheDocument();
  });

  it("Toggle switches state on click", async () => {
    render(<RadixToggleDemo />);
    const toggle = screen.getByRole("button", { name: "Toggle mode" });
    expect(toggle).toHaveTextContent("Flow");
    await userEvent.click(toggle);
    expect(toggle).toHaveTextContent("Learn");
  });

  it("Toggle is styled with Tailwind classes", () => {
    render(<RadixToggleDemo />);
    const toggle = screen.getByRole("button", { name: "Toggle mode" });
    expect(toggle.className).toContain("rounded-md");
    expect(toggle.className).toContain("text-sm");
  });
});
