/**
 * Maps harmonic distance to an emoji cue indicating the chord's character.
 * Used on hover to give quick visual guidance during creative flow.
 */
export function getChordEmoji(distance: number): string {
  if (distance === 0) return "🏠";
  if (distance === 1) return "👍";
  if (distance === 2) return "🔥";
  if (distance === 3) return "✨";
  return "🌈";
}
