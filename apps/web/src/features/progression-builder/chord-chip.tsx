import { useEffect, useRef, useState } from "react";

interface ChordChipProps {
  chordId: string;
  index: number;
  isNew: boolean;
  isActive: boolean;
  onClick: (chordId: string) => void;
  onRemove: (index: number) => void;
}

export default function ChordChip({
  chordId,
  index,
  isNew,
  isActive,
  onClick,
  onRemove,
}: ChordChipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isEntering, setIsEntering] = useState(isNew);
  const pulseTimerRef = useRef<number>(0);

  // Entry animation: scale from 0.8/opacity 0 → normal over 300ms
  useEffect(() => {
    if (isEntering) {
      requestAnimationFrame(() => setIsEntering(false));
    }
  }, [isEntering]);

  // Cleanup pulse timer on unmount
  useEffect(() => {
    return () => clearTimeout(pulseTimerRef.current);
  }, []);

  function handleClick() {
    onClick(chordId);
    setIsPulsing(true);
    clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = window.setTimeout(() => setIsPulsing(false), 200);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    // Animate out first, then remove
    setIsRemoving(true);
  }

  function handleTransitionEnd() {
    if (isRemoving) {
      onRemove(index);
    }
  }

  return (
    <div
      data-testid="chord-chip"
      role="button"
      tabIndex={0}
      className={`relative inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium
        bg-primary-50 text-primary-500 cursor-pointer select-none
        transition-all duration-200
        hover:-translate-y-0.5
        ${isPulsing ? "scale-110" : "scale-100"}
        ${isRemoving ? "opacity-0 scale-75" : "opacity-100"}
        ${isEntering ? "opacity-0 scale-75" : ""}
        ${isActive ? "ring-2 ring-primary-400 scale-105" : ""}
      `}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTransitionEnd={handleTransitionEnd}
    >
      {chordId}
      {isHovered && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Remove ${chordId}`}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs
            flex items-center justify-center leading-none hover:bg-red-200 transition-colors cursor-pointer"
          onClick={handleRemove}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              handleRemove(e as unknown as React.MouseEvent);
            }
          }}
        >
          ×
        </span>
      )}
    </div>
  );
}
