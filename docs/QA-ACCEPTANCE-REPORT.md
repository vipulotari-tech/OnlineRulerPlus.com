# QA Acceptance Report — OnlineRulerPlus.com (P0 + P1 Verification)

**Verification Date:** Executed cleanly against final edited source & production `dist/` build.

---

## 1. Automated Verification Summary

| Suite / Command | Scope | Passed | Failed | Skipped |
|:---|:---|---:|---:|---:|
| `npm run build` | Static production bundle (`dist/`, 156 localized HTML routes + sitemap) | Exit `0` | `0` | `0` |
| `npm test` (`node --test tests/*.test.mjs`) | Unit math (`units`, `ticks`, `calibration`, `devices`, `storage`, `photo-measure`), 12-locale schema & placeholder parity, built HTML & smoke checks | **22** | **0** | **0** |
| `npx playwright test --project=chrome` | Full E2E (`audit-regressions`, `p1-features`, `qa-comprehensive`, `ruler`, `i18n`, `favicon`) in Chromium + Axe WCAG 2.1 AA | **32** | **0** | **0** |
| `npx playwright test tests/e2e/p1-features.spec.ts tests/e2e/audit-regressions.spec.ts --project=edge` | Cross-browser P0 invariants & P1 features in Microsoft Edge | **11** | **0** | **0** |

---

## 2. Criterion-by-Criterion Acceptance Verification

| Criterion | Status | Evidence & Test Coverage |
|:---|:---|:---|
| Mobile first-screen ruler visible (`y < 280px`, `>= 220px` stage, `0` horizontal overflow at `375×667` and `320×568`) | **PASS** | [audit-regressions.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/audit-regressions.spec.ts) (`P0 invariants`) & (`BUG-04 & BUG-05`) |
| Focus Mode toggle hides hero without losing ruler state and persists across reload | **PASS** | [audit-regressions.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/audit-regressions.spec.ts) (`#btn-focus-mode` + reload) |
| Live edge cursor canvas projection updates on `pointermove` and clears cleanly on `pointerleave` | **PASS** | [audit-regressions.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/audit-regressions.spec.ts) (Canvas pixel readback: `>= 40` blue cursor pixels on move -> `0` on leave) |
| Localized `ΔY` guide span (zero hardcoded `'ΔY guide span'` on `/es`) + non-intrusive locale banner without forced `/` redirect | **PASS** | [audit-regressions.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/audit-regressions.spec.ts), [i18n.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/i18n.spec.ts), `tests/i18n.test.mjs` |
| Pinch-zoom warning (`visualViewport.scale`) & honest uncalibrated touchscreen label + fractional DPR tolerance | **PASS** | [audit-regressions.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/audit-regressions.spec.ts), [measurement-engine.test.mjs](file:///C:/OnlineRulerPlus.com/tests/measurement-engine.test.mjs) |
| Direct card corner-drag resize + `2×/3× Cards`, `A4`, `US Letter`, `Quarter Coin`, `CD/DVD`, `Custom` calibration & reload persistence | **PASS** | [p1-features.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/p1-features.spec.ts) (`P1.1`), [calibration.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/calibration.ts) |
| Dual `cm+px`, `in+px`, `1/8`, `1/16`, `1/32` inch divisor ticks, & guide bounding-box (`ΔX`, `ΔY`, `Diag`) | **PASS** | [p1-features.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/p1-features.spec.ts) (`P1.3`), [measurement-engine.test.mjs](file:///C:/OnlineRulerPlus.com/tests/measurement-engine.test.mjs) |
| Client-side Photo & Clipboard (`Ctrl+V`) load, 2-point scale calibration, Line & `ΔX / ΔY` measurement, & Annotated PNG export with `0` outbound uploads | **PASS** | [p1-features.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/p1-features.spec.ts) (`P1.2`) + [p1-photo-measure-desktop.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/p1-photo-measure-desktop.png) |
| Accessibility (Axe WCAG 2.1 AA across routes, dark/light themes, help modal focus trap, & open Photo Mode) | **PASS** | [qa-comprehensive.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/qa-comprehensive.spec.ts) + [p1-features.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/p1-features.spec.ts) (`0` violations) |
| All existing regression, responsive (`320px–1920px`), protractor, floating ruler, touch drag, and favicon tests remain green | **PASS** | Full `chrome` (`32/32`) & `edge` (`11/11`) E2E runs with zero failures or skipped specs |
