/**
 * Chord frequency mapping utility.
 * Maps chord IDs (e.g., "C", "Am", "G7", "Bdim") to arrays of frequencies
 * using equal temperament tuning (A4 = 440Hz).
 */

import type { ChordType } from "@songwriter/shared";

const NOTE_NAMES: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

// Semitone intervals from root for each chord type
const CHORD_INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  "7th": [0, 4, 7, 10],
  aug: [0, 4, 8],
  dim: [0, 3, 6],
};

// Suffix-to-type mapping for chord ID parsing
const SUFFIX_MAP: Record<string, ChordType> = {
  m: "minor",
  "7": "7th",
  dim: "dim",
  aug: "aug",
};

const BASE_OCTAVE = 3;

/**
 * Convert a MIDI note number to frequency using equal temperament.
 * A4 (MIDI 69) = 440Hz
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Convert a note name and octave to a MIDI note number.
 * C3 = 48, A4 = 69
 */
export function noteToMidi(note: string, octave: number): number {
  const semitone = NOTE_NAMES[note];
  if (semitone === undefined) {
    throw new Error(`Unknown note: ${note}`);
  }
  return (octave + 1) * 12 + semitone;
}

/**
 * Parse a chord ID string into root note and chord type.
 * Examples: "C" → major, "Am" → minor, "G7" → 7th, "Bdim" → dim, "Caug" → aug
 */
export function parseChordId(chordId: string): {
  root: string;
  type: ChordType;
} {
  const match = chordId.match(/^([A-G][#b]?)(.*)/);
  if (!match) {
    throw new Error(`Invalid chord ID: ${chordId}`);
  }

  const root = match[1];
  const suffix = match[2];

  if (suffix === "") {
    return { root, type: "major" };
  }

  const type = SUFFIX_MAP[suffix];
  if (!type) {
    throw new Error(`Unknown chord suffix: ${suffix} in ${chordId}`);
  }

  return { root, type };
}

/**
 * Get an array of frequencies for the given chord ID.
 * Uses octave 3 as base for warm voicing.
 */
export function getChordFrequencies(chordId: string): number[] {
  const { root, type } = parseChordId(chordId);
  const intervals = CHORD_INTERVALS[type];
  const rootMidi = noteToMidi(root, BASE_OCTAVE);

  return intervals.map((interval) => midiToFrequency(rootMidi + interval));
}
