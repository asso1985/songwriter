export interface ProgressionChord {
  id: string;
  chordId: string;
  position: number;
}

export interface Progression {
  id: string;
  chords: ProgressionChord[];
  currentKey: string;
}
