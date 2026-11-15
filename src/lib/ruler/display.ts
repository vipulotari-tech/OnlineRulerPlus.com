export type Platform = 'ios' | 'ipados' | 'android' | 'mac' | 'windows' | 'linux' | 'other';

export interface DisplayInfo {
  /** window.screen.width / height in CSS px (as reported; iOS always reports portrait). */
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly dpr: number;
  readonly platform: Platform;
  readonly touch: boolean;
  /** window.visualViewport?.scale when available (1 at un-pinched scale). */
  readonly visualViewportScale?: number;
}

export type DisplayChange = 'none' | 'orientation' | 'zoom' | 'display';

export function detectPlatform(userAgent: string, maxTouchPoints = 0): Platform {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipod/.test(ua)) return 'ios';
  if (/ipad/.test(ua)) return 'ipados';
  // iPadOS 13+ Safari reports a desktop Mac user agent but has a touch screen.
  if (/macintosh/.test(ua) && maxTouchPoints > 1) return 'ipados';
  if (/android/.test(ua)) return 'android';
  if (/macintosh|mac os x/.test(ua)) return 'mac';
  if (/windows/.test(ua)) return 'windows';
  if (/linux|cros/.test(ua)) return 'linux';
  return 'other';
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function sortedSize(info: Pick<DisplayInfo, 'screenWidth' | 'screenHeight'>): [long: number, short: number] {
  const a = Math.round(info.screenWidth);
  const b = Math.round(info.screenHeight);
  return a >= b ? [a, b] : [b, a];
}

/** Orientation-independent key for one display configuration. */
export function displaySignature(info: DisplayInfo): string {
  const [long, short] = sortedSize(info);
  return `${long}x${short}@${round3(info.dpr)}`;
}

/** Physical device-pixel size, approximately (CSS screen size × DPR). */
export function devicePixelSize(info: DisplayInfo): [long: number, short: number] {
  const [long, short] = sortedSize(info);
  return [Math.round(long * info.dpr), Math.round(short * info.dpr)];
}

const DPR_EPSILON = 0.001;

function devicePixelTolerance(dprA: number, dprB: number): number {
  return Math.max(4, Math.ceil(Math.max(dprA, dprB) * 2));
}

/**
 * Classify how the display changed between two readings.
 * - zoom: DPR changed on the same panel (Chromium keeps screen.* constant on zoom;
 *   Firefox scales screen.* so the device-pixel size stays constant).
 */
export function classifyDisplayChange(prev: DisplayInfo, next: DisplayInfo): DisplayChange {
  const [pl, ps] = sortedSize(prev);
  const [nl, ns] = sortedSize(next);
  const sameCssSize = pl === nl && ps === ns;
  const sameDpr = Math.abs(prev.dpr - next.dpr) < DPR_EPSILON;

  if (sameCssSize && sameDpr) {
    const swapped = Math.round(prev.screenWidth) !== Math.round(next.screenWidth);
    return swapped ? 'orientation' : 'none';
  }
  if (!sameDpr) {
    if (sameCssSize) return 'zoom';
    const [pdl, pds] = devicePixelSize(prev);
    const [ndl, nds] = devicePixelSize(next);
    const tol = devicePixelTolerance(prev.dpr, next.dpr);
    if (Math.abs(pdl - ndl) <= tol && Math.abs(pds - nds) <= tol) return 'zoom';
  }
  return 'display';
}

/** Read the current display from browser globals. Browser-only. */
export function readDisplayInfo(win: Window = window): DisplayInfo {
  const nav = win.navigator;
  const rawScale = win.visualViewport?.scale;
  const visualViewportScale =
    typeof rawScale === 'number' && Number.isFinite(rawScale) && rawScale > 0
      ? round3(rawScale)
      : 1;
  return {
    screenWidth: win.screen.width,
    screenHeight: win.screen.height,
    dpr: win.devicePixelRatio || 1,
    platform: detectPlatform(nav.userAgent, nav.maxTouchPoints),
    touch: nav.maxTouchPoints > 0,
    visualViewportScale,
  };
}
