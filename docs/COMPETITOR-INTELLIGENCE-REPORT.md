# Independent Competitor Intelligence & Website Gap Analysis

**Target Property Evaluated:** `https://onlinerulerplus.com/` (Live DNS unreachable at audit time; local production build evaluated via `astro preview` on `http://localhost:4325/` and `http://localhost:4321/`)
**Competitors Audited Live:** 11 live HTTP 200 competitors (2 additional candidates excluded/documented in Section 17)
**Audit Environment:** Windows Desktop & Mobile Emulation in real Chromium (`channel: 'chrome'`, `1440×900` desktop and `375×667` touch mobile), automated `axe-core` WCAG accessibility audit, Web Performance API telemetry (`CLS`, `FCP`, `LCP`, `load`, transfer size), interactive user-journey testing, and visual screenshot inspection.
**Zero-Bias Covenant:** Every finding below treats **OnlineRulerPlus** identically to an independent third-party product. Where competitors perform better, this report states so directly. Where metrics were not observable or live production DNS blocked public verification, those items are explicitly marked **`Not verified`**.

---

## 1. Executive Summary

**OnlineRulerPlus** enters a mature, high-utility search vertical dominated by legacy ad-monetized tools (**Ginifab**, **PiliApp**, **RapidTables**) and modern minimalist challengers (**Ruler.im**, **OnlineRulerTool.com**, **OnlineRulers.com**, **AnRuler.com**).

