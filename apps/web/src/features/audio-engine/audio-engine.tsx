import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setPreviewChord } from "../../store/slices/audio-slice";
import { selectSelectedNode } from "../../store/slices/graph-slice";
import { useAudioContext } from "./use-audio-context";

/**
 * Render-less component that bridges Redux state and Web Audio API.
 * Listens to graph selectedNode changes and triggers chord playback.
 */
export function AudioEngine() {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(selectSelectedNode);
  const { playChord, stopAll } = useAudioContext();
  const prevNodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedNode === prevNodeRef.current) return;
    prevNodeRef.current = selectedNode;

    if (selectedNode) {
      dispatch(setPreviewChord(selectedNode));
      playChord(selectedNode);
    } else {
      dispatch(setPreviewChord(null));
      stopAll();
    }
  }, [selectedNode, dispatch, playChord, stopAll]);

  return null;
}
