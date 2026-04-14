/**
 * Web Audio API synthesis engine.
 * Creates oscillator-based chord synthesis with ADSR envelopes,
 * low-pass filtering, and crossfade support.
 */

const MASTER_GAIN = 0.3;
const ATTACK_TIME = 0.01; // 10ms
const DECAY_TIME = 0.1; // 100ms
const SUSTAIN_LEVEL = 0.6;
const RELEASE_TIME = 0.3; // 300ms
const CROSSFADE_TIME = 0.05; // 50ms
const FILTER_CUTOFF = 2000; // Hz

export interface ActiveChord {
  masterGain: GainNode;
  oscillators: OscillatorNode[];
  noteGains: GainNode[];
  filters: BiquadFilterNode[];
}

/**
 * Play a chord by creating oscillators for each frequency.
 * Signal chain per note: Oscillator (triangle) → GainNode (ADSR) → BiquadFilter (lowpass) → masterGain → destination
 */
export interface PlayChordOptions {
  /** Auto-release after this many milliseconds. Omit for indefinite sustain. */
  duration?: number;
}

export function playChord(
  ctx: AudioContext,
  frequencies: number[],
  options?: PlayChordOptions,
): ActiveChord {
  const now = ctx.currentTime;

  // Create master gain node with 50ms fade-in for smooth crossfade
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(MASTER_GAIN, now + CROSSFADE_TIME);
  masterGain.connect(ctx.destination);

  const oscillators: OscillatorNode[] = [];
  const noteGains: GainNode[] = [];
  const filters: BiquadFilterNode[] = [];

  for (const freq of frequencies) {
    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    // Per-note gain with ADSR envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    // Attack: ramp from 0 to 1 over ATTACK_TIME
    gain.gain.linearRampToValueAtTime(1, now + ATTACK_TIME);
    // Decay: ramp from 1 to SUSTAIN_LEVEL over DECAY_TIME
    gain.gain.linearRampToValueAtTime(
      SUSTAIN_LEVEL,
      now + ATTACK_TIME + DECAY_TIME,
    );

    // Low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(FILTER_CUTOFF, now);

    // Connect chain: osc → gain → filter → masterGain
    osc.connect(gain);
    gain.connect(filter);
    filter.connect(masterGain);

    osc.start(now);

    oscillators.push(osc);
    noteGains.push(gain);
    filters.push(filter);
  }

  // Schedule auto-release if duration provided
  if (options?.duration != null) {
    const releaseStart = now + options.duration / 1000;
    const releaseEnd = releaseStart + RELEASE_TIME;

    // Ramp each note gain to near-zero at release
    for (const gain of noteGains) {
      gain.gain.setValueAtTime(SUSTAIN_LEVEL, releaseStart);
      gain.gain.exponentialRampToValueAtTime(0.001, releaseEnd);
    }

    // Ramp master gain to near-zero
    masterGain.gain.setValueAtTime(MASTER_GAIN, releaseStart);
    masterGain.gain.exponentialRampToValueAtTime(0.001, releaseEnd);

    // Stop oscillators after release
    const stopTime = releaseEnd + 0.01;
    for (const osc of oscillators) {
      osc.stop(stopTime);
    }

    // Disconnect all nodes after stop
    setTimeout(() => {
      for (const osc of oscillators) {
        osc.disconnect();
      }
      for (const gain of noteGains) {
        gain.disconnect();
      }
      for (const filter of filters) {
        filter.disconnect();
      }
      masterGain.disconnect();
    }, (options.duration + RELEASE_TIME * 1000 + 100));
  }

  return { masterGain, oscillators, noteGains, filters };
}

/**
 * Stop a chord with a smooth crossfade (ramp gain to 0).
 * Disconnects and cleans up all nodes after release.
 */
export function stopChord(ctx: AudioContext, chord: ActiveChord): void {
  const now = ctx.currentTime;

  // Ramp master gain to near-zero (exponentialRamp can't go to 0)
  chord.masterGain.gain.setValueAtTime(chord.masterGain.gain.value, now);
  chord.masterGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + CROSSFADE_TIME,
  );

  // Schedule cleanup after crossfade completes
  const cleanupTime = now + CROSSFADE_TIME + 0.01;
  for (const osc of chord.oscillators) {
    try {
      osc.stop(cleanupTime);
    } catch {
      // Already stopped (e.g., auto-release fired before manual stop)
    }
  }

  // Disconnect all nodes after stop
  setTimeout(() => {
    for (const osc of chord.oscillators) {
      osc.disconnect();
    }
    for (const gain of chord.noteGains) {
      gain.disconnect();
    }
    for (const filter of chord.filters) {
      filter.disconnect();
    }
    chord.masterGain.disconnect();
  }, (CROSSFADE_TIME + 0.05) * 1000);
}
