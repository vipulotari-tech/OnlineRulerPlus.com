import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  CIRCLE_PRESETS,
  CSS_PX_PER_INCH,
  CSS_REFERENCE_PX_PER_MM,
  DEFAULT_PREFERENCES,
  EMPTY_CALIBRATION_STORE,
  MM_PER_CM,
  MM_PER_INCH,
  REFERENCE_PRESETS,
  SCALE_PRESETS,
  STATUS_LABELS,
  appendHistoryRecord,
  calibrateScaleFromTwoPoints,
  cardHeightForWidth,
  cardWidthPx,
  clampCircleDiameterMm,
  classifyDisplayChange,
  computeCircleMetrics,
  computeQuadrantMetrics,
  createManualProfile,
  cssPpi,
  deleteNamedProfileFromStore,
  deltaStatsPx,
  detectCalibration,
  detectPlatform,
  displaySignature,
  distancePx,
  effectivePxPerMmForScale,
  findProfileForDisplay,
  fitContainRect,
  formatHistoryCsv,
  formatHistoryJson,
  formatInchFraction,
  formatPhotoLength,
  formatValue,
  fromDevicePxPerMm,
  generateTicks,
  getReferencePreset,
  interiorAngleDeg,
  isScalePresetId,
  normalizeFullAngleDeg,
  parseCalibrationStore,
  parseDiagonal,
  parseFloatingRulers,
  parseHistory,
  parsePreferences,
  photoPxToUnit,
  pointToFullAngle,
  pointToProtractorAngle,
  pxPerMmFromCardHeight,
  pxPerMmFromCardWidth,
  pxPerMmFromDiagonal,
  pxPerMmFromReference,
  pxPerUnit,
  pxToUnit,
  raySweepAngleDeg,
  removeProfileForDisplay,
  removeProfileFromStore,
  resolveCalibration,
  saveNamedProfileToStore,
  saveProfileToStore,
  scaleFactorForPreset,
  selectNamedProfileInStore,
  supplementaryAngleDeg,
  toDevicePxPerMm,
  toFraction,
  unitToPx,
} from '../src/lib/ruler/index.ts';
import { buildPrintableRulerSvg, PAPER_DIMENSIONS_MM } from '../src/lib/ruler/print-svg.ts';

test('Unit constants & conversions preserve physical invariants', () => {
  assert.strictEqual(MM_PER_INCH, 25.4);
  assert.strictEqual(MM_PER_CM, 10);
  assert.strictEqual(CSS_PX_PER_INCH, 96);

  const pxPerMm = 4.0; // 101.6 CSS PPI
  assert.strictEqual(pxPerUnit('mm', pxPerMm), 4);
  assert.strictEqual(pxPerUnit('cm', pxPerMm), 40);
  assert.strictEqual(pxPerUnit('in', pxPerMm), 101.6);
  assert.strictEqual(pxPerUnit('px', pxPerMm), 1);

  assert.strictEqual(unitToPx(10, 'cm', pxPerMm), 400);
  assert.strictEqual(pxToUnit(400, 'cm', pxPerMm), 10);
  assert.strictEqual(pxToUnit(400, 'mm', pxPerMm), 100);
  assert.ok(Math.abs(pxToUnit(101.6, 'in', pxPerMm) - 1) < 1e-9);
  assert.strictEqual(pxToUnit(250, 'px', pxPerMm), 250);
});

test('Fractional inch formatting reduces power-of-two fractions accurately', () => {
  assert.deepStrictEqual(toFraction(3.4375, 16), {
    negative: false,
    whole: 3,
    numerator: 7,
    denominator: 16,
  });
  assert.strictEqual(formatInchFraction(3.4375, 16), '3 7/16 in');
  assert.strictEqual(formatInchFraction(0.5, 16), '1/2 in');
  assert.strictEqual(formatInchFraction(2.0, 16), '2 in');
  assert.strictEqual(formatInchFraction(0.0625, 16), '1/16 in');
  assert.strictEqual(formatValue(12.345, 'cm'), '12.35 cm');
  assert.strictEqual(formatValue(-0.0001, 'cm'), '0.00 cm');
});

