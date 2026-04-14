import { describe, it, expect } from "vitest";
import {
  getChordFrequencies,
  parseChordId,
  noteToMidi,
  midiToFrequency,
} from "./chord-frequencies";

describe("midiToFrequency", () => {
  it("returns 440Hz for MIDI note 69 (A4)", () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 1);
  });

  it("returns ~261.63Hz for MIDI note 60 (C4)", () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 1);
  });

  it("returns ~130.81Hz for MIDI note 48 (C3)", () => {
    expect(midiToFrequency(48)).toBeCloseTo(130.81, 1);
  });
});

describe("noteToMidi", () => {
  it("maps C3 to MIDI 48", () => {
    expect(noteToMidi("C", 3)).toBe(48);
  });

  it("maps A4 to MIDI 69", () => {
    expect(noteToMidi("A", 4)).toBe(69);
  });

  it("maps C#3 to MIDI 49", () => {
    expect(noteToMidi("C#", 3)).toBe(49);
  });

  it("maps Db3 to MIDI 49", () => {
    expect(noteToMidi("Db", 3)).toBe(49);
  });

  it("maps B3 to MIDI 59", () => {
    expect(noteToMidi("B", 3)).toBe(59);
  });
});

describe("parseChordId", () => {
  it("parses major chord (no suffix)", () => {
    expect(parseChordId("C")).toEqual({ root: "C", type: "major" });
  });

  it("parses minor chord", () => {
    expect(parseChordId("Am")).toEqual({ root: "A", type: "minor" });
  });

  it("parses 7th chord", () => {
    expect(parseChordId("G7")).toEqual({ root: "G", type: "7th" });
  });

  it("parses diminished chord", () => {
    expect(parseChordId("Bdim")).toEqual({ root: "B", type: "dim" });
  });

  it("parses augmented chord", () => {
    expect(parseChordId("Caug")).toEqual({ root: "C", type: "aug" });
  });

  it("parses sharp root notes", () => {
    expect(parseChordId("C#")).toEqual({ root: "C#", type: "major" });
  });

  it("parses flat root notes", () => {
    expect(parseChordId("Eb")).toEqual({ root: "Eb", type: "major" });
  });

  it("parses flat root with minor suffix", () => {
    expect(parseChordId("Ebm")).toEqual({ root: "Eb", type: "minor" });
  });

  it("parses flat root with 7th suffix", () => {
    expect(parseChordId("Ab7")).toEqual({ root: "Ab", type: "7th" });
  });

  it("parses Bbm correctly", () => {
    expect(parseChordId("Bbm")).toEqual({ root: "Bb", type: "minor" });
  });
});

describe("getChordFrequencies", () => {
  it("returns 3 frequencies for a major chord", () => {
    const freqs = getChordFrequencies("C");
    expect(freqs).toHaveLength(3);
  });

  it("returns 3 frequencies for a minor chord", () => {
    const freqs = getChordFrequencies("Am");
    expect(freqs).toHaveLength(3);
  });

  it("returns 4 frequencies for a 7th chord", () => {
    const freqs = getChordFrequencies("G7");
    expect(freqs).toHaveLength(4);
  });

  it("returns 3 frequencies for an augmented chord", () => {
    const freqs = getChordFrequencies("Caug");
    expect(freqs).toHaveLength(3);
  });

  it("returns 3 frequencies for a diminished chord", () => {
    const freqs = getChordFrequencies("Bdim");
    expect(freqs).toHaveLength(3);
  });

  it("returns correct frequencies for C major (C3, E3, G3)", () => {
    const freqs = getChordFrequencies("C");
    // C3 = ~130.81, E3 = ~164.81, G3 = ~196.00
    expect(freqs[0]).toBeCloseTo(130.81, 0);
    expect(freqs[1]).toBeCloseTo(164.81, 0);
    expect(freqs[2]).toBeCloseTo(196.0, 0);
  });

  it("returns correct frequencies for Am (A3, C4, E4)", () => {
    const freqs = getChordFrequencies("Am");
    // A3 = ~220, C4 = ~261.63, E4 = ~329.63
    expect(freqs[0]).toBeCloseTo(220.0, 0);
    expect(freqs[1]).toBeCloseTo(261.63, 0);
    expect(freqs[2]).toBeCloseTo(329.63, 0);
  });

  it("returns correct frequencies for G7 (G3, B3, D4, F4)", () => {
    const freqs = getChordFrequencies("G7");
    // G3 = ~196, B3 = ~246.94, D4 = ~293.66, F4 = ~349.23
    expect(freqs[0]).toBeCloseTo(196.0, 0);
    expect(freqs[1]).toBeCloseTo(246.94, 0);
    expect(freqs[2]).toBeCloseTo(293.66, 0);
    expect(freqs[3]).toBeCloseTo(349.23, 0);
  });

  it("handles sharp root notes (F#)", () => {
    const freqs = getChordFrequencies("F#");
    expect(freqs).toHaveLength(3);
    // F#3 = ~185.0
    expect(freqs[0]).toBeCloseTo(185.0, 0);
  });

  it("handles flat root notes (Eb)", () => {
    const freqs = getChordFrequencies("Eb");
    expect(freqs).toHaveLength(3);
    // Eb3 = ~155.56
    expect(freqs[0]).toBeCloseTo(155.56, 0);
  });

  it("all frequencies are in a musically reasonable range (100Hz-1000Hz)", () => {
    const testChords = ["C", "Am", "G7", "Bdim", "Caug", "F#", "Ebm"];
    for (const chord of testChords) {
      const freqs = getChordFrequencies(chord);
      for (const freq of freqs) {
        expect(freq).toBeGreaterThan(100);
        expect(freq).toBeLessThan(1000);
      }
    }
  });
});
