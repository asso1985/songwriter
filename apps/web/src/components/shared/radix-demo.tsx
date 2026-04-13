import { Toggle, Tooltip } from "radix-ui";
import { useState } from "react";

export function RadixToggleDemo() {
  const [pressed, setPressed] = useState(false);

  return (
    <Toggle.Root
      pressed={pressed}
      onPressedChange={setPressed}
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        pressed
          ? "bg-primary-500 text-white"
          : "bg-surface-elevated text-text-primary border border-border"
      }`}
      aria-label="Toggle mode"
    >
      {pressed ? "Learn" : "Flow"}
    </Toggle.Root>
  );
}

export function RadixTooltipDemo() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-primary-500 text-white">
            Hover me
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="rounded-md bg-text-primary text-white px-3 py-1.5 text-xs"
            sideOffset={5}
          >
            Tooltip content
            <Tooltip.Arrow className="fill-text-primary" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
