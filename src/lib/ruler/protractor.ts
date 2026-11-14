/**
 * Protractor angle mathematics and rendering helper.
 */

export function normalizeAngleDeg(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return Math.max(0, Math.min(180, Math.round(deg * 10) / 10));
}

/**
 * Compute angle in degrees [0, 180] from a baseline origin (cx, cy) to (px, py),
 * where 0° is along the +X axis and 90° is straight up (−Y in screen coordinates).
 */
export function pointToProtractorAngle(
  cx: number,
  cy: number,
  px: number,
  py: number,
): number {
  const dx = px - cx;
  const dy = cy - py; // Invert Y so upward is positive
  if (dx === 0 && dy === 0) return 90;
  const rad = Math.atan2(Math.max(0, dy), dx);
  return normalizeAngleDeg((rad * 180) / Math.PI);
}
