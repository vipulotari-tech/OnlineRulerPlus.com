# Fix Log & Root Cause Remediation — OnlineRulerPlus.com

Every fix below was implemented in source, reviewed by an independent `code-reviewer` subagent (`APPROVE`, 0 critical / 0 high findings), and re-verified across double production builds, unit tests, and Chrome + Edge Playwright suites.

---

### BUG-QA-01 — SSR Ruler Canvas & Stage Bounds (`CLS: 0.4571 -> 0.00073`)
- **Root Cause:** `#ruler-stage` and edge `<canvas>` elements initialized without SSR width/height/offset geometry, shifting layout downward/rightward when `WorkspaceController` mounted.
- **File Modified:** [RulerWorkspace.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerWorkspace.astro)
- **Fix:** Computed deterministic SSR initial edge flags (`initTop/Bottom/Left/Right`) and explicit inline styles (`48px` thickness, `calc(100% - ...)` stage and canvas bounds) matching client hydration defaults.
- **Verification:** `/` production preview CLS dropped to `0.00073`; `/cm-ruler` dropped to `0.00065`.

### BUG-QA-02 & BUG-QA-03 — Light & Dark Mode WCAG 2.1 AA Contrast Tokens
- **Root Cause:** Muted foreground tokens (`#7a7a7a`) and translucent link pills (`rgba(0,102,204,0.12)` light / `rgba(41,151,255,0.18)` dark) fell between `3.94:1` and `4.32:1` against card/surface backgrounds.
- **File Modified:** [global.css](file:///C:/OnlineRulerPlus.com/src/styles/global.css)
- **Fix:** Darkened light muted/link tokens (`--text-ink-muted-48: #5f5f63`, `--text-faint: #5f5f63`, `--accent-link: #005bb8`, `--accent-link-deep: #005bb8`, `--accent-link-soft: rgba(0, 102, 204, 0.09)`) and lightened dark link tokens (`--accent-link: #5eb2ff`, `--accent-link-on-dark: #5eb2ff`, `--accent-link-soft: rgba(41, 151, 255, 0.14)`).
- **Verification:** `axe-core` WCAG 2.0/2.1 A/AA reports `0` color-contrast violations across all 13 English + 3 localized routes in both themes.

### BUG-QA-04 — Accessible Label-in-Name Alignment (WCAG 2.1 A 2.5.3)
- **Root Cause:** `aria-label` strings on header utility controls and Help modal close button replaced rather than extended visible short text labels.
- **Files Modified:** [Header.astro](file:///C:/OnlineRulerPlus.com/src/components/Header.astro), [LanguageSelector.astro](file:///C:/OnlineRulerPlus.com/src/components/LanguageSelector.astro), [HelpModal.astro](file:///C:/OnlineRulerPlus.com/src/components/HelpModal.astro)
- **Fix:** Removed overriding `aria-label` strings and structured accessible text with visible label first (`<span class="sr-only sm:not-sr-only">`) plus visually hidden descriptor context (`<span class="sr-only"> — ...</span>`), marking decorative keycaps and mobile compact badges `aria-hidden="true"`.
- **Verification:** `axe-core` `label-content-name-mismatch` reports `0` violations across closed, Help Modal open, and Mobile Tray open states.

### BUG-QA-05 — Scrollable Region Focusability & Dead Utility Token
- **Root Cause:** Horizontal scrollable table wrappers lacked `tabindex="0"` and landmark labeling; two doc pages used undefined `bg-surface-primary` and redundant nested `overflow-x-auto`.
- **Files Modified:** [ContentSections.astro](file:///C:/OnlineRulerPlus.com/src/components/ContentSections.astro), [RulerSpokeContent.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerSpokeContent.astro), [calibration-guide.astro](file:///C:/OnlineRulerPlus.com/src/pages/[...lang]/calibration-guide.astro), [how-to-use.astro](file:///C:/OnlineRulerPlus.com/src/pages/[...lang]/how-to-use.astro)
- **Fix:** Added `role="region" tabindex="0" aria-labelledby="..."` on scrollable table regions, removed duplicate `overflow-x-auto`, and replaced `bg-surface-primary` with `bg-canvas`.
- **Verification:** `axe-core` `scrollable-region-focusable` passes with `0` violations across all routes.

### BUG-QA-06 — Touch Drag Isolation & 320px Floating Ruler Bounds Clamping
- **Root Cause:** Interactive stage overlays lacked `touch-action: none`, allowing mobile touch-drag gestures to trigger page panning; spawning multiple floating rulers on narrow screens lacked X/Y max-bound clamping.
- **Files Modified:** [workspace-overlays.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-overlays.ts), [workspace-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-controller.ts)
- **Fix:** Added Tailwind `touch-none` class to `.guide-line`, `.floating-ruler`, and `.protractor-widget canvas`, and clamped `addFloatingRuler` coordinates inside `#ruler-stage` dimensions.
- **Verification:** Playwright touch context verifies `getComputedStyle(guideLine).touchAction === 'none'` and 2nd floating ruler stays within `stage.right` at `320px`.

### BUG-QA-07 — Webfont Preload & Metric-Adjusted Fallbacks (`CLS: 0.1659 -> 0.00118`)
- **Root Cause:** `@fontsource-variable/inter` and `plus-jakarta-sans` swapped after initial layout with narrower Windows `Segoe UI` fallback, shifting hero text height by `-33.6px` on `/calibration-guide` (`0.1659`) and `/privacy` (`0.1485`).
- **Files Modified:** [BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro), [global.css](file:///C:/OnlineRulerPlus.com/src/styles/global.css)
- **Fix:** Added `<link rel="preload" as="font" type="font/woff2" crossorigin>` for both Latin variable fonts and added metric-adjusted `@font-face` `"Inter Fallback"` / `"Plus Jakarta Sans Fallback"` declarations (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`).
- **Verification:** Measured cold-context CLS across all 13 routes on `astro preview --port 4322`: max CLS dropped to `0.00543` (`/about`), `/calibration-guide` to `0.00118`, `/privacy` to `0.00272`.

### BUG-QA-08 — Ultra-Narrow 320px Header Utility Overflow (`scrollWidth: 309 -> <=305`)
- **Root Cause:** `Header.astro` placed `shrink-0` on the brand link plus `px-2.5` horizontal padding and `36px` mobile menu width, reaching `309px` on 320px viewports when Windows classic scrollbars leave `305px` client width.
- **File Modified:** [Header.astro](file:///C:/OnlineRulerPlus.com/src/components/Header.astro)
- **Fix:** Adjusted mobile horizontal padding (`px-2 sm:px-6`), compact mobile icon padding (`px-1.5 sm:px-2.5` on Help/Theme pills), mobile menu button width (`w-[30px] sm:w-[44px]`), and `min-w-0 shrink` + `truncate` fallback on the brand label.
- **Verification:** Zero horizontal document overflow in headed Chrome (`clientWidth = 305px`) and Edge at `320x568`.

### BUG-QA-09 — Localized Guide Axis Flex-Wrap Overflow (`/id` at `320px`)
- **Root Cause:** Guide Axis label and 3 chip buttons sat in `flex items-center gap-1` without wrapping, expanding to `285px` (`r = 314px > 305px`) for Bahasa Indonesia (`Sumbu Garis: Vertikal Horizontal Keduanya`).
- **File Modified:** [RulerWorkspace.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerWorkspace.astro)
- **Fix:** Added `flex-wrap` to the guide axis control group (`class="flex flex-wrap items-center gap-1"`).
- **Verification:** `tests/e2e/i18n.spec.ts` passes cleanly across all 12 locales at `320px` and desktop in Chrome and Edge.
