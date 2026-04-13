import type { ReactNode } from "react";

interface DesktopGateProps {
  children: ReactNode;
}

export default function DesktopGate({ children }: DesktopGateProps) {
  return (
    <>
      <div className="md:hidden flex items-center justify-center min-h-screen bg-surface p-8 text-center">
        <p className="text-text-secondary text-lg font-medium">
          Songwriter is designed for desktop. Please visit on a larger screen.
        </p>
      </div>
      <div className="hidden md:contents">{children}</div>
    </>
  );
}
