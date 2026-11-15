# Device, Browser & Scaling Compatibility Report — OnlineRulerPlus.com

**Test Environment:** Windows host, Astro dev/preview on `http://localhost:4321`  
**Installed Browsers Tested Live:** Google Chrome `157.0.8103.79`, Microsoft Edge `157.0.4341.60`  
**Not Installed in Test Environment:** Playwright `chromium` headless shell, Mozilla Firefox, Apple WebKit / Safari

---

## 1. Browser Coverage Matrix

| Browser / Engine | Version Tested | E2E Suite Result | All 13 Routes (HTTP 200 & Zero Console/Network Errors) | Verification Classification |
|:---|:---|:---|:---|:---|
| **Google Chrome** | `157.0.8103.79` | `11 / 11` passed (`ruler.spec.ts` + `audit-regressions.spec.ts`) | Verified (`0` console errors, `0` page errors, `0` >=400 responses) | **VERIFIED** |
| **Microsoft Edge** | `157.0.4341.60` | `11 / 11` passed (`ruler.spec.ts` + `audit-regressions.spec.ts`) | Verified (`0` console errors, `0` page errors, `0` >=400 responses) | **VERIFIED** |
| **Mozilla Firefox** | N/A | Not run (executable not installed locally) | Unit zoom classification tests cover Firefox's `screenWidth/dpr` scaling model (`classifyDisplayChange`), live browser unexecuted | **UNVERIFIED (Browser Missing)** |
| **Apple Safari / WebKit** | N/A | Not run (executable/macOS/iOS unavailable) | Device lookup table unit-tested for iOS/iPadOS/Mac (`devices.ts`), live WebKit rendering unexecuted | **UNVERIFIED (Browser Missing)** |

---

## 2. Responsive Viewports, Touch & Orientation Matrix

Tested live in headless Chrome & Edge across mobile portrait, mobile landscape, tablet, laptop, desktop, and widescreen viewports:

| Viewport (`width × height`) | Touch Emulation | Doc Overflow (`scrollWidth > clientWidth`) | Overlay & Calibration Behavior Observed | Status |
|:---|:---|:---|:---|:---|
| `320 × 568` (Small phone portrait) | `hasTouch: true` | **PASS (`false`)** *(Fixed in BUG-04)* | Touch guide tap succeeds; card defaults to portrait `204 px` (`53.98 mm` baseline) | **VERIFIED** |
| `375 × 667` (Mobile portrait) | `hasTouch: true` | **PASS (`false`)** | Responsive protractor canvas fits inside `#ruler-stage`; dynamic portrait orientation on rotation verified | **VERIFIED** |
| `390 × 844` (Modern mobile portrait) | `hasTouch: true` | **PASS (`false`)** | Protractor & floating ruler remain contained within `#ruler-stage` | **VERIFIED** |
| `844 × 390` (Mobile landscape) | `hasTouch: true` | **PASS (`false`)** *(Fixed in BUG-04)* | Global nav collapses cleanly into mobile drawer (`<= 1023px` breakpoint) without header overflow | **VERIFIED** |
| `768 × 1024` (Tablet portrait) | `hasTouch: true` | **PASS (`false`)** | All workspace pods & protractor render without horizontal clipping | **VERIFIED** |
| `1024 × 768` (Small desktop) | `false` | **PASS (`false`)** | Desktop `.apple-nav-desktop` visible (`navVisAt1024: true`) across all 13 routes with zero overflow | **VERIFIED** |
| `1280 × 800` / `1600 × 900` / `1920 × 1080` | `false` | **PASS (`false`)** | Full control pods, card stage + checklist, and `180°` full-size (`320×180`) protractor verified | **VERIFIED** |

---

## 3. Browser Zoom & DPR Scaling Verification (`50%` to `200%`)

### Simulated Zoom / DPR Results (`chrome` & `msedge` via Playwright `deviceScaleFactor`)

Starting from a manual ID-1 card calibration at `DPR = 1.0` (`342.4 px` card width -> `4.0000 CSS px/mm`), `localStorage` was carried across browser contexts at each scaling factor (`0.50`, `0.67`, `0.75`, `0.90`, `1.00`, `1.10`, `1.25`, `1.50`, `2.00`):

| Factor (`deviceScaleFactor`) | Expected `CSS px/mm` (`4.0 / DPR`) | Observed `#ruler-workspace[data-px-per-mm]` (Chrome & Edge) | Status Retained (`manual`) | Physical Equivalence Model (`pxPerMm * dpr`) |
|:---|:---|:---|:---|:---|
| `0.50` (`50%`) | `8.0000` | `8.0000` | `manual` | `4.0000` dev px/mm (**EXACT**) |
| `0.67` (`67%`) | `5.9701` | `5.9701` | `manual` | `4.0000` dev px/mm (**EXACT**) |
| `0.75` (`75%`) | `5.3333` | `5.3333` | `manual` | `4.0000` dev px/mm (**EXACT**) |
| `0.90` (`90%`) | `4.4444` | `4.4444` | `manual` | `4.0000` dev px/mm (**EXACT**) |
| `1.00` (`100%`) | `4.0000` | `4.0000` | `manual` | `4.0000` dev px/mm (**EXACT**) |
| `1.10` (`110%`) | `3.6364` | `3.6364` | `manual` | `4.0000` dev px/mm (**EXACT**) |
| `1.25` (`125%`) | `3.2000` | `3.2000` | `manual` | `4.0000` dev px/mm (**EXACT**) |
| `1.50` (`150%`) | `2.6667` | `2.6667` | `manual` | `4.0000` dev px/mm (**EXACT**) |
| `2.00` (`200%`) | `2.0000` | `2.0000` | `manual` | `4.0000` dev px/mm (**EXACT**) |

### Simulated vs. Physical Hardware Caveat (Important Honesty Boundary)

- **What IS Verified:** Playwright `deviceScaleFactor` emulation + unit persistence tests prove that `storage.ts`, `display.ts`, and `resolve.ts` accurately store `devicePxPerMm` and rescale `pxPerMm = devicePxPerMm / dpr` identically in both Chrome and Edge from `50%` to `200%`.
- **What is PARTIALLY VERIFIED / Hardware-Dependent:** Changing **Windows OS Display Scaling** live (`100%` / `125%` / `150%` / `200%` in Windows Display Settings) scales `window.screen.width` inversely alongside `window.devicePixelRatio` (`physicalWidth = screen.width * dpr` stays constant while `screen.width` changes). That dual-axis panel matching path (`matchesPhysicalPanel`) is verified by unit tests (`measurement-engine.test.mjs`) for simulated payloads, **not** by toggling host Windows OS Display Settings or measuring physical pixels with a caliper/bank card against this workstation's monitor during headless automation. Real physical accuracy requires on-screen verification with a physical ISO/IEC 7810 ID-1 card or physical ruler on the target monitor.
