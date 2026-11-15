import {
  cardWidthPx,
  fromDevicePxPerMm,
  isPlausiblePxPerMm,
  toDevicePxPerMm,
  type ReferencePresetId,
} from './calibration.ts';
import { type DisplayInfo, displaySignature, sortedSize } from './display.ts';
import type { InchDivisor } from './ticks.ts';
import { isUnit, type Unit } from './units.ts';

export type CalibrationMethod = 'auto-detect' | 'diagonal' | 'card';
export type CalibrationStatus = 'detected' | 'estimated' | 'manual';

export const STATUS_LABELS: Readonly<Record<CalibrationStatus, string>> = {
  detected: 'Device detected',
  estimated: 'Estimated calibration',
  manual: 'Manual calibration',
};

export interface CalibrationProfile {
  readonly signature: string;
  readonly cssLong: number;
  readonly cssShort: number;
  readonly dpr: number;
  readonly pxPerMm: number;
  readonly devicePxPerMm: number;
  readonly method: CalibrationMethod;
  readonly status: CalibrationStatus;
  readonly label: string;
  readonly diagonalIn?: number;
  readonly cardWidthPx?: number;
  readonly referencePresetId?: ReferencePresetId;
  readonly referenceMm?: number;
  readonly updatedAt: number;
}

export interface CalibrationStore {
  readonly version: 1;
  readonly profiles: Readonly<Record<string, CalibrationProfile>>;
}

export interface EdgeState {
  readonly top: boolean;
  readonly bottom: boolean;
  readonly left: boolean;
  readonly right: boolean;
}

export type RulerThickness = 36 | 48 | 64;

export interface RulerPreferences {
  readonly unit: Unit;
  readonly edges: EdgeState;
  readonly dualUnit: boolean;
  readonly dualPair?: 'unit' | 'px';
  readonly inchDivisor?: InchDivisor;
  readonly thickness: RulerThickness;
  readonly opacity: number;
  readonly guidesEnabled: boolean;
  readonly crosshairEnabled: boolean;
  readonly shortcutsEnabled?: boolean;
  readonly focusMode?: boolean;
}

export interface MeasurementRecord {
  readonly id: string;
  readonly lengthMm: number;
  readonly lengthPx: number;
  readonly unit: Unit;
  readonly label: string;
  readonly createdAt: number;
}

export const STORAGE_KEYS = {
  calibration: 'orp:calibration:v1',
  preferences: 'orp:preferences:v1',
  history: 'orp:history:v1',
  theme: 'orp:theme',
} as const;

export const DEFAULT_PREFERENCES: RulerPreferences = {
  unit: 'cm',
  edges: { top: true, left: true, bottom: false, right: false },
  dualUnit: false,
  thickness: 48,
  opacity: 0.96,
  guidesEnabled: true,
  crosshairEnabled: false,
};

export const EMPTY_CALIBRATION_STORE: CalibrationStore = {
  version: 1,
  profiles: {},
};

const METHODS: readonly CalibrationMethod[] = ['auto-detect', 'diagonal', 'card'];
const STATUSES: readonly CalibrationStatus[] = ['detected', 'estimated', 'manual'];
const THICKNESSES: readonly RulerThickness[] = [36, 48, 64];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function isValidProfile(v: unknown): v is CalibrationProfile {
  if (!isRecord(v)) return false;
  return (
    typeof v.signature === 'string' &&
    v.signature.length > 0 &&
    typeof v.cssLong === 'number' &&
    Number.isFinite(v.cssLong) &&
    v.cssLong > 0 &&
    typeof v.cssShort === 'number' &&
    Number.isFinite(v.cssShort) &&
    v.cssShort > 0 &&
    typeof v.dpr === 'number' &&
    Number.isFinite(v.dpr) &&
    v.dpr > 0 &&
    typeof v.pxPerMm === 'number' &&
    isPlausiblePxPerMm(v.pxPerMm) &&
    typeof v.devicePxPerMm === 'number' &&
    Number.isFinite(v.devicePxPerMm) &&
    v.devicePxPerMm > 0 &&
    typeof v.method === 'string' &&
    (METHODS as readonly string[]).includes(v.method) &&
    typeof v.status === 'string' &&
    (STATUSES as readonly string[]).includes(v.status) &&
    typeof v.label === 'string' &&
    typeof v.updatedAt === 'number' &&
    Number.isFinite(v.updatedAt)
  );
}

