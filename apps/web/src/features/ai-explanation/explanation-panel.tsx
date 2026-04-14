import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectMode,
  selectSelectedChordId,
  selectExplanation,
  selectAiStatus,
  selectAiError,
  fetchExplanation,
} from "../../store/slices/ai-slice";
import { selectCurrentKey, selectChords } from "../../store/slices/progression-slice";

const STILL_THINKING_DELAY = 5000;

function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      className={`h-4 rounded bg-border animate-pulse ${width}`}
    />
  );
}

export default function ExplanationPanel() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectMode);
  const selectedChordId = useAppSelector(selectSelectedChordId);
  const explanation = useAppSelector(selectExplanation);
  const status = useAppSelector(selectAiStatus);
  const error = useAppSelector(selectAiError);
  const currentKey = useAppSelector(selectCurrentKey);
  const chords = useAppSelector(selectChords);
  const [showStillThinking, setShowStillThinking] = useState(false);
  const thinkingTimerRef = useRef<number>(0);

  const isVisible = mode === "learn" && selectedChordId !== null;

  // "Still thinking..." timer
  useEffect(() => {
    if (status === "loading") {
      setShowStillThinking(false);
      thinkingTimerRef.current = window.setTimeout(
        () => setShowStillThinking(true),
        STILL_THINKING_DELAY,
      );
    } else {
      setShowStillThinking(false);
      clearTimeout(thinkingTimerRef.current);
    }
    return () => clearTimeout(thinkingTimerRef.current);
  }, [status]);

  function handleRetry() {
    if (selectedChordId) {
      dispatch(
        fetchExplanation({
          chordId: selectedChordId,
          progressionContext: chords.slice(-3),
          key: currentKey,
          mode,
        }),
      );
    }
  }

  return (
    <aside
      role="complementary"
      aria-live="polite"
      tabIndex={0}
      className={`w-[280px] shrink-0 border-l border-border bg-surface-elevated overflow-y-auto
        transition-all duration-250 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 w-0 border-0 p-0"}`}
    >
      {isVisible && (
        <div className="p-4 flex flex-col gap-3">
          {/* Chord name always visible */}
          <h2 className="text-xl font-bold text-text-primary">
            {selectedChordId}
          </h2>

          {status === "loading" && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-text-secondary">
                Why this works
              </h3>
              <SkeletonLine width="w-full" />
              <SkeletonLine width="w-3/4" />
              <SkeletonLine width="w-1/2" />
              {showStillThinking && (
                <p className="text-xs text-text-secondary mt-1">
                  Still thinking...
                </p>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-red-500">
                Unable to load explanation
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="text-sm text-primary-500 hover:text-primary-600 underline self-start"
              >
                Retry
              </button>
            </div>
          )}

          {status === "idle" && explanation && (
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-1">
                  Why this works
                </h3>
                <p className="text-sm text-text-primary leading-relaxed">
                  {explanation.explanation}
                </p>
              </div>

              <div className="rounded-md bg-primary-50 p-3">
                <p className="text-xs text-text-secondary mb-0.5">
                  Chord Function
                </p>
                <p className="text-sm font-medium text-primary-600">
                  {explanation.chordFunction}
                </p>
              </div>

              <div className="rounded-md bg-primary-50 p-3">
                <p className="text-xs text-text-secondary mb-0.5">
                  Character
                </p>
                <p className="text-sm font-medium text-primary-600">
                  {explanation.chordCharacter}
                  {explanation.emoji && ` ${explanation.emoji}`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
