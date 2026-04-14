import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioContext } from "./use-audio-context";

// Mock AudioContext
class MockOscillatorNode {
  type = "triangle";
  frequency = { setValueAtTime: vi.fn() };
  connect = vi.fn().mockReturnThis();
  start = vi.fn();
  stop = vi.fn();
  disconnect = vi.fn();
  addEventListener = vi.fn();
}

class MockGainNode {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();
}

class MockBiquadFilterNode {
  type = "lowpass";
  frequency = { setValueAtTime: vi.fn() };
  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();
}

class MockAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  createOscillator = vi.fn(() => new MockOscillatorNode());
  createGain = vi.fn(() => new MockGainNode());
  createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}

beforeEach(() => {
  vi.stubGlobal("AudioContext", MockAudioContext);
});

describe("useAudioContext", () => {
  it("returns playChord, playSequence, stopAll, and isReady", () => {
    const { result } = renderHook(() => useAudioContext());
    expect(result.current).toHaveProperty("playChord");
    expect(result.current).toHaveProperty("playSequence");
    expect(result.current).toHaveProperty("stopAll");
    expect(result.current).toHaveProperty("isReady");
  });

  it("is not ready before first playChord call", () => {
    const { result } = renderHook(() => useAudioContext());
    expect(result.current.isReady).toBe(false);
  });

  it("creates AudioContext lazily on first playChord call", async () => {
    const { result } = renderHook(() => useAudioContext());

    await act(async () => {
      result.current.playChord("C");
    });

    expect(result.current.isReady).toBe(true);
  });

  it("resumes AudioContext if suspended", async () => {
    const SuspendedMockAudioContext = class extends MockAudioContext {
      state = "suspended";
    };
    vi.stubGlobal("AudioContext", SuspendedMockAudioContext);

    const { result } = renderHook(() => useAudioContext());

    await act(async () => {
      result.current.playChord("C");
    });

    expect(result.current.isReady).toBe(true);
  });

  it("reuses the same AudioContext across multiple calls", async () => {
    const constructorSpy = vi.fn();
    const ReusableMockAudioContext = class extends MockAudioContext {
      constructor() {
        super();
        constructorSpy();
      }
    };
    vi.stubGlobal("AudioContext", ReusableMockAudioContext);

    const { result } = renderHook(() => useAudioContext());

    await act(async () => {
      result.current.playChord("C");
    });
    await act(async () => {
      result.current.playChord("Am");
    });

    expect(constructorSpy).toHaveBeenCalledTimes(1);
  });

  it("stopAll can be called without errors when nothing is playing", () => {
    const { result } = renderHook(() => useAudioContext());
    expect(() => result.current.stopAll()).not.toThrow();
  });

  it("stopAll can be called after playing a chord", async () => {
    const { result } = renderHook(() => useAudioContext());

    await act(async () => {
      result.current.playChord("C");
    });

    expect(() => result.current.stopAll()).not.toThrow();
  });
});