export function createManualProfile(
  info: DisplayInfo,
  pxPerMm: number,
  method: 'diagonal' | 'card',
  label: string,
  extra?: {
    readonly diagonalIn?: number;
    readonly cardWidthPx?: number;
    readonly referencePresetId?: ReferencePresetId;
    readonly referenceMm?: number;
  },
  now = Date.now(),
): CalibrationProfile {
  const [cssLong, cssShort] = sortedSize(info);
  return {
    signature: displaySignature(info),
    cssLong,
    cssShort,
    dpr: info.dpr,
    pxPerMm,
    devicePxPerMm: toDevicePxPerMm(pxPerMm, info.dpr),
    method,
    status: 'manual',
    label,
    ...(extra?.diagonalIn !== undefined ? { diagonalIn: extra.diagonalIn } : {}),
    ...(extra?.cardWidthPx !== undefined ? { cardWidthPx: extra.cardWidthPx } : {}),
    ...(extra?.referencePresetId !== undefined ? { referencePresetId: extra.referencePresetId } : {}),
    ...(extra?.referenceMm !== undefined ? { referenceMm: extra.referenceMm } : {}),
    updatedAt: now,
  };
}

export function parseCalibrationStore(raw: string | null | undefined): CalibrationStore {
  if (!raw) return EMPTY_CALIBRATION_STORE;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.profiles)) {
      return EMPTY_CALIBRATION_STORE;
    }
    const clean: Record<string, CalibrationProfile> = {};
    for (const [key, val] of Object.entries(parsed.profiles)) {
      if (isValidProfile(val)) {
        clean[key] = val;
      }
    }
    return { version: 1, profiles: clean };
  } catch {
    return EMPTY_CALIBRATION_STORE;
  }
}

export function saveProfileToStore(
  store: CalibrationStore,
  profile: CalibrationProfile,
): CalibrationStore {
  return {
    version: 1,
    profiles: {
      ...store.profiles,
      [profile.signature]: profile,
    },
  };
}

function matchesPhysicalPanel(cand: CalibrationProfile, info: DisplayInfo): boolean {
  const [long, short] = sortedSize(info);
  if (cand.cssLong === long && cand.cssShort === short) return true;
  const devLong = Math.round(long * info.dpr);
  const devShort = Math.round(short * info.dpr);
  const candDevLong = Math.round(cand.cssLong * cand.dpr);
  const candDevShort = Math.round(cand.cssShort * cand.dpr);
  const tol = Math.max(4, Math.ceil(Math.max(info.dpr, cand.dpr) * 2));
  return Math.abs(candDevLong - devLong) <= tol && Math.abs(candDevShort - devShort) <= tol;
}

export function removeProfileFromStore(
  store: CalibrationStore,
  signature: string,
): CalibrationStore {
  const next: Record<string, CalibrationProfile> = {};
  for (const [key, value] of Object.entries(store.profiles)) {
    if (key !== signature) next[key] = value;
  }
  return { version: 1, profiles: next };
}

export function removeProfileForDisplay(
  store: CalibrationStore,
  info: DisplayInfo,
): CalibrationStore {
  const sig = displaySignature(info);
  const next: Record<string, CalibrationProfile> = {};
  for (const [key, value] of Object.entries(store.profiles)) {
    if (key !== sig && !matchesPhysicalPanel(value, info)) {
      next[key] = value;
    }
  }
  return { version: 1, profiles: next };
}

/**
 * Find a matching manual calibration for `info`.
 * 1. Exact signature match (`long×short@dpr`).
 * 2. Same CSS screen size or same physical device-pixel size with a different DPR
 *    (browser zoom or OS scaling changed on the same monitor) -> rescale from `devicePxPerMm`.
 */
export function findProfileForDisplay(
  store: CalibrationStore,
  info: DisplayInfo,
): { readonly profile: CalibrationProfile; readonly rescaledForZoom: boolean } | null {
  const sig = displaySignature(info);
  const direct = store.profiles[sig];
  if (direct) return { profile: direct, rescaledForZoom: false };

  const [long, short] = sortedSize(info);
  const candidates = Object.values(store.profiles).sort((a, b) => b.updatedAt - a.updatedAt);
  for (const cand of candidates) {
    if (matchesPhysicalPanel(cand, info)) {
      const rescaledPxPerMm = fromDevicePxPerMm(cand.devicePxPerMm, info.dpr);
      if (isPlausiblePxPerMm(rescaledPxPerMm)) {
        return {
          profile: {
            ...cand,
            signature: sig,
            cssLong: long,
            cssShort: short,
            dpr: info.dpr,
            pxPerMm: rescaledPxPerMm,
            ...(cand.cardWidthPx !== undefined
              ? { cardWidthPx: cardWidthPx(rescaledPxPerMm) }
              : {}),
          },
          rescaledForZoom: true,
        };
      }
    }
  }
  return null;
}

