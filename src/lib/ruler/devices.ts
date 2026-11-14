import type { DisplayInfo, Platform } from './display.ts';
import { sortedSize } from './display.ts';
import { CSS_PX_PER_INCH } from './units.ts';

/**
 * Curated screen configurations whose CSS size + DPR identify a panel density.
 * cssPpi = physical ppi × (CSS short side / panel short side in physical px).
 * Figures are from manufacturer technical specifications.
 */
interface DeviceSpec {
  readonly name: string;
  readonly platforms: readonly Platform[];
  /** CSS screen size, long × short. */
  readonly css: readonly [number, number];
  readonly dpr: number;
  readonly ppi: number;
  readonly panelShortPx: number;
}

const IOS: readonly Platform[] = ['ios'];
const IPAD: readonly Platform[] = ['ipados', 'ios'];
const MAC: readonly Platform[] = ['mac'];

export const DEVICE_SPECS: readonly DeviceSpec[] = [
  // iPhone
  { name: 'iPhone SE (1st gen) / 5s', platforms: IOS, css: [568, 320], dpr: 2, ppi: 326, panelShortPx: 640 },
  { name: 'iPhone SE (2nd/3rd gen) / 6–8', platforms: IOS, css: [667, 375], dpr: 2, ppi: 326, panelShortPx: 750 },
  { name: 'iPhone 6–8 Plus', platforms: IOS, css: [736, 414], dpr: 3, ppi: 401, panelShortPx: 1080 },
  { name: 'iPhone X / XS / 11 Pro', platforms: IOS, css: [812, 375], dpr: 3, ppi: 458, panelShortPx: 1125 },
  { name: 'iPhone 12 mini / 13 mini', platforms: IOS, css: [812, 375], dpr: 3, ppi: 476, panelShortPx: 1080 },
  { name: 'iPhone XR / 11', platforms: IOS, css: [896, 414], dpr: 2, ppi: 326, panelShortPx: 828 },
  { name: 'iPhone XS Max / 11 Pro Max', platforms: IOS, css: [896, 414], dpr: 3, ppi: 458, panelShortPx: 1242 },
  { name: 'iPhone 12 / 13 / 14 (incl. Pro)', platforms: IOS, css: [844, 390], dpr: 3, ppi: 460, panelShortPx: 1170 },
  { name: 'iPhone 12/13 Pro Max / 14 Plus', platforms: IOS, css: [926, 428], dpr: 3, ppi: 458, panelShortPx: 1284 },
  { name: 'iPhone 14 Pro / 15 / 15 Pro / 16', platforms: IOS, css: [852, 393], dpr: 3, ppi: 460, panelShortPx: 1179 },
  { name: 'iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus', platforms: IOS, css: [932, 430], dpr: 3, ppi: 460, panelShortPx: 1290 },
  { name: 'iPhone 16 Pro / 17 / 17 Pro', platforms: IOS, css: [874, 402], dpr: 3, ppi: 460, panelShortPx: 1206 },
  { name: 'iPhone 16 Pro Max / 17 Pro Max', platforms: IOS, css: [956, 440], dpr: 3, ppi: 460, panelShortPx: 1320 },
  // iPad
  { name: 'iPad 9.7″ / iPad Air (1st/2nd gen)', platforms: IPAD, css: [1024, 768], dpr: 2, ppi: 264, panelShortPx: 1536 },
  { name: 'iPad mini (2nd–5th gen)', platforms: IPAD, css: [1024, 768], dpr: 2, ppi: 326, panelShortPx: 1536 },
  { name: 'iPad 10.2″ (7th–9th gen)', platforms: IPAD, css: [1080, 810], dpr: 2, ppi: 264, panelShortPx: 1620 },
  { name: 'iPad Pro 10.5″ / iPad Air (3rd gen)', platforms: IPAD, css: [1112, 834], dpr: 2, ppi: 264, panelShortPx: 1668 },
  { name: 'iPad Pro 11″ (1st–4th gen)', platforms: IPAD, css: [1194, 834], dpr: 2, ppi: 264, panelShortPx: 1668 },
  { name: 'iPad Pro 11″ (M4)', platforms: IPAD, css: [1210, 834], dpr: 2, ppi: 264, panelShortPx: 1668 },
  { name: 'iPad Air 10.9″/11″ / iPad (10th gen)', platforms: IPAD, css: [1180, 820], dpr: 2, ppi: 264, panelShortPx: 1640 },
  { name: 'iPad Pro 12.9″ / iPad Air 13″', platforms: IPAD, css: [1366, 1024], dpr: 2, ppi: 264, panelShortPx: 2048 },
  { name: 'iPad Pro 13″ (M4)', platforms: IPAD, css: [1376, 1032], dpr: 2, ppi: 264, panelShortPx: 2064 },
  { name: 'iPad mini (6th gen and later)', platforms: IPAD, css: [1133, 744], dpr: 2, ppi: 326, panelShortPx: 1488 },
  // Mac (default "looks like" resolutions)
  { name: 'MacBook Pro 14″ (2021 and later)', platforms: MAC, css: [1512, 982], dpr: 2, ppi: 254, panelShortPx: 1964 },
  { name: 'MacBook Pro 16″ (2021 and later)', platforms: MAC, css: [1728, 1117], dpr: 2, ppi: 254, panelShortPx: 2234 },
  { name: 'MacBook Pro 16″ (2019)', platforms: MAC, css: [1792, 1120], dpr: 2, ppi: 226, panelShortPx: 1920 },
  { name: 'MacBook Pro 16″ (2019, scaled)', platforms: MAC, css: [1536, 960], dpr: 2, ppi: 226, panelShortPx: 1920 },
  { name: 'MacBook Air 15.3″ (M2 and later)', platforms: MAC, css: [1710, 1107], dpr: 2, ppi: 224, panelShortPx: 1864 },
  { name: 'MacBook Air 13.6″ (M2 and later)', platforms: MAC, css: [1470, 956], dpr: 2, ppi: 224, panelShortPx: 1664 },
  { name: 'MacBook Air / Pro 13.3″ Retina', platforms: MAC, css: [1440, 900], dpr: 2, ppi: 227, panelShortPx: 1600 },
  { name: 'MacBook Pro 15″ (2016–2019)', platforms: MAC, css: [1440, 900], dpr: 2, ppi: 220, panelShortPx: 1800 },
  { name: 'MacBook Pro 13.3″ Retina (2012–2015)', platforms: MAC, css: [1280, 800], dpr: 2, ppi: 227, panelShortPx: 1600 },
  { name: 'iMac 24″', platforms: MAC, css: [2240, 1260], dpr: 2, ppi: 218, panelShortPx: 2520 },
  { name: 'iMac 21.5″ 4K', platforms: MAC, css: [2048, 1152], dpr: 2, ppi: 219, panelShortPx: 2304 },
  { name: 'iMac 27″ 5K / Studio Display', platforms: MAC, css: [2560, 1440], dpr: 2, ppi: 218, panelShortPx: 2880 },
  { name: '27″ 4K display (scaled)', platforms: MAC, css: [2560, 1440], dpr: 2, ppi: 163, panelShortPx: 2160 },
];