test('Tick generation produces exact coordinates and adapts subdivisions', () => {
  const pxPerMm = 4.0; // 40 px per cm, 4 px per mm (>= 3px min gap)
  const cmTicks = generateTicks(100, 'cm', pxPerMm);
  // 100px = 2.5 cm -> 25 mm ticks (indices 0..25 => 26 ticks)
  assert.strictEqual(cmTicks.length, 26);
  assert.strictEqual(cmTicks[0].pos, 0);
  assert.strictEqual(cmTicks[0].level, 0);
  assert.strictEqual(cmTicks[0].label, '0');
  assert.strictEqual(cmTicks[5].pos, 20);
  assert.strictEqual(cmTicks[5].level, 1); // 0.5 cm medium tick
  assert.strictEqual(cmTicks[10].pos, 40);
  assert.strictEqual(cmTicks[10].level, 0);
  assert.strictEqual(cmTicks[10].label, '1');

  // Inches at 4 px/mm = 101.6 px/in -> 1/16 in is 6.35 px (>= 3px), so 1/16 subdivisions are generated
  const inTicks = generateTicks(102, 'in', pxPerMm);
  assert.strictEqual(inTicks.length, 17); // 0 to 16/16
  assert.strictEqual(inTicks[8].level, 1); // 1/2 in
  assert.strictEqual(inTicks[4].level, 2); // 1/4 in
  assert.strictEqual(inTicks[2].level, 3); // 1/8 in
  assert.strictEqual(inTicks[1].level, 4); // 1/16 in

  // CSS pixels mode
  const pxTicks = generateTicks(200, 'px', pxPerMm);
  assert.strictEqual(pxTicks[0].label, '0');
  assert.strictEqual(pxTicks[5].pos, 50);
  assert.strictEqual(pxTicks[5].level, 1);
  assert.strictEqual(pxTicks[10].pos, 100);
  assert.strictEqual(pxTicks[10].label, '100');

  // Guard against non-finite values
  assert.deepStrictEqual(generateTicks(Infinity, 'cm', pxPerMm), []);
  assert.deepStrictEqual(generateTicks(100, 'cm', Infinity), []);
  assert.deepStrictEqual(generateTicks(NaN, 'cm', pxPerMm), []);
});

test('Diagonal calibration validates input and calculates exact CSS PPI', () => {
  assert.strictEqual(parseDiagonal('').ok, false);
  assert.strictEqual(parseDiagonal('-15').ok, false);
  assert.strictEqual(parseDiagonal('0').ok, false);
  assert.strictEqual(parseDiagonal('2').ok, false);
  assert.strictEqual(parseDiagonal('150').ok, false);

  const parsed = parseDiagonal('15.6"');
  assert.strictEqual(parsed.ok, true);
  if (parsed.ok) assert.strictEqual(parsed.value, 15.6);

  // 1920x1080 on a 24" screen -> diagonal px = 2202.907 -> CSS PPI = 91.7878
  const res = pxPerMmFromDiagonal(1920, 1080, 24);
  assert.strictEqual(res.ok, true);
  if (res.ok) {
    const expectedPpi = Math.hypot(1920, 1080) / 24;
    assert.ok(Math.abs(cssPpi(res.value) - expectedPpi) < 1e-6);
  }
});

