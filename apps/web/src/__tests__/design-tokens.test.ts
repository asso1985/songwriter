import { readFileSync } from "fs";
import { resolve } from "path";

describe("Design Tokens", () => {
  const css = readFileSync(resolve(__dirname, "../index.css"), "utf-8");

  it("defines primary color scale (50-900)", () => {
    expect(css).toContain("--color-primary-50");
    expect(css).toContain("--color-primary-100");
    expect(css).toContain("--color-primary-500");
    expect(css).toContain("--color-primary-900");
  });

  it("defines surface colors", () => {
    expect(css).toContain("--color-surface: #FAFAF8");
    expect(css).toContain("--color-surface-elevated: #FFFFFF");
  });

  it("defines text colors", () => {
    expect(css).toContain("--color-text-primary: #2D2D2D");
    expect(css).toContain("--color-text-secondary: #777777");
  });

  it("defines graph chord colors", () => {
    expect(css).toContain("--color-chord-current");
    expect(css).toContain("--color-chord-close");
    expect(css).toContain("--color-chord-medium");
    expect(css).toContain("--color-chord-distant");
  });

  it("defines spacing scale tokens", () => {
    expect(css).toContain("--spacing-1: 4px");
    expect(css).toContain("--spacing-2: 8px");
    expect(css).toContain("--spacing-3: 12px");
    expect(css).toContain("--spacing-4: 16px");
    expect(css).toContain("--spacing-6: 24px");
    expect(css).toContain("--spacing-8: 32px");
    expect(css).toContain("--spacing-12: 48px");
    expect(css).toContain("--spacing-16: 64px");
  });

  it("defines font-size scale tokens", () => {
    expect(css).toContain("--font-size-xs");
    expect(css).toContain("--font-size-sm");
    expect(css).toContain("--font-size-base");
    expect(css).toContain("--font-size-lg");
    expect(css).toContain("--font-size-xl");
    expect(css).toContain("--font-size-2xl");
  });

  it("defines line-height tokens", () => {
    expect(css).toContain("--leading-tight: 1.2");
    expect(css).toContain("--leading-normal: 1.5");
  });

  it("defines Nunito as sans font", () => {
    expect(css).toContain("--font-family-sans");
    expect(css).toContain("Nunito");
  });
});
