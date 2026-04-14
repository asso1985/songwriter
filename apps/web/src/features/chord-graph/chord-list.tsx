import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { setSelectedNode, selectSelectedNode } from "../../store/slices/graph-slice";
import { addChord } from "../../store/slices/progression-slice";
import { useAppSelector } from "../../store/hooks";
import { getChordEmoji } from "./chord-emoji";
import type { ChordEntry } from "../../data/get-chords-by-key";

function getDistanceLabel(distance: number): string {
  if (distance === 0) return "root";
  if (distance === 1) return "close";
  if (distance === 2) return "medium";
  if (distance === 3) return "far";
  return "distant";
}

interface ChordListProps {
  chords: ChordEntry[];
  onClose: () => void;
}

export default function ChordList({ chords, onClose }: ChordListProps) {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(selectSelectedNode);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // Sort by distance (closest first)
  const sorted = [...chords].sort((a, b) => a.distance - b.distance);

  // Focus first item on mount
  useEffect(() => {
    const firstItem = listRef.current?.querySelector('[role="option"]');
    if (firstItem instanceof HTMLElement) firstItem.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, sorted.length - 1));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        }
        case "Enter": {
          e.preventDefault();
          const chord = sorted[activeIndex];
          if (!chord) break;
          if (selectedNode === chord.id) {
            // Already previewing — commit
            dispatch(addChord(chord.id));
            dispatch(setSelectedNode(null));
          } else {
            // Preview
            dispatch(setSelectedNode(chord.id));
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          onClose();
          break;
        }
      }
    },
    [activeIndex, sorted, selectedNode, dispatch, onClose],
  );

  // Scroll active item into view
  useEffect(() => {
    const items = listRef.current?.querySelectorAll('[role="option"]');
    if (items?.[activeIndex] instanceof HTMLElement) {
      items[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 z-20 bg-surface-elevated/95 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-text-primary">Chord List</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-2 py-1"
          aria-label="Close chord list"
        >
          Close (L)
        </button>
      </div>
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Available chords sorted by harmonic distance"
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-1"
      >
        {sorted.map((chord, index) => {
          const isActive = index === activeIndex;
          const isPreviewing = selectedNode === chord.id;
          const emoji = getChordEmoji(chord.distance);
          const label = `${chord.name} — ${chord.type} — ${getDistanceLabel(chord.distance)} ${emoji}`;

          return (
            <li
              key={chord.id}
              role="option"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                ${isActive ? "bg-primary-50 text-primary-600 font-medium" : "text-text-primary hover:bg-primary-50/50"}
                ${isPreviewing ? "ring-2 ring-primary-400" : ""}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
              onClick={() => {
                setActiveIndex(index);
                dispatch(setSelectedNode(chord.id));
              }}
            >
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
