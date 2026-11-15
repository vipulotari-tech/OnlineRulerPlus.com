import {
  cardWidthPx,
  cssPpi,
  fromDevicePxPerMm,
  isPlausiblePxPerMm,
  toDevicePxPerMm,
  type ReferencePresetId,
} from './calibration.ts';
import { type DisplayInfo, displaySignature, sortedSize } from './display.ts';
import type { InchDivisor } from './ticks.ts';
import { isScalePresetId, isUnit, type ScalePresetId, type Unit } from './units.ts';

export type CalibrationMethod = 'auto-detect' | 'diagonal' | 'card';
export type CalibrationStatus = 'detected' | 'estimated' | 'manual';

export const STATUS_LABELS: Readonly<Record<CalibrationStatus, string>> = {
  detected: 'Device detected',
  estimated: 'Estimated calibration',
  manual: 'Manual calibration',
};

export interface CalibrationProfile {
  readonly id?: string;
  readonly customName?: string;
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
  readonly namedProfiles?: readonly CalibrationProfile[];
  readonly activeNamedProfileId?: string;
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
  readonly scalePreset?: ScalePresetId;
}

export interface PersistedFloatingRuler {
  readonly id: string;
  readonly orientation: 'horizontal' | 'vertical';
  readonly x: number;
  readonly y: number;
  readonly lengthPx: number;
  readonly angleDeg: number;
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
  overlays: 'orp:overlays:v1',
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
    readonly id?: string;
    readonly customName?: string;
    readonly diagonalIn?: number;
    readonly cardWidthPx?: number;
    readonly referencePresetId?: ReferencePresetId;
    readonly referenceMm?: number;
  },
  now = Date.now(),
): CalibrationProfile {
  const [cssLong, cssShort] = sortedSize(info);
  return {
    ...(extra?.id ? { id: extra.id } : {}),
    ...(extra?.customName ? { customName: extra.customName.slice(0, 60) } : {}),
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
    const namedProfiles: CalibrationProfile[] = [];
    if (Array.isArray(parsed.namedProfiles)) {
      for (const np of parsed.namedProfiles) {
        if (isValidProfile(np) && typeof np.id === 'string' && np.id.length > 0) {
          namedProfiles.push(np);
        }
        if (namedProfiles.length >= 12) break;
      }
    }
    const activeNamedProfileId =
      typeof parsed.activeNamedProfileId === 'string' &&
      namedProfiles.some((np) => np.id === parsed.activeNamedProfileId)
        ? parsed.activeNamedProfileId
        : undefined;

    return {
      version: 1,
      profiles: clean,
      ...(namedProfiles.length > 0 ? { namedProfiles } : {}),
      ...(activeNamedProfileId !== undefined ? { activeNamedProfileId } : {}),
    };
  } catch {
    return EMPTY_CALIBRATION_STORE;
  }
}

export function saveProfileToStore(
  store: CalibrationStore,
  profile: CalibrationProfile,
): CalibrationStore {
  return {
    ...store,
    version: 1,
    profiles: {
      ...store.profiles,
      [profile.signature]: profile,
    },
  };
}

