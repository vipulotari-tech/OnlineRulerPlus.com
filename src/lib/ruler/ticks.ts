import { pxPerUnit, type Unit } from './units.ts';

/** 0 = major (labelled), higher numbers = progressively shorter marks. */
export type TickLevel = 0 | 1 | 2 | 3 | 4;

export interface Tick {
  /** Offset from the ruler origin in CSS px. */
  readonly pos: number;
  readonly level: TickLevel;
  readonly label?: string;
}

interface Subdivision {
  readonly divisor: number;
  readonly level: TickLevel;
}

interface TickScheme {
  /** Size of one major step, expressed in `unit`. */
  readonly majorStep: number;
  /** Ascending divisors of the major step; each must divide the next. */
  readonly subdivisions: readonly Subdivision[];
  readonly label: (majorIndex: number) => string;
}

export type InchDivisor = 8 | 16 | 32;

const METRIC_SUBDIVISIONS: readonly Subdivision[] = [
  { divisor: 2, level: 1 }, // 5 mm
  { divisor: 10, level: 2 }, // 1 mm
];

const INCH_SUBDIVISIONS_BY_DIVISOR: Readonly<Record<InchDivisor, readonly Subdivision[]>> = {
  8: [
    { divisor: 2, level: 1 },
    { divisor: 4, level: 2 },
    { divisor: 8, level: 3 },
  ],
  16: [
    { divisor: 2, level: 1 },
    { divisor: 4, level: 2 },
    { divisor: 8, level: 3 },
    { divisor: 16, level: 4 },
  ],
  32: [
    { divisor: 2, level: 1 },
    { divisor: 4, level: 2 },
    { divisor: 8, level: 3 },
    { divisor: 16, level: 4 },
    { divisor: 32, level: 4 },
  ],
};

const SCHEMES: Readonly<Record<Unit, TickScheme>> = {
  cm: { majorStep: 1, subdivisions: METRIC_SUBDIVISIONS, label: (i) => String(i) },
  mm: { majorStep: 10, subdivisions: METRIC_SUBDIVISIONS, label: (i) => String(i * 10) },
  in: {
    majorStep: 1,
    subdivisions: INCH_SUBDIVISIONS_BY_DIVISOR[16],
    label: (i) => String(i),
  },
  px: {
    majorStep: 100,
    subdivisions: [
      { divisor: 2, level: 1 }, // 50 px
      { divisor: 10, level: 2 }, // 10 px
    ],
    label: (i) => String(i * 100),
  },
};

/** Marks closer together than this (CSS px) are dropped rather than smeared. */
export const MIN_TICK_GAP_PX = 3;
/** Minimum distance between numeric labels (CSS px). */
export const MIN_LABEL_GAP_PX = 28;
const LABEL_STRIDES = [1, 2, 5, 10, 20, 50] as const;

export interface GenerateTicksOptions {
  readonly inchDivisor?: InchDivisor;
}

/**
 * Generate ruler marks for a ruler `lengthPx` CSS px long.
 * Every mark sits on an exact measurement coordinate; density adapts by
 * omitting the finest subdivisions, never by moving marks.
 */
export function generateTicks(
  lengthPx: number,
  unit: Unit,
  pxPerMm: number,
  minGapPx = MIN_TICK_GAP_PX,
  options?: GenerateTicksOptions,
): Tick[] {
  if (!Number.isFinite(lengthPx) || !Number.isFinite(pxPerMm) || lengthPx <= 0 || pxPerMm <= 0) {
    return [];
  }
  const scheme = SCHEMES[unit];
  const subdivisions =
    unit === 'in' && options?.inchDivisor
      ? (INCH_SUBDIVISIONS_BY_DIVISOR[options.inchDivisor] ?? scheme.subdivisions)
      : scheme.subdivisions;
  const majorPx = scheme.majorStep * pxPerUnit(unit, pxPerMm);

  const effectiveMinGap = unit === 'in' && options?.inchDivisor === 32 ? Math.min(minGapPx, 2.5) : minGapPx;
  const usable = subdivisions.filter((s) => majorPx / s.divisor >= effectiveMinGap);
  const finest = usable.length > 0 ? usable[usable.length - 1].divisor : 1;
  const stepPx = majorPx / finest;
  const labelStride = LABEL_STRIDES.find((k) => majorPx * k >= MIN_LABEL_GAP_PX) ?? 100;

  const count = Math.floor(lengthPx / stepPx + 1e-9);
  const ticks: Tick[] = [];
  for (let i = 0; i <= count; i++) {
    const pos = (i * majorPx) / finest;
    if (i % finest === 0) {
      const major = i / finest;
      ticks.push(
        major % labelStride === 0 ? { pos, level: 0, label: scheme.label(major) } : { pos, level: 0 },
      );
      continue;
    }
    const sub = usable.find((s) => (i * s.divisor) % finest === 0);
    ticks.push({ pos, level: sub ? sub.level : 4 });
  }
  return ticks;
}