test('Credit card calibration preserves ISO/IEC 7810 ID-1 aspect ratio and scaling', () => {
  assert.strictEqual(CARD_WIDTH_MM, 85.6);
  assert.strictEqual(CARD_HEIGHT_MM, 53.98);

  const widthPx = 342.4; // 4.0 px/mm
  const heightPx = cardHeightForWidth(widthPx);
  assert.ok(Math.abs(heightPx / widthPx - CARD_HEIGHT_MM / CARD_WIDTH_MM) < 1e-12);

  const res = pxPerMmFromCardWidth(widthPx);
  assert.strictEqual(res.ok, true);
  if (res.ok) {
    assert.ok(Math.abs(res.value - 4.0) < 1e-9);
    assert.ok(Math.abs(cardWidthPx(res.value) - widthPx) < 1e-9);
  }

  const shortRes = pxPerMmFromCardHeight(heightPx);
  assert.strictEqual(shortRes.ok, true);
  if (shortRes.ok) {
    assert.ok(Math.abs(shortRes.value - 4.0) < 1e-9);
  }

  assert.strictEqual(pxPerMmFromCardWidth(0).ok, false);
  assert.strictEqual(pxPerMmFromCardWidth(-100).ok, false);
  assert.strictEqual(pxPerMmFromCardWidth(10).ok, false); // Too small (< 1 px/mm)
  assert.strictEqual(pxPerMmFromCardWidth(5000).ok, false); // Too large (> 20 px/mm)
});

test('Auto-detect identifies known devices and falls back to honest estimates', () => {
  const mbp14 = {
    screenWidth: 1512,
    screenHeight: 982,
    dpr: 2,
    platform: 'mac',
    touch: false,
  };
  const detected = detectCalibration(mbp14);
  assert.strictEqual(detected.kind, 'detected');
  assert.match(detected.label, /MacBook Pro 14/);
  assert.strictEqual(detected.cssPpi, 127);

  const unknownDesktop = {
    screenWidth: 1920,
    screenHeight: 1080,
    dpr: 1,
    platform: 'windows',
    touch: false,
  };
  const estimated = detectCalibration(unknownDesktop);
  assert.strictEqual(estimated.kind, 'estimated');
  assert.ok(estimated.cssPpi > 80 && estimated.cssPpi < 110);
});

test('Display classification distinguishes orientation, zoom, and monitor changes', () => {
  const base = { screenWidth: 1920, screenHeight: 1080, dpr: 1, platform: 'windows', touch: false };
  const rotated = { ...base, screenWidth: 1080, screenHeight: 1920 };
  const zoomedChrome = { ...base, dpr: 1.25 };
  const zoomedFirefox = { ...base, screenWidth: 1536, screenHeight: 864, dpr: 1.25 };
  const otherMonitor = { ...base, screenWidth: 2560, screenHeight: 1440, dpr: 1 };

  assert.strictEqual(classifyDisplayChange(base, base), 'none');
  assert.strictEqual(classifyDisplayChange(base, rotated), 'orientation');
  assert.strictEqual(classifyDisplayChange(base, zoomedChrome), 'zoom');
  assert.strictEqual(classifyDisplayChange(base, zoomedFirefox), 'zoom');
  assert.strictEqual(classifyDisplayChange(base, otherMonitor), 'display');
  assert.strictEqual(displaySignature(base), displaySignature(rotated));
});

test('Calibration persistence stores per-display profiles and rescales across zoom', () => {
  const display = {
    screenWidth: 1920,
    screenHeight: 1080,
    dpr: 1,
    platform: 'windows',
    touch: false,
  };
  const profile = createManualProfile(display, 4.0, 'card', 'ID-1 Card', { cardWidthPx: 342.4 });
  const store = saveProfileToStore(EMPTY_CALIBRATION_STORE, profile);
  const raw = JSON.stringify(store);
  const loaded = parseCalibrationStore(raw);

  const active = resolveCalibration(loaded, display);
  assert.strictEqual(active.status, 'manual');
  assert.strictEqual(active.statusLabel, STATUS_LABELS.manual);
  assert.strictEqual(active.pxPerMm, 4.0);
  assert.strictEqual(active.rescaledForZoom, false);

  // Simulate 125% browser zoom on the same physical monitor: DPR becomes 1.25, CSS px/mm becomes 4.0 / 1.25 = 3.2
  const zoomed = { ...display, dpr: 1.25 };
  const activeZoomed = resolveCalibration(loaded, zoomed);
  assert.strictEqual(activeZoomed.status, 'manual');
  assert.strictEqual(activeZoomed.rescaledForZoom, true);
  assert.ok(Math.abs(activeZoomed.pxPerMm - 3.2) < 1e-9);
  assert.ok(Math.abs((activeZoomed.cardWidthPx ?? 0) - 85.6 * 3.2) < 1e-6);

  // Removing profile for zoomed display also removes underlying same-panel profile
  const clearedZoomed = removeProfileForDisplay(loaded, zoomed);
  assert.strictEqual(findProfileForDisplay(clearedZoomed, zoomed), null);
  assert.strictEqual(findProfileForDisplay(clearedZoomed, display), null);

  // Corrupt JSON falls back safely
  assert.deepStrictEqual(parseCalibrationStore('{not-json'), EMPTY_CALIBRATION_STORE);
  assert.deepStrictEqual(parsePreferences('{bad'), DEFAULT_PREFERENCES);
  assert.deepStrictEqual(parseHistory('{bad'), []);

  // Remove profile
  const cleared = removeProfileFromStore(loaded, profile.signature);
  assert.strictEqual(findProfileForDisplay(cleared, display), null);
});