/** Save a named monitor profile so users can switch between identical-resolution displays. */
export function saveNamedProfileToStore(
  store: CalibrationStore,
  info: DisplayInfo,
  pxPerMm: number,
  customName: string,
  method: 'diagonal' | 'card' = 'card',
  id = `np-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  now = Date.now(),
): CalibrationStore {
  const cleanName = customName.trim().slice(0, 48) || `Monitor ${displaySignature(info)}`;
  const named = createManualProfile(
    info,
    pxPerMm,
    method,
    cleanName,
    {
      id,
      customName: cleanName,
      cardWidthPx: cardWidthPx(pxPerMm),
    },
    now,
  );
  const existing = store.namedProfiles ?? [];
  const nextNamed = [named, ...existing.filter((p) => p.id !== id && p.customName !== cleanName)].slice(0, 12);
  return {
    ...store,
    version: 1,
    profiles: {
      ...store.profiles,
      [named.signature]: named,
    },
    namedProfiles: nextNamed,
    activeNamedProfileId: named.id,
  };
}

/** Activate a saved named profile for the current display (rescaling across DPR differences cleanly). */
export function selectNamedProfileInStore(
  store: CalibrationStore,
  profileId: string,
  info: DisplayInfo,
  now = Date.now(),
): CalibrationStore {
  const found = (store.namedProfiles ?? []).find((p) => p.id === profileId);
  if (!found) return store;
  const sig = displaySignature(info);
  const [cssLong, cssShort] = sortedSize(info);
  const nextPxPerMm = isPlausiblePxPerMm(fromDevicePxPerMm(found.devicePxPerMm, info.dpr))
    ? fromDevicePxPerMm(found.devicePxPerMm, info.dpr)
    : found.pxPerMm;

  const activated: CalibrationProfile = {
    ...found,
    signature: sig,
    cssLong,
    cssShort,
    dpr: info.dpr,
    pxPerMm: nextPxPerMm,
    devicePxPerMm: toDevicePxPerMm(nextPxPerMm, info.dpr),
    cardWidthPx: cardWidthPx(nextPxPerMm),
    updatedAt: now,
  };
  return {
    ...store,
    version: 1,
    profiles: {
      ...store.profiles,
      [sig]: activated,
    },
    activeNamedProfileId: profileId,
  };
}

export function deleteNamedProfileFromStore(
  store: CalibrationStore,
  profileId: string,
): CalibrationStore {
  const nextNamed = (store.namedProfiles ?? []).filter((p) => p.id !== profileId);
  const nextActive = store.activeNamedProfileId === profileId ? undefined : store.activeNamedProfileId;
  return {
    ...store,
    version: 1,
    namedProfiles: nextNamed,
    ...(nextActive !== undefined ? { activeNamedProfileId: nextActive } : { activeNamedProfileId: undefined }),
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
  return {
    ...store,
    version: 1,
    profiles: next,
    activeNamedProfileId: undefined,
  };
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
  return {
    ...store,
    version: 1,
    profiles: next,
    activeNamedProfileId: undefined,
  };
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
    const scalePreset = isScalePresetId(parsed.scalePreset) ? parsed.scalePreset : undefined;

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
      ...(scalePreset !== undefined ? { scalePreset } : {}),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function parseFloatingRulers(raw: string | null | undefined): readonly PersistedFloatingRuler[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const clean: PersistedFloatingRuler[] = [];
    for (const item of parsed) {
      if (
        isRecord(item) &&
        typeof item.id === 'string' &&
        (item.orientation === 'horizontal' || item.orientation === 'vertical') &&
        typeof item.x === 'number' &&
        Number.isFinite(item.x) &&
        typeof item.y === 'number' &&
        Number.isFinite(item.y) &&
        typeof item.lengthPx === 'number' &&
        Number.isFinite(item.lengthPx) &&
        item.lengthPx >= 100 &&
        item.lengthPx <= 2000
      ) {
        const rawAngle = typeof item.angleDeg === 'number' && Number.isFinite(item.angleDeg)
          ? ((item.angleDeg % 360) + 360) % 360
          : item.orientation === 'vertical'
            ? 90
            : 0;
        clean.push({
          id: item.id,
          orientation: item.orientation,
          x: Math.max(0, Math.round(item.x * 10) / 10),
          y: Math.max(0, Math.round(item.y * 10) / 10),
          lengthPx: Math.round(item.lengthPx),
          angleDeg: Math.round(rawAngle * 10) / 10,
        });
      }
      if (clean.length >= 4) break;
    }
    return clean;
  } catch {
    return [];
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

export interface HistoryExportContext {
  readonly status: CalibrationStatus;
  readonly label: string;
  readonly pxPerMm: number;
}

function escapeCsvCell(val: string | number): string {
  const s = String(val);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function formatHistoryCsv(
  history: readonly MeasurementRecord[],
  ctx: HistoryExportContext,
): string {
  const headers = ['id', 'label', 'cm', 'mm', 'in', 'px', 'unit', 'calibration_status', 'px_per_mm', 'css_ppi', 'created_at'];
  const ppi = cssPpi(ctx.pxPerMm).toFixed(2);
  const pxMm = ctx.pxPerMm.toFixed(4);
  const rows = history.map((item) => {
    const cm = (item.lengthMm / 10).toFixed(2);
    const mm = item.lengthMm.toFixed(1);
    const inches = (item.lengthMm / 25.4).toFixed(3);
    const px = Math.round(item.lengthPx);
    const iso = new Date(item.createdAt).toISOString();
    return [
      item.id,
      item.label,
      cm,
      mm,
      inches,
      px,
      item.unit,
      ctx.status,
      pxMm,
      ppi,
      iso,
    ].map(escapeCsvCell).join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function formatHistoryJson(
  history: readonly MeasurementRecord[],
  ctx: HistoryExportContext,
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      source: 'OnlineRulerPlus.com',
      calibration: {
        status: ctx.status,
        label: ctx.label,
        pxPerMm: Number(ctx.pxPerMm.toFixed(4)),
        cssPpi: Number(cssPpi(ctx.pxPerMm).toFixed(2)),
      },
      measurements: history.map((item) => ({
        id: item.id,
        label: item.label,
        cm: Number((item.lengthMm / 10).toFixed(3)),
        mm: Number(item.lengthMm.toFixed(2)),
        inches: Number((item.lengthMm / 25.4).toFixed(4)),
        px: Math.round(item.lengthPx),
        unit: item.unit,
        createdAt: new Date(item.createdAt).toISOString(),
      })),
    },
    null,
    2,
  );
}
