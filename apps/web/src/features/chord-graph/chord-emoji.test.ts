import { describe, it, expect } from "vitest";
import { getChordEmoji } from "./chord-emoji";

describe("getChordEmoji", () => {
  it("returns home emoji for distance 0 (root)", () => {
    expect(getChordEmoji(0)).toBe("🏠");
  });

  it("returns thumbs up for distance 1 (safe)", () => {
    expect(getChordEmoji(1)).toBe("👍");
  });

  it("returns fire for distance 2 (bold)", () => {
    expect(getChordEmoji(2)).toBe("🔥");
  });

  it("returns sparkle for distance 3 (colorful)", () => {
    expect(getChordEmoji(3)).toBe("✨");
  });

  it("returns rainbow for distance 4+ (adventurous)", () => {
    expect(getChordEmoji(4)).toBe("🌈");
    expect(getChordEmoji(5)).toBe("🌈");
    expect(getChordEmoji(10)).toBe("🌈");
  });
});
