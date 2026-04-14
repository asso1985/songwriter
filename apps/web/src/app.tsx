import ErrorBoundary from "./components/shared/error-boundary";
import DesktopGate from "./components/shared/desktop-gate";
import Layout from "./components/shared/layout";
import KeySelector, {
  KeySelectorCentered,
} from "./features/key-selector/key-selector";
import { useAppSelector } from "./store/hooks";
import ChordGraph from "./features/chord-graph/chord-graph";
import { selectCurrentKey, selectIsEditingKey } from "./store/slices/progression-slice";
import { AudioEngine } from "./features/audio-engine/audio-engine";
import ProgressionBar from "./features/progression-builder/progression-bar";
import ModeToggle from "./features/ai-explanation/mode-toggle";
import ExplanationPanel from "./features/ai-explanation/explanation-panel";
import { useExplanationTrigger } from "./features/ai-explanation/use-explanation-trigger";
import { useKeyboardShortcuts } from "./features/keyboard-shortcuts/use-keyboard-shortcuts";

function GraphAreaContent() {
  const currentKey = useAppSelector(selectCurrentKey);
  const isEditing = useAppSelector(selectIsEditingKey);
  const hasKey = currentKey !== "";

  if (!hasKey || isEditing) {
    return <KeySelectorCentered />;
  }

  return <ChordGraph currentKey={currentKey} />;
}

function AppContent() {
  const currentKey = useAppSelector(selectCurrentKey);
  const hasKey = currentKey !== "";

  // Trigger explanation fetch when chord is selected in Learn Mode
  useExplanationTrigger();
  // Global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <Layout
      topBar={
        hasKey ? (
          <div className="flex items-center justify-between w-full">
            <KeySelector />
            <span className="text-sm text-text-secondary">Zoom Controls</span>
            <ModeToggle />
          </div>
        ) : undefined
      }
      graphArea={
        <div className="flex h-full">
          <div className="flex-1 min-w-0">
            <GraphAreaContent />
          </div>
          <ExplanationPanel />
        </div>
      }
      progressionBar={<ProgressionBar />}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-surface text-text-secondary">
          Something went wrong. Please refresh the page.
        </div>
      }
    >
      <DesktopGate>
        <AudioEngine />
        <AppContent />
      </DesktopGate>
    </ErrorBoundary>
  );
}
