import { MM_PER_CM, MM_PER_INCH, formatInchFraction, formatNumber, type Unit } from './units.ts';
import type { InchDivisor } from './ticks.ts';

export interface PhotoPoint {
  /** Horizontal offset in natural image pixels. */
  readonly x: number;
  /** Vertical offset in natural image pixels. */
  readonly y: number;
}

export type PhotoLengthUnit = 'mm' | 'cm' | 'in';

export interface PhotoScaleCalibration {
  readonly pxPerMm: number;
  readonly referencePx: number;
  readonly referenceMm: number;
  readonly label: string;
}

export interface PhotoDeltaStats {
  readonly dxPx: number;
  readonly dyPx: number;
  readonly diagPx: number;
}

export interface PhotoCalibrateResult<T> {
  readonly ok: boolean;
  readonly value?: T;
  readonly error?: string;
}

export function distancePx(a: PhotoPoint, b: PhotoPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function deltaStatsPx(a: PhotoPoint, b: PhotoPoint): PhotoDeltaStats {
  const dxPx = Math.abs(b.x - a.x);
  const dyPx = Math.abs(b.y - a.y);
  return { dxPx, dyPx, diagPx: Math.hypot(dxPx, dyPx) };
}

export function toMmFromPhotoUnit(value: number, unit: PhotoLengthUnit): number {
  if (unit === 'cm') return value * MM_PER_CM;
  if (unit === 'in') return value * MM_PER_INCH;
  return value;
}

/**
 * Calibrates natural image scale (px per mm) from two clicked image points
 * separated by a known physical length. No external server upload is required.
 */
export function calibrateScaleFromTwoPoints(
  a: PhotoPoint,
  b: PhotoPoint,
  knownLength: number,
  unit: PhotoLengthUnit,
  label = '2-point photo reference',
): PhotoCalibrateResult<PhotoScaleCalibration> {
  const referencePx = distancePx(a, b);
  if (!Number.isFinite(referencePx) || referencePx < 2) {
    return { ok: false, error: 'Pick two distinct reference points at least 2 px apart.' };
  }
  if (!Number.isFinite(knownLength) || knownLength <= 0) {
    return { ok: false, error: 'Known reference length must be greater than zero.' };
  }
  const referenceMm = toMmFromPhotoUnit(knownLength, unit);
  const pxPerMm = referencePx / referenceMm;
  if (!Number.isFinite(pxPerMm) || pxPerMm < 1e-4 || pxPerMm > 1e5) {
    return { ok: false, error: 'Computed image scale is out of supported precision bounds.' };
  }
  return {
    ok: true,
    value: {
      pxPerMm,
      referencePx,
      referenceMm,
      label,
    },
  };
}

export function photoPxToUnit(
  px: number,
  unit: Unit,
  scale: PhotoScaleCalibration | null,
): number {
  if (unit === 'px' || !scale) return px;
  const mm = px / scale.pxPerMm;
  if (unit === 'mm') return mm;
  if (unit === 'cm') return mm / MM_PER_CM;
  return mm / MM_PER_INCH;
}

export function formatPhotoLength(
  px: number,
  unit: Unit,
  scale: PhotoScaleCalibration | null,
  inchDivisor: InchDivisor = 16,
): string {
  const roundedPx = `${Math.round(px)} px`;
  if (unit === 'px' || !scale) {
    return roundedPx;
  }
  const val = photoPxToUnit(px, unit, scale);
  const main =
    unit === 'in'
      ? `${formatNumber(val, 'in')} in (${formatInchFraction(val, inchDivisor)})`
      : `${formatNumber(val, unit)} ${unit}`;
  return `${main} · ${roundedPx}`;
}

export interface FitRect {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly scale: number;
  readonly drawW: number;
  readonly drawH: number;
}

/** Computes centered contain placement for an image inside a viewport box. */
export function fitContainRect(
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number,
  paddingPx = 16,
): FitRect {
  if (imgW <= 0 || imgH <= 0 || boxW <= 0 || boxH <= 0) {
    return { offsetX: 0, offsetY: 0, scale: 1, drawW: 0, drawH: 0 };
  }
  const availW = Math.max(32, boxW - paddingPx * 2);
  const availH = Math.max(32, boxH - paddingPx * 2);
  const scale = Math.min(availW / imgW, availH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  return {
    offsetX: (boxW - drawW) / 2,
    offsetY: (boxH - drawH) / 2,
    scale,
    drawW,
    drawH,
  };
}
