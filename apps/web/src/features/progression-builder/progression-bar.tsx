import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectChords,
  removeChord,
  clearChords,
} from "../../store/slices/progression-slice";
import { setSelectedNode } from "../../store/slices/graph-slice";
import { stopAll } from "../../store/slices/audio-slice";
import ChordChip from "./chord-chip";

export default function ProgressionBar() {
  const dispatch = useAppDispatch();
  const chords = useAppSelector(selectChords);
  const isEmpty = chords.length === 0;
  const prevLengthRef = useRef(chords.length);
  const replayTimerRef = useRef<number>(0);
  const [isClearing, setIsClearing] = useState(false);

  // Track which chip index is newly added
  const newChordIndex =
    chords.length > prevLengthRef.current ? chords.length - 1 : -1;

  useEffect(() => {
    prevLengthRef.current = chords.length;
  }, [chords.length]);

  // Cleanup replay timer on unmount
  useEffect(() => {
    return () => clearTimeout(replayTimerRef.current);
  }, []);

  const handleChipClick = useCallback(
    (chordId: string) => {
      dispatch(setSelectedNode(chordId));
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = window.setTimeout(
        () => dispatch(setSelectedNode(null)),
        100,
      );
    },
    [dispatch],
  );

  const handleRemove = useCallback(
    (index: number) => {
      dispatch(removeChord(index));
    },
    [dispatch],
  );

  const handleClear = useCallback(() => {
    // Animate out first
    setIsClearing(true);
  }, []);

  function handleClearTransitionEnd() {
    if (isClearing) {
      setIsClearing(false);
      dispatch(clearChords());
      dispatch(setSelectedNode(null));
      dispatch(stopAll());
    }
  }

  return (
    <div className="flex items-center justify-between w-full h-full gap-3">
      {isEmpty ? (
        <span className="text-sm text-text-secondary">
          Click a chord to start building
        </span>
      ) : (
        <div
          className={`flex items-center gap-2 overflow-x-auto min-w-0 flex-1 transition-all duration-300
            ${isClearing ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
          onTransitionEnd={handleClearTransitionEnd}
        >
          {chords.map((chordId, index) => (
            <ChordChip
              key={`${chordId}-${index}`}
              chordId={chordId}
              index={index}
              isNew={index === newChordIndex}
              onClick={handleChipClick}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {!isEmpty && (
          <button
            type="button"
            className="text-xs text-text-secondary hover:text-red-500 transition-colors"
            onClick={handleClear}
          >
            Clear
          </button>
        )}
        <button
          type="button"
          className="text-sm text-text-secondary disabled:opacity-40"
          disabled={chords.length < 2}
          aria-label="Play progression"
        >
          ▶
        </button>
        <span className="text-xs text-text-secondary">BPM</span>
      </div>
    </div>
  );
}
