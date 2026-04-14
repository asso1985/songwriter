import { getChordsByKey, getAvailableKeys } from "./get-chords-by-key";

describe("getChordsByKey", () => {
  it("returns chord data for C Major", () => {
    const data = getChordsByKey("C_major");
    expect(data).not.toBeNull();
    expect(data!.root).toBe("C");
    expect(data!.quality).toBe("Major");
    expect(data!.chords.length).toBeGreaterThan(5);
    expect(data!.relationships.length).toBeGreaterThan(5);
  });

  it("returns chord data for G Major", () => {
    const data = getChordsByKey("G_major");
    expect(data).not.toBeNull();
    expect(data!.root).toBe("G");
  });

  it("returns chord data for A Minor", () => {
    const data = getChordsByKey("A_minor");
    expect(data).not.toBeNull();
    expect(data!.quality).toBe("Minor");
  });

  it("returns null for unsupported key", () => {
    expect(getChordsByKey("Z Major")).toBeNull();
  });

  it("root chord has distance 0", () => {
    const data = getChordsByKey("C_major")!;
    const root = data.chords.find((c) => c.distance === 0);
    expect(root).toBeDefined();
    expect(root!.id).toBe("C");
  });

  it("all chords have valid types", () => {
    const data = getChordsByKey("C_major")!;
    const validTypes = ["major", "minor", "7th", "aug", "dim"];
    for (const chord of data.chords) {
      expect(validTypes).toContain(chord.type);
    }
  });

  it("all relationship weights are positive integers", () => {
    const data = getChordsByKey("C_major")!;
    for (const rel of data.relationships) {
      expect(rel.weight).toBeGreaterThan(0);
      expect(Number.isInteger(rel.weight)).toBe(true);
    }
  });
});

describe("getAvailableKeys", () => {
  it("returns at least 6 keys", () => {
    const keys = getAvailableKeys();
    expect(keys.length).toBe(24);
  });

  it("includes C Major and A Minor", () => {
    const keys = getAvailableKeys();
    expect(keys).toContain("C_major");
    expect(keys).toContain("A_minor");
  });
});
