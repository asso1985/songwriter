import chordData from "./chord-relationships.json";

export interface ChordEntry {
  id: string;
  name: string;
  type: "major" | "minor" | "7th" | "aug" | "dim";
  distance: number;
}

export interface ChordEdge {
  source: string;
  target: string;
  weight: number;
  label: string;
}

export interface KeyData {
  root: string;
  quality: string;
  chords: ChordEntry[];
  relationships: ChordEdge[];
}

const keys = chordData.keys as Record<string, KeyData>;

export function getChordsByKey(key: string): KeyData | null {
  return keys[key] ?? null;
}

export function getAvailableKeys(): string[] {
  return Object.keys(keys);
}
