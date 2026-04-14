import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectMode, setMode } from "../../store/slices/ai-slice";
import {
  selectIsPlaying,
  selectBpm,
  setIsPlaying,
} from "../../store/slices/audio-slice";
import { selectChords, removeChord } from "../../store/slices/progression-slice";
import { setSelectedNode, selectSelectedNode } from "../../store/slices/graph-slice";
import { useAudioContext } from "../audio-engine/use-audio-context";

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.getAttribute("role") === "combobox") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

/**
 * Global keyboard shortcuts for the app.
 * Space: play/stop, M: toggle mode, Backspace: remove last chord.
 * +/-/Escape are handled in chord-graph.tsx (graph-specific).
 */
export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(selectIsPlaying);
  const mode = useAppSelector(selectMode);
  const chords = useAppSelector(selectChords);
  const bpm = useAppSelector(selectBpm);
  const selectedNode = useAppSelector(selectSelectedNode);
  const { playLoop, stopLoop, stopAll } = useAudioContext();

  const chordsRef = useRef(chords);
  chordsRef.current = chords;
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      switch (e.key) {
        case " ": {
          e.preventDefault();
          if (chords.length < 2) return;
          if (isPlaying) {
            stopLoop();
            dispatch(setIsPlaying(false));
          } else {
            stopAll();
            dispatch(setSelectedNode(null));
            dispatch(setIsPlaying(true));
            playLoop(chordsRef, bpmRef, () => {});
          }
          break;
        }
        case "m":
        case "M": {
          e.preventDefault();
          dispatch(setMode(mode === "flow" ? "learn" : "flow"));
          break;
        }
        case "Backspace": {
          if (chords.length > 0) {
            e.preventDefault();
            dispatch(removeChord(chords.length - 1));
          }
          break;
        }
      }
    },
    [isPlaying, mode, chords, stopLoop, stopAll, playLoop, dispatch],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
