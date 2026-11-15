import { MM_PER_INCH } from './units.ts';

export const MIN_CIRCLE_MM = 1;
export const MAX_CIRCLE_MM = 150;

export interface CirclePreset {
  readonly id: string;
  readonly category: 'bolt' | 'coin' | 'ring' | 'disc';
  readonly label: string;
  readonly diameterMm: number;
}

export const CIRCLE_PRESETS: readonly CirclePreset[] = [
  { id: 'm3', category: 'bolt', label: 'M3 (3 mm)', diameterMm: 3.0 },
  { id: 'm4', category: 'bolt', label: 'M4 (4 mm)', diameterMm: 4.0 },
  { id: 'm5', category: 'bolt', label: 'M5 (5 mm)', diameterMm: 5.0 },
  { id: 'm6', category: 'bolt', label: 'M6 (6 mm)', diameterMm: 6.0 },
  { id: 'm8', category: 'bolt', label: 'M8 (8 mm)', diameterMm: 8.0 },
  { id: 'm10', category: 'bolt', label: 'M10 (10 mm)', diameterMm: 10.0 },
  { id: 'm12', category: 'bolt', label: 'M12 (12 mm)', diameterMm: 12.0 },
  { id: 'ring-us-7', category: 'ring', label: 'US Ring 7 (17.3 mm)', diameterMm: 17.35 },
  { id: 'ring-us-9', category: 'ring', label: 'US Ring 9 (19.0 mm)', diameterMm: 18.95 },
  { id: 'penny', category: 'coin', label: 'US Penny (19.05 mm)', diameterMm: 19.05 },
  { id: 'euro-1', category: 'coin', label: '€1 Euro (23.25 mm)', diameterMm: 23.25 },
  { id: 'quarter', category: 'coin', label: 'US Quarter (24.26 mm)', diameterMm: 24.26 },
  { id: 'cd-dvd', category: 'disc', label: 'CD / DVD (120 mm)', diameterMm: 120.0 },
];

// US standard ring sizes mapped by inside diameter (mm)
const US_RING_SIZES: readonly { readonly size: string; readonly diameterMm: number }[] = [
  { size: '3', diameterMm: 14.1 },
  { size: '3.5', diameterMm: 14.5 },
  { size: '4', diameterMm: 14.9 },
  { size: '4.5', diameterMm: 15.3 },
  { size: '5', diameterMm: 15.7 },
  { size: '5.5', diameterMm: 16.1 },
  { size: '6', diameterMm: 16.5 },
  { size: '6.5', diameterMm: 16.9 },
  { size: '7', diameterMm: 17.35 },
  { size: '7.5', diameterMm: 17.75 },
  { size: '8', diameterMm: 18.19 },
  { size: '8.5', diameterMm: 18.54 },
  { size: '9', diameterMm: 18.95 },
  { size: '9.5', diameterMm: 19.41 },
  { size: '10', diameterMm: 19.84 },
  { size: '10.5', diameterMm: 20.2 },
  { size: '11', diameterMm: 20.68 },
  { size: '11.5', diameterMm: 21.08 },
  { size: '12', diameterMm: 21.49 },
  { size: '13', diameterMm: 22.33 },
];

export function clampCircleDiameterMm(mm: number): number {
  if (!Number.isFinite(mm)) return 24.26;
  return Math.max(MIN_CIRCLE_MM, Math.min(MAX_CIRCLE_MM, Math.round(mm * 100) / 100));
}

export interface CircleMetrics {
  readonly diameterMm: number;
  readonly radiusMm: number;
  readonly circumferenceMm: number;
  readonly areaMm2: number;
  readonly diameterIn: number;
  readonly nearestUsRing: string | null;
  readonly nearestEuRing: number | null;
}

export function computeCircleMetrics(rawDiameterMm: number): CircleMetrics {
  const diameterMm = clampCircleDiameterMm(rawDiameterMm);
  const radiusMm = diameterMm / 2;
  const circumferenceMm = Math.PI * diameterMm;
  const areaMm2 = Math.PI * radiusMm * radiusMm;
  const diameterIn = diameterMm / MM_PER_INCH;

  let nearestUsRing: string | null = null;
  let nearestEuRing: number | null = null;
  if (diameterMm >= 13.8 && diameterMm <= 22.8) {
    let best = US_RING_SIZES[0];
    let bestDiff = Math.abs(diameterMm - best.diameterMm);
    for (const entry of US_RING_SIZES) {
      const diff = Math.abs(diameterMm - entry.diameterMm);
      if (diff < bestDiff) {
        best = entry;
        bestDiff = diff;
      }
    }
    nearestUsRing = `US ${best.size}`;
    nearestEuRing = Math.round(circumferenceMm);
  }

  return {
    diameterMm,
    radiusMm,
    circumferenceMm,
    areaMm2,
    diameterIn,
    nearestUsRing,
    nearestEuRing,
  };
}

export interface QuadrantMetrics {
  readonly xUnit: number;
  readonly yUnit: number;
  readonly rUnit: number;
  readonly angleDeg: number;
  readonly quadrantLabel: 'Origin' | 'Axis' | 'I (+, +)' | 'II (−, +)' | 'III (−, −)' | 'IV (+, −)';
}

export function computeQuadrantMetrics(xUnit: number, yUnit: number): QuadrantMetrics {
  const eps = 1e-6;
  const rUnit = Math.hypot(xUnit, yUnit);
  const rawDeg = (Math.atan2(yUnit, xUnit) * 180) / Math.PI;
  const angleDeg = (rawDeg + 360) % 360;

  let quadrantLabel: QuadrantMetrics['quadrantLabel'] = 'Axis';
  if (Math.abs(xUnit) <= eps && Math.abs(yUnit) <= eps) {
    quadrantLabel = 'Origin';
  } else if (xUnit > eps && yUnit > eps) {
    quadrantLabel = 'I (+, +)';
  } else if (xUnit < -eps && yUnit > eps) {
    quadrantLabel = 'II (−, +)';
  } else if (xUnit < -eps && yUnit < -eps) {
    quadrantLabel = 'III (−, −)';
  } else if (xUnit > eps && yUnit < -eps) {
    quadrantLabel = 'IV (+, −)';
  }

  return {
    xUnit,
    yUnit,
    rUnit,
    angleDeg: rUnit <= eps ? 0 : angleDeg,
    quadrantLabel,
  };
}