/** Typical single-DPR desktop monitors, keyed by device-pixel size. Estimates only. */
const TYPICAL_MONITORS: readonly { readonly size: readonly [number, number]; readonly diagonal: number }[] = [
  { size: [1280, 1024], diagonal: 19 },
  { size: [1366, 768], diagonal: 15.6 },
  { size: [1440, 900], diagonal: 19 },
  { size: [1600, 900], diagonal: 20 },
  { size: [1680, 1050], diagonal: 22 },
  { size: [1920, 1080], diagonal: 24 },
  { size: [1920, 1200], diagonal: 24 },
  { size: [2560, 1080], diagonal: 29 },
  { size: [2560, 1440], diagonal: 27 },
  { size: [3440, 1440], diagonal: 34 },
  { size: [3840, 2160], diagonal: 32 },
];

/** Nominal densities used when nothing more specific is known (CSS px per inch). */
export const NOMINAL_CSS_PPI = {
  iphone: 153, // every iPhone since the X renders ~153 CSS px per inch
  ipad: 132,
  android: 160, // Android density-independent pixel: nominally 1/160 in
  retinaMac: 120,
  scaledWindows: 110, // Windows default scaling lands ~105–115 CSS px/in on laptops
} as const;

export type DetectionKind = 'detected' | 'estimated';

