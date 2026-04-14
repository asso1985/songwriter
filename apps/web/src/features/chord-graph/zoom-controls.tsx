import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setViewMode, selectViewMode } from "../../store/slices/graph-slice";

export default function ZoomControls() {
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector(selectViewMode);

  return (
    <div
      className="absolute top-3 right-3 flex flex-col gap-2 z-10"
      role="group"
      aria-label="Zoom controls"
    >
      <button
        onClick={() => dispatch(setViewMode("zoomed-in"))}
        disabled={viewMode === "zoomed-in"}
        className="w-11 h-11 flex items-center justify-center rounded-md bg-surface-elevated/80 border border-border text-text-primary text-lg font-bold hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => dispatch(setViewMode("zoomed-out"))}
        disabled={viewMode === "zoomed-out"}
        className="w-11 h-11 flex items-center justify-center rounded-md bg-surface-elevated/80 border border-border text-text-primary text-lg font-bold hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}
