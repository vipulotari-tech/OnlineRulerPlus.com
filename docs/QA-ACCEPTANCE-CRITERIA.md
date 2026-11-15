# OnlineRulerPlus.com — Pre-Launch QA Acceptance Criteria

**Date:** 2026-11-15  
**Role:** Objective Release Gate for every P0–P2 change defined in [PRELAUNCH-DEVELOPMENT-ROADMAP.md](file:///C:/OnlineRulerPlus.com/docs/PRELAUNCH-DEVELOPMENT-ROADMAP.md).  
**Rule:** Zero features may ship with skipped assertions, mocked metrology math, or unverified mobile viewports.

---

## 1. Automated Unit & Build Gate (`npm test` & `npm run build`)

1. **Zero-Regression Build:** `npm run build` exits `0`, builds all localized static pages without broken `hreflang`, duplicate `<link rel="icon">`, or missing JSON-LD schemas.
2. **Metrology Math Invariants (`tests/*.test.mjs`):**
   - `MM_PER_INCH === 25.4`; zero tick drift (`< 1e-6 px` across `0–3,000 px`).
   - Reference calibration `pxPerMmFromReference(px, refMm)` accurately converts `ID-1 Card (85.6mm)`, `2× Card (171.2mm)`, `CD (120mm)`, `A4 (210mm)`, `Letter (215.9mm)`, `Quarter (24.26mm)`, `€1 (23.25mm)`, and `Custom`, strictly clamped to `[MIN_PX_PER_MM, MAX_PX_PER_MM]`.
   - `display.ts` accurately reads/falls back for `visualViewport.scale`, distinguishes zoom vs resolution change, and permits user-selected named multi-monitor profiles even when two panels share `1920×1080@1`.
   - `protractor.ts` dual-ray and `0°–360°` angle math passes boundary cases (`0°`, `90°`, `180°`, `270°`, `359.9°`, wrap-around).
   - **100% i18n Key Parity:** Every key and placeholder `{token}` in `en.json` matches every locale file cleanly (including new keys for `ΔY` span, pinch-zoom warning, photo ruler, Focus Mode, and new presets).

---

## 2. Live Browser Functional & Metrology Acceptance Matrix (Playwright Chromium)

### 2.1 Desktop Workspace & Edge Rendering (`1440×900` & `1920×1080`)
- **Initial Utility:** Top ruler canvas renders non-blank (`width > 1200 px`), `#status-ppi-text` displays valid numeric PPI + explicit `Estimated` or `Calibrated` label.
- **Cursor Projection Sync (P0.2):** Moving pointer cleanly across `#workspace-stage` mutates `#ruler-top` and `#ruler-left` canvas pixel hashes *and* updates `#live-cursor-readout` numerically within `50ms`; pointer leave cleanly clears the projection tick.
- **Unit Switching & Dual Readouts:** Switching `cm`, `mm`, `in`, `px`, `Dual cm/in`, `cm+px`, and `in+px` triggers visible canvas redraws and updates floating ruler, guide, and readout units atomically.
- **Origin Symmetry:** Clicking `Center Zero` shifts canvas `0` tick exactly to stage center (`width / 2`, `height / 2`) within `±0.5 px`.
- **Multi-Axis Guides & Bounding Box (P1.3):**
  - Enabling Guides `[G]`, dragging 2 X guides & 2 Y guides displays localized `ΔX`, `ΔY`, and `Diagonal` spans matching `(dx / pxPerMm)` within `±0.05 cm`.
  - Non-English route (e.g. `/es`) never emits literal English `'ΔY guide span'`.
- **Protractor & Rotatable Floating Ruler (P2.1):**
  - Floating ruler drags smoothly across stage, rotates across arbitrary degrees (`0°`, `45°`, `90°`), persists across `page.reload()`, and deletes cleanly (`<= 4` active).
  - Protractor `[P]` vertex repositions cleanly and sweeps angles continuously `[0°, 360°]` via mouse drag and keyboard arrows.

### 2.2 Calibration, Persistence & Multi-Display Resilience
- **Card Corner-Drag & Presets (P1.1):** Dragging `#card-cal-preview` handle updates numeric `px`, preview box CSS width (`rect.width === inputPx`), and active `pxPerMm` identically; `A4`, `Letter`, `Coin`, and `Custom` presets apply exact ratios.
- **Persistence & Reload:** Applying a `15.6″` diagonal or `340 px` card calibration updates `#status-ppi-text` (`Calibrated`), writes `orp:calibration:v1`, and restores identical `pxPerMm` on full reload.
- **Zoom & Pinch Compensation (P0.4):**
  - Browser DPR zoom override (`1.0` -> `1.5`) rescales `cssPxPerMm` inversely (`storedDevicePxPerMm / 1.5`) or raises explicit monitor-change warning without corrupting stored profiles silently.
  - Emulated `visualViewport.scale = 1.5` triggers the explicit pinch-zoom warning inside `#display-change-banner`.
- **Cold Locale Root Preservation (P0.3):** Visiting `/` on fresh context with Chromium `locale: 'es-ES'` keeps `window.location.pathname === '/'` and shows a dismissible suggestion link to `/es`.

### 2.3 Photo & Clipboard Measurement Engine (P1.2)
- **Image Calibration Accuracy:** Loading a synthetic `800×400 px` PNG containing a `200 px` calibration bar tagged `10.00 cm` sets image scale to `20.00 px/cm`. Measuring a second `100 px` feature inside the same image reports **`5.00 cm` ± `0.05 cm`**.
- **Privacy Guarantee:** Inspecting Playwright `request` events during image upload, `Ctrl+V` clipboard paste, and annotated PNG export MUST confirm **`0` outbound HTTP image payloads** (`100%` client-side).

---

## 3. Responsive, Touch & Mobile First-Screen Criteria

Verified across `320×568`, `375×667`, `390×844`, `768×1024`, `1024×768`, `1440×900`, `1920×1080`:

| Checkpoint | Pass Threshold |
|---|---|
| **Mobile First-Screen Ruler Visibility (`375×667`)** | `#ruler-workspace` & `#ruler-top` canvas top `< 280 px`; `#workspace-stage` visible height `>= 220 px` inside initial `667 px` fold without scrolling. |
| **Horizontal Overflow** | `document.documentElement.scrollWidth <= window.innerWidth` across **all 7 viewports** and **all 12 locales** (especially `de`, `es`, `pl`, `ja`). |
| **Touch Interactions** | Touch drag (`touchscreen.tap` / touch-move) successfully repositions guides, floating rulers, and calibration drag handle without unintended page pull-to-refresh or text selection inside `#workspace-stage`. |
| **Tap Target Ergonomics** | Primary toolbar controls meet comfortable mobile tap ergonomics (`>= 36–44 px` height or padded hit area). |

---

## 4. Accessibility, Performance, SEO & Zero-Regression Gates

1. **WCAG / Axe-Core Audit:** `0` `critical`, `serious`, `moderate`, or `minor` Axe violations across **Light and Dark modes** on `/`, `/cm-ruler`, `/photo-ruler`, `/calibration-guide`, `/faq`, and active Calibration/Shortcuts modals.
2. **Keyboard-Only Navigation:** Full `Tab` reachability across unit toggles, canvas guides (`Arrow` keys `1px` / `Shift+Arrow` `10px`), protractor angles, modals (`Esc` closes & restores focus), and calibration tabs without focus traps.
3. **Web Vitals & Asset Budget (Static Dist):**
   - `CLS <= 0.01` on all desktop & mobile loads (`0.0007` baseline protected).
   - Main `/` initial transfer `< 200 KB` (lazy-load Photo/Image Measurement & Print PDF generators dynamically so initial ruler load remains ultra-fast).
   - `LCP < 1,200 ms` on local dist Chromium trace; `0` console errors, `0` uncaught `pageerror`, `0` `>= 400` asset requests.
4. **Embed & Printable Integrity:**
   - `/embed` / `?embed=1` renders `0` marketing sections, `0` footer, works across cross-origin-friendly `<iframe>` sizing with unit switching.
   - Printable rulers render clean black-on-white SVG rules including the mandatory `100 mm` & `4 in` printer-scale verification bar.