export interface DetectionResult {
  readonly kind: DetectionKind;
  readonly cssPpi: number;
  readonly label: string;
  readonly basis: string;
}

const MATCH_SPREAD = 1.02;
const DPR_TOLERANCE = 0.01;

const specCssPpi = (s: DeviceSpec) => (s.ppi * s.css[1]) / s.panelShortPx;
const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function findDeviceMatches(info: DisplayInfo): readonly DeviceSpec[] {
  const [long, short] = sortedSize(info);
  return DEVICE_SPECS.filter(
    (s) =>
      s.platforms.includes(info.platform) &&
      s.css[0] === long &&
      s.css[1] === short &&
      Math.abs(s.dpr - info.dpr) < DPR_TOLERANCE,
  );
}

function estimateWithoutMatch(info: DisplayInfo): DetectionResult {
  const est = (cssPpi: number, label: string, basis: string): DetectionResult => ({ kind: 'estimated', cssPpi, label, basis });
  switch (info.platform) {
    case 'ios':
      return est(NOMINAL_CSS_PPI.iphone, 'iPhone (model not identified)', 'Typical iPhone density');
    case 'ipados':
      return est(NOMINAL_CSS_PPI.ipad, 'iPad (model not identified)', 'Typical iPad density');
    case 'android':
      return est(NOMINAL_CSS_PPI.android, 'Android device', 'Android nominal density (160 dp per inch)');
    default:
      break;
  }
  if (info.platform === 'mac' && info.dpr >= 2) {
    return est(NOMINAL_CSS_PPI.retinaMac, 'Mac with Retina display', 'Typical Retina Mac at a scaled resolution');
  }
  if (Math.abs(info.dpr - 1) < DPR_TOLERANCE) {
    const [long, short] = sortedSize(info);
    const monitor = TYPICAL_MONITORS.find((m) => m.size[0] === long && m.size[1] === short);
    if (monitor) {
      return est(
        Math.hypot(long, short) / monitor.diagonal,
        `${long}×${short} display`,
        `Assumes a typical ${monitor.diagonal}″ screen at this resolution`,
      );
    }
    return est(CSS_PX_PER_INCH, 'Desktop display', 'CSS reference scale (96 px per inch)');
  }
  return est(NOMINAL_CSS_PPI.scaledWindows, 'Scaled laptop or desktop display', 'Typical density at default OS scaling');
}

/** Identify the display, or estimate its CSS px per inch. Never exact: always verify. */
export function detectCalibration(info: DisplayInfo): DetectionResult {
  const matches = findDeviceMatches(info);
  if (matches.length === 0) return estimateWithoutMatch(info);
  const ppis = matches.map(specCssPpi);
  const label = matches.map((m) => m.name).join(' or ');
  const consistent = Math.max(...ppis) / Math.min(...ppis) <= MATCH_SPREAD;
  return consistent
    ? { kind: 'detected', cssPpi: mean(ppis), label, basis: 'Matched a known screen configuration' }
    : { kind: 'estimated', cssPpi: mean(ppis), label, basis: 'Several devices share this configuration' };
}
