/**
 * Unit constants and conversions.
 *
 * Internal scale: CSS pixels per millimetre (`pxPerMm`).
 * `px` values are CSS pixels and never depend on calibration.
 */

export type Unit = 'cm' | 'mm' | 'in' | 'px';

export const UNITS: readonly Unit[] = ['cm', 'mm', 'in', 'px'];

export type ScalePresetId = '1:1' | '1:10' | '1:20' | '1:48' | '1:50' | '1:100';

export interface ScalePreset {
  readonly id: ScalePresetId;
  readonly label: string;
  readonly factor: number;
}

export const SCALE_PRESETS: readonly ScalePreset[] = [
  { id: '1:1', label: '1:1', factor: 1 },
  { id: '1:10', label: '1:10', factor: 10 },
  { id: '1:20', label: '1:20', factor: 20 },
  { id: '1:48', label: '1/4″ = 1′ (1:48)', factor: 48 },
  { id: '1:50', label: '1:50', factor: 50 },
  { id: '1:100', label: '1:100', factor: 100 },
];

export function isScalePresetId(value: unknown): value is ScalePresetId {
  return typeof value === 'string' && SCALE_PRESETS.some((s) => s.id === value);
}

export function scaleFactorForPreset(id: ScalePresetId | undefined): number {
  const found = SCALE_PRESETS.find((s) => s.id === id);
  return found ? found.factor : 1;
}

/** Effective screen pixels per real-world mm when measuring an architectural scale drawing. */
export function effectivePxPerMmForScale(pxPerMm: number, scaleFactor = 1): number {
  if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) return pxPerMm;
  return pxPerMm / scaleFactor;
}

export const MM_PER_INCH = 25.4;
export const MM_PER_CM = 10;
/** CSS reference: 1in = 96 CSS px (CSS Values & Units). Not a physical density. */
export const CSS_PX_PER_INCH = 96;
export const CSS_REFERENCE_PX_PER_MM = CSS_PX_PER_INCH / MM_PER_INCH;

export const UNIT_LABELS: Readonly<Record<Unit, string>> = {
  cm: 'Centimeters',
  mm: 'Millimeters',
  in: 'Inches',
  px: 'CSS pixels',
};

const UNIT_DECIMALS: Readonly<Record<Unit, number>> = { cm: 2, mm: 1, in: 3, px: 0 };

export function isUnit(value: unknown): value is Unit {
  return typeof value === 'string' && (UNITS as readonly string[]).includes(value);
}

/** CSS pixels spanned by one `unit` at the given scale. */
export function pxPerUnit(unit: Unit, pxPerMm: number): number {
  switch (unit) {
    case 'mm':
      return pxPerMm;
    case 'cm':
      return pxPerMm * MM_PER_CM;
    case 'in':
      return pxPerMm * MM_PER_INCH;
    case 'px':
      return 1;
  }
}

export function pxToUnit(px: number, unit: Unit, pxPerMm: number): number {
  return px / pxPerUnit(unit, pxPerMm);
}

export function unitToPx(value: number, unit: Unit, pxPerMm: number): number {
  return value * pxPerUnit(unit, pxPerMm);
}

export function formatNumber(value: number, unit: Unit): string {
  const fixed = value.toFixed(UNIT_DECIMALS[unit]);
  // Avoid "-0.00" for tiny negative values.
  return Number(fixed) === 0 ? (0).toFixed(UNIT_DECIMALS[unit]) : fixed;
}

export function formatValue(value: number, unit: Unit): string {
  return `${formatNumber(value, unit)} ${unit}`;
}

export interface Fraction {
  readonly negative: boolean;
  readonly whole: number;
  readonly numerator: number;
  readonly denominator: number;
}

/** Nearest fraction with a power-of-two denominator up to `maxDenominator`, reduced. */
export function toFraction(value: number, maxDenominator = 16): Fraction {
  const negative = value < 0;
  const scaled = Math.round(Math.abs(value) * maxDenominator);
  const whole = Math.floor(scaled / maxDenominator);
  let numerator = scaled % maxDenominator;
  let denominator = maxDenominator;
  while (numerator > 0 && numerator % 2 === 0 && denominator % 2 === 0) {
    numerator /= 2;
    denominator /= 2;
  }
  return { negative: negative && scaled > 0, whole, numerator, denominator };
}

/** e.g. 3.4375 → "3 7/16 in", 0.5 → "1/2 in", 2 → "2 in". */
export function formatInchFraction(inches: number, maxDenominator = 16): string {
  const { negative, whole, numerator, denominator } = toFraction(inches, maxDenominator);
  const sign = negative ? '−' : '';
  if (numerator === 0) return `${sign}${whole} in`;
  const frac = `${numerator}/${denominator}`;
  return whole === 0 ? `${sign}${frac} in` : `${sign}${whole} ${frac} in`;
}
