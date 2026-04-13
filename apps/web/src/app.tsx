import type { ChordNode } from "@songwriter/shared";

const sampleChord: ChordNode = {
  id: "c-major",
  name: "C Major",
  type: "major",
  key: "C",
};

export default function App() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <header className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold font-sans">Songwriter</h1>
      </header>
      <main className="p-4">
        <p className="text-text-secondary">
          Welcome to Songwriter. Ready to explore chords.
        </p>
        <p className="text-sm text-text-secondary mt-2">
          Sample chord: {sampleChord.name} ({sampleChord.type})
        </p>
      </main>
    </div>
  );
}
