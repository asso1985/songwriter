import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setViewMode, selectViewMode } from "../../store/slices/graph-slice";

export default function ZoomControls() {
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector(selectViewMode);

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Zoom controls"
    >
      <button
        onClick={() => dispatch(setViewMode("zoomed-in"))}
        disabled={viewMode === "zoomed-in"}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-text-primary text-sm font-bold hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => dispatch(setViewMode("zoomed-out"))}
        disabled={viewMode === "zoomed-out"}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-text-primary text-sm font-bold hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}
