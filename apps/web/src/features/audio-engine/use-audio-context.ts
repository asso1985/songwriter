import { useCallback, useRef, useState } from "react";
import { getChordFrequencies } from "./chord-frequencies";
import {
  playChord as synthPlayChord,
  stopChord,
  type ActiveChord,
} from "./synth-engine";

const PREVIEW_DURATION = 2000; // ms — auto-release after 2 seconds

interface UseAudioContextReturn {
  /** Play a single chord. Pass duration in ms for auto-release, omit for indefinite sustain. */
  playChord: (chordId: string, duration?: number) => void;
  playSequence: (contextChords: string[], previewChord: string) => void;
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
  const scheduledTimeoutsRef = useRef<number[]>([]);
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

  const clearScheduled = useCallback(() => {
    for (const id of scheduledTimeoutsRef.current) {
      clearTimeout(id);
    }
    scheduledTimeoutsRef.current = [];
  }, []);

  const playChord = useCallback(
    (chordId: string, duration?: number) => {
      const currentPlayId = ++playIdRef.current;
      clearScheduled();

      void (async () => {
        try {
          const ctx = await ensureContext();

          if (currentPlayId !== playIdRef.current) return;

          // Stop previous chord with crossfade
          if (activeChordRef.current) {
            stopChord(ctx, activeChordRef.current);
          }

          // Play new chord — with auto-release if duration provided
          const frequencies = getChordFrequencies(chordId);
          activeChordRef.current = synthPlayChord(
            ctx,
            frequencies,
            duration != null ? { duration } : undefined,
          );
        } catch (err) {
          console.error("Audio playback failed:", err);
        }
      })();
    },
    [ensureContext, clearScheduled],
  );

  /**
   * Play a sequence of context chords followed by the preview chord.
   * Context chords are played at the current BPM (default ~500ms each at 120bpm).
   */
  const playSequence = useCallback(
    (contextChords: string[], previewChord: string) => {
      const currentPlayId = ++playIdRef.current;
      clearScheduled();

      void (async () => {
        try {
          const ctx = await ensureContext();

          if (currentPlayId !== playIdRef.current) return;

          // Stop any active chord
          if (activeChordRef.current) {
            stopChord(ctx, activeChordRef.current);
            activeChordRef.current = null;
          }

          const beatDuration = 500; // ms per chord at 120bpm

          // Schedule context chords
          for (let i = 0; i < contextChords.length; i++) {
            const delay = i * beatDuration;
            const timeoutId = window.setTimeout(() => {
              try {
                if (currentPlayId !== playIdRef.current) return;

                if (activeChordRef.current && ctxRef.current) {
                  stopChord(ctxRef.current, activeChordRef.current);
                }

                const frequencies = getChordFrequencies(contextChords[i]);
                activeChordRef.current = synthPlayChord(ctx, frequencies, {
                  duration: beatDuration,
                });
              } catch (err) {
                console.error("Audio sequence chord failed:", err);
              }
            }, delay);
            scheduledTimeoutsRef.current.push(timeoutId);
          }

          // Schedule preview chord after context
          const previewDelay = contextChords.length * beatDuration;
          const previewTimeoutId = window.setTimeout(() => {
            try {
              if (currentPlayId !== playIdRef.current) return;

              if (activeChordRef.current && ctxRef.current) {
                stopChord(ctxRef.current, activeChordRef.current);
              }

              const frequencies = getChordFrequencies(previewChord);
              activeChordRef.current = synthPlayChord(ctx, frequencies, {
                duration: PREVIEW_DURATION,
              });
            } catch (err) {
              console.error("Audio preview chord failed:", err);
            }
          }, previewDelay);
          scheduledTimeoutsRef.current.push(previewTimeoutId);
        } catch (err) {
          console.error("Audio sequence playback failed:", err);
        }
      })();
    },
    [ensureContext, clearScheduled],
  );

  const stopAll = useCallback(() => {
    playIdRef.current++;
    clearScheduled();
    if (ctxRef.current && activeChordRef.current) {
      stopChord(ctxRef.current, activeChordRef.current);
      activeChordRef.current = null;
    }
  }, [clearScheduled]);

  return { playChord, playSequence, stopAll, isReady };
}
