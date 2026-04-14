import { useState } from "react";
import { Select } from "radix-ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setCurrentKey,
  startEditingKey,
  stopEditingKey,
  selectCurrentKey,
  selectIsEditingKey,
} from "../../store/slices/progression-slice";
import { formatKeyId, formatKeyDisplay } from "../../data/key-utils";

const KEY_ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const QUALITIES = ["Major", "Minor"] as const;

function KeySelectorExpanded({
  onSelect,
  onCancel,
  canCancel,
}: {
  onSelect: (key: string) => void;
  onCancel?: () => void;
  canCancel: boolean;
}) {
  const [root, setRoot] = useState("");
  const [quality, setQuality] = useState("");

  function handleRootChange(value: string) {
    setRoot(value);
    if (quality) {
      onSelect(formatKeyId(value, quality));
    }
  }

  function handleQualityChange(value: string) {
    setQuality(value);
    if (root) {
      onSelect(formatKeyId(root, value));
    }
  }

  return (
    <div
      className="flex flex-col items-center gap-6"
      role="group"
      aria-label="Select musical key"
    >
      <h2 className="text-2xl font-bold text-text-primary">Choose a Key</h2>
      <div className="flex items-center gap-4">
        <Select.Root value={root} onValueChange={handleRootChange}>
          <Select.Trigger
            className="inline-flex items-center justify-between rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-text-primary min-w-[120px] hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Key root"
          >
            <Select.Value placeholder="Root note" />
            <Select.Icon className="ml-2 text-text-secondary">▾</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              className="overflow-hidden rounded-md border border-border bg-surface-elevated shadow-lg"
              position="popper"
              sideOffset={4}
              style={{ maxHeight: "var(--radix-select-content-available-height)" }}
            >
              <Select.ScrollUpButton className="flex items-center justify-center h-6 cursor-default text-text-secondary">
                ▴
              </Select.ScrollUpButton>
              <Select.Viewport className="p-1">
                {KEY_ROOTS.map((note) => (
                  <Select.Item
                    key={note}
                    value={note}
                    className="relative flex items-center rounded px-3 py-2 text-sm text-text-primary cursor-pointer select-none hover:bg-primary-50 focus:bg-primary-50 focus:outline-none data-[highlighted]:bg-primary-50"
                  >
                    <Select.ItemText>{note}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
              <Select.ScrollDownButton className="flex items-center justify-center h-6 cursor-default text-text-secondary">
                ▾
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <Select.Root value={quality} onValueChange={handleQualityChange}>
          <Select.Trigger
            className="inline-flex items-center justify-between rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-text-primary min-w-[120px] hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Key quality"
          >
            <Select.Value placeholder="Quality" />
            <Select.Icon className="ml-2 text-text-secondary">▾</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              className="overflow-hidden rounded-md border border-border bg-surface-elevated shadow-lg"
              position="popper"
              sideOffset={4}
              style={{ maxHeight: "var(--radix-select-content-available-height)" }}
            >
              <Select.ScrollUpButton className="flex items-center justify-center h-6 cursor-default text-text-secondary">
                ▴
              </Select.ScrollUpButton>
              <Select.Viewport className="p-1">
                {QUALITIES.map((q) => (
                  <Select.Item
                    key={q}
                    value={q}
                    className="relative flex items-center rounded px-3 py-2 text-sm text-text-primary cursor-pointer select-none hover:bg-primary-50 focus:bg-primary-50 focus:outline-none data-[highlighted]:bg-primary-50"
                  >
                    <Select.ItemText>{q}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
              <Select.ScrollDownButton className="flex items-center justify-center h-6 cursor-default text-text-secondary">
                ▾
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
      <p className="text-sm text-text-secondary">
        Select a root note and quality to start exploring
      </p>
      {canCancel && onCancel && (
        <button
          onClick={onCancel}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function KeySelectorCompact({
  currentKey,
  onChangeKey,
}: {
  currentKey: string;
  onChangeKey: () => void;
}) {
  return (
    <button
      onClick={onChangeKey}
      className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label={`Current key: ${formatKeyDisplay(currentKey)}. Click to change.`}
    >
      {formatKeyDisplay(currentKey)}
      <span className="text-xs opacity-75">▾</span>
    </button>
  );
}

export default function KeySelector() {
  const dispatch = useAppDispatch();
  const currentKey = useAppSelector(selectCurrentKey);
  const isEditing = useAppSelector(selectIsEditingKey);

  const hasKey = currentKey !== "";

  if (!hasKey || isEditing) {
    return null;
  }

  return (
    <KeySelectorCompact
      currentKey={currentKey}
      onChangeKey={() => dispatch(startEditingKey())}
    />
  );
}

export function KeySelectorCentered() {
  const dispatch = useAppDispatch();
  const currentKey = useAppSelector(selectCurrentKey);
  const isEditing = useAppSelector(selectIsEditingKey);

  const hasKey = currentKey !== "";

  if (hasKey && !isEditing) {
    return null;
  }

  function handleSelect(key: string) {
    dispatch(setCurrentKey(key));
  }

  function handleCancel() {
    dispatch(stopEditingKey());
  }

  return (
    <div className="flex items-center justify-center h-full">
      {/* key prop forces remount to reset local root/quality state */}
      <KeySelectorExpanded
        key={isEditing ? "editing" : "initial"}
        onSelect={handleSelect}
        onCancel={handleCancel}
        canCancel={hasKey}
      />
    </div>
  );
}

export { KeySelectorCompact, KeySelectorExpanded };
