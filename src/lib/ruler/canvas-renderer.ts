import { generateTicks, type Tick, type TickLevel } from './ticks.ts';
import { type Unit } from './units.ts';

export type RulerEdge = 'top' | 'bottom' | 'left' | 'right';

export interface RenderRulerOptions {
  readonly edge: RulerEdge;
  readonly lengthPx: number;
  readonly thicknessPx: number;
  readonly originInsetPx: number;
  readonly unit: Unit;
  readonly dualUnit: boolean;
  readonly pxPerMm: number;
  readonly dpr: number;
  readonly dark: boolean;
  readonly cursorPosPx?: number | null;
}

const LEVEL_HEIGHT_RATIO: Readonly<Record<TickLevel, number>> = {
  0: 0.56,
  1: 0.40,
  2: 0.28,
  3: 0.20,
  4: 0.13,
};

const DUAL_LEVEL_HEIGHT_RATIO: Readonly<Record<TickLevel, number>> = {
  0: 0.36,
  1: 0.26,
  2: 0.18,
  3: 0.13,
  4: 0.09,
};

function secondaryUnitFor(primary: Unit): Unit {
  return primary === 'in' ? 'cm' : 'in';
}

/**
 * Render a horizontal or vertical calibrated ruler onto a 2D canvas context
 * using Apple DESIGN.md surface, ink, and Action Blue tokens.
 */
export function renderRulerToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderRulerOptions,
): { readonly primaryTicks: readonly Tick[]; readonly secondaryTicks: readonly Tick[] } {
  const {
    edge,
    lengthPx,
    thicknessPx,
    originInsetPx,
    unit,
    dualUnit,
    pxPerMm,
    dpr,
    dark,
    cursorPosPx,
  } = options;

  const isHorizontal = edge === 'top' || edge === 'bottom';
  const cssWidth = isHorizontal ? lengthPx : thicknessPx;
  const cssHeight = isHorizontal ? thicknessPx : lengthPx;

  const targetW = Math.max(1, Math.round(cssWidth * dpr));
  const targetH = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== targetW) canvas.width = targetW;
  if (canvas.height !== targetH) canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  const measurableLength = Math.max(0, lengthPx - originInsetPx - 8);
  const primaryTicks = generateTicks(measurableLength, unit, pxPerMm);
  const secondaryUnit = secondaryUnitFor(unit);
  const secondaryTicks = dualUnit ? generateTicks(measurableLength, secondaryUnit, pxPerMm) : [];

  if (!ctx) return { primaryTicks, secondaryTicks };

  ctx.save();
  ctx.scale(dpr, dpr);

  // Surface fill: Pure White (#ffffff) in light mode, Near-Black (#1d1d1f) in dark mode
  ctx.fillStyle = dark ? '#1d1d1f' : '#ffffff';
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Parchment (#f5f5f7) / Tile-1 (#272729) precision track band along the measuring edge
  ctx.fillStyle = dark ? '#272729' : '#f5f5f7';
  if (edge === 'top') ctx.fillRect(0, 0, cssWidth, thicknessPx * 0.35);
  else if (edge === 'bottom') ctx.fillRect(0, thicknessPx * 0.65, cssWidth, thicknessPx * 0.35);
  else if (edge === 'left') ctx.fillRect(0, 0, thicknessPx * 0.35, cssHeight);
  else ctx.fillRect(thicknessPx * 0.65, 0, thicknessPx * 0.35, cssHeight);

  const inkMajor = dark ? '#ffffff' : '#1d1d1f';
  const inkMinor = dark ? '#cccccc' : '#333333';
  const inkSubtle = dark ? '#86868b' : '#7a7a7a';
  const accentBlue = dark ? '#2997ff' : '#0066cc';

  const ratios = dualUnit ? DUAL_LEVEL_HEIGHT_RATIO : LEVEL_HEIGHT_RATIO;

  // Draw primary ticks (anchored to outer edge of the ruler)
  drawTickSeries(ctx, {
    ticks: primaryTicks,
    edge,
    anchorOuter: true,
    thicknessPx,
    originInsetPx,
    ratios,
    inkMajor,
    inkMinor,
    inkSubtle,
    unitSuffix: unit,
    showFractionHalves: unit === 'in' && !dualUnit && thicknessPx >= 48,
  });

  // Draw secondary ticks in dual mode (anchored to inner edge of the ruler)
  if (dualUnit && secondaryTicks.length > 0) {
    drawTickSeries(ctx, {
      ticks: secondaryTicks,
      edge,
      anchorOuter: false,
      thicknessPx,
      originInsetPx,
      ratios,
      inkMajor: inkMinor,
      inkMinor: inkSubtle,
      inkSubtle,
      unitSuffix: secondaryUnit,
      showFractionHalves: false,
    });
  }

  // Draw live cursor projection marker on the ruler in Action Blue / Sky Link Blue
  if (typeof cursorPosPx === 'number' && cursorPosPx >= 0 && cursorPosPx <= measurableLength) {
    const cPos = originInsetPx + cursorPosPx;
    ctx.strokeStyle = accentBlue;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(cPos, 0);
      ctx.lineTo(cPos, thicknessPx);
    } else {
      ctx.moveTo(0, cPos);
      ctx.lineTo(thicknessPx, cPos);
    }
    ctx.stroke();
  }

  ctx.restore();
  return { primaryTicks, secondaryTicks };
}

