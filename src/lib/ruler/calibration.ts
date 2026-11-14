import { MM_PER_INCH } from './units.ts';

/** ISO/IEC 7810 ID-1 (bank / credit / ID card) dimensions. */
export const CARD_WIDTH_MM = 85.6;
export const CARD_HEIGHT_MM = 53.98;
/** ISO/IEC 7810 corner radius for ID-1 cards. */
export const CARD_CORNER_RADIUS_MM = 3.18;

export const MIN_DIAGONAL_IN = 3;
export const MAX_DIAGONAL_IN = 100;

/** Plausible CSS px per mm (≈25–508 CSS px/in). Outside this a result is rejected. */
export const MIN_PX_PER_MM = 1;
export const MAX_PX_PER_MM = 20;

export type Result<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = <T>(error: string): Result<T> => ({ ok: false, error });

export function isPlausiblePxPerMm(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_PX_PER_MM && value <= MAX_PX_PER_MM;
}

/** Accepts "15.6", "15,6", '15.6"', "15.6 in", "15.6 inches". */
export function parseDiagonal(input: string | number): Result<number> {
  const text = String(input)
    .trim()
    .toLowerCase()
    .replace(/(inches|inch|in|["″”])$/u, '')
    .trim()
    .replace(',', '.');
  if (text === '') return fail('Enter your screen diagonal in inches.');
  if (!/^\d*\.?\d+$/.test(text)) return fail('Use a number such as 15.6.');
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0) return fail('The diagonal must be greater than zero.');
  if (value < MIN_DIAGONAL_IN || value > MAX_DIAGONAL_IN) {
    return fail(`Enter a diagonal between ${MIN_DIAGONAL_IN} and ${MAX_DIAGONAL_IN} inches.`);
  }
  return ok(value);
}

/**
 * CSS px per mm from the visible display diagonal.
 * `screenWidth`/`screenHeight` are CSS px (window.screen.*) at 100 % browser zoom.
 */
export function pxPerMmFromDiagonal(screenWidth: number, screenHeight: number, diagonalIn: number): Result<number> {
  if (!(screenWidth > 0) || !(screenHeight > 0)) return fail('Screen dimensions are unavailable.');
  if (!(diagonalIn >= MIN_DIAGONAL_IN && diagonalIn <= MAX_DIAGONAL_IN)) {
    return fail(`Enter a diagonal between ${MIN_DIAGONAL_IN} and ${MAX_DIAGONAL_IN} inches.`);
  }
  const cssPpi = Math.hypot(screenWidth, screenHeight) / diagonalIn;
  const pxPerMm = cssPpi / MM_PER_INCH;
  if (!isPlausiblePxPerMm(pxPerMm)) {
    return fail('That diagonal gives an implausible pixel density. Check the value and your browser zoom.');
  }
  return ok(pxPerMm);
}

/** CSS px per mm from the on-screen width (CSS px) that matches a physical ID-1 card. */
export function pxPerMmFromCardWidth(cardWidthPx: number): Result<number> {
  if (!Number.isFinite(cardWidthPx) || cardWidthPx <= 0) return fail('Card width must be greater than zero.');
  const pxPerMm = cardWidthPx / CARD_WIDTH_MM;
  if (!isPlausiblePxPerMm(pxPerMm)) return fail('That card size is outside the plausible range.');
  return ok(pxPerMm);
}

export function cardWidthPx(pxPerMm: number): number {
  return CARD_WIDTH_MM * pxPerMm;
}

export function cardHeightPx(pxPerMm: number): number {
  return CARD_HEIGHT_MM * pxPerMm;
}

/** Height that keeps the exact ID-1 aspect ratio for a given width. */
export function cardHeightForWidth(widthPx: number): number {
  return (widthPx * CARD_HEIGHT_MM) / CARD_WIDTH_MM;
}

/** CSS px per mm from the on-screen short edge (53.98 mm) of an ID-1 card (portrait mode on phones). */
export function pxPerMmFromCardHeight(cardShortEdgePx: number): Result<number> {
  if (!Number.isFinite(cardShortEdgePx) || cardShortEdgePx <= 0) {
    return fail('Card size must be greater than zero.');
  }
  const pxPerMm = cardShortEdgePx / CARD_HEIGHT_MM;
  if (!isPlausiblePxPerMm(pxPerMm)) return fail('That card size is outside the plausible range.');
  return ok(pxPerMm);
}

export function cssPpi(pxPerMm: number): number {
  return pxPerMm * MM_PER_INCH;
}

export function pxPerMmFromCssPpi(ppi: number): number {
  return ppi / MM_PER_INCH;
}

/** Physical-panel scale, invariant under browser zoom and OS scaling. */
export function toDevicePxPerMm(pxPerMm: number, dpr: number): number {
  return pxPerMm * dpr;
}

export function fromDevicePxPerMm(devicePxPerMm: number, dpr: number): number {
  return devicePxPerMm / dpr;
}

/** Signed relative error in percent of a measured length against its true value. */
export function relativeErrorPercent(measured: number, expected: number): number {
  return ((measured - expected) / expected) * 100;
}
