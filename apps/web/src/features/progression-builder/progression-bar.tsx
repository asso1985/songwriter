import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectChords,
  removeChord,
  clearChords,
} from "../../store/slices/progression-slice";
import { setSelectedNode } from "../../store/slices/graph-slice";
import {
  selectIsPlaying,
  selectBpm,
  setIsPlaying,
  stopAll as stopAllAction,
} from "../../store/slices/audio-slice";
import { useAudioContext } from "../audio-engine/use-audio-context";
import ChordChip from "./chord-chip";

export default function ProgressionBar() {
  const dispatch = useAppDispatch();
  const chords = useAppSelector(selectChords);
  const isPlaying = useAppSelector(selectIsPlaying);
  const bpm = useAppSelector(selectBpm);
  const isEmpty = chords.length === 0;
  const canPlay = chords.length >= 2;
  const prevLengthRef = useRef(chords.length);
  const replayTimerRef = useRef<number>(0);
  const [isClearing, setIsClearing] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState(-1);

  // Ref for chords so playLoop reads fresh values each cycle
  const chordsRef = useRef(chords);
  chordsRef.current = chords;

  const { playLoop, stopLoop, stopAll } = useAudioContext();

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

  const stopPlayback = useCallback(() => {
    stopLoop();
    dispatch(setIsPlaying(false));
    setActiveChordIndex(-1);
  }, [stopLoop, dispatch]);

  // Stop playback if chords drop below 2 while playing
  useEffect(() => {
    if (isPlaying && chords.length < 2) {
      stopPlayback();
    }
  }, [chords.length, isPlaying, stopPlayback]);

  const handleChipClick = useCallback(
    (chordId: string) => {
      if (isPlaying) stopPlayback();
      dispatch(setSelectedNode(chordId));
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = window.setTimeout(
        () => dispatch(setSelectedNode(null)),
        100,
      );
    },
    [dispatch, isPlaying, stopPlayback],
  );

  const handleRemove = useCallback(
    (index: number) => {
      dispatch(removeChord(index));
    },
    [dispatch],
  );

  const handleClear = useCallback(() => {
    if (isPlaying) stopPlayback();
    setIsClearing(true);
  }, [isPlaying, stopPlayback]);

  function handleClearTransitionEnd() {
    if (isClearing) {
      setIsClearing(false);
      dispatch(clearChords());
      dispatch(setSelectedNode(null));
      dispatch(stopAllAction());
    }
  }

  const handlePlayStop = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      // Stop any preview first
      stopAll();
      dispatch(setSelectedNode(null));
      dispatch(setIsPlaying(true));
      playLoop(chordsRef, bpm, (index) => {
        setActiveChordIndex(index);
      });
    }
  }, [isPlaying, stopPlayback, stopAll, playLoop, bpm, dispatch]);

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
              isActive={isPlaying && index === activeChordIndex}
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
          className="text-sm disabled:opacity-40 transition-colors"
          disabled={!canPlay}
          aria-label={isPlaying ? "Stop playback" : "Play progression"}
          onClick={handlePlayStop}
        >
          {isPlaying ? "⏹" : "▶"}
        </button>
        <span className="text-xs text-text-secondary">BPM</span>
      </div>
    </div>
  );
}
