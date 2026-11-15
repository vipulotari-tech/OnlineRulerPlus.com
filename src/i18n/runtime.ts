import type { Locale } from './config.ts';
import type { LocaleDict } from './types.ts';

type RuntimeDict = LocaleDict['runtime'];

interface RuntimePayload {
  locale: Locale;
  runtime: RuntimeDict;
}

const FALLBACK_RUNTIME: RuntimeDict = {
  statusLabels: {
    detected: 'Detected Device',
    estimated: 'Estimated Scale',
    manual: 'Manual Calibration',
  },
  orientLandscape: 'Landscape',
  orientPortrait: 'Portrait',
  rangeLabel: 'Range:',
  angleLabel: 'Angle:',
  removeGuideAria: 'Remove guide line',
  rotateFloatingTitle: 'Rotate 90°',
  rotateFloatingAria: 'Rotate floating ruler',
  removeFloatingTitle: 'Remove floating ruler',
  removeFloatingAria: 'Remove floating ruler',
  closeProtractorAria: 'Close protractor',
  spanSaved: '{axis}: {value} saved',
  spanGuideLabel: '{axis} Guide',
  autoAppliedBanner: 'Auto-detected display profile applied: {label} ({pxPerMm} px/mm).',
  cardSavedBanner: 'Calibration saved for {label}: {pxPerMm} px/mm ({ppi} CSS PPI).',
  diagonalSavedBanner: 'Diagonal calibration saved: {pxPerMm} px/mm ({ppi} CSS PPI).',
  resetBanner: 'Calibration reset: {label} ({pxPerMm} px/mm).',
  displayOrientationBanner: 'Display orientation changed ({w}×{h}). Ruler recalibrated for your active screen.',
  displayZoomManualBanner: 'Browser zoom or display scaling changed. Manual calibration scale adjusted proportionally.',
  displayZoomAutoBanner: 'Browser zoom or display scaling changed ({w}×{h}). Ruler updated to match active CSS scale.',
  displaySwitchedBanner: 'Display resolution changed ({w}×{h}). Active profile switched to {label}.',
  enterDiagonalPrompt: 'Enter a diagonal size above to preview calibrated PPI.',
  calculatedScale: 'Calculated scale: {ppi} CSS PPI ({pxPerMm} px/mm)',
  basisMap: {},
  deviceLabelMap: {},
  errorMap: {},
  displaySizeSuffix: '{long}×{short} display',
  typMonitorBasis: 'Assumes a typical {diag}″ screen at this resolution',
  manualDiagBasis: '{diag}″ Screen Diagonal',
};

let cachedPayload: RuntimePayload | null = null;

function readPayload(): RuntimePayload {
  if (cachedPayload) return cachedPayload;
  if (typeof document !== 'undefined') {
    const el = document.getElementById('orp-i18n-data');
    if (el && el.textContent) {
      try {
        const parsed = JSON.parse(el.textContent) as Partial<RuntimePayload>;
        if (parsed && parsed.runtime) {
          cachedPayload = {
            locale: parsed.locale ?? 'en',
            runtime: {
              ...FALLBACK_RUNTIME,
              ...parsed.runtime,
              statusLabels: {
                ...FALLBACK_RUNTIME.statusLabels,
                ...(parsed.runtime.statusLabels ?? {}),
              },
            },
          };
          return cachedPayload;
        }
      } catch {
        // Fall back to default English runtime strings if payload JSON is invalid
      }
    }
  }
  return { locale: 'en', runtime: FALLBACK_RUNTIME };
}

export function clearRuntimeCache(): void {
  cachedPayload = null;
}

export function getRuntimeLocale(): Locale {
  return readPayload().locale;
}

export function getRuntimeDict(): RuntimeDict {
  return readPayload().runtime;
}

export function formatTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (full, key: string) => {
    const val = vars[key];
    return val === undefined ? full : String(val);
  });
}

export function translateStatusLabel(
  status: 'detected' | 'estimated' | 'manual',
  runtime: RuntimeDict = getRuntimeDict(),
): string {
  return runtime.statusLabels[status] ?? FALLBACK_RUNTIME.statusLabels[status];
}

export function translateDeviceLabel(label: string, runtime: RuntimeDict = getRuntimeDict()): string {
  const exact = runtime.deviceLabelMap[label];
  if (exact) return exact;
  if (label === 'ISO/IEC 7810 ID-1 Card (85.60 mm)') {
    return runtime.deviceLabelMap['Credit card calibration'] ?? label;
  }

  const diagMatch = label.match(/^([\d.]+)″ (?:Screen|Display) Diagonal$/);
  if (diagMatch) {
    return formatTemplate(runtime.manualDiagBasis, { diag: diagMatch[1] });
  }

  const sizeMatch = label.match(/^(.+?)×(.+?) display$/);
  if (sizeMatch) {
    return formatTemplate(runtime.displaySizeSuffix, {
      long: sizeMatch[1],
      short: sizeMatch[2],
    });
  }

  return label;
}

export function translateBasis(basis: string, runtime: RuntimeDict = getRuntimeDict()): string {
  const exact = runtime.basisMap[basis];
  if (exact) return exact;

  const typMatch = basis.match(/^Assumes a typical ([\d.]+)″ screen at this resolution$/);
  if (typMatch) {
    return formatTemplate(runtime.typMonitorBasis, { diag: typMatch[1] });
  }

  return basis;
}

export function translateError(error: string, runtime: RuntimeDict = getRuntimeDict()): string {
  const exact = runtime.errorMap[error];
  if (exact) return exact;

  const rangeMatch = error.match(/^Enter a diagonal between (\d+) and (\d+) inches\.$/);
  if (rangeMatch) {
    const tmpl = runtime.errorMap['Enter a diagonal between 4 and 120 inches.'];
    if (tmpl) {
      return tmpl.replace(/\b4\b/, rangeMatch[1]).replace(/\b120\b/, rangeMatch[2]);
    }
  }

  return error;
}