interface DrawSeriesArgs {
  readonly ticks: readonly Tick[];
  readonly edge: RulerEdge;
  readonly anchorOuter: boolean;
  readonly thicknessPx: number;
  readonly originInsetPx: number;
  readonly ratios: Readonly<Record<TickLevel, number>>;
  readonly inkMajor: string;
  readonly inkMinor: string;
  readonly inkSubtle: string;
  readonly unitSuffix: Unit;
  readonly showFractionHalves: boolean;
}

function drawTickSeries(ctx: CanvasRenderingContext2D, args: DrawSeriesArgs): void {
  const {
    ticks,
    edge,
    anchorOuter,
    thicknessPx,
    originInsetPx,
    ratios,
    inkMajor,
    inkMinor,
    inkSubtle,
    unitSuffix,
    showFractionHalves,
  } = args;

  const isHorizontal = edge === 'top' || edge === 'bottom';
  const fromZeroEdge =
    (edge === 'top' && anchorOuter) ||
    (edge === 'bottom' && !anchorOuter) ||
    (edge === 'left' && anchorOuter) ||
    (edge === 'right' && !anchorOuter);

  ctx.font = '600 11px "SF Mono", ui-monospace, SFMono-Regular, "Geist Mono Variable", "Geist Mono", monospace';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i];
    const coord = originInsetPx + tick.pos;
    const tickLen = Math.round(thicknessPx * ratios[tick.level]);

    ctx.strokeStyle = tick.level === 0 ? inkMajor : tick.level <= 2 ? inkMinor : inkSubtle;
    ctx.lineWidth = tick.level === 0 ? 1.25 : 1;

    const start = fromZeroEdge ? 0 : thicknessPx;
    const end = fromZeroEdge ? tickLen : thicknessPx - tickLen;

    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(coord, start);
      ctx.lineTo(coord, end);
    } else {
      ctx.moveTo(start, coord);
      ctx.lineTo(end, coord);
    }
    ctx.stroke();

    if (tick.label !== undefined) {
      ctx.fillStyle = inkMajor;
      const text = tick.pos === 0 ? `0 ${unitSuffix}` : tick.label;
      if (isHorizontal) {
        ctx.textAlign = tick.pos === 0 ? 'left' : 'center';
        const labelX = tick.pos === 0 ? coord + 3 : coord;
        const labelY = fromZeroEdge ? Math.min(thicknessPx - 9, tickLen + 8) : Math.max(9, end - 8);
        ctx.fillText(text, labelX, labelY);
      } else {
        ctx.save();
        const labelX = fromZeroEdge ? Math.min(thicknessPx - 10, tickLen + 8) : Math.max(10, end - 8);
        const labelY = tick.pos === 0 ? coord + 4 : coord;
        ctx.translate(labelX, labelY);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = tick.pos === 0 ? 'right' : 'center';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    } else if (showFractionHalves && tick.level === 1 && isHorizontal) {
      ctx.save();
      ctx.fillStyle = inkSubtle;
      ctx.font = '600 9px "SF Mono", ui-monospace, SFMono-Regular, "Geist Mono Variable", "Geist Mono", monospace';
      ctx.textAlign = 'center';
      const labelY = fromZeroEdge ? tickLen + 6 : end - 6;
      ctx.fillText('½', coord, labelY);
      ctx.restore();
    }
  }
}