test('Platform detection and history storage behave deterministically', () => {
  assert.strictEqual(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 5), 'ios');
  assert.strictEqual(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5), 'ipados');
  assert.strictEqual(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0), 'mac');
  assert.strictEqual(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0), 'windows');

  const h1 = appendHistoryRecord([], {
    id: 'm1',
    lengthMm: 45,
    lengthPx: 180,
    unit: 'cm',
    label: 'Guide span',
    createdAt: 1000,
  });
  assert.strictEqual(h1.length, 1);
  const parsed = parseHistory(JSON.stringify(h1));
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].lengthMm, 45);

  // Protractor angle math
  assert.strictEqual(pointToProtractorAngle(100, 100, 200, 100), 0);
  assert.strictEqual(pointToProtractorAngle(100, 100, 100, 0), 90);
  assert.strictEqual(pointToProtractorAngle(100, 100, 0, 100), 180);
  assert.strictEqual(pointToProtractorAngle(100, 100, 200, 0), 45);
});

test('Boundary invariants: 1/32 dyadic fractions, zero tick drift over 3000px, and zoom invariance 50%-200%', () => {
  // 1/2, 1/4, 1/8, 1/16, 1/32 fraction exactness, carry, and Unicode minus for negatives
  for (const denom of [2, 4, 8, 16, 32]) {
    for (let n = 0; n <= denom * 2; n++) {
      const val = n / denom;
      const f = toFraction(val, denom);
      const recon = (f.negative ? -1 : 1) * (f.whole + f.numerator / f.denominator);
      assert.ok(Math.abs(recon - val) < 1e-12);
    }
  }
  assert.deepStrictEqual(toFraction(1.99, 32), { negative: false, whole: 2, numerator: 0, denominator: 32 });
  assert.strictEqual(formatInchFraction(-2.03125, 32), '−2 1/32 in');

  // Tick non-drift invariant over 3000 CSS px
  for (const pxPerMm of [2.5, 96 / 25.4, 5.1234, 8.75]) {
    for (const unit of ['cm', 'mm', 'in', 'px']) {
      const ticks = generateTicks(3000, unit, pxPerMm);
      assert.strictEqual(ticks[0].pos, 0);
      assert.strictEqual(ticks[0].label, '0');
      const unitPx = pxPerUnit(unit, pxPerMm);
      for (const tick of ticks) {
        if (tick.label !== undefined) {
          assert.ok(Math.abs(tick.pos - Number(tick.label) * unitPx) < 1e-6);
        }
      }
    }
  }

  // Diagonal parser edge cases
  assert.strictEqual(parseDiagonal('15,6').ok, true);
  assert.strictEqual(parseDiagonal('27"').ok, true);
  assert.strictEqual(parseDiagonal('1e5').ok, false);
  assert.strictEqual(parseDiagonal('NaN').ok, false);
  assert.strictEqual(parseDiagonal('60cm').ok, false);
  assert.strictEqual(parseDiagonal('1,234').ok, false);

  // Device pixel ratio invariance across 50%..200% zoom levels
  const basePxPerMm = 96 / 25.4;
  for (const dpr of [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 2]) {
    const dev = toDevicePxPerMm(basePxPerMm, dpr);
    const back = fromDevicePxPerMm(dev, dpr);
    assert.ok(Math.abs(back - basePxPerMm) < 1e-12);
  }

  // Below-baseline protractor pointer clamping
  assert.strictEqual(pointToProtractorAngle(100, 100, 200, 150), 0);
  assert.strictEqual(pointToProtractorAngle(100, 100, 0, 150), 180);

  // P0.4 Touchscreen fallback labeling & fractional scaling tolerance
  const genericTouch = {
    screenWidth: 412,
    screenHeight: 915,
    dpr: 2.625,
    platform: 'other',
    touch: true,
    visualViewportScale: 1,
  };
  const touchAuto = detectCalibration(genericTouch);
  assert.strictEqual(touchAuto.kind, 'estimated');
  assert.strictEqual(touchAuto.label, 'Touchscreen device (uncalibrated)');

  // Firefox fractional zoom rounding (1920x1080 @ 1 -> 1444x812 @ 1.33, devW = 1921)
  const baseMonitor = { screenWidth: 1920, screenHeight: 1080, dpr: 1, platform: 'windows', touch: false };
  const firefoxFracZoom = { screenWidth: 1444, screenHeight: 812, dpr: 1.33, platform: 'windows', touch: false };
  assert.strictEqual(classifyDisplayChange(baseMonitor, firefoxFracZoom), 'zoom');
  const storedStore = saveProfileToStore(
    EMPTY_CALIBRATION_STORE,
    createManualProfile(baseMonitor, 4.0, 'card', 'ID-1 Card'),
  );
  const rescaledFrac = findProfileForDisplay(storedStore, firefoxFracZoom);
  assert.ok(rescaledFrac !== null && rescaledFrac.rescaledForZoom === true);

  // focusMode preference parsing
  assert.strictEqual(parsePreferences('{"unit":"cm","focusMode":true}').focusMode, true);
  assert.strictEqual(parsePreferences('{"unit":"cm","focusMode":"yes"}').focusMode, false);
});

