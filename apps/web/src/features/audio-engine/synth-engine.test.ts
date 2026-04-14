import { describe, it, expect, vi, beforeEach } from "vitest";
import { playChord, stopChord } from "./synth-engine";

// Mock Web Audio API nodes
function createMockGainParam() {
  return {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

function createMockOscillator() {
  return {
    type: "triangle" as OscillatorType,
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
    addEventListener: vi.fn(),
  };
}

function createMockGainNode() {
  return {
    gain: createMockGainParam(),
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
  };
}

function createMockBiquadFilter() {
  return {
    type: "lowpass" as BiquadFilterType,
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
  };
}

function createMockAudioContext() {
  const oscillators: ReturnType<typeof createMockOscillator>[] = [];
  const gainNodes: ReturnType<typeof createMockGainNode>[] = [];
  const filters: ReturnType<typeof createMockBiquadFilter>[] = [];

  return {
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => {
      const osc = createMockOscillator();
      oscillators.push(osc);
      return osc;
    }),
    createGain: vi.fn(() => {
      const gain = createMockGainNode();
      gainNodes.push(gain);
      return gain;
    }),
    createBiquadFilter: vi.fn(() => {
      const filter = createMockBiquadFilter();
      filters.push(filter);
      return filter;
    }),
    _oscillators: oscillators,
    _gainNodes: gainNodes,
    _filters: filters,
  } as unknown as AudioContext & {
    _oscillators: ReturnType<typeof createMockOscillator>[];
    _gainNodes: ReturnType<typeof createMockGainNode>[];
    _filters: ReturnType<typeof createMockBiquadFilter>[];
  };
}

describe("playChord", () => {
  let ctx: ReturnType<typeof createMockAudioContext>;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates one oscillator per frequency", () => {
    playChord(ctx, [261.63, 329.63, 392.0]);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it("creates one gain node per frequency plus one master gain", () => {
    playChord(ctx, [261.63, 329.63, 392.0]);
    // 3 per-note gains + 1 master gain = 4
    expect(ctx.createGain).toHaveBeenCalledTimes(4);
  });

  it("creates one filter per frequency", () => {
    playChord(ctx, [261.63, 329.63, 392.0]);
    expect(ctx.createBiquadFilter).toHaveBeenCalledTimes(3);
  });

  it("sets oscillator type to triangle", () => {
    playChord(ctx, [440]);
    expect(ctx._oscillators[0].type).toBe("triangle");
  });

  it("sets each oscillator frequency correctly", () => {
    const freqs = [261.63, 329.63, 392.0];
    playChord(ctx, freqs);

    for (let i = 0; i < freqs.length; i++) {
      expect(ctx._oscillators[i].frequency.setValueAtTime).toHaveBeenCalledWith(
        freqs[i],
        0,
      );
    }
  });

  it("applies ADSR envelope to each note gain", () => {
    playChord(ctx, [440]);

    // Note gain is the second gain node (first is master)
    const noteGain = ctx._gainNodes[1];
    // Attack: starts at 0
    expect(noteGain.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
    // Attack: ramps to 1
    expect(noteGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      1,
      0.01,
    );
    // Decay: ramps to sustain level
    expect(noteGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0.6,
      0.11,
    );
  });

  it("sets filter to lowpass at 2000Hz", () => {
    playChord(ctx, [440]);
    expect(ctx._filters[0].type).toBe("lowpass");
    expect(ctx._filters[0].frequency.setValueAtTime).toHaveBeenCalledWith(
      2000,
      0,
    );
  });

  it("starts all oscillators", () => {
    playChord(ctx, [261.63, 329.63, 392.0]);
    for (const osc of ctx._oscillators) {
      expect(osc.start).toHaveBeenCalledWith(0);
    }
  });

  it("connects master gain to destination", () => {
    playChord(ctx, [440]);
    // Master gain is the first gain node created
    expect(ctx._gainNodes[0].connect).toHaveBeenCalledWith(ctx.destination);
  });

  it("returns an ActiveChord with correct structure", () => {
    const result = playChord(ctx, [261.63, 329.63]);
    expect(result.oscillators).toHaveLength(2);
    expect(result.noteGains).toHaveLength(2);
    expect(result.filters).toHaveLength(2);
    expect(result.masterGain).toBeDefined();
  });

  it("handles a single frequency (e.g., for testing)", () => {
    const result = playChord(ctx, [440]);
    expect(result.oscillators).toHaveLength(1);
    expect(result.noteGains).toHaveLength(1);
    expect(result.filters).toHaveLength(1);
  });

  it("handles 4 frequencies (7th chord)", () => {
    const result = playChord(ctx, [196.0, 246.94, 293.66, 349.23]);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(4);
    expect(result.oscillators).toHaveLength(4);
  });

  it("schedules auto-release when duration option provided", () => {
    vi.useFakeTimers();
    playChord(ctx, [440], { duration: 2000 });

    // Note gain should have release scheduled at 2.0s (2000ms/1000)
    const noteGain = ctx._gainNodes[1];
    expect(noteGain.gain.setValueAtTime).toHaveBeenCalledWith(0.6, 2);
    expect(
      noteGain.gain.exponentialRampToValueAtTime,
    ).toHaveBeenCalledWith(0.001, expect.closeTo(2.3, 1));

    // Master gain should also have release scheduled
    const masterGain = ctx._gainNodes[0];
    expect(masterGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.001,
      expect.closeTo(2.3, 1),
    );
    vi.useRealTimers();
  });

  it("stops oscillators after auto-release", () => {
    vi.useFakeTimers();
    playChord(ctx, [440], { duration: 2000 });

    // Oscillator stop scheduled after release
    expect(ctx._oscillators[0].stop).toHaveBeenCalledWith(
      expect.closeTo(2.31, 1),
    );
    vi.useRealTimers();
  });

  it("does not schedule auto-release when no duration option", () => {
    playChord(ctx, [440]);

    // Oscillator should NOT have stop called (sustain indefinitely)
    expect(ctx._oscillators[0].stop).not.toHaveBeenCalled();
  });
});

describe("stopChord", () => {
  let ctx: ReturnType<typeof createMockAudioContext>;

  beforeEach(() => {
    ctx = createMockAudioContext();
    vi.useFakeTimers();
  });

  it("ramps master gain to near-zero for crossfade", () => {
    const chord = playChord(ctx, [440]);
    stopChord(ctx, chord);

    const masterGain = ctx._gainNodes[0];
    expect(
      masterGain.gain.exponentialRampToValueAtTime,
    ).toHaveBeenCalledWith(0.001, expect.closeTo(0.05, 2));
  });

  it("schedules oscillator stop after crossfade", () => {
    const chord = playChord(ctx, [440]);
    stopChord(ctx, chord);

    expect(ctx._oscillators[0].stop).toHaveBeenCalledWith(
      expect.closeTo(0.06, 2),
    );
  });

  it("disconnects all nodes after cleanup timeout", () => {
    const chord = playChord(ctx, [261.63, 329.63]);
    stopChord(ctx, chord);

    // Advance timers past cleanup timeout
    vi.advanceTimersByTime(200);

    for (const osc of ctx._oscillators) {
      expect(osc.disconnect).toHaveBeenCalled();
    }
    // Note gains (not master) at indices 1 and 2
    expect(ctx._gainNodes[1].disconnect).toHaveBeenCalled();
    expect(ctx._gainNodes[2].disconnect).toHaveBeenCalled();
    for (const filter of ctx._filters) {
      expect(filter.disconnect).toHaveBeenCalled();
    }
    // Master gain
    expect(ctx._gainNodes[0].disconnect).toHaveBeenCalled();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
