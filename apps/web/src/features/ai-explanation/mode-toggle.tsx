import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectMode, setMode } from "../../store/slices/ai-slice";

export default function ModeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectMode);
  const isLearn = mode === "learn";

  function handleToggle() {
    dispatch(setMode(isLearn ? "flow" : "learn"));
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-all duration-250 ease-out
        border border-border hover:bg-primary-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      aria-label={isLearn ? "Switch to Flow Mode" : "Switch to Learn Mode"}
    >
      <span className="transition-transform duration-250 ease-out">
        {isLearn ? "📖" : "♪"}
      </span>
      <span className="text-text-secondary">
        {isLearn ? "Learn" : "Flow"}
      </span>
    </button>
  );
}