test('P1 reference calibration presets, inch divisors (1/8-1/32), and client-side photo math', () => {
  // Reference presets (A4, US Letter, 2x/3x Cards, Coins)
  assert.ok(REFERENCE_PRESETS.length >= 9);
  const a4 = getReferencePreset('a4-width');
  assert.strictEqual(a4.widthMm, 210);
  const a4Cal = pxPerMmFromReference(840, a4.widthMm);
  assert.strictEqual(a4Cal.ok, true);
  assert.strictEqual(a4Cal.value, 4);

  const card3x = getReferencePreset('card-3x');
  assert.strictEqual(card3x.widthMm, 256.8);
  const qtr = getReferencePreset('us-quarter');
  assert.strictEqual(qtr.widthMm, 24.26);
  assert.strictEqual(pxPerMmFromReference(0, 100).ok, false);
  assert.strictEqual(pxPerMmFromReference(100, -5).ok, false);

  // Inch divisors 1/8, 1/16, 1/32 at high density (6 px/mm -> 152.4 px/in)
  const ticks8 = generateTicks(153, 'in', 6, undefined, { inchDivisor: 8 });
  const ticks16 = generateTicks(153, 'in', 6, undefined, { inchDivisor: 16 });
  const ticks32 = generateTicks(153, 'in', 6, undefined, { inchDivisor: 32 });
  assert.strictEqual(ticks8.length, 9);
  assert.strictEqual(ticks16.length, 17);
  assert.strictEqual(ticks32.length, 33);

  // Preferences dualPair & inchDivisor round-trip
  const prefParsed = parsePreferences('{"unit":"in","dualUnit":true,"dualPair":"px","inchDivisor":32}');
  assert.strictEqual(prefParsed.dualPair, 'px');
  assert.strictEqual(prefParsed.inchDivisor, 32);

  // Client-side photo calibration & measurements
  const pA = { x: 100, y: 200 };
  const pB = { x: 500, y: 200 };
  assert.strictEqual(distancePx(pA, pB), 400);
  const cal = calibrateScaleFromTwoPoints(pA, pB, 10, 'cm');
  assert.strictEqual(cal.ok, true);
  assert.ok(cal.value && Math.abs(cal.value.pxPerMm - 4) < 1e-9); // 400 px / 100 mm = 4 px/mm

  const measuredPx = distancePx({ x: 10, y: 10 }, { x: 10, y: 210 });
  assert.strictEqual(photoPxToUnit(measuredPx, 'cm', cal.value), 5);
  assert.ok(formatPhotoLength(measuredPx, 'cm', cal.value).includes('5.00 cm'));

  const stats = deltaStatsPx({ x: 50, y: 60 }, { x: 250, y: 210 });
  assert.strictEqual(stats.dxPx, 200);
  assert.strictEqual(stats.dyPx, 150);
  assert.strictEqual(stats.diagPx, 250);

  // Rejection on degenerate points / <=0 length
  assert.strictEqual(calibrateScaleFromTwoPoints({ x: 5, y: 5 }, { x: 5.5, y: 5.5 }, 10, 'mm').ok, false);
  assert.strictEqual(calibrateScaleFromTwoPoints(pA, pB, 0, 'cm').ok, false);

  const fit = fitContainRect(2000, 1000, 800, 500, 20);
  assert.ok(fit.scale > 0 && fit.drawW <= 760 && fit.drawH <= 460);
});

