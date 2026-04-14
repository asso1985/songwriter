/**
 * Formats a key root + quality into the internal key ID format.
 * e.g., ("G", "Major") → "G_major"
 */
export function formatKeyId(root: string, quality: string): string {
  return `${root}_${quality.toLowerCase()}`;
}

/**
 * Formats an internal key ID into a human-readable display string.
 * e.g., "G_major" → "G Major"
 */
export function formatKeyDisplay(keyId: string): string {
  const [root, quality] = keyId.split("_");
  if (!root || !quality) return keyId;
  return `${root} ${quality.charAt(0).toUpperCase()}${quality.slice(1)}`;
}
