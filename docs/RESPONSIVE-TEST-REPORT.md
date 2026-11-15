# Responsive Layout & Core Web Vitals Report — OnlineRulerPlus.com

**Tested Viewports:** `320×568`, `375×667`, `390×844`, `768×1024`, `1024×768`, `1440×900`, `1920×1080` + landscape mobile (`844×390`)  
**Browsers:** Google Chrome (`channel: 'chrome'`, visible headed + Windows classic 15px scrollbar check) & Microsoft Edge (`channel: 'msedge'`)

---

## 1. Responsive Matrix Summary (`tests/e2e/qa-comprehensive.spec.ts` & `tests/e2e/i18n.spec.ts`)

| Viewport | Device Class | Overflow (`scrollWidth <= clientWidth`) | Header & Lang Menu Bounds | Ruler Stage & Controls | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `320 × 568` | Small Mobile | Pass (`0` overflow across EN & all 12 locales) | Brand + Utility cluster + Hamburger fit `<= 305px` clientWidth | Guide Axis wraps cleanly; 2 floating rulers clamped inside stage | **PASS** |
| `375 × 667` | Mobile Portrait | Pass | Mobile drawer toggles cleanly; internal links navigate & pass axe | Protractor fits inside `#ruler-stage` bounds | **PASS** |
| `390 × 844` | Modern Mobile | Pass | Language dropdown stays within viewport bounds | Touch-action `none` verified on draggable overlays; touch tap places guide | **PASS** |
| `844 × 390` | Mobile Landscape | Pass | Verified in `tests/e2e/audit-regressions.spec.ts` | Stage & edge canvases size cleanly without clipping | **PASS** |
| `768 × 1024` | Tablet Portrait | Pass | Language dropdown & subnav fit cleanly | Workspace control pods reflow with balanced margins | **PASS** |
| `1024 × 768` | Laptop | Pass | Desktop nav links (`8`) visible without wrapping | Dual-edge canvases & calibration grid aligned | **PASS** |
| `1440 × 900` | Desktop | Pass | Full header, utility shortcuts (`H`/`D`), language pill aligned | Workspace, Protractor, Card Verification Gauge above fold | **PASS** |
| `1920 × 1080` | Large Desktop | Pass | `max-w-[1440px]` centered container preserves balance | Wide canvas scale (`0–48+ cm`) sharp and centered | **PASS** |

---

## 2. Production Cumulative Layout Shift (CLS) Audit (`astro preview --port 4322`, Chrome 1440×900 Cold Contexts)

| Route | CLS Before Fixes | CLS After Final Fix | Target (`<= 0.10`) | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `0.4571` | `0.00073` | `<= 0.10` | **PASS** |
| `/cm-ruler` | `0.3581` | `0.00065` | `<= 0.10` | **PASS** |
| `/mm-ruler` | — | `0.00065` | `<= 0.10` | **PASS** |
| `/inch-ruler` | — | `0.00056` | `<= 0.10` | **PASS** |
| `/horizontal-ruler` | — | `0.00065` | `<= 0.10` | **PASS** |
| `/vertical-ruler` | — | `0.00065` | `<= 0.10` | **PASS** |
| `/how-to-use` | — | `0.00001` | `<= 0.10` | **PASS** |
| `/calibration-guide` | `0.1659` | `0.00118` | `<= 0.10` | **PASS** |
| `/faq` | — | `0.00001` | `<= 0.10` | **PASS** |
| `/about` | — | `0.00543` | `<= 0.10` | **PASS** |
| `/contact` | — | `0.00044` | `<= 0.10` | **PASS** |
| `/privacy` | `0.1485` | `0.00272` | `<= 0.10` | **PASS** |
| `/terms` | — | `0.00127` | `<= 0.10` | **PASS** |

---

## 3. Visual Evidence Screenshots (`docs/qa-screenshots/`)

- [home-desktop-1440-light.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/home-desktop-1440-light.png)
- [home-desktop-1440-dark.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/home-desktop-1440-dark.png)
- [protractor-floating-guides.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/protractor-floating-guides.png)
- [calibration-card-active.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/calibration-card-active.png)
- [mobile-320-ruler.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/mobile-320-ruler.png)
- [mobile-375-tray.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/mobile-375-tray.png)