test('P2 protractor 360°/dual-ray math, named monitor profiles, floating angles, history CSV/JSON & printable SVG', () => {
  // 360-degree & dual-ray protractor math
  assert.strictEqual(normalizeFullAngleDeg(-45), 315);
  assert.strictEqual(normalizeFullAngleDeg(405), 45);
  assert.strictEqual(pointToFullAngle(100, 100, 200, 100), 0);
  assert.strictEqual(pointToFullAngle(100, 100, 100, 0), 90);
  assert.strictEqual(pointToFullAngle(100, 100, 100, 200), 270);
  assert.strictEqual(raySweepAngleDeg(30, 120), 90);
  assert.strictEqual(raySweepAngleDeg(350, 20), 30);
  assert.strictEqual(interiorAngleDeg(350, 20), 30);
  assert.strictEqual(interiorAngleDeg(20, 350), 30);
  assert.strictEqual(supplementaryAngleDeg(45), 135);

  // Named dual-monitor profiles (same resolution, distinguished by customName)
  const mon = { screenWidth: 1920, screenHeight: 1080, dpr: 1, platform: 'windows', touch: false };

  let store = saveNamedProfileToStore(EMPTY_CALIBRATION_STORE, mon, 3.6, 'Office 27', 'card', 'office-27');
  store = saveNamedProfileToStore(store, mon, 4.2, 'Home 24', 'diagonal', 'home-24');
  assert.strictEqual(store.namedProfiles?.length, 2);
  assert.strictEqual(resolveCalibration(store, mon).pxPerMm, 4.2);

  store = selectNamedProfileInStore(store, 'office-27', mon);
  assert.strictEqual(resolveCalibration(store, mon).pxPerMm, 3.6);

  store = deleteNamedProfileFromStore(store, 'home-24');
  assert.strictEqual(store.namedProfiles?.length, 1);

  // Floating ruler persistence with arbitrary angleDeg
  const parsedFloating = parseFloatingRulers(
    JSON.stringify([
      { id: 'fr-1', x: 40, y: 80, lengthPx: 320, orientation: 'horizontal', angleDeg: 30 },
      { id: 'bad', x: 'nope' },
    ]),
  );
  assert.strictEqual(parsedFloating.length, 1);
  assert.strictEqual(parsedFloating[0].angleDeg, 30);

  // History CSV / JSON exports with CSV injection-safe escaping
  const records = appendHistoryRecord([], {
    id: 'rec-1',
    lengthMm: 85.6,
    lengthPx: 323.5,
    unit: 'cm',
    label: 'ID-1 "Credit" Card',
    createdAt: 1700000000000,
  });
  const ctx = { status: 'manual', label: 'ID-1 Card', pxPerMm: 3.779527559 };
  const csv = formatHistoryCsv(records, ctx);
  assert.ok(csv.includes('"ID-1 ""Credit"" Card"'));
  assert.ok(csv.includes('8.56'));
  const jsonText = formatHistoryJson(records, ctx);
  const parsedJson = JSON.parse(jsonText);
  assert.strictEqual(parsedJson.calibration.status, 'manual');
  assert.strictEqual(parsedJson.measurements[0].id, 'rec-1');
  assert.strictEqual(parsedJson.measurements[0].mm, 85.6);

  // Printable vector SVG sheets & mandatory 100mm / 4in check bar
  assert.strictEqual(PAPER_DIMENSIONS_MM.a4.widthMm, 210);
  assert.strictEqual(PAPER_DIMENSIONS_MM.letter.heightMm, 279.4);
  const sheet15 = buildPrintableRulerSvg('ruler-15cm', 'a4');
  assert.ok(sheet15.svg.includes('width="210mm"') && sheet15.svg.includes('height="297mm"'));
  assert.ok(sheet15.svg.includes('100.0 mm') && sheet15.svg.includes('4.00 in'));
  const sheet360 = buildPrintableRulerSvg('protractor-360', 'letter');
  assert.ok(sheet360.svg.includes('viewBox="0 0 215.9 279.4"'));
  assert.ok(sheet360.svg.includes('330°'));
});

