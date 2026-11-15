import { MM_PER_INCH } from './units.ts';

export type PrintSheetTemplate =
  | 'ruler-15cm'
  | 'ruler-25cm'
  | 'ruler-30cm-split'
  | 'ruler-12in-split'
  | 'grid-1cm'
  | 'protractor-360';

export type PaperFormat = 'a4' | 'letter';

export const PAPER_DIMENSIONS_MM: Readonly<Record<PaperFormat, { readonly widthMm: number; readonly heightMm: number; readonly label: string }>> = {
  a4: { widthMm: 210, heightMm: 297, label: 'A4 (210 × 297 mm)' },
  letter: { widthMm: 215.9, heightMm: 279.4, label: 'US Letter (215.9 × 279.4 mm)' },
};

export interface PrintSheetSpec {
  readonly template: PrintSheetTemplate;
  readonly paper: PaperFormat;
  readonly orientation: 'portrait' | 'landscape';
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMetricStripSvg(
  xMm: number,
  yMm: number,
  startCm: number,
  endCm: number,
  stripHeightMm = 28,
): string {
  const spanCm = endCm - startCm;
  const padX = 5;
  const bodyW = spanCm * 10 + padX * 2;
  const parts: string[] = [];

  parts.push(
    `<rect x="${xMm}" y="${yMm}" width="${bodyW}" height="${stripHeightMm}" rx="2" fill="#ffffff" stroke="#1d1d1f" stroke-width="0.4" />`,
  );

  const totalMm = spanCm * 10;
  for (let mm = 0; mm <= totalMm; mm += 1) {
    const absMm = startCm * 10 + mm;
    const x = xMm + padX + mm;
    const isCm = absMm % 10 === 0;
    const isHalf = absMm % 5 === 0;
    const tickH = isCm ? 9 : isHalf ? 6.2 : 3.6;
    const strokeW = isCm ? 0.38 : isHalf ? 0.28 : 0.2;
    parts.push(
      `<line x1="${x.toFixed(2)}" y1="${yMm}" x2="${x.toFixed(2)}" y2="${(yMm + tickH).toFixed(2)}" stroke="#1d1d1f" stroke-width="${strokeW}" />`,
    );
    if (isCm) {
      parts.push(
        `<text x="${x.toFixed(2)}" y="${(yMm + 13.5).toFixed(2)}" text-anchor="middle" font-family="monospace" font-size="3.6" font-weight="600" fill="#1d1d1f">${absMm / 10}</text>`,
      );
    }
  }

  parts.push(
    `<text x="${(xMm + bodyW - 4).toFixed(2)}" y="${(yMm + stripHeightMm - 4).toFixed(2)}" text-anchor="end" font-family="monospace" font-size="3" fill="#5f5f63">cm (${startCm}–${endCm} cm · 1:1 mm)</text>`,
  );

  return parts.join('\n');
}

function renderImperialStripSvg(
  xMm: number,
  yMm: number,
  startIn: number,
  endIn: number,
  stripHeightMm = 28,
): string {
  const spanIn = endIn - startIn;
  const padX = 5;
  const bodyW = spanIn * MM_PER_INCH + padX * 2;
  const parts: string[] = [];

  parts.push(
    `<rect x="${xMm}" y="${yMm}" width="${bodyW.toFixed(2)}" height="${stripHeightMm}" rx="2" fill="#ffffff" stroke="#1d1d1f" stroke-width="0.4" />`,
  );

  const totalSixteenths = spanIn * 16;
  for (let i = 0; i <= totalSixteenths; i += 1) {
    const abs16 = startIn * 16 + i;
    const x = xMm + padX + (i / 16) * MM_PER_INCH;
    const isInch = abs16 % 16 === 0;
    const isHalf = abs16 % 8 === 0;
    const isQuarter = abs16 % 4 === 0;
    const isEighth = abs16 % 2 === 0;
    const tickH = isInch ? 10 : isHalf ? 7.5 : isQuarter ? 5.8 : isEighth ? 4.4 : 3.0;
    const strokeW = isInch ? 0.4 : isQuarter ? 0.28 : 0.2;
    parts.push(
      `<line x1="${x.toFixed(2)}" y1="${yMm}" x2="${x.toFixed(2)}" y2="${(yMm + tickH).toFixed(2)}" stroke="#1d1d1f" stroke-width="${strokeW}" />`,
    );
    if (isInch) {
      parts.push(
        `<text x="${x.toFixed(2)}" y="${(yMm + 14.5).toFixed(2)}" text-anchor="middle" font-family="monospace" font-size="3.6" font-weight="600" fill="#1d1d1f">${abs16 / 16}</text>`,
      );
    }
  }

  parts.push(
    `<text x="${(xMm + bodyW - 4).toFixed(2)}" y="${(yMm + stripHeightMm - 4).toFixed(2)}" text-anchor="end" font-family="monospace" font-size="3" fill="#5f5f63">in (${startIn}–${endIn}" · 1/16 in)</text>`,
  );

  return parts.join('\n');
}

function renderCalibrationCheckBar(xMm: number, yMm: number): string {
  const parts: string[] = [];
  parts.push(
    `<rect x="${xMm}" y="${yMm}" width="180" height="24" rx="2" fill="#f5f5f7" stroke="#5f5f63" stroke-width="0.3" />`,
  );
  parts.push(
    `<text x="${xMm + 4}" y="${yMm + 5.5}" font-family="sans-serif" font-size="3.1" font-weight="700" fill="#1d1d1f">PRINT SCALE CHECK BAR — Print at "100% / Actual Size" (disable Fit-to-Page)</text>`,
  );

  // 100.0 mm bar
  const barY = yMm + 10.5;
  parts.push(`<line x1="${xMm + 4}" y1="${barY}" x2="${xMm + 104}" y2="${barY}" stroke="#0066cc" stroke-width="0.6" />`);
  parts.push(`<line x1="${xMm + 4}" y1="${barY - 2}" x2="${xMm + 4}" y2="${barY + 2}" stroke="#0066cc" stroke-width="0.5" />`);
  parts.push(`<line x1="${xMm + 104}" y1="${barY - 2}" x2="${xMm + 104}" y2="${barY + 2}" stroke="#0066cc" stroke-width="0.5" />`);
  parts.push(
    `<text x="${xMm + 107}" y="${barY + 1}" font-family="monospace" font-size="3" font-weight="600" fill="#0066cc">100.0 mm (10.0 cm)</text>`,
  );

  // 4.00 in bar (101.60 mm)
  const inY = yMm + 18.5;
  const fourInMm = 4 * MM_PER_INCH; // 101.6
  parts.push(`<line x1="${xMm + 4}" y1="${inY}" x2="${(xMm + 4 + fourInMm).toFixed(2)}" y2="${inY}" stroke="#1d1d1f" stroke-width="0.6" />`);
  parts.push(`<line x1="${xMm + 4}" y1="${inY - 2}" x2="${xMm + 4}" y2="${inY + 2}" stroke="#1d1d1f" stroke-width="0.5" />`);
  parts.push(`<line x1="${(xMm + 4 + fourInMm).toFixed(2)}" y1="${inY - 2}" x2="${(xMm + 4 + fourInMm).toFixed(2)}" y2="${inY + 2}" stroke="#1d1d1f" stroke-width="0.5" />`);
  parts.push(
    `<text x="${(xMm + 7 + fourInMm).toFixed(2)}" y="${inY + 1}" font-family="monospace" font-size="3" font-weight="600" fill="#1d1d1f">4.00 in (101.6 mm) · ID-1 Card: 85.6 mm</text>`,
  );

  return parts.join('\n');
}

function renderGridSheetSvg(xMm: number, yMm: number, widthMm: number, heightMm: number): string {
  const parts: string[] = [];
  const cols = Math.floor(widthMm / 10) * 10;
  const rows = Math.floor(heightMm / 10) * 10;
  parts.push(
    `<rect x="${xMm}" y="${yMm}" width="${cols}" height="${rows}" fill="#ffffff" stroke="#1d1d1f" stroke-width="0.4" />`,
  );
  for (let x = 0; x <= cols; x += 5) {
    const isCm = x % 10 === 0;
    parts.push(
      `<line x1="${xMm + x}" y1="${yMm}" x2="${xMm + x}" y2="${yMm + rows}" stroke="${isCm ? '#88888d' : '#d2d2d7'}" stroke-width="${isCm ? '0.28' : '0.15'}" />`,
    );
    if (isCm && x > 0 && x < cols) {
      parts.push(
        `<text x="${xMm + x}" y="${yMm + 4}" text-anchor="middle" font-family="monospace" font-size="2.6" fill="#5f5f63">${x / 10}</text>`,
      );
    }
  }
  for (let y = 0; y <= rows; y += 5) {
    const isCm = y % 10 === 0;
    parts.push(
      `<line x1="${xMm}" y1="${yMm + y}" x2="${xMm + cols}" y2="${yMm + y}" stroke="${isCm ? '#88888d' : '#d2d2d7'}" stroke-width="${isCm ? '0.28' : '0.15'}" />`,
    );
    if (isCm && y > 0 && y < rows) {
      parts.push(
        `<text x="${xMm + 2}" y="${yMm + y - 1}" font-family="monospace" font-size="2.6" fill="#5f5f63">${y / 10} cm</text>`,
      );
    }
  }
  return parts.join('\n');
}

function renderPrintableProtractorSvg(cxMm: number, cyMm: number, rMm = 68): string {
  const parts: string[] = [];
  parts.push(
    `<circle cx="${cxMm}" cy="${cyMm}" r="${rMm}" fill="#ffffff" stroke="#1d1d1f" stroke-width="0.45" />`,
  );
  parts.push(
    `<circle cx="${cxMm}" cy="${cyMm}" r="${rMm * 0.62}" fill="none" stroke="#d2d2d7" stroke-width="0.25" />`,
  );
  parts.push(
    `<line x1="${cxMm - rMm}" y1="${cyMm}" x2="${cxMm + rMm}" y2="${cyMm}" stroke="#1d1d1f" stroke-width="0.3" />`,
  );
  parts.push(
    `<line x1="${cxMm}" y1="${cyMm - rMm}" x2="${cxMm}" y2="${cyMm + rMm}" stroke="#1d1d1f" stroke-width="0.3" />`,
  );

  for (let d = 0; d < 360; d += 1) {
    const rad = (d * Math.PI) / 180;
    const isMajor = d % 10 === 0;
    const isFive = d % 5 === 0;
    const tickLen = isMajor ? 6.5 : isFive ? 4.2 : 2.2;
    const x1 = cxMm + Math.cos(rad) * rMm;
    const y1 = cyMm - Math.sin(rad) * rMm;
    const x2 = cxMm + Math.cos(rad) * (rMm - tickLen);
    const y2 = cyMm - Math.sin(rad) * (rMm - tickLen);
    parts.push(
      `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${isMajor ? '#1d1d1f' : '#5f5f63'}" stroke-width="${isMajor ? '0.35' : '0.18'}" />`,
    );
    if (d % 30 === 0) {
      const lx = cxMm + Math.cos(rad) * (rMm - 11.5);
      const ly = cyMm - Math.sin(rad) * (rMm - 11.5) + 1.1;
      parts.push(
        `<text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" font-family="monospace" font-size="3.4" font-weight="600" fill="#1d1d1f">${d}°</text>`,
      );
    }
  }
  return parts.join('\n');
}

/** Generate a standalone true-scale (1 SVG unit = 1 mm) vector SVG sheet for printing or download. */
export function buildPrintableRulerSvg(
  template: PrintSheetTemplate,
  paper: PaperFormat = 'a4',
): { readonly svg: string; readonly widthMm: number; readonly heightMm: number; readonly orientation: 'portrait' | 'landscape' } {
  const basePaper = PAPER_DIMENSIONS_MM[paper];
  const isLandscape = template === 'ruler-25cm';
  const pageW = isLandscape ? basePaper.heightMm : basePaper.widthMm;
  const pageH = isLandscape ? basePaper.widthMm : basePaper.heightMm;

  const marginX = 12;
  const headerY = 14;
  const titleMap: Readonly<Record<PrintSheetTemplate, string>> = {
    'ruler-15cm': 'OnlineRulerPlus.com — Printable 15 cm & 6 Inch True-Scale Ruler',
    'ruler-25cm': 'OnlineRulerPlus.com — Printable 25 cm Full-Length Metric Ruler',
    'ruler-30cm-split': 'OnlineRulerPlus.com — Printable 30 cm Interlocking Two-Part Ruler (0–15 cm / 15–30 cm)',
    'ruler-12in-split': 'OnlineRulerPlus.com — Printable 12 Inch Interlocking Two-Part Ruler (0–6" / 6–12")',
    'grid-1cm': 'OnlineRulerPlus.com — Printable 1 cm / 5 mm True-Scale Precision Grid',
    'protractor-360': 'OnlineRulerPlus.com — Printable 360° Vector Protractor & Angle Finder',
  };

  const body: string[] = [];
  body.push(
    `<text x="${marginX}" y="${headerY}" font-family="sans-serif" font-size="4.4" font-weight="700" fill="#1d1d1f">${escapeXml(titleMap[template])}</text>`,
  );
  body.push(
    `<text x="${marginX}" y="${headerY + 5}" font-family="monospace" font-size="3" fill="#5f5f63">Paper: ${escapeXml(basePaper.label)} · Scale: 1.000:1 mm</text>`,
  );

  body.push(renderCalibrationCheckBar(marginX, headerY + 9));

  const contentTop = headerY + 39;

  switch (template) {
    case 'ruler-15cm':
      body.push(renderMetricStripSvg(marginX, contentTop, 0, 15, 30));
      body.push(renderImperialStripSvg(marginX, contentTop + 38, 0, 6, 30));
      body.push(renderMetricStripSvg(marginX, contentTop + 76, 0, 15, 30));
      break;
    case 'ruler-25cm':
      body.push(renderMetricStripSvg(marginX, contentTop, 0, 25, 32));
      body.push(renderImperialStripSvg(marginX, contentTop + 40, 0, 9, 32));
      break;
    case 'ruler-30cm-split':
      body.push(renderMetricStripSvg(marginX, contentTop, 0, 15, 30));
      body.push(renderMetricStripSvg(marginX, contentTop + 38, 15, 30, 30));
      break;
    case 'ruler-12in-split':
      body.push(renderImperialStripSvg(marginX, contentTop, 0, 6, 30));
      body.push(renderImperialStripSvg(marginX, contentTop + 38, 6, 12, 30));
      break;
    case 'grid-1cm':
      body.push(renderGridSheetSvg(marginX, contentTop, pageW - marginX * 2, pageH - contentTop - 16));
      break;
    case 'protractor-360':
      body.push(renderPrintableProtractorSvg(pageW / 2, contentTop + 75, 68));
      body.push(renderMetricStripSvg(marginX, contentTop + 156, 0, 15, 24));
      break;
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageW}mm" height="${pageH}mm" viewBox="0 0 ${pageW} ${pageH}" role="img" aria-label="${escapeXml(titleMap[template])}">`,
    `<rect x="0" y="0" width="${pageW}" height="${pageH}" fill="#ffffff" />`,
    ...body,
    `</svg>`,
  ].join('\n');

  return {
    svg,
    widthMm: pageW,
    heightMm: pageH,
    orientation: isLandscape ? 'landscape' : 'portrait',
  };
}
