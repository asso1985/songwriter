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
  setBpm,
  stopAll as stopAllAction,
} from "../../store/slices/audio-slice";
import { useAudioContext } from "../audio-engine/use-audio-context";
import ChordChip from "./chord-chip";

const MIN_BPM = 40;
const MAX_BPM = 240;
const DEFAULT_BPM = 120;
const TAP_THRESHOLD = 4; // minimum taps to calculate BPM
const TAP_TIMEOUT = 2000; // ms — reset taps after this gap
const MAX_TAPS = 8;

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
  const [isTapping, setIsTapping] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const tapTimerRef = useRef<number>(0);
  const tapTimestampsRef = useRef<number[]>([]);

  // Refs for playLoop to read fresh values each cycle
  const chordsRef = useRef(chords);
  chordsRef.current = chords;
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const { playLoop, stopLoop, stopAll } = useAudioContext();

  const newChordIndex =
    chords.length > prevLengthRef.current ? chords.length - 1 : -1;

  useEffect(() => {
    if (chords.length > prevLengthRef.current) {
      const added = chords[chords.length - 1];
      setAnnouncement(
        `${added} added to progression, position ${chords.length} of ${chords.length}`,
      );
    } else if (chords.length < prevLengthRef.current && chords.length > 0) {
      setAnnouncement(`Chord removed from progression`);
    } else if (chords.length === 0 && prevLengthRef.current > 0) {
      setAnnouncement("Progression cleared");
    }
    prevLengthRef.current = chords.length;
  }, [chords]);

  useEffect(() => {
    return () => {
      clearTimeout(replayTimerRef.current);
      clearTimeout(tapTimerRef.current);
    };
  }, []);

  const stopPlayback = useCallback(() => {
    stopLoop();
    dispatch(setIsPlaying(false));
    setActiveChordIndex(-1);
  }, [stopLoop, dispatch]);

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
      stopAll();
      dispatch(setSelectedNode(null));
      dispatch(setIsPlaying(true));
      playLoop(chordsRef, bpmRef, (index) => {
        setActiveChordIndex(index);
      });
    }
  }, [isPlaying, stopPlayback, stopAll, playLoop, dispatch]);

  const handleBpmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        // Don't clamp per-keystroke — let the user type freely, clamp on blur
        dispatch(setBpm(value));
      }
    },
    [dispatch],
  );

  const handleBpmBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (isNaN(value) || value < MIN_BPM || value > MAX_BPM) {
        dispatch(setBpm(DEFAULT_BPM));
      } else {
        // Clamp to valid range on blur
        const clamped = Math.max(MIN_BPM, Math.min(MAX_BPM, value));
        dispatch(setBpm(clamped));
      }
    },
    [dispatch],
  );

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timestamps = tapTimestampsRef.current;

    // Reset if gap too long
    if (timestamps.length > 0 && now - timestamps[timestamps.length - 1] > TAP_TIMEOUT) {
      tapTimestampsRef.current = [];
    }

    tapTimestampsRef.current.push(now);

    // Keep last MAX_TAPS
    if (tapTimestampsRef.current.length > MAX_TAPS) {
      tapTimestampsRef.current = tapTimestampsRef.current.slice(-MAX_TAPS);
    }

    // Visual feedback
    setIsTapping(true);
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = window.setTimeout(() => setIsTapping(false), 150);

    // Calculate BPM if enough taps
    if (tapTimestampsRef.current.length >= TAP_THRESHOLD) {
      const ts = tapTimestampsRef.current;
      let totalInterval = 0;
      for (let i = 1; i < ts.length; i++) {
        totalInterval += ts[i] - ts[i - 1];
      }
      const avgInterval = totalInterval / (ts.length - 1);
      const calculatedBpm = Math.round(60000 / avgInterval);
      const clamped = Math.max(MIN_BPM, Math.min(MAX_BPM, calculatedBpm));
      dispatch(setBpm(clamped));
    }
  }, [dispatch]);

  return (
    <div className="flex items-center justify-between w-full h-full gap-3">
      {isEmpty ? (
        <span className="text-sm text-text-secondary">
          Click a chord to start building
        </span>
      ) : (
        <div
          role="list"
          aria-label="Chord progression"
          className={`flex items-center gap-2 overflow-x-auto min-w-0 flex-1 transition-all duration-300
            ${isClearing ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
          onTransitionEnd={handleClearTransitionEnd}
        >
          {chords.map((chordId, index) => (
            <ChordChip
              key={`${chordId}-${index}`}
              chordId={chordId}
              index={index}
              total={chords.length}
              isNew={index === newChordIndex}
              isActive={isPlaying && index === activeChordIndex}
              onClick={handleChipClick}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
      {/* aria-live region for progression change announcements */}
      <span className="sr-only" aria-live="polite" role="status">
        {announcement}
      </span>

      <div className="flex items-center gap-2 shrink-0">
        {!isEmpty && (
          <button
            type="button"
            className="text-xs text-text-secondary hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            onClick={handleClear}
          >
            Clear
          </button>
        )}
        <button
          type="button"
          className="text-sm disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          disabled={!canPlay}
          aria-label={isPlaying ? "Stop playback" : "Play progression"}
          onClick={handlePlayStop}
        >
          {isPlaying ? "⏹" : "▶"}
        </button>
        <input
          type="number"
          min={MIN_BPM}
          max={MAX_BPM}
          step={1}
          value={bpm}
          onChange={handleBpmChange}
          onBlur={handleBpmBlur}
          aria-label="Tempo in beats per minute"
          className="w-14 text-center text-sm border border-border rounded px-1 py-0.5 bg-surface text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        />
        <span className="text-xs text-text-secondary">BPM</span>
        <button
          type="button"
          aria-label="Tap to set tempo"
          className={`text-xs px-2 py-1 rounded border border-border transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            ${isTapping ? "bg-primary-100 border-primary-400" : "bg-surface hover:bg-primary-50"}`}
          onClick={handleTap}
        >
          Tap
        </button>
      </div>
    </div>
  );
}
