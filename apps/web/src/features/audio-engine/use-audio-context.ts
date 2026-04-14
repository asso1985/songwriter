import { useCallback, useRef, useState } from "react";
import { getChordFrequencies } from "./chord-frequencies";
import {
  playChord as synthPlayChord,
  stopChord,
  type ActiveChord,
} from "./synth-engine";

interface UseAudioContextReturn {
  playChord: (chordId: string) => void;
  stopAll: () => void;
  isReady: boolean;
}

/**
 * Hook managing AudioContext lifecycle and chord playback.
 * Creates AudioContext lazily on first playChord() call (requires user gesture).
 * Handles crossfade between chords automatically.
 */
export function useAudioContext(): UseAudioContextReturn {
  const ctxRef = useRef<AudioContext | null>(null);
  const activeChordRef = useRef<ActiveChord | null>(null);
  const [isReady, setIsReady] = useState(false);
  // Guard against overlapping async playChord calls
  const playIdRef = useRef(0);

  const ensureContext = useCallback(async (): Promise<AudioContext> => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      setIsReady(true);
    }

    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }

    return ctxRef.current;
  }, []);

  const playChord = useCallback(
    (chordId: string) => {
      const currentPlayId = ++playIdRef.current;

      void (async () => {
        try {
          const ctx = await ensureContext();

          // Bail if a newer playChord call has started during the await
          if (currentPlayId !== playIdRef.current) return;

          // Stop previous chord with crossfade
          if (activeChordRef.current) {
            stopChord(ctx, activeChordRef.current);
          }

          // Play new chord
          const frequencies = getChordFrequencies(chordId);
          activeChordRef.current = synthPlayChord(ctx, frequencies);
        } catch (err) {
          console.error("Audio playback failed:", err);
        }
      })();
    },
    [ensureContext],
  );

  const stopAll = useCallback(() => {
    // Invalidate any in-flight async playChord calls
    playIdRef.current++;
    if (ctxRef.current && activeChordRef.current) {
      stopChord(ctxRef.current, activeChordRef.current);
      activeChordRef.current = null;
    }
  }, []);

  return { playChord, stopAll, isReady };
}
