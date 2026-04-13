import type { ReactNode } from "react";
import ErrorBoundary from "./error-boundary";

interface LayoutProps {
  topBar?: ReactNode;
  graphArea?: ReactNode;
  progressionBar?: ReactNode;
}

export default function Layout({ topBar, graphArea, progressionBar }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary font-sans">
      <a
        href="#graph-area"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-primary-500 focus:text-white"
      >
        Skip to chord graph
      </a>
      <a
        href="#progression-bar"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-primary-500 focus:text-white"
      >
        Skip to progression
      </a>

      <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-surface-elevated shrink-0">
        {topBar ?? (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-text-secondary">Key Selector</span>
            <span className="text-sm text-text-secondary">Zoom Controls</span>
            <span className="text-sm text-text-secondary">Mode Toggle</span>
          </div>
        )}
      </header>

      <main id="graph-area" className="flex-1 min-h-0" tabIndex={-1}>
        <ErrorBoundary
          fallback={
            <div className="flex items-center justify-center h-full text-text-secondary">
              Something went wrong in the graph area.
            </div>
          }
        >
          {graphArea ?? (
            <div className="flex items-center justify-center h-full text-text-secondary">
              <p>Chord graph will appear here</p>
            </div>
          )}
        </ErrorBoundary>
      </main>

      <footer
        id="progression-bar"
        tabIndex={-1}
        className="flex items-center px-4 h-16 border-t border-border bg-surface-elevated shrink-0"
      >
        <ErrorBoundary
          fallback={
            <div className="text-text-secondary">
              Something went wrong in the progression bar.
            </div>
          }
        >
          {progressionBar ?? (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-text-secondary">
                Progression chords will appear here
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Play</span>
                <span className="text-sm text-text-secondary">BPM</span>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </footer>
    </div>
  );
}
