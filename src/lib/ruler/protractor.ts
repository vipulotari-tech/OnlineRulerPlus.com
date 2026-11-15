/**
 * Protractor angle mathematics and helper utilities (180° and full 360° dual-ray).
 */

export function normalizeAngleDeg(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return Math.max(0, Math.min(180, Math.round(deg * 10) / 10));
}

/** Normalize an angle to [0, 360) rounded to 0.1°. */
export function normalizeFullAngleDeg(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  const wrapped = ((deg % 360) + 360) % 360;
  const rounded = Math.round(wrapped * 10) / 10;
  return rounded >= 360 ? 0 : rounded;
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

/**
 * Compute full counter-clockwise angle in degrees [0, 360) from (cx, cy) to (px, py),
 * where 0° is +X (right), 90° is −Y (up), 180° is −X (left), 270° is +Y (down).
 */
export function pointToFullAngle(
  cx: number,
  cy: number,
  px: number,
  py: number,
): number {
  const dx = px - cx;
  const dy = cy - py;
  if (dx === 0 && dy === 0) return 0;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return normalizeFullAngleDeg(deg);
}

/** Positive counter-clockwise sweep [0, 360) from baseline ray `baseDeg` to measurement ray `armDeg`. */
export function raySweepAngleDeg(baseDeg: number, armDeg: number): number {
  if (!Number.isFinite(baseDeg) || !Number.isFinite(armDeg)) return 0;
  return normalizeFullAngleDeg(armDeg - baseDeg);
}

/** Shortest interior angle [0, 180] between two rays. */
export function interiorAngleDeg(baseDeg: number, armDeg: number): number {
  const sweep = raySweepAngleDeg(baseDeg, armDeg);
  const interior = sweep > 180 ? 360 - sweep : sweep;
  return Math.round(interior * 10) / 10;
}

/** Supplementary angle (180° - interior) in [0, 180]. */
export function supplementaryAngleDeg(interiorDeg: number): number {
  if (!Number.isFinite(interiorDeg)) return 180;
  const clamped = Math.max(0, Math.min(180, interiorDeg));
  return Math.round((180 - clamped) * 10) / 10;
}
