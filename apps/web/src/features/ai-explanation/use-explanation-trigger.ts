import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectMode, selectSelectedChordId, fetchExplanation, setSelectedChordId } from "../../store/slices/ai-slice";
import { selectSelectedNode } from "../../store/slices/graph-slice";
import { selectCurrentKey, selectChords } from "../../store/slices/progression-slice";

/**
 * Hook that triggers fetchExplanation when in Learn Mode and a chord is selected.
 * Listens to graph selectedNode changes and syncs to ai-slice selectedChordId.
 */
export function useExplanationTrigger() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectMode);
  const selectedNode = useAppSelector(selectSelectedNode);
  const currentKey = useAppSelector(selectCurrentKey);
  const chords = useAppSelector(selectChords);
  const prevNodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedNode === prevNodeRef.current) return;
    prevNodeRef.current = selectedNode;

    if (selectedNode) {
      dispatch(setSelectedChordId(selectedNode));

      if (mode === "learn") {
        dispatch(
          fetchExplanation({
            chordId: selectedNode,
            progressionContext: chords.slice(-3),
            key: currentKey,
            mode,
          }),
        );
      }
    } else {
      dispatch(setSelectedChordId(null));
    }
  }, [selectedNode, mode, currentKey, chords, dispatch]);
}
