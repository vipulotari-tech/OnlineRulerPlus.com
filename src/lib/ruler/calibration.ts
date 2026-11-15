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

/** Reference calibration target identifiers supported in the calibration studio. */
export type ReferencePresetId =
  | 'card-1x'
  | 'card-2x'
  | 'card-3x'
  | 'a4-width'
  | 'letter-width'
  | 'cd-dvd'
  | 'us-quarter'
  | 'euro-1'
  | 'us-penny'
  | 'custom';

export interface ReferencePreset {
  readonly id: ReferencePresetId;
  readonly widthMm: number;
  readonly aspectRatio: number; // height / width (1 for circle/custom bar)
  readonly circular?: boolean;
  readonly multiplierLabel: string;
}

export const REFERENCE_PRESETS: readonly ReferencePreset[] = [
  { id: 'card-1x', widthMm: 85.6, aspectRatio: CARD_HEIGHT_MM / CARD_WIDTH_MM, multiplierLabel: '1× ID-1 (85.6 mm)' },
  { id: 'card-2x', widthMm: 171.2, aspectRatio: CARD_HEIGHT_MM / 171.2, multiplierLabel: '2× Cards (171.2 mm)' },
  { id: 'card-3x', widthMm: 256.8, aspectRatio: CARD_HEIGHT_MM / 256.8, multiplierLabel: '3× Cards (256.8 mm)' },
  { id: 'a4-width', widthMm: 210.0, aspectRatio: 0.25, multiplierLabel: 'A4 Width (210.0 mm)' },
  { id: 'letter-width', widthMm: 215.9, aspectRatio: 0.25, multiplierLabel: 'US Letter (215.9 mm)' },
  { id: 'cd-dvd', widthMm: 120.0, aspectRatio: 1, circular: true, multiplierLabel: 'CD/DVD (120.0 mm)' },
  { id: 'us-quarter', widthMm: 24.26, aspectRatio: 1, circular: true, multiplierLabel: 'US Quarter (24.26 mm)' },
  { id: 'euro-1', widthMm: 23.25, aspectRatio: 1, circular: true, multiplierLabel: '€1 Coin (23.25 mm)' },
  { id: 'us-penny', widthMm: 19.05, aspectRatio: 1, circular: true, multiplierLabel: 'US Penny (19.05 mm)' },
];

export function getReferencePreset(id: ReferencePresetId): ReferencePreset {
  return REFERENCE_PRESETS.find((p) => p.id === id) ?? REFERENCE_PRESETS[0];
}

/** CSS px per mm from any physical reference target length in millimeters. */
export function pxPerMmFromReference(measuredPx: number, referenceMm: number): Result<number> {
  if (!Number.isFinite(measuredPx) || measuredPx <= 0) {
    return fail('Measured pixels must be greater than zero.');
  }
  if (!Number.isFinite(referenceMm) || referenceMm <= 0) {
    return fail('Reference length must be greater than zero.');
  }
  const pxPerMm = measuredPx / referenceMm;
  if (!isPlausiblePxPerMm(pxPerMm)) {
    return fail('That reference size is outside the plausible range.');
  }
  return ok(pxPerMm);
}

/** Signed relative error in percent of a measured length against its true value. */
export function relativeErrorPercent(measured: number, expected: number): number {
  return ((measured - expected) / expected) * 100;
}