test('P3 architectural scales, circle/ring/bolt gauge metrics, and 4-quadrant vector geometry', () => {
  assert.strictEqual(SCALE_PRESETS.length, 6);
  assert.strictEqual(isScalePresetId('1:50'), true);
  assert.strictEqual(isScalePresetId('1:999'), false);
  assert.strictEqual(scaleFactorForPreset('1:48'), 48);

  // At 1:50 scale and base 4 px/mm: 40 CSS px (=10mm on screen) equals 500 mm (50 cm) in blueprint reality
  const eff = effectivePxPerMmForScale(4.0, 50);
  assert.strictEqual(pxToUnit(40, 'cm', eff), 50);
  // px unit remains unscaled (40px = 40px)
  assert.strictEqual(pxToUnit(40, 'px', eff), 40);

  // Preferences round-trip with scalePreset
  assert.strictEqual(parsePreferences('{"unit":"cm","scalePreset":"1:50"}').scalePreset, '1:50');
  assert.strictEqual(parsePreferences('{"unit":"cm","scalePreset":"1:999"}').scalePreset, undefined);

  // Circle gauge clamping & ring sizes
  assert.ok(CIRCLE_PRESETS.length >= 12);
  assert.strictEqual(clampCircleDiameterMm(0.2), 1);
  assert.strictEqual(clampCircleDiameterMm(999), 150);
  const ring7 = computeCircleMetrics(17.35);
  assert.strictEqual(ring7.nearestUsRing, 'US 7');
  assert.strictEqual(ring7.nearestEuRing, Math.round(Math.PI * 17.35));
  assert.ok(Math.abs(computeCircleMetrics(10).areaMm2 - Math.PI * 25) < 1e-6);

  // 4-quadrant vector & polar readout
  const q2 = computeQuadrantMetrics(-3, 4);
  assert.strictEqual(q2.rUnit, 5);
  assert.strictEqual(q2.quadrantLabel, 'II (−, +)');
  assert.ok(q2.angleDeg > 126 && q2.angleDeg < 127);

  const q4 = computeQuadrantMetrics(3, -3);
  assert.strictEqual(q4.quadrantLabel, 'IV (+, −)');
  assert.strictEqual(Math.round(q4.angleDeg), 315);
  assert.strictEqual(computeQuadrantMetrics(0, 0).quadrantLabel, 'Origin');
});