### Bottom-Line Assessment
1. **Critical Live Blocker (`CRITICAL`):** `https://onlinerulerplus.com/` currently fails public DNS resolution (`DNS_ERROR_RCODE_NAME_ERROR` / `ENOTFOUND`). Regardless of UI or engineering quality inside the repository, **zero real users or search crawlers can currently reach the live production domain**.
2. **Where OnlineRulerPlus Genuinely Outperforms Competitors (Verified on Local Production Bundle):**
   - **Workspace Depth & Precision Tooling:** Combines Top/Bottom/Left/Right/**All Edges** perimeter rulers, simultaneous **`Dual cm/in`**, interactive X/Y alignment guides + crosshair delta readout, movable/rotatable **`+ Floating Ruler`**, inline **`180° Protractor`**, local measurement history, and keyboard shortcuts (`H`/`D`/`G`/`C`/`F`) in one cohesive CAD-inspired workspace.
   - **Technical Quality, CLS & Accessibility:** On local production preview (`http://localhost:4325/`), `OnlineRulerPlus` achieved **`0.0007` CLS**, **`0` `axe-core` violations**, **`0` console/network errors**, **`0` horizontal overflow** on both `1440×900` desktop and `375×667` mobile, **`148 KB` transfer weight**, **`0` ads**, and **5 valid JSON-LD schemas** (`Organization`, `WebSite`, `WebPage`, `WebApplication`, `FAQPage`). Every ad-supported competitor suffered severe layout shift (`CLS 0.1059` to `0.5151`) and `2` to `8` WCAG `axe` rule violations.
3. **Where Competitors Brutally Outperform OnlineRulerPlus (Verified on Live Competitor Sites):**
   - **Mobile First-Screen Utility (`375×667`):** `OnlineRulerPlus` stacks Header + Sub-header + Badge + `H1` + Subtitle + 3 control pods + Status row + Guide/Thickness bar *above* the ruler grid, pushing the interactive canvas to **`y = 781px`** (completely **below the 667px mobile fold**; only the bottom millimeter ticks peek around `y ≈ 615px`) while misleadingly labeling the screen `Desktop display` in headless/touch emulation. By contrast, **OnlineRulers.com**, **AnRuler.com**, **Ruler.im**, and **Ginifab** surface actual usable ruler markings immediately near the top or middle of the first mobile viewport.
   - **Desktop Visual Clutter Control ("Pure Ruler" Mode):** **OnlineRulerTool.com** offers a one-click **`Hide Info`** button collapsing editorial chrome so the canvas dominates the screen; **OnlineRulerPlus** forces hero typography and buttons above the workspace unless fullscreen is entered.
   - **Calibration Object Diversity:** **OnlineRulerTool.com** calibrates against **Card, A4 Paper, US Letter, and Custom Known Length**; **Ginifab** calibrates against credit cards (1x, 2x, 3x width, height), **CD diameter (120 mm)**, **A4 long edge (297 mm)**, and **localized banknotes (`₹10 123mm`, etc.)**. **OnlineRulerPlus** only calibrates via Credit Card, Screen Diagonal, or Auto-Detect—its coin graphics (`Quarter`, `€1`, `₹5`, `₹10`) are **passive verification circles**, not active calibration controls.
   - **Photo / Screenshot Measurement:** **Ruler.im** (upload image inline), **OnlineRulerTool.com** (`Measure image`), **Ginifab** (`virtual_ruler_on_your_image.html`), **Virtual-Ruler.com** (JPG overlay & export), and **RapidTables** (`Ctrl+V` clipboard pixel measurement) all let users measure *inside images or screenshots*. **OnlineRulerPlus** has zero image/clipboard measurement.
   - **Printable Actual-Size PDFs & Standalone Tool Spokes:** **TheOnlineRuler.com**, **Ginifab**, **Ruler.im**, and **PiliApp** capture adjacent search demand with dedicated printable PDFs, popup detached windows (`Ginifab`, `AnRuler`, `PiliApp`), unit converters (`cm↔in`, `meters↔feet`), scale rulers (`1:50`/`1:100`), screen-size detectors, and concentric circle / quadrant tools.

### Overall Weighted Rank (Out of 12 Evaluated Products)
On **pure product, technical engineering, and desktop UX** (local build average across Criteria 1–8 = **`8.38/10`**), **OnlineRulerPlus** ranks **#2 behind #1 Ruler.im (`8.69/10`)**. However, factoring in **zero live public reachability (`ENOTFOUND`, Criterion 10 = `0.0`)** and **zero current public domain indexation (Criterion 9 Real-World = `0.0`)**, its **overall real-world competitive score drops to `6.70 / 10` (Rank #3 tie with AnRuler, behind #1 Ruler.im `8.70/10` and #2 OnlineRulerTool `6.90/10`)** until the site is publicly deployed, mobile chrome is collapsed, and missing workflows are added.

---

## 2. Competitor List and Selection Rationale

All 11 competitors below returned **HTTP `200 OK`** in real Chrome during this audit and represent direct functional substitutes for someone searching "online ruler", "actual size ruler", "screen ruler", or "measure object on screen".

| # | Competitor | Primary Audited URL | Tier Classification | Why Selected (Relevance Rationale) |
|:-:|:---|:---|:---|:---|
| 1 | **Ginifab Online Ruler** | `https://www.ginifab.com/feeds/cm_to_inch/actual_size_ruler.html` | Established High-Traffic & Feature-Rich | One of the oldest, deepest legacy leaders in virtual rulers; benchmarks maximum functional breadth (localized banknotes, A4 calibration, voice, command highlight, popup, architect scales, converters). |
| 2 | **PiliApp Actual-Size Ruler** | `https://www.piliapp.com/actual-size/cm-ruler/` (`+ /inch-ruler/`) | Established High-Traffic & UX-Focused | Classic high-ranking utility tool split into intent-specific routes (`cm-ruler`, `inch-ruler`, `what-is-my-monitor-size`); tests onboarding modal friction and iframe embedding. |
| 3 | **RapidTables Pixel Ruler** | `https://www.rapidtables.com/web/tools/pixel-ruler.html` | Established High-Traffic Utility | Represents the high-volume developer/UI "clipboard screenshot measurement" adjacent intent (`Ctrl+V` paste + `Δx × Δy` vector length). |
| 4 | **Ruler.im** | `https://ruler.im/` (`+ /quadrant`, `/concentric-circle`, `/protractor`) | UX/Design-Focused & Feature-Rich | Closest modern architectural peer (`0` ads, `0` CLS, `0` Axe violations, 32 locales, CAD blueprint UI, inline image upload, specialized geometry routes). |
| 5 | **OnlineRulerTool.com** | `https://onlinerulertool.com/` | UX/Design-Focused & Feature-Rich | Direct modern competitor matching `OnlineRulerPlus`'s 13-hreflang SEO footprint, dual `cm+px`/`in+px` units, multi-object calibration (`Card/A4/Letter/Custom`), and `Hide Info` mode. |
| 6 | **TheOnlineRuler.com** | `https://theonlineruler.com/` | Direct Printable & Affiliate Competitor | Represents the "Printable PDF Ruler + Amazon affiliate" search cluster (`15cm`, `30cm`, triangle, square, tape PDFs), testing content-heavy monetization vs tool immediacy. |
| 7 | **iRuler.net** | `https://iruler.net/` | Direct Minimalist Competitor | Minimalist photorealistic wood-grain 30 cm / 12 in dual-scale ruler with aspect-ratio + diagonal creator; tests nostalgic skeuomorphic simplicity. |
| 8 | **Ruler.onl** | `https://ruler.onl/` | Ad-Heavy Direct Competitor | Lightweight quick-toggle (`inch`/`cm`) + diagonal preset dropdown + card calibration wrapped in aggressive multi-slot AdSense layouts. |
| 9 | **OnlineRulers.com** | `https://onlinerulers.com/` | Feature-Rich Multilingual Direct Competitor | Modern clean yellow-tape UI with horizontal/vertical toggle, fullscreen, explicit calibration warning banner, and 24 `hreflang` targets. |
| 10 | **Virtual-Ruler.com** | `https://virtual-ruler.com/` | Photo/Image Overlay Specialist | Pure client-side JPG photo-annotation ruler (`Total CM`, `Rotate °`, `Ink/Surface Color`, `Pixels/cm`) showing an unserved image-measurement niche. |
| 11 | **AnRuler.com** | `https://anruler.com/` | UX/Utility Direct Competitor | Fast-FCP (`372ms`) canvas ruler featuring top sticky edge ticks, inline diagonal field (`13.3"`), **`Rotate`**, **`Fullscreen`**, **`Popup`**, and 20 `hreflang` links. |

> **Excluded Candidates (Documented Transparently):**
> - `https://onlineruler.org/` returned **HTTP `403`** behind a Cloudflare `"Checking your browser before accessing. Just a moment..."` challenge; per strict anti-bot policy, no challenge bypass was attempted.
> - `https://preciseruler.com/` failed network connection during initial live discovery.

---

## 3. Website-by-Website Analysis

### 3.0 Target Website: OnlineRulerPlus (`https://onlinerulerplus.com/` / Local Production Build)
- **Evaluated URLs:** Live production `https://onlinerulerplus.com/` (`ENOTFOUND` — unreachable); Local build `dist/` served at `http://localhost:4325/` and `http://localhost:4321/` (`156` static HTML pages across `12` languages × `13` routes, plus `sitemap-index.xml` and `sitemap-0.xml`).
- **Measured Desktop & Mobile Telemetry (Local Preview):** `status=200`, `CLS=0.0007`, `FCP=844ms`, `LCP=844ms`, `load=598ms`, `transfer=148KB`, `resources=8`, `words=2779`, `hreflangs=13`, `schemas=[Organization, WebSite, WebPage, WebApplication, FAQPage]`, `desktopOverflow=false`, `mobileOverflow=false`, `axeViolations=0`, `adSlots=0`, `errors=0`.
- **Interactive Capabilities Verified:**
  - Units: `cm`, `mm`, `in` (up to 1/32 fractional readability), `px`, and simultaneous `Dual cm/in`.
  - Edges: `Top`, `Bottom`, `Left`, `Right`, `All Edges` (simultaneous 4-sided perimeter ruler).
  - Workspace Overlays: Draggable X/Y `Guides` (`Vertical`/`Horizontal`/`Both`), `Crosshair` coordinate delta HUD, `+ Floating Ruler` (verified spawning draggable rotatable sub-ruler), inline `180° Protractor` (`verified visible`), `Thickness` (`36px`/`48px`/`64px`), `Opacity` (`96%`), `Fullscreen`, `Theme` light/dark toggle, `Shortcuts` overlay, and local `Measurement History` (`Save to History` / `Clear`).
  - Calibration (`#calibration`): 3 tabs (`1. Credit Card 85.60×53.98mm` Landscape/Portrait toggle + `-1`/`+1`/slider/exact numeric px input, `2. Screen Diagonal` with 11 preset buttons `11″`–`34″` + custom input, `3. Auto-Detect`), plus 4 passive everyday verification circles (`US Quarter`, `€1`, `₹5`, `₹10`).
- **Strengths:** Best-in-class precision workspace features, cleanest HTML/WCAG/performance engineering (`0` Axe, `0.0007` CLS, `0` ads), deepest educational guide & schema implementation.
- **Weaknesses:** Live domain unresolvable (`NXDOMAIN`); mobile (`375×667`) buries `#ruler-tool` canvas (`y = 781px`) beneath hero + 3 control rows; status bar reports `"96.0 PPI · Desktop display"` on 375px touch emulation; passive coin gauges lack calibration triggers; misses image measurement, printable PDFs, detached popup window, and standalone converter/calculator spokes.

### 3.1 Ginifab (`https://www.ginifab.com/feeds/cm_to_inch/actual_size_ruler.html`)
- **Telemetry:** `CLS=0.5151`, `FCP=1796ms`, `LCP=2048ms`, `load=5260ms`, `transfer=933KB`, `resources=81`, `words=2249`, `hreflangs=0` (uses explicit body links to 20+ translated pages + `language.php`), `schemas=[WebApplication]`, `desktopOverflow=true (1566>1425)`, `mobileOverflow=true (385>375)`, `axe=8` (missing `html[lang]`, `17` unnamed links, `4` frame-title, `4` color-contrast, `5` aria-command-name, missing `alt`, `label`, `select-name`), `adSlots=34`, `errors=4 console / 5 failed`.
- **Interactive Findings:** Supports `1/8`, `1/16`, `1/32` inch ticks, `⅛ inch marks` toggle, `flip over` orientation, `quiet` toggle (voice speech), `command` target-length input, `pop up` window button, drag-line measurement, and **industry-leading reference object calibration dropdown**: Credit card width (`3 3/8"`), Credit card height (`2 1/8"`), `2` & `3` credit cards width, Standard CD (`120 mm`), **localized Indian ₹10 banknote (`123 mm` — localized text rendered dynamically!)**, and **A4 paper long edge (`297 mm`)**. Also links verified `200 OK` sub-tools: `virtual_vertical_ruler.html`, `virtual_ruler_on_your_image.html`, `architect_metric_scale_ruler.html`, `what_is_my_screen_size.html`, and `/feeds/angle_measurement/`.
- **Strengths:** Unmatched reference-object localization, standalone sub-tool ecosystem, voice/command accessibility helpers, top-edge ruler visible immediately even on mobile (`y ≈ 60px`).
- **Weaknesses:** Extremely cluttered 2000s UI, aggressive `34` ad units (sticky right rail + bottom overlay covering viewport), worst CLS (`0.5151`), overflows both desktop and mobile viewports, `8` Axe violations, `html[lang]` missing.

### 3.2 PiliApp (`https://www.piliapp.com/actual-size/cm-ruler/`)
- **Telemetry:** `CLS=0.1059`, `FCP=372ms`, `LCP=372ms`, `load=1415ms`, `transfer=479KB`, `resources=38`, `words=73`, `metaDescLen=0`, `hreflangs=0`, `schemas=[WebApplication]`, `desktopOverflow=false`, `mobileOverflow=true (1134>375 — 3x overflow!)`, `axe=3` (`button-name:1`, `color-contrast:5`, `meta-viewport:1`), `adSlots=1`.
- **Interactive Findings:** First load displays a dark blocking overlay (`"Are you using 19-inch screen? Yes / 17-inch / user-input"`). Clicking `#yes` unlocks a stark yellow-tan `30CM / 300mm` ruler strip (`width: 300.0mm (11.81Inch)`) with `Lite / Normal / Full` tick density, `full screen`, `drag it`, and **`iframe embed`**. Separate `/actual-size/inch-ruler/` route confirmed `200 OK`.
- **Strengths:** Ultra-fast `372ms` FCP/LCP, clean high-contrast yellow plastic ruler metaphor, rare **`iframe embed`** sharing capability, dedicated inch/cm URLs.
- **Weaknesses:** Harsh blocking modal on entry prevents instant viewing; severe `1134px` horizontal overflow on `375px` mobile; near-zero educational/FAQ content (`73` words, `0`-char meta description); lacks guides, dual units, or protractors.

### 3.3 RapidTables Pixel Ruler (`https://www.rapidtables.com/web/tools/pixel-ruler.html`)
- **Telemetry:** `CLS=0.0051`, `FCP=1232ms`, `LCP=1568ms`, `transfer=100KB`, `words=53`, `canonical=""`, `schemas=[]`, `desktopOverflow=false`, `mobileOverflow=true (564>375)`, `axe=2` (`label-content-name-mismatch:1`, `link-in-text-block:3`), `adNet=false`.
- **Interactive Findings:** Built strictly for measuring digital images/screenshots pasted via `Ctrl+V`: outputs clicked pixel `length` and `Δx × Δy` bounding dimensions with zoom `+/-` and `.png` save/clear controls. Does **not** measure physical cm/inches via screen PPI.
- **Strengths:** Fast (`100 KB`), tiny `0.0051` CLS, zero ad clutter during capture, dead-simple screenshot pixel workflow.
- **Weaknesses:** Completely lacks physical cm/inch screen ruler mode, calibration, mobile responsiveness (`564px` overflow), SEO copy (`53` words, no schema, no canonical), and accessible text labels on toolbar icons.

### 3.4 Ruler.im (`https://ruler.im/`)
- **Telemetry:** `CLS=0`, `FCP=452ms`, `LCP=452ms`, `load=579ms`, `transfer=229KB`, `words=555`, `hreflangs=32`, `schemas=[WebSite, FAQPage]`, `desktopOverflow=false`, `mobileOverflow=false`, `brokenImgs=5`, `axe=0`, `adSlots=0`, `adNet=false`.
- **Interactive Findings:** Dark drafting blueprint UI framing the viewport with top & left cyan ticks displaying `?` until calibrated. Clicking `Go Calibrate` opens an ultra-focused `Standard Credit Card: 85.6 × 54.0 mm` modal with one cyan slider and `Confirm Calibration` (`0` clutter). Includes an inline **file upload input** for measuring inside photos, an inline **`Inch ↔ Centimeter`** calculator, `Copy link`, FAQ accordion, `32` `hreflang` translations, plus verified **`200 OK` specialized routes**: `/quadrant` (center origin), `/concentric-circle` (bullseye radius/diameter circles), and `/protractor` (180° angle tool).
- **Strengths:** Ties `OnlineRulerPlus` on **`CLS = 0`** and **`0` Axe violations** while running **faster (`452ms` FCP/LCP)**, placing edge ticks directly along the viewport perimeter even on mobile, supporting `32` languages, offering inline image upload + `Concentric Circle` + `Quadrant` tools, and having zero ads.
- **Weaknesses:** Edge ticks show unusable `?` placeholders until card calibration completes (high uncertainty for users without a card nearby); calibration lacks diagonal preset/custom-paper/A4 fallbacks; `5` broken images detected in DOM (`cross-product cards`); misses dual `cm+in` simultaneous edge labels, floating sub-rulers, crosshair HUD, and keyboard shortcuts.

### 3.5 OnlineRulerTool.com (`https://onlinerulertool.com/`)
- **Telemetry:** `CLS=0.4736`, `FCP=1264ms`, `LCP=2680ms`, `transfer=684KB`, `words=820`, `hreflangs=13`, `schemas=[WebSite, Organization, WebApplication, WebPage, HowTo, FAQPage]`, `desktopOverflow=false`, `mobileOverflow=false`, `axe=7` (`definition-list`, `dlitem`, `aria-command-name`, `frame-title`, `label-content-name-mismatch`, `link-name`, `meta-viewport`), `adSlots=20`.
- **Interactive Findings:** Places L-shaped perimeter rulers cleanly along screen edges, adds `cm | in | px | cm+px | in+px`, `Guidelines`, `Selection`, `Ruler position`, `Enter fullscreen`, **`Hide Info`** collapse button, and a standout 3-tab Calibration Modal (`Physical | Device | Diagonal`) supporting **Card, A4, Letter, and Custom length**. **Critical flaw observed live:** a sticky AdSense banner physically covered the bottom third of its calibration modal, obscuring the calibration slider and `Done` button! On `375px` mobile, sticky left ruler ticks slightly overlap left-aligned hero text.
- **Strengths:** Multi-object physical calibration (`Card/A4/Letter/Custom`), `Hide Info` pure-canvas toggle, combined `cm+px`/`in+px` units, `HowTo` + `FAQPage` schema, dedicated `/guides/*` articles.
- **Weaknesses:** Severe `0.4736` CLS (`LCP 2680ms`), `20` ad slots overlapping interactive calibration controls, `7` Axe accessibility errors, mobile sticky tick overlap on hero copy.

### 3.6 TheOnlineRuler.com (`https://theonlineruler.com/`)
- **Telemetry:** `CLS=0.1564`, `FCP=3132ms`, `LCP=3200ms`, `load=5928ms`, `transfer=1243KB`, `words=776`, `ogImage=""`, `hreflangs=0`, `schemas=[]`, `desktopOverflow=false`, `mobileOverflow=false`, `axe=4` (`color-contrast:14`, `frame-title:1`, `link-name:8`, `meta-viewport:1`), `adSlots=22`.
- **Interactive Findings:** No interactive on-screen ruler appears above the fold on desktop or mobile; homepage leads with a PDF promotional ad and Amazon `$6.99` steel ruler affiliate cards, followed by links to downloadable printable PDFs (`15-cm by mm`, `12 inches 20 cm`, `30-cm by mm`, `Large Print`, `Triangle Ruler`, `Square cm`, `Printable Protractor`, `Measuring Tape`).
- **Strengths:** Captures "printable PDF ruler" offline print intent with 9+ specialized PDF templates.
- **Weaknesses:** Slowest FCP/LCP (`3.1s`/`3.2s`), heaviest payload (`1243 KB`), misleading for users expecting a live on-screen ruler (`22` ad slots + affiliate bloat), zero schema, `14` contrast failures.

### 3.7 iRuler.net (`https://iruler.net/`)
- **Telemetry:** `CLS=0.1155`, `FCP=1144ms`, `LCP=1728ms`, `transfer=801KB`, `words=30`, `canonical=""`, `h1s=[]`, `schemas=[]`, `desktopOverflow=false`, `mobileOverflow=false`, `axe=3` (`color-contrast:4`, `image-alt:1`, `meta-viewport:1`), `adSlots=7`, `errors=2 console / 1 pageerror`.
- **Interactive Findings:** Clean centered wooden dual-scale ruler (`mm/cm` top edge, `1/8 inch` bottom edge) with automatic display heuristic (`"Your display was distinguished as 17.7\" 1440×900"` -> `8" 375×667` on mobile) plus diagonal & aspect-ratio (`width : height`) form.
- **Strengths:** Intuitive zero-learning-curve wooden physical ruler aesthetic fitting both `cm` and `inch` on one body; responsive without horizontal overflow.
- **Weaknesses:** Missing `<h1>`, missing canonical tag, only `30` words, runtime JS page error, aspect-ratio heuristic wrongly calls a `375×667` phone `"8\""`, zero advanced guides/protractor/card-calibration.

### 3.8 Ruler.onl (`https://ruler.onl/`)
- **Telemetry:** `CLS=0.2464`, `FCP=780ms`, `LCP=944ms`, `transfer=711KB`, `words=775`, `canonical=""`, `hreflangs=5`, `schemas=[]`, `desktopOverflow=true (1441>1425)`, `mobileOverflow=false`, `axe=8` (`color-contrast:10`, missing `select-name`), `adSlots=15`.
- **Interactive Findings:** Top horizontal strip ruler with `inch`/`cm` radio buttons, `~17.7″`–`27.0″` diagonal dropdown (`4.0″` to `27.0″`), custom diagonal field, and `↹ Calibrate` card-fit trigger. Heavily sandwiched between top/bottom/anchor AdSense units.
- **Strengths:** Compact single-row calibration (`diagonal dropdown` + `card icon`) and 20 preset screen sizes directly inside the ruler bar.
- **Weaknesses:** `15` ad slots dominate above-the-fold mobile screen (`ruler-onl-mobile.png` shows 75% ad banner height above the 3-inch ruler), desktop 16px horizontal overflow, `0.2464` CLS, `8` Axe errors, no vertical/multi-edge/protractor modes.

### 3.9 OnlineRulers.com (`https://onlinerulers.com/`)
- **Telemetry (Initial Live Visit):** `CLS=0.1414`, `FCP=1648ms`, `LCP=1648ms`, `transfer=565KB`, `words=476`, `metaDescLen=188`, `hreflangs=24`, `schemas=[]`, `desktopOverflow=false`, `mobileOverflow=false`, `axe=6`, `adSlots=11`. *(Secondary follow-up crawl blocked by Cloudflare WAF; UI/perf verified on initial Chrome visit.)*
- **Visual & Interactive Observations (`onlinerulers-desktop.png`, `onlinerulers-mobile.png`):** Clean bright-yellow ruler bar (`0–30 cm` desktop, `0–8 cm` mobile) with `cm/mm | inches`, `Horizontal | Vertical`, Calibration icon, and prominent blue **`Fullscreen`** pill. Displays honest amber warning `"Auto-calibration failed — calibrate manually below"`. Immediately below the warning sits a massive `300×250` AdSense unit.
- **Strengths:** Honest accuracy alert ("Auto-calibration failed"), crisp high-contrast mobile layout putting the ruler above the fold (`y ≈ 200px`), `24` hreflangs.
- **Weaknesses:** Prominent AdSense placement inside the first screen, `0.1414` CLS, `6` Axe errors, zero JSON-LD schema, Cloudflare WAF aggressively blocks automated tooling.

### 3.10 Virtual-Ruler.com (`https://virtual-ruler.com/`)
- **Telemetry:** `CLS=0.3491`, `FCP=948ms`, `LCP=948ms`, `transfer=6KB` (tiny initial HTML), `words=341`, `metaDescLen=0`, `canonical=""`, `schemas=[]`, `desktopOverflow=false`, `mobileOverflow=true (635>375)`, `axe=3`, `adNet=false`.
- **Interactive Findings:** Specialized image-annotation tool: upload `.JPG`, customize `Total (CM)`, `Rotate (°)`, `Margin (px)`, `Ink Colour`, `Surface Colour`, `Default Palette`, `Pixels per CM`, `Horizontal/Vertical Offset (px)` -> download `.JPG` with stamped scale ruler.
- **Strengths:** Zero ads, addresses a real e-commerce/crafting/forensics niche (adding a readable scale bar onto product photos).
- **Weaknesses:** Severe mobile clipping (`635px > 375px` cuts off `Default Palette` and `Margin`), `0.3491` CLS, zero screen-ruler measurement, only supports `.JPG`, zero SEO metadata.

### 3.11 AnRuler.com (`https://anruler.com/`)
- **Telemetry (Initial Live Visit):** `CLS=0.1304`, `FCP=372ms`, `LCP=372ms`, `transfer=544KB`, `words=409`, `canvases=3`, `hreflangs=20`, `desktopOverflow=false`, `mobileOverflow=false`, `axe=4` (`color-contrast:27`, etc.), `adSlots=17`, `consoleErrors=12`. *(Secondary repeat crawl blocked by Cloudflare WAF.)*
- **Visual & Interactive Observations (`anruler-desktop.png`, `anruler-mobile.png`):** Instant `372ms` FCP/LCP canvas ruler locked directly at `y = 0` top viewport edge across desktop and mobile, followed by `cm | inch | Calibrate | Fullscreen | Rotate | Popup` toolbar, inline quick diagonal input (`13.3"` placeholder + `Save`), and bold yellow warning `"Unknown device. Using default 96 PPI. Calibrate for better accuracy."`
- **Strengths:** Immediate top-edge ruler (`y = 0` on both desktop and mobile), native **`Popup`** detached window button, inline 1-field diagonal calibration above the fold, **`Rotate`**, `20` hreflangs, blazing `372ms` speed.
- **Weaknesses:** `17` ad slots, `12` console errors, `27` color-contrast accessibility failures, `0.1304` CLS, lacks floating multi-rulers, crosshair delta HUD, guides, and fractional 1/32 precision.

---

## 4. Complete Feature Comparison Matrix

> **Authorized Labels Only:** `Available and verified`, `Partially available`, `Missing`, `Better than competitors`, `Worse than competitors`, `Not verified`, `Not applicable`.

| # | Category | OnlineRulerPlus (Local Build) | Best-in-Class Competitor(s) | Status Label vs Market |
|:-:|:---|:---|:---|:---|
| 1 | **Core ruler functionality** | `Top/Bottom/Left/Right/All Edges` synced canvas | `Ruler.im`, `OnlineRulerTool`, `Ginifab`, `AnRuler` | **Better than competitors** |
| 2 | **Measurement units** | `cm`, `mm`, `in` (1/8–1/32), `px`, `Dual cm/in` | `OnlineRulerTool` (`cm+px`, `in+px`) | **Available and verified** *(ties `OnlineRulerTool` differently: `Dual cm/in` vs `cm+px`)* |
| 3 | **Calibration methods** | Credit card (L/P), Diagonal presets/input, Auto-detect | `Ginifab` (card/CD/A4/banknotes), `OnlineRulerTool` (Card/A4/Letter/Custom) | **Partially available** *(strong card UI, fewer physical object presets)* |
| 4 | **Screen-size compatibility** | Responsive CSS + DP/PPI scaling (`320px–1920px+`) | `Ruler.im`, `AnRuler` | **Available and verified** *(minor status label bug on mobile emulation: prints `"Desktop display"`)* |
| 5 | **Mobile functionality** | Zero overflow (`0px`), `/vertical-ruler`, touch-friendly | `AnRuler`, `OnlineRulers`, `Ruler.im` | **Worse than competitors** *(above-the-fold pushdown puts canvas at `y=781px` on `375×667`)* |
| 6 | **Touch interactions** | Touch drag guides, floating rulers, swipe sliders | `OnlineRulers`, `OnlineRulerTool` | **Available and verified** |
| 7 | **Advanced measuring features** | Crosshair X/Y delta, Guides, `+ Floating Ruler`, `180° Protractor`, History | `Ruler.im` (`/concentric-circle`, `/quadrant`), `Ginifab` (command/voice) | **Better than competitors** *(unique all-in-one workspace; lacks concentric circle)* |
| 8 | **User experience (Time-to-Rule)** | Clean ad-free workspace; desktop instant, mobile requires scroll | `Ruler.im` (perimeter instant), `AnRuler` (top instant), `OnlineRulerTool` (`Hide Info`) | **Partially available** |
| 9 | **UI/UX design** | Modern drafting-grid aesthetic, Light + Dark themes | `Ruler.im` (dark CAD), `OnlineRulerTool` (light/dark) | **Better than competitors** |
| 10 | **Accessibility (WCAG)** | `0` `axe-core` violations, keyboard shortcuts (`H/D/G/C/F`), skip link | `Ruler.im` (`0` Axe violations) | **Better than competitors** *(tied #1 with `Ruler.im`; zero contrast/label failures)* |
| 11 | **Navigation** | Top bar (`8` links + `12` langs) + sub-bar + mobile drawer | `OnlineRulerTool`, `Ginifab` | **Available and verified** |
| 12 | **Feature discoverability** | Shortcuts overlay + dedicated view cards below fold | `AnRuler`, `Ginifab`, `OnlineRulerTool` | **Partially available** *(some controls wrap deeply on small screens)* |
| 13 | **Educational content** | `2,779` words: PPI table, tolerance math, hardware limits, guides | `Ginifab` (`2,249` words), `OnlineRulerTool` (`/guides/*`) | **Better than competitors** |
| 14 | **FAQs and documentation** | dedicated `/faq`, `/how-to-use`, `/calibration-guide` + FAQPage schema | `OnlineRulerTool`, `Ruler.im` | **Better than competitors** |
| 15 | **SEO architecture** | `156` built pages, `13` hreflang tags, 5 schemas, sitemap | `Ruler.im` (`32` hreflangs), `OnlineRulers` (`24`), `OnlineRulerTool` | **Partially available** *(`12` langs < `32`/`24`; lacks converter/calculator spoke pages)* |
| 16 | **Content quality** | Original, non-spammy technical explanations (PPI formulas) | `OnlineRulerTool` | **Better than competitors** |
| 17 | **Page performance** | `FCP 844ms`, `LCP 844ms`, `load 598ms`, `148KB` (`0` errors) | `AnRuler` (`372ms`), `PiliApp` (`372ms`), `Ruler.im` (`452ms`) | **Available and verified** *(slightly slower first paint on local uncached preview than CDN edges)* |
| 18 | **Core Web Vitals (CLS)** | `CLS = 0.0007` (local preview) | `Ruler.im` (`CLS = 0`), `RapidTables` (`0.0051`) | **Better than competitors** *(crushes all ad competitors `0.10–0.52`)* |
| 19 | **Trust and credibility** | ISO/IEC 7810 ID-1 citations, About/Contact/Privacy/Terms | `OnlineRulerTool` (W3C + ISO citations) | **Partially available** *(new/offline domain lacks real backlink/brand proof)* |
| 20 | **Advertising experience** | `0` ads (`adSlots = 0`) | `Ruler.im` (`0`), `Virtual-Ruler` (`0`) | **Better than competitors** *(beats `Ginifab` 34 / `TheOnlineRuler` 22 / `OnlineRulerTool` 20)* |
| 21 | **Internal linking** | Cross-links across cm/mm/in/horiz/vert/guides/anchor IDs | `Ginifab`, `TheOnlineRuler` | **Available and verified** *(could expand contextual links once spokes exist)* |
| 22 | **Unique selling propositions** | Ad-free CAD workspace + All-Edges + Floating + Protractor + History | `Ruler.im`, `Ginifab`, `Virtual-Ruler` | **Available and verified** |
| 23 | **Overall product usefulness** | Deep desktop precision; mobile fold & missing print/photo hurt breadth | `Ruler.im`, `Ginifab` | **Partially available** |
| 24 | **Live Public DNS / Reachability** | **`ENOTFOUND` (`DNS_ERROR_RCODE_NAME_ERROR`)** | All 11 competitors live HTTP `200` | **Worse than competitors** *(fatal until deployed)* |
| 25 | **Photo / Screenshot Measurement** | None (no file upload, no clipboard `Ctrl+V` overlay) | `Ruler.im`, `OnlineRulerTool`, `Ginifab`, `RapidTables`, `Virtual-Ruler` | **Missing** |
| 26 | **Printable Actual-Size PDF Export** | Print CSS only (no dedicated PDF generator or paper presets) | `TheOnlineRuler`, `Ginifab` | **Missing** |
| 27 | **Detached Floating Popup Window** | None (`window.open` compact ruler mode absent) | `Ginifab`, `AnRuler`, `PiliApp` (`drag it`) | **Missing** |
| 28 | **Unit Converter / Calculator Spokes** | None (`cm-to-in`, `PPI calc`, `screen size` absent) | `Ginifab`, `PiliApp`, `Ruler.im` | **Missing** |
| 29 | **Voice Readout / Target Command** | None | `Ginifab` (`command`, `voice`) | **Missing** |

### Concrete Feature Gap Evidence Matrix

| Gap Feature | Competitor(s) | Exact URL | What Competitor Offers | What OnlineRulerPlus Offers | Why It Matters to Users | Verification Method |
|:---|:---|:---|:---|:---|:---|:---|
| **Multi-Object Physical Calibration (`A4`, `Letter`, `Banknote`, `CD`, `Custom`)** | `OnlineRulerTool`, `Ginifab` | `https://onlinerulertool.com/`, `https://www.ginifab.com/feeds/cm_to_inch/actual_size_ruler.html` | Calibration against A4 paper (`297mm`), US Letter, CD (`120mm`), localized currency notes (`₹10 123mm`), or arbitrary known mm/in length | Only ID-1 bank card (`85.60×53.98mm`), screen diagonal, or auto-detect; coins are passive display-only rings | Users frequently do not have a bank card beside them or prefer calibrating larger objects (A4 reduces % alignment error across wide monitors) | Clicked `Calibrate` in Chrome (`onlinerulertool-calibrate.png`); probed `#adjuster` `<select>` on `ginifab` |
| **Image / Photo / Screenshot Measurement** | `Ruler.im`, `OnlineRulerTool`, `Virtual-Ruler`, `RapidTables`, `Ginifab` | `https://ruler.im/`, `https://virtual-ruler.com/`, `https://www.rapidtables.com/web/tools/pixel-ruler.html` | Upload/paste image/photo, set scale from a reference inside the photo or overlay JPG ruler bars, read pixel/physical dimensions | Physical screen measurement only | High-frequency user job: measuring an object in a *photograph* or *UI mockup screenshot* rather than holding hardware onto LCD glass | Inspected `INPUT[type=file]` (`ruler.im`, `virtual-ruler.com`), `Measure image` (`onlinerulertool.com`), `virtual_ruler_on_your_image.html` (`ginifab`) |
| **Pure Canvas Focus Toggle (`Hide Info`)** | `OnlineRulerTool` | `https://onlinerulertool.com/` | Single floating **`Hide Info`** button collapses surrounding marketing copy & cards into a pure workspace | Hero copy, CTA buttons, and tool pods remain stacked unless entering OS fullscreen | Desktop/tablet users on 13" laptops regain ~200px vertical measuring space without losing browser tabs | Clicked `Hide Info` in `interact-competitors.mjs` (`Show Info` toggle verified) |
| **Detached Browser Popup Ruler** | `AnRuler`, `Ginifab`, `PiliApp` | `https://anruler.com/`, `https://www.ginifab.com/feeds/cm_to_inch/actual_size_ruler.html` | **`Popup` / `pop up` / `drag it`** opens a slim frameless browser window to sit beside Figma/Word/Excel | Inside-page `+ Floating Ruler` cannot leave the browser viewport | Designers/developers want a ruler docked *over* external desktop apps, not confined inside one webpage | Verified controls in DOM & desktop screenshots (`anruler-desktop.png`, `ginifab-desktop.png`, `piliapp-cm-unlocked.png`) |
| **Printable Actual-Size PDF Library** | `TheOnlineRuler`, `Ginifab` | `https://theonlineruler.com/` | 9+ download-ready scale-locked printable PDFs (`15cm`, `30cm`, large-print, protractor, measuring tape) | No printable PDF templates or `Download 1:1 PDF` generator | Users needing to measure curved objects, hardware in a workshop, or wrap dimensions want to print a physical strip | Inspected `theonlineruler.com` DOM links & download endpoints |
| **Mobile Immediate Top-Edge Ruler** | `AnRuler`, `Ruler.im`, `OnlineRulers` | `https://anruler.com/`, `https://ruler.im/`, `https://onlinerulers.com/` | Ticks render at `y = 0..240px` on `375×667` mobile with minimal top chrome | Header + subbar + badge + `H1` + subtitle + 3 pill pods push `#ruler-tool canvas` to `y = 781px` (`114px` below fold!) | First-time phone visitors literally do not see the measuring canvas without scrolling | Measured via Playwright `mobileBounds` (`competitor-interact.json`) + `onlinerulerplus-mobile.png` vs `anruler-mobile.png` |
| **Screen Size Finder & Converter Spokes** | `Ginifab`, `PiliApp`, `Ruler.im` | `https://www.ginifab.com/feeds/cm_to_inch/what_is_my_screen_size.html`, `https://www.piliapp.com/actual-size/what-is-my-monitor-size/` | Dedicated routes for `"What is my monitor size?"`, `"cm to inches"`, `"architect metric/imperial scale"`, `"concentric circle"` | Only 5 ruler modes + 3 documentation routes (`how-to-use`, `calibration-guide`, `faq`) | Captures high-intent upstream users who don't know their monitor diagonal *before* calibrating | Verified `HTTP 200` on competitor sub-routes in `interact-competitors.mjs` |

---

## 5. UX / UI Comparison

- **Time-to-First-Useful-Ruler (Desktop `1440×900`):**
  - **Best (`0` clicks):** `OnlineRulerPlus` (`canvasTop = 354px`, visible above fold), `AnRuler` (`y = 0`), `OnlineRulers` (`y ~ 150px`), `Ginifab` (`y ~ 80px`), `OnlineRulerTool` (`y = 0`).
  - **Worst (Friction Barrier):** `PiliApp` (blocks screen with `"Are you using 19-inch screen?"` modal), `TheOnlineRuler` (zero live screen ruler above fold), `Ruler.im` (shows perimeter ruler immediately, but marks every number as `?` until calibration confirms).
- **Calibration Onboarding Experience:**
  - `Ruler.im` has the **lowest-friction card UI**: dark overlay, giant cyan slider, `Confirm Calibration`—takes ~2 clicks.
  - `OnlineRulerTool.com` has the **smartest logic** (`Card | A4 | Letter | Custom`), **ruined visually** by a sticky AdSense overlay blocking its `Done` button (`onlinerulertool-calibrate.png`).
  - `OnlineRulerPlus` scores well (`Calibrate` scrolls smoothly to `#calibration` with Landscape/Portrait card toggle + numeric px input + `-1`/`+1` buttons + 11 diagonal chips), **but** places calibration inline further down the page instead of an instant modal overlay right over the live ruler, forcing users to scroll away from the top ticks unless they watch the preview bar.
- **Visual Polish & Cognitive Load:**
  - `OnlineRulerPlus` and `Ruler.im` look like precision engineering instruments rather than ad-stuffed blogspam. `Ginifab`, `Ruler.onl`, and `TheOnlineRuler` feel visually dated and claustrophobic under AdSense overlays (`34`, `15`, and `22` ad slots).

---

## 6. Mobile Experience Comparison (`375×667`, Touch Enabled)

| Site | Horizontal Overflow (`375px` VP) | Where Ruler Appears on First Screen | Mobile Usability Verdict |
|:---|:---|:---|:---|
| **AnRuler.com** | `False` (`0px`) | **`y = 0px`** (sticky top edge) | Clean instant edge access; slight ad intrusion mid-screen, `27` contrast warnings |
| **OnlineRulers.com** | `False` (`0px`) | **`y ~ 230px`** (full yellow 0–8 cm bar) | Very legible thumb-friendly controls; huge `300×250` AdSense below tool |
| **Ruler.im** | `False` (`0px`) | **`y = 0px`** perimeter ticks + Card CTA | Crisp zero-overflow CAD dark mode; shows `?` until card calibrated |
| **OnlineRulerPlus** | `False` (`0px`) | **`y ~ 615px` (ticks edge); `canvasTop = 781px`!** | **Fails immediate-utility test:** 3 stacked toolbar pods + Hero + Subbar bury workspace; status displays `"Desktop display"` in touch emulation |
| **OnlineRulerTool.com** | `False` (`0px`) | `y = 0px` left/top ticks | Sticky left ruler ticks slightly overlap left-aligned hero text on narrow portrait screens |
| **Ruler.onl** | `False` (`0px`) | `y ~ 530px` (bottom 20% of fold) | Top 75% consumed by 2 stacked AdSense banners |
| **Ginifab** | **`True` (`385px`)** | `y ~ 65px` | Clips right edge slightly (`+10px`); covered by sticky mobile footer ad |
| **RapidTables** | **`True` (`564px`)** | Center canvas clipped right | Unadapted desktop toolbar clips right buttons (`PrtSc` cut off) |
| **Virtual-Ruler.com** | **`True` (`635px`)** | Form fields overflow right | Cuts off `Default Palette` swatches and labels |
| **PiliApp** | **`True` (`1134px`!)** | Blocked by monitor modal | 3× horizontal scroll explosion makes mobile usage painful |

---

## 7. SEO & Content Architecture Comparison

| Metric | OnlineRulerPlus (Local Build) | Ginifab | OnlineRulerTool | Ruler.im | OnlineRulers | AnRuler | PiliApp |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **Indexable Live Status** | **Blocked (`ENOTFOUND`)** | Live `200` | Live `200` | Live `200` | Live `200` | Live `200` | Live `200` |
| **Word Count (Home)** | `2,779` words | `2,249` words | `820` words | `555` words | `476` words | `409` words | `73` words |
| **JSON-LD Schemas** | **5 types** (`Organization`, `WebSite`, `WebPage`, `WebApplication`, `FAQPage`) | `1` (`WebApplication`) | **6 types** (`+HowTo`) | `2` (`WebSite`, `FAQPage`) | `0` | `Not verified` (blocked repeat crawl) | `1` (`WebApplication`) |
| **`hreflang` Breadth** | `13` (`12` langs + `x-default`) | `0` tags (`20+` HTML links) | `13` | **`32`** | `24` | `20` | `0` |
| **Topic Cluster Spokes** | `13` routes (`cm`, `mm`, `inch`, `horizontal`, `vertical`, `guides`, `faq`) | **Broadest** (`vertical`, `image`, `architect scales`, `protractor`, `screen size`, `converters`) | `cm`, `guides/*`, `faq` | `coordinate`, `quadrant`, `concentric-circle`, `protractor` | `Not verified` | `Not verified` | `cm-ruler`, `inch-ruler`, `what-is-my-monitor-size` |

**Brutally Honest SEO Verdict:** On-page structured data and semantic depth on `OnlineRulerPlus` beat `PiliApp`, `iRuler`, `Ruler.onl`, `OnlineRulers`, and `TheOnlineRuler`, matching `OnlineRulerTool` (`+HowTo` is missing on `OnlineRulerPlus`). However, **`OnlineRulerPlus` currently has zero public domain indexation (`NXDOMAIN`)**, covers fewer languages than `Ruler.im` (`32` vs `12`) and `OnlineRulers` (`24`), and lacks high-volume **adjacent converter/utility spokes** (`what is my screen size`, `cm to inches converter`, `pixel to cm calculator`, `printable PDF ruler`, `online protractor` standalone route, `concentric circle ruler`).

---

## 8. Technical Performance & Reliability Comparison

Measured directly in Chromium (`1440×900`):

| Site | FCP (ms) | LCP (ms) | CLS | Transfer (KB) | Console / Network Errors | `axe-core` Violations | Ad Slots |
|:---|---:|---:|---:|---:|---:|---:|---:|
| **OnlineRulerPlus (Local Preview)** | `844` | `844` | `0.0007` | `148` | **`0 / 0`** | **`0`** | **`0`** |
| **Ruler.im** | `452` | `452` | **`0.0000`** | `229` | `5 broken imgs` | **`0`** | **`0`** |
| **PiliApp** | **`372`** | **`372`** | `0.1059` | `479` | `Not counted (clean load)` | `3` | `1` |
| **AnRuler** | **`372`** | **`372`** | `0.1304` | `544` | `12 console errs` | `4` | `17` |
| **Ruler.onl** | `780` | `944` | `0.2464` | `711` | `0` noted | `8` | `15` |
| **Virtual-Ruler** | `948` | `948` | `0.3491` | `6` | `0` noted | `3` | `0` |
| **iRuler.net** | `1144` | `1728` | `0.1155` | `801` | `2 console / 1 pageerr` | `3` | `7` |
| **OnlineRulerTool** | `1264` | `2680` | `0.4736` | `684` | `0` noted | `7` | `20` |
| **RapidTables** | `1232` | `1568` | `0.0051` | `100` | `0` noted | `2` | `0` (detected `adNet=false`) |
| **OnlineRulers** | `1648` | `1648` | `0.1414` | `565` | `0` noted | `6` | `11` |
| **Ginifab** | `1796` | `2048` | `0.5151` | `933` | `4 console / 5 failed` | `8` | `34` |
| **TheOnlineRuler** | `3132` | `3200` | `0.1564` | `1243` | `0` noted | `4` | `22` |

> **Engineering Note:** `OnlineRulerPlus` (`844ms` FCP on uncached local Node preview) will likely drop under `~500ms` behind a real Edge CDN (`Cloudflare`/`Vercel`), but **until deployed**, its real-world latency is infinite (`ENOTFOUND`).

---

## 9. Competitive Scoring and Rankings (1–10 Rubric)

Scores reflect strictly observed evidence under the **Zero-Bias Policy**:

| Criterion | OnlineRulerPlus (Real-World / Local) | Ruler.im | Ginifab | OnlineRulerTool | AnRuler | OnlineRulers | PiliApp | iRuler | Ruler.onl | Virtual-Ruler | RapidTables | TheOnlineRuler |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1. Core Ruler Utility | **9.0** | 8.0 | 8.5 | 8.5 | 7.5 | 7.0 | 6.5 | 6.5 | 6.0 | 5.0 | 5.0 | 3.0 |
| 2. Calibration Flexibility | 7.5 | 6.5 | **9.5** | **9.5** | 7.0 | 6.5 | 6.0 | 6.5 | 7.0 | 6.0 | 2.0 | 2.0 |
| 3. UI/UX & Visual Clarity | 8.5 | **9.0** | 4.5 | 6.5 | 6.5 | 7.0 | 5.5 | 7.0 | 4.0 | 5.5 | 6.0 | 3.5 |
| 4. Mobile Ergonomics (`375px`) | 5.5 | **8.5** | 5.0 | 7.0 | **8.5** | 8.0 | 2.0 | 7.5 | 5.0 | 3.0 | 3.5 | 4.5 |
| 5. Advanced Features (Guides/Photo/Print) | 8.0 | **8.5** | **8.5** | 8.0 | 6.5 | 5.0 | 5.5 | 3.0 | 3.0 | 7.0 | 6.0 | 6.5 |
| 6. Accessibility (WCAG/Axe) | **9.5** | **9.5** | 3.5 | 5.0 | 4.5 | 5.5 | 6.0 | 6.0 | 4.0 | 5.5 | 7.0 | 4.5 |
| 7. Performance & CWV (`CLS`/`LCP`) | 9.0 | **9.5** | 3.0 | 4.0 | 7.5 | 6.5 | 8.0 | 6.5 | 5.5 | 6.0 | 8.5 | 3.0 |
| 8. Ad Restraint & Trust UX | **10.0** | **10.0** | 2.5 | 4.0 | 4.5 | 5.5 | 8.0 | 6.5 | 4.0 | **10.0** | 9.0 | 3.0 |
| 9. SEO & Spoke Breadth | `0.0` Real *(8.0 Local)* | **8.5** | **9.0** | 8.0 | 6.5 | 6.5 | 6.0 | 3.0 | 4.5 | 2.5 | 4.5 | 5.5 |
| 10. Live Production Reliability | **0.0 (`ENOTFOUND`)** | **9.0** | 8.0 | 8.5 | 8.0 | 8.0 | 9.0 | 7.5 | 8.5 | 9.0 | 9.5 | 8.0 |
| **Product-Only Avg (Criteria 1–8)** | `8.38` | **`8.69`** | `5.63` | `6.56` | `6.56` | `6.38` | `5.94` | `6.19` | `4.81` | `6.00` | `5.88` | `3.75` |
| **Overall Real-World Avg (1–10)** | **6.70** *(8.33/9 if deployed)* | **8.70** | **6.20** | **6.90** | **6.70** | **6.55** | **6.25** | **6.00** | **5.15** | **5.95** | **6.10** | **4.35** |
| **Final Competitive Rank** | **#3 (Tie Real-World)** / **#2 (Product)** | **#1** | **#7** | **#2** | **#3 (Tie)** | **#5** | **#6** | **#9** | **#11** | **#10** | **#8** | **#12** |

> *Why OnlineRulerPlus ranks #3 Real-World (`6.70`) yet #2 Product-Only (`8.38`):* Its core ad-free engineering (`0.0007` CLS, `0` Axe errors, multi-edge + protractor + floating ruler) cleanly outscores cluttered incumbents like `Ginifab` (`6.20` overall due to `0.515` CLS, `8` Axe errors, `34` ads) and `OnlineRulerTool` (`6.90` overall, `6.56` Product-Only). Yet `0.0` public reachability (`ENOTFOUND`) keeps it behind `#1 Ruler.im` (`8.70`) and `#2 OnlineRulerTool` (`6.90`) in real-world usability today. Once deployed and indexed, solving mobile fold pushdown (`5.5`), expanded physical calibration (`7.5`), and photo/print gaps moves it toward **#1 parity**.

---

## 10. Features We Are Missing (High-Value Gaps)

1. **Public Deployment & Valid DNS (`onlinerulerplus.com`):** Currently returns `NXDOMAIN` (`DNS_ERROR_RCODE_NAME_ERROR`).
2. **Everyday Multi-Object Calibration Inputs (`A4`, `US Letter`, `Localized Banknotes`, `CD 120mm`, `Custom Known Length`):** Competitors allow calibrating with paper or any known reference object; `OnlineRulerPlus` restricts interactive calibration to bank card or diagonal.
3. **Interactive Image / Screenshot Measurement Mode (`/image-ruler`):** Ability to upload a photo or paste (`Ctrl+V`) a screenshot, set a known scale between two points (e.g., an A4 sheet or coin in the photo), and measure distances/angles across the photo (**Ruler.im**, **OnlineRulerTool**, **Ginifab**, **RapidTables**, **Virtual-Ruler** all serve slices of this workflow).
4. **Printable Actual-Size 1:1 PDF Templates (`/printable-ruler`):** Generating exact-scale (`15cm`, `30cm`, `12in`, printable protractor, scale strips) PDF sheets ready for A4/Letter printing without browser margin shrinkage (**TheOnlineRuler**, **Ginifab**).
5. **Detached Popup Window (`Popup Mode`):** Opening a minimal top-edge ruler inside a compact resizable `window.open` popup for side-by-side measurement inside native desktop apps (**Ginifab**, **AnRuler**, **PiliApp**).
6. **Pure-Canvas Collapse Toggle (`Zen / Hide Info`):** One-click toggle to hide hero text and cards above `#ruler-tool` without forcing full-screen browser lockout (**OnlineRulerTool**).
7. **Mobile Above-the-Fold Sticky Ruler Priority:** Ensuring `375×667` mobile users see the calibrated ruler bar in the **top 200px** rather than scrolling past hero badges and 3 stacked toolbar pods.
8. **Standalone Traffic-Capture Utility Spokes:** `/what-is-my-screen-size`, `/cm-to-inches`, `/mm-to-inches`, `/ppi-calculator`, `/protractor`, `/concentric-circle` (`Ruler.im`, `Ginifab`, `PiliApp`).
9. **Interactive Coin Calibration Presets:** Turning the passive coin badges (`Quarter`, `€1`, `₹5`, `₹10`) into clickable calibration presets like credit cards.
10. **Iframe Embed Snippet (`PiliApp`):** Easy `<iframe>` generator for STEM teachers, e-commerce sellers, and blogs wanting to embed an ad-free ruler.

---

## 11. Features Competitors Are Missing (Where OnlineRulerPlus Wins)

No audited single competitor combines all of these verified capabilities in one tool:
1. **Simultaneous 4-Edge Perimeter Rulers (`All Edges`)** paired with `Top`/`Bottom`/`Left`/`Right` switching (`Ruler.im` only does Top+Left; `AnRuler` only Top or rotated; `OnlineRulers` only H/V strip).
2. **Movable, Rotatable `+ Floating Ruler`** that sits directly over rotated physical parts or angled diagrams inside the canvas.
3. **Integrated `180° Protractor` + Draggable X/Y `Guides` + `Crosshair Delta HUD` + `Measurement History` Log** inside the same clean workspace without page reloads or ads.
4. **`Dual cm/in` Combined Ticks + `px` + `mm` Fine Scale** without sacrificing layout stability (`CLS = 0.0007`, `0` Axe errors, `0` ads).
5. **Passive Coin Verification Gauges** rendered cleanly inline to spot-check calibration drift immediately after adjusting a slider (`US Quarter 24.26mm`, `€1 23.25mm`, `₹5 23.00mm`, `₹10 27.00mm`).

---

## 12. Unique Competitive Opportunities

1. **Position as the "Zero-Ad, Zero-Shift Precision Instrument":** `Ginifab` (`0.515` CLS, `34` ads), `OnlineRulerTool` (`0.474` CLS, `20` ads literally blocking its calibration modal), `Ruler.onl` (`0.246` CLS, `15` ads), and `TheOnlineRuler` (`3.2s` LCP, `22` ads) alienate precision users with intrusive AdSense clutter. Keeping the core workspace **completely ad-free** while owning `0.000` CLS creates genuine word-of-mouth moat (`Ruler.im` proved users love clean UI, and `OnlineRulerPlus` can out-feature `Ruler.im`!).
2. **Unified "Screen + Photo + Print" Triad:** Currently, users must bounce across **3 different websites** depending on task (`AnRuler`/`OnlineRulerPlus` for screen measurement -> `Ruler.im`/`Virtual-Ruler` for photo overlay -> `TheOnlineRuler` for printable PDF). Combining Screen Ruler + Client-Side Photo Calibrator + 1:1 Print PDF Export makes `OnlineRulerPlus` the definitive category bookmark.
3. **B2B / Educator `iframe` Embed & Bookmarkable Calibrated Share Links:** Neither `Ruler.im` nor `OnlineRulerTool` offers a sleek clean embed mode; `PiliApp`'s dated `iframe embed` shows clear demand from classrooms, hardware forums, and craft blogs.

---

## 13. Weaknesses of My Website (`OnlineRulerPlus`)

Brutal, zero-sugarcoating summary of actual issues observed:
1. **Zero Live Internet Reachability (`ENOTFOUND`):** Site does not resolve publicly via DNS yet—100% invisible to Google and real users today.
2. **Severe Mobile Above-the-Fold Pushdown (`375×667`):** Hero headline, badge, buttons, and 3 wrapped toolbar cards push the actual ruler canvas (`canvasTop = 781px`) **below the bottom of a standard smartphone screen**, forcing first-time mobile visitors to scroll before measuring!
3. **Inaccurate Device Label Bug on Mobile Touch Emulation:** `onlinerulerplus-mobile.png` clearly shows **`96.0 PPI · Desktop display`** on a `375×667` viewport. Relying on UA string alone instead of `window.innerWidth`/pointer coarseness creates distrust with observant mobile testers.
4. **Toolbar Density & Duplicate `"Calibrate"` CTAs Above Fold:** On desktop (`1440×900`), **four** separate calibration triggers appear simultaneously within the top 300px (`Calibrate` in sub-header, `Calibrate Your Screen` CTA, `Calibrate ↓` inside toolbar, plus `#calibration` below)—visually repetitive and steals vertical canvas height.
5. **Single-Object Calibration Bottleneck:** Only credit/ID cards can be visually resized to calibrate PPI (despite already displaying 4 standard coin dimensions right underneath!). No A4 paper, US Letter, or custom known-length calibration.
6. **Zero Photo / Clipboard Image Support:** Cannot paste a screenshot or upload a photo to measure ratios/lengths remotely.
7. **Zero Printable PDF Exports or Popup Window Mode.**
8. **Zero Unit Converter / Monitor-Diagonal Spokes (`what-is-my-screen-size`, `cm-to-inches`, `ppi-calculator`)** to catch pre-calibration and adjacent search queries.

---

## 14. Weaknesses of Competitor Websites

- **Epidemic Ad-Driven Layout Instability:** `Ginifab` (`CLS 0.515`), `OnlineRulerTool` (`0.474`), `Virtual-Ruler` (`0.349`), `Ruler.onl` (`0.246`), `TheOnlineRuler` (`0.156`), `OnlineRulers` (`0.141`), and `AnRuler` (`0.130`) suffer heavy visual jumping caused by late-loading AdSense slots (`OnlineRulerTool`'s ad even blocks its own calibration controls!).
- **Widespread Accessibility Neglect:** `10` of `11` live competitors fail `axe-core` WCAG 2.1 checks (`AnRuler` `27` contrast errors, `Ginifab` missing `html[lang]` + `17` unnamed links, `TheOnlineRuler` `14` contrast errors, disabled pinch-zoom `meta-viewport` traps on `PiliApp`, `iRuler`, `OnlineRulerTool`, `TheOnlineRuler`, `Virtual-Ruler`).
- **Broken Mobile Layouts:** `PiliApp` (`1134px`), `Virtual-Ruler` (`635px`), `RapidTables` (`564px`), and `Ginifab` (`385px`) spill horizontally on `375px` mobile viewports.
- **Rigid or Confusing Calibration States:** `PiliApp` blocks first entry with a modal; `Ruler.im` renders `?` on every tick until card calibration finishes; `AnRuler` throws `12` console errors; `Ruler.im` had `5` broken image URLs; `TheOnlineRuler` hides no interactive screen ruler above fold (`3.2s` LCP).

---

## 15. Prioritized Recommendations

| Priority | Action Item | Implementation Complexity | Pros | Cons / Risks | Expected Impact |
|:-:|:---|:---|:---|:---|:---|
| **Priority 1 (Immediate Launch Blocker)** | **Configure Production DNS, SSL & Deploy Live Site + Fix Mobile `"Desktop display"` Status Label** | **Low** (DNS/Deploy + ~10-line label heuristic) | Unlocks live indexing, removes `#1` fatal `ENOTFOUND` blocker, stops displaying `"Desktop display"` on `375px` screens | Requires hosting/domain DNS provisioning & GSC sitemap submission | Moves live reliability from **`0` → `9.0+`**; enables SEO crawl of `156` built pages |
| **Priority 2 (Core UX & Conversion)** | **Mobile First-Screen Fix + Desktop `"Pure Ruler"` Collapse + Deduplicate `Calibrate` CTAs** *(put calibrated top ticks at `y ≤ 120px` on `375px`, collapse hero banner by default or via 1-click toggle, keep 1 clear Calibrate trigger opening an inline modal)* | **Medium** (CSS/layout restructure, compact mobile control bar) | Matches `AnRuler`/`Ruler.im` instant-start UX without sacrificing `OnlineRulerPlus` power features; boosts mobile retention dramatically | Must test carefully so `CLS` stays `~0.000` across breakpoints | Fixes the worst mobile UX flaw (`canvasTop 781px → ~150px`) and eliminates duplicate CTA clutter |
| **Priority 3 (Calibration Parity)** | **Expand Physical Calibration Inputs (`A4 297mm`, `US Letter 11in`, `Coin Click-to-Calibrate`, `Custom Known Length`, Localized Banknotes)** | **Medium** (extend existing `#calibration` logic using stored PPI math) | Surpasses `OnlineRulerTool` & matches `Ginifab` calibration convenience using objects users already hold (coins are already drawn!) | Slightly richer tab UI must stay simple for casual users | Unlocks calibration for users without a bank card or unsure of laptop diagonal |
| **Priority 4 (Feature Expansion & Utility Parity)** | **Add `/image-ruler` (Photo + `Ctrl+V` Screenshot Reference Measurement), `/printable-ruler` (1:1 PDF Export), & `Popup Window` Mode** | **Medium-High** (isolated client canvas tools + `@media print` SVG generator) | Closes all three missing workflow verticals (`Ruler.im` + `Virtual-Ruler` + `TheOnlineRuler` + `AnRuler` Popup) while remaining `100%` ad-free | Increases maintenance surface; image tool requires clear UX for setting 2-point reference length | Turns `OnlineRulerPlus` into a full Screen + Image + Print suite |
| **Priority 5 (Organic Growth & Spoke Expansion)** | **Build Programmatic Utility Spokes (`/what-is-my-screen-size`, `/cm-to-inches`, `/ppi-calculator`, `/protractor`, `/concentric-circle`) + Expand `hreflang` from `12` to `25–32` Languages + `<iframe>` Educator Embed** | **Medium** (template Astro routes + i18n JSON bundles) | Captures high-volume adjacent search keywords, builds natural educational backlinks via `<iframe>` embeds, challenges `Ruler.im` (`32` langs) globally | High translation QA effort across `25+` locales | Compounding non-branded organic traffic growth once domain ages |

---

## 16. Evidence, Screenshots, and Source URLs

All telemetry and visual findings were captured directly in this session via real Chrome automation:

- **Structured Telemetry & Probes:**
  - Audit JSON (`12` sites, Desktop `1440×900` + Mobile `375×667`, CWV, Axe, Ads): [competitor-audit.json](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-audit.json)
  - Deep DOM Links, Headings & Controls: [competitor-deep.json](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-deep.json)
  - Interactive User Journey & Calibration Probe: [competitor-interact.json](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-interact.json)
- **Key Inspected Screenshots (`competitor-shots/`):**
  - **OnlineRulerPlus:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/onlinerulerplus-desktop.png) | [Mobile `375×667`](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/onlinerulerplus-mobile.png)
  - **Ruler.im:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/ruler-im-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/ruler-im-mobile.png) | [Calibrate Modal](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/ruler-im-calibrate.png)
  - **OnlineRulerTool.com:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/onlinerulertool-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/onlinerulertool-mobile.png) | [Calibrate Modal + Ad Overlap](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/onlinerulertool-calibrate.png)
  - **Ginifab:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/ginifab-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/ginifab-mobile.png)
  - **PiliApp:** [Desktop Modal](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/piliapp-cm-desktop.png) | [Desktop Unlocked](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/piliapp-cm-unlocked.png) | [Mobile Overflow](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/piliapp-cm-mobile.png)
  - **RapidTables:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/rapidtables-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/rapidtables-mobile.png)
  - **iRuler.net:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/iruler-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/iruler-mobile.png)
  - **TheOnlineRuler:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/theonlineruler-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/theonlineruler-mobile.png)
  - **Ruler.onl:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/ruler-onl-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/ruler-onl-mobile.png)
  - **OnlineRulers.com:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/onlinerulers-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/onlinerulers-mobile.png)
  - **Virtual-Ruler.com:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/virtual-ruler-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/virtual-ruler-mobile.png)
  - **AnRuler.com:** [Desktop](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/anruler-desktop.png) | [Mobile](file:///C:/Users/vipul/.gemini/antigravity-cli/brain/bba22495-7a73-4cca-b6be-c8913b37b960/scratch/competitor-shots/anruler-mobile.png)

---

## 17. Limitations and Unverified Findings

To maintain strict analytical integrity, the following items are explicitly classified as **`Not verified`** or **`Blocked`**:
1. **`https://onlinerulerplus.com/` Live Hosting & CDN Performance (`Not verified / Blocked`):** Public DNS lookup failed (`DNS_ERROR_RCODE_NAME_ERROR` / `ENOTFOUND`). All `OnlineRulerPlus` scores labeled "Local Build" reflect the compiled production bundle (`dist/`) on localhost, **not** live internet TTFB, SSL certificate chain, or CDN edge caching.
2. **Real Organic Traffic, Backlinks, Domain Authority & Google SERP Positions (`Not verified`):** No external SEO authority/traffic API (Ahrefs, Semrush, Similarweb, Google Search Console, CrUX field data) was accessible; organic traffic volume and domain authority are intentionally omitted rather than estimated.
3. **`https://onlineruler.org/` (`Blocked — Anti-Bot Gate`):** Returned HTTP `403` Cloudflare verification (`"Checking your browser before accessing. Just a moment..."`); omitted to comply with anti-bot policies.
4. **`https://preciseruler.com/` (`Blocked — Network Error`):** Failed connection during live competitor verification.
5. **Secondary Sub-Route Crawls on `OnlineRulers.com` and `AnRuler.com` (`Partially verified`):** Initial live Chrome visit captured full metrics and desktop/mobile screenshots cleanly (`status 200`), while subsequent rapid DOM crawl calls encountered Cloudflare rate/WAF blocking (`"Sorry, you have been blocked"`), so deep inner sub-pages on those two domains remain `Not verified`.
6. **Physical Glass Screen Tolerance Testing (`Not verified`):** Physical accuracy was tested via code DOM/pixel geometry rather than holding an external calibrated steel Mitutoyo/Starrett physical ruler against physical monitor glass in the room.
