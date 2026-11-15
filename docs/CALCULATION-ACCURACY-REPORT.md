# Calculation Accuracy & Metrology Verification Report — OnlineRulerPlus.com

**Engine Audited:** `src/lib/ruler/units.ts`, `src/lib/ruler/ticks.ts`, `src/lib/ruler/calibration.ts`, `src/lib/ruler/protractor.ts`, `src/lib/ruler/display.ts`, `src/lib/ruler/resolve.ts`, `src/lib/ruler/devices.ts`, `src/lib/ruler/storage.ts`  
**Verification Method:** Independent mathematical oracle checks (`node` test script) + `tests/measurement-engine.test.mjs` (`16` unit & boundary tests)

---

## 1. Metric & Imperial Conversion Constants (`units.ts`)

| Constant / Formula | Audited Implementation | Independent Standard | Status |
|:---|:---|:---|:---|
| Inch to Millimeter | `MM_PER_INCH = 25.4` | Exact international inch (`25.4 mm`) | **VERIFIED** |
| Centimeter to Millimeter | `MM_PER_CM = 10` | Exact SI prefix (`10 mm`) | **VERIFIED** |
| Uncalibrated CSS Reference | `CSS_PX_PER_INCH = 96` (`3.779527559... px/mm`) | W3C CSS Values & Units (`1in = 96px`) | **VERIFIED** |
| Bidirectional Conversion (`unitToPx` / `pxToUnit`) | Tested across `0..500 cm` (`cm <-> mm <-> in <-> px`) | Exact linear proportionality (`|err| < 1e-10`) | **VERIFIED** |

---

## 2. Fractional Inches (`1/2`, `1/4`, `1/8`, `1/16`, `1/32`) & Rounding

- **`toFraction(value, denominator)` & `formatInchFraction(value, denominator)`:**
  - Verified independently across **all dyadic denominators `[2, 4, 8, 16, 32]`** from `0` to `3` inches in exact rational steps (`num / denom`): reconstructed value matches within `< 1e-12` and numerator/denominator pairs are strictly coprime (`gcd = 1`).
  - **Carry boundary check:** `toFraction(1.99, 32)` carries `64/32` cleanly to `{ negative: false, whole: 2, numerator: 0, denominator: 32 }` without emitting `"1 32/32"`.
  - **Negative zero & negative fraction check:** `toFraction(-0.001, 16)` suppresses `−0` and returns positive `0`; `formatInchFraction(-2.03125, 32)` emits `'−2 1/32 in'`.
- **Ruler Canvas Inch Tick Granularity (`ticks.ts`):**
  - `SCHEMES.in` explicitly specifies subdivisions `[2, 4, 8, 16]` with `MIN_TICK_GAP_PX = 3`.
  - Accordingly, canvas inch rulers render down to **`1/16"`** when `pxPerUnit('in') / 16 >= 3 px` (which includes standard `96 PPI` at `6 px` per `1/16"` tick) and adapt coarser (`1/8"`, `1/4"`, `1/2"`) at lower CSS densities. **`1/32"` tick marks are not drawn on the canvas ruler** (matching the `1/16"` specification documented across the UI, footer, and guides).
- **Decimal Rounding (`formatNumber` / `formatValue`):**
  - `UNIT_DECIMALS`: `{ cm: 2, mm: 1, in: 3, px: 0 }`.
  - Uses `value.toFixed(UNIT_DECIMALS[unit])` with `-0` guard (`Number(fixed) === 0 -> (0).toFixed(...)`).
  - Non-finite inputs (`NaN`, `Infinity`, `-Infinity`) safely return `'0'`.
  - *Note:* Standard JavaScript IEEE-754 binary floating-point representation applies to `Number.prototype.toFixed()` (e.g., `12.345.toFixed(2) -> "12.35"`, whereas `1.2345.toFixed(3) -> "1.234"` due to IEEE-754 representation of `1.2345`).

---

## 3. Zero Point, Tick Spacing & Label Alignment (`ticks.ts`, `canvas-renderer.ts`)

