export type ChordType = "major" | "minor" | "7th" | "aug" | "dim";

export interface ChordNode {
  id: string;
  name: string;
  type: ChordType;
  key: string;
}

export interface ChordRelationship {
  source: string;
  target: string;
  weight: number;
  label: string;
}
