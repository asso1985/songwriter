import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setPreviewChord } from "../../store/slices/audio-slice";
import { selectSelectedNode } from "../../store/slices/graph-slice";
import { selectChords } from "../../store/slices/progression-slice";
import { useAudioContext } from "./use-audio-context";

const MAX_CONTEXT_CHORDS = 3;
const PREVIEW_DURATION = 2000; // ms

/**
 * Render-less component that bridges Redux state and Web Audio API.
 * Listens to graph selectedNode changes and triggers chord playback
 * with progression context (last 2-3 chords + preview chord).
 */
export function AudioEngine() {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(selectSelectedNode);
  const chords = useAppSelector(selectChords);
  const { playChord, playSequence, stopAll } = useAudioContext();
  const prevNodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedNode === prevNodeRef.current) return;
    prevNodeRef.current = selectedNode;

    if (selectedNode) {
      dispatch(setPreviewChord(selectedNode));

      // Play progression context + preview chord
      const contextChords = chords.slice(-MAX_CONTEXT_CHORDS);
      if (contextChords.length > 0) {
        playSequence(contextChords, selectedNode);
      } else {
        playChord(selectedNode, PREVIEW_DURATION);
      }
    } else {
      dispatch(setPreviewChord(null));
      stopAll();
    }
  }, [selectedNode, chords, dispatch, playChord, playSequence, stopAll]);

  return null;
}