- **Zero Datum Inset:** Edge rulers offset `0` by `ORIGIN_INSET_PX = 16` CSS px in `canvas-renderer.ts`, matching the stage origin hairlines (`left-[16px]`, `top-[16px]`) inside `#ruler-stage` (`RulerWorkspace.astro`).
- **Cumulative Drift Check:** Verified across `3,000 CSS px` spans and multiple calibrated densities (`2.5`, `96/25.4`, `5.1234`, `8.75 px/mm`) for `cm`, `mm`, `in`, and `px`:
  - `ticks[0].pos === 0` and `ticks[0].label === '0'` for every unit/scale.
  - Every tick coordinate is computed directly from index multiplication (`tickIndex * (unitPx / step)` rather than incremental floating-point accumulation), keeping every labeled tick aligned within `< 1e-6 CSS px` of `Number(tick.label) * pxPerUnit(...)`.
- **Dual Scale Rendering (`canvas-renderer.ts`):** Primary scale draws along the inner reading edge (`thickness - 16px` / outer offset) and secondary scale (`in` when primary is metric, `cm` when primary is `in`/`px`) draws along the opposite strip edge when `#btn-dual-unit` is enabled.

---

## 4. Calibration Equations & Persistence (`calibration.ts`, `resolve.ts`, `display.ts`)

| Calibration Method | Formula Implemented | Validation Bounds | Independent Result | Status |
|:---|:---|:---|:---|:---|
| **ISO/IEC 7810 ID-1 Card (Landscape)** | `pxPerMm = cardWidthPx / 85.60`, `cardHeightPx = cardWidthPx * (53.98 / 85.60)`, `cornerR = 3.18 * pxPerMm` | `1..20 px/mm` (~`25.4..508 CSS PPI`); Slider/Input `120..900 px` (`35.6..267.1 PPI` landscape) | Exact ISO/IEC 7810 ID-1 aspect ratio (`0.6306074766...`) preserved to `< 1e-12` | **VERIFIED** |
| **ID-1 Card (Portrait Mobile Mode)** | `pxPerMm = cardShortPx / 53.98` | `1..20 px/mm` (`56.5..423.5 PPI` at `120..900 px` long edge) | Matches landscape `pxPerMm` identically (`< 1e-12`) | **VERIFIED** |
| **Screen Diagonal** | `cssPpi = hypot(screenWidth, screenHeight) / diagonalIn`, `pxPerMm = cssPpi / 25.4` | `3 <= diagonalIn <= 100`, `1..20 px/mm`, rejects non-numeric/scientific/unit-mismatch (`60cm`) inputs; accepts comma decimals (`"15,6"`) | Matches `Math.sqrt(W² + H²) / D / 25.4` to `< 1e-12` | **VERIFIED** |
| **Zoom Scaling Invariance** | `devicePxPerMm = pxPerMm * dpr`; on lookup: `cssPxPerMm = devicePxPerMm / currentDpr` | DPR `0.50` to `2.00` tested | Exact roundtrip invariance (`|err| < 1e-12`) preserving physical device-pixel pitch when `screen.width/height` identify the same panel | **VERIFIED** |
| **Protractor Angle Math** | `atan2(cy - py, px - cx) * 180 / Math.PI`, clamped `[0, 180]` below horizontal baseline | `0.0°..180.0°` | Exact at `0°`, `45°`, `90°`, `180°`; points below baseline clamp cleanly to `0°` (right) / `180°` (left) | **VERIFIED** |

---

## 5. Known Metrology Limitations (Hardware & OS Boundaries)

1. **Uncalibrated Default Limit:** Uncalibrated desktop displays without an exact hardware profile match fall back to W3C `96.0 CSS PPI` (or heuristic DPR estimate). As demonstrated in `devices.ts` tests, a physical `14"` or `15.6"` 1080p panel differs substantially from `96 CSS PPI` until manually calibrated.
2. **OS Display Scaling Ambiguity:** Browsers cannot query physical monitor width over HDMI/DisplayPort (`CalibrationSection.astro` explicitly warns users of this limitation). Manual card or diagonal calibration at 100% browser zoom remains required before trusting physical measurements.
