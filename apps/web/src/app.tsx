import ErrorBoundary from "./components/shared/error-boundary";
import DesktopGate from "./components/shared/desktop-gate";
import Layout from "./components/shared/layout";

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
        <Layout />
      </DesktopGate>
    </ErrorBoundary>
  );
}