export function parsePreferences(raw: string | null | undefined): RulerPreferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return DEFAULT_PREFERENCES;
    const unit = isUnit(parsed.unit) ? parsed.unit : DEFAULT_PREFERENCES.unit;
    const rawEdges = isRecord(parsed.edges) ? parsed.edges : {};
    const edges: EdgeState = {
      top: typeof rawEdges.top === 'boolean' ? rawEdges.top : DEFAULT_PREFERENCES.edges.top,
      bottom:
        typeof rawEdges.bottom === 'boolean' ? rawEdges.bottom : DEFAULT_PREFERENCES.edges.bottom,
      left: typeof rawEdges.left === 'boolean' ? rawEdges.left : DEFAULT_PREFERENCES.edges.left,
      right: typeof rawEdges.right === 'boolean' ? rawEdges.right : DEFAULT_PREFERENCES.edges.right,
    };
    const dualUnit =
      typeof parsed.dualUnit === 'boolean' ? parsed.dualUnit : DEFAULT_PREFERENCES.dualUnit;
    const thickness =
      typeof parsed.thickness === 'number' &&
      (THICKNESSES as readonly number[]).includes(parsed.thickness)
        ? (parsed.thickness as RulerThickness)
        : DEFAULT_PREFERENCES.thickness;
    const opacity =
      typeof parsed.opacity === 'number' && parsed.opacity >= 0.35 && parsed.opacity <= 1
        ? Math.round(parsed.opacity * 100) / 100
        : DEFAULT_PREFERENCES.opacity;
    const guidesEnabled =
      typeof parsed.guidesEnabled === 'boolean'
        ? parsed.guidesEnabled
        : DEFAULT_PREFERENCES.guidesEnabled;
    const crosshairEnabled =
      typeof parsed.crosshairEnabled === 'boolean'
        ? parsed.crosshairEnabled
        : DEFAULT_PREFERENCES.crosshairEnabled;
    const shortcutsEnabled =
      typeof parsed.shortcutsEnabled === 'boolean' ? parsed.shortcutsEnabled : true;
    const focusMode =
      typeof parsed.focusMode === 'boolean' ? parsed.focusMode : false;
    const dualPair =
      parsed.dualPair === 'px' || parsed.dualPair === 'unit' ? parsed.dualPair : undefined;
    const inchDivisor =
      parsed.inchDivisor === 8 || parsed.inchDivisor === 16 || parsed.inchDivisor === 32
        ? parsed.inchDivisor
        : undefined;

    return {
      unit,
      edges,
      dualUnit,
      ...(dualPair !== undefined ? { dualPair } : {}),
      ...(inchDivisor !== undefined ? { inchDivisor } : {}),
      thickness,
      opacity,
      guidesEnabled,
      crosshairEnabled,
      ...(parsed.shortcutsEnabled !== undefined ? { shortcutsEnabled } : {}),
      ...(parsed.focusMode !== undefined ? { focusMode } : {}),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export const MAX_HISTORY_ITEMS = 25;

export function parseHistory(raw: string | null | undefined): readonly MeasurementRecord[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: MeasurementRecord[] = [];
    for (const item of parsed) {
      if (
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.lengthMm === 'number' &&
        Number.isFinite(item.lengthMm) &&
        item.lengthMm >= 0 &&
        typeof item.lengthPx === 'number' &&
        Number.isFinite(item.lengthPx) &&
        item.lengthPx >= 0 &&
        isUnit(item.unit) &&
        typeof item.label === 'string' &&
        typeof item.createdAt === 'number'
      ) {
        valid.push({
          id: item.id,
          lengthMm: item.lengthMm,
          lengthPx: item.lengthPx,
          unit: item.unit,
          label: item.label.slice(0, 80),
          createdAt: item.createdAt,
        });
      }
      if (valid.length >= MAX_HISTORY_ITEMS) break;
    }
    return valid;
  } catch {
    return [];
  }
}

export function appendHistoryRecord(
  history: readonly MeasurementRecord[],
  record: MeasurementRecord,
): readonly MeasurementRecord[] {
  return [record, ...history.filter((r) => r.id !== record.id)].slice(0, MAX_HISTORY_ITEMS);
}
