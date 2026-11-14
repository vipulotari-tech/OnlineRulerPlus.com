# SEO Keyword Research, Intent Mapping & Content Strategy — OnlineRulerPlus.com

- **Target Domain**: `https://onlinerulerplus.com`
- **Primary Skill Applied**: `claude-seo` (`AgriciDaniel/claude-seo` v2.6.0 — `seo-content`, `seo-cluster`, `references/quality-gates.md`, `references/eeat-framework.md`) combined with `seo-audit` (`coreyhaines31/marketingskills` — `references/title-tags.md`, `references/rankings-push.md`)
- **Date**: November 14, 2026

> **Data Integrity Note**: Per project governance and `claude-seo` truthfulness rules, this strategy distinguishes between **measured SERP / codebase observations** and **relative demand tiers**. No fabricated monthly search volume numbers, backlink counts, or unverified ranking claims are invented.

---

## 1. Product Understanding & Core Search Value Proposition

**OnlineRulerPlus.com** is a client-side physical screen metrology application. Visitors arrive with an immediate practical goal: **they have a physical object in their hand (a screw, ring, coin, watch strap, package, card, or print) and no physical ruler nearby, or they need to inspect viewport pixel dimensions on their display.**

### Why Most Competitor Online Rulers Fail the User's Intent
Live SERP analysis across our target keyword clusters identified the dominant incumbent pages (`ginifab.com/feeds/cm_to_inch/actual_size_ruler.html`, `onlinerulertool.com`, `anruler.com`, `ruler.onl`, `iruler.net`, `piliapp.com/actual-size/cm-ruler/`, `printablerulers.net`, `inchcalculator.com`):

| Competitor Archetype | Strengths Observed in SERP | Critical UX / SEO Weaknesses Exploited by OnlineRulerPlus.com |
| :--- | :--- | :--- |
| **Legacy Ad-Heavy Utility Sites** (`ginifab.com`, `piliapp.com`, `iruler.net`) | High domain age; rank for `actual size online ruler` and `cm ruler online`; include basic PPI/card calibration and conversion text. | Cluttered mid-2010s UI with intrusive display ads shifting layout (poor CLS); single-edge rulers; weak mobile portrait calibration; dated HTML structure with low passage citability for AI Overviews. |
| **Minimalist Single-Screen Rulers** (`ruler.onl`, `anruler.com`) | Fast load times; clean minimal canvas; rank for `online ruler` and `inches ruler online`. | Thin textual content (<250 words) on tool pages; lack comprehensive 1/16″ fraction conversion tables, M2–M10 fastener charts, or multi-edge (Top/Bottom/Left/Right) + floating ruler + 180° protractor capabilities. |
| **Dedicated Printable PDF Sites** (`printablerulers.net`, `labelvalue.com`, `vendian.org`) | Dominate `printable ruler` SERPs with dozens of downloadable PDF templates. | Cannot measure objects directly on screen without a physical printer; static PDF downloads lack interactive calibration or guide-line span subtraction. |

---

## 2. Target Keyword Cluster Evaluation & Page Existence Decisions

In accordance with the directive *"Do not blindly create pages for every keyword. Evaluate keyword demand, search intent, competition and SERP features before deciding which pages deserve to exist"*, we evaluated all 10 core keyword clusters:

| Keyword Cluster | Primary Search Intent | SERP Features Observed | Relative Demand Tier | Strategic Page Decision | Target Canonical URL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. `online ruler`** | **Transactional / Utility** (Immediate interactive tool) | Interactive tool snippets, People Also Ask (calibration, accuracy), AI Overviews | **Tier 1 (Head Term — Highest)** | Serve on Homepage Hub (`/`) with interactive multi-unit ruler above the fold (`y < 400px`). | `https://onlinerulerplus.com/` |
| **2. `actual size online ruler`** | **Transactional + Informational** (Calibrated 1:1 physical scale) | People Also Ask ("How to get actual size ruler on screen?"), AI Overviews | **Tier 1 (Core Head Modifier)** | Co-target on Homepage Hub (`/`) via `<title>`, `<h1>`, ISO/IEC 7810 ID-1 credit card calibration, and 96 PPI error table. **Do NOT create a separate `/actual-size-ruler` page** (would cannibalize `/` 100%). | `https://onlinerulerplus.com/` |
| **3. `online measuring ruler`** | **Transactional / Utility** | Identical SERP to `online ruler` and `actual size online ruler` | **Tier 2 (Synonym Cluster)** | Fold into Homepage Hub (`/`) and `/how-to-use` semantic copy. **Do NOT create a separate page** (identical SERP intent to `/`). | `https://onlinerulerplus.com/` |
| **4. `cm ruler online`** | **Transactional / Utility (Metric)** | Dedicated metric ruler pages (`piliapp`, `ginifab`, `anruler`), conversion PAA boxes | **Tier 1 (Primary Metric Spoke)** | Serve on dedicated `/cm-ruler` spoke page (`forceUnit="cm"`), differentiated with 1–30 cm conversion table and metric reference objects. | `https://onlinerulerplus.com/cm-ruler` |
| **5. `centimeter to inch` measurement guidance** | **Informational + Utility** (`1 in = 2.54 cm`, `1 cm = 0.3937 in`, 15 cm / 30 cm ruler equivalents) | Direct Answer / Unit Converter box, comparison tables, People Also Ask | **Tier 1 (High Informational Demand)** | **Integrate directly into `/cm-ruler` and `/faq`** via a comprehensive 1–30 cm to mm, decimal inch, and nearest 1/16″ fraction table + Dual cm/in workspace mode. **Do NOT create a standalone converter page** that would compete against Google's built-in widget without ruler utility. | `https://onlinerulerplus.com/cm-ruler` |
| **6. `inches ruler online`** | **Transactional / Utility (Imperial)** | Dedicated inch ruler pages, 1/16″ fraction reading diagrams, PAA | **Tier 1 (Primary Imperial Spoke)** | Serve on dedicated `/inch-ruler` spoke page (`forceUnit="in"`), differentiated with 1/16″ dyadic fraction guide and US coin verification benchmarks. | `https://onlinerulerplus.com/inch-ruler` |
| **7. `12 inch online ruler`** | **Transactional / Utility (Imperial Foot Scale)** | Same top-ranking URLs as `inches ruler online` (`anruler`, `ginifab`, `onlinerulertool`) | **Tier 2 (High-Intent Long-Tail)** | **Co-target directly on `/inch-ruler`** in `<title>`, `<h1>`, `<h2>`, and a dedicated "How to Display a Full 12-Inch Online Ruler on Screen" section. Creating a separate `/12-inch-ruler` URL would duplicate `/inch-ruler`. | `https://onlinerulerplus.com/inch-ruler` |
| **8. `mm ruler online`** | **Transactional / Utility (Fine Pitch Metric)** | Metric/mm ruler pages, hardware/jewelry sizing queries | **Tier 2 (Precision Metric Spoke)** | Serve on dedicated `/mm-ruler` spoke page (`forceUnit="mm"`), differentiated with M2–M10 ISO fastener and 18–22 mm watch lug sizing tables. | `https://onlinerulerplus.com/mm-ruler` |
| **9. `screen ruler` / `pixel ruler`** | **Hybrid Utility** (Physical screen measurement + W3C CSS pixel `px` UI inspection) | Mix of web screen rulers, Chrome extensions, and desktop utilities | **Tier 2 (Designer & Desktop Spoke)** | Target across `/` and **`/horizontal-ruler`** (`Horizontal Online Screen & Pixel Ruler`), featuring simultaneous Top & Bottom strips, `px` mode (Shortcut `3`), and a 16:9/16:10/21:9 monitor viewport width table. | `https://onlinerulerplus.com/horizontal-ruler` |
| **10. `printable ruler`** | **Transactional (Downloadable PDF) + Informational (100% Print Scale)** | Dominated by PDF template libraries (`printablerulers.net`, `inchcalculator.com`, `labelvalue.com`) | **Tier 2 (Adjacent Intent)** | **Do NOT create a thin standalone `/printable-ruler` page.** Instead, add `@media print` ink-friendly stylesheet rules in `src/styles/global.css` and a dedicated **"How to Print an Actual-Size Ruler at 100% Scale"** verification guide on `/how-to-use` and `/faq`. | `https://onlinerulerplus.com/how-to-use` |

---

## 3. Hub-and-Spoke Topical Authority Architecture (`claude-seo` `seo-cluster`)

OnlineRulerPlus.com is structured as a tight **13-URL topical cluster** with zero orphan pages, zero thin programmatic pages, and maximum 1-click crawl depth from any page on the site:

```
                    [ https://onlinerulerplus.com/ ]
              (Pillar Hub: Actual-Size Online Ruler Workspace)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
[Unit & Axis Spokes]      [Technical & User Guides]    [Trust & E-E-A-T Pages]
 ├─ /cm-ruler              ├─ /calibration-guide        ├─ /about
 │  (cm + cm-to-inch)      │  (PPI math, ISO 7810,      │  (96 PPI fallacy,
 ├─ /inch-ruler            │   W3C CSS px, coins)       │   NIST/ISO standards)
 │  (1/16" + 12-inch)      ├─ /how-to-use               ├─ /contact
 ├─ /mm-ruler              │  (3-step manual, overlays, │  (Hardware profile DB
 │  (1 mm + M2-M10/lugs)   │   100% print scale guide)  │   submission guide)
 ├─ /horizontal-ruler      └─ /faq                      ├─ /privacy
 │  (Top/Bottom + CSS px)     (16 categorized Q&As)     │  (100% localStorage)
 └─ /vertical-ruler                                     └─ /terms
    (Left/Right + Portrait)                                (Metrology disclaimer)
```

---

## 4. On-Page Title, Meta Description & H1 Matrix (All 13 Canonical Pages)

Every `<title>` tag was engineered following Corey Haines's `title-tags.md` and `ai-writing-detection.md` (primary keyword front-loaded, `|` pipe separator, zero em-dashes, 49–59 characters) and verified with `claude-seo`'s `page_checks.py`:

| Route | Optimized `<title>` (Length) | Optimized `<meta name="description">` (Length) | Primary `<h1>` |
| :--- | :--- | :--- | :--- |
| `/` | `Online Ruler \| Actual-Size Screen Ruler (cm, mm, Inches)` (56c) | `Free calibrated actual-size online ruler in centimeters (cm), millimeters (mm), 1/16″ inches, and pixels. Calibrate with a bank card or screen diagonal.` (152c) | `Actual-Size Online Ruler in cm, mm & Inches` |
| `/cm-ruler` | `CM Ruler Online \| Actual-Size Centimeter Ruler & cm to in` (57c) | `Calibrated actual-size online centimeter ruler (cm) with 1 mm and 5 mm ticks, 1–30 cm to inch conversion chart, and ISO/IEC 7810 bank card calibration.` (151c) | `Actual-Size Online Centimeter Ruler (cm)` |
| `/inch-ruler` | `Inches Ruler Online \| Actual-Size 12-Inch & 1/16″ Ruler` (55c) | `Calibrated actual-size online inch ruler with 1/2, 1/4, 1/8, and 1/16″ markings, 12-inch foot ruler guide, and fraction-to-mm conversion chart.` (143c) | `Actual-Size Online Inch Ruler (1/16″ & 12-Inch Scale)` |
| `/mm-ruler` | `MM Ruler Online \| Calibrated Millimeter Screen Ruler (mm)` (57c) | `Calibrated actual-size online millimeter ruler (mm) with 1 mm and 5 mm graduations, M2–M10 fastener & watch lug size chart, and ISO/IEC 7810 card calibration.` (158c) | `Actual-Size Online Millimeter Ruler (mm)` |
| `/horizontal-ruler` | `Horizontal Online Ruler \| Top & Bottom Screen & Pixel Ruler` (59c) | `Full-width horizontal online screen ruler with simultaneous Top and Bottom edges in cm, mm, inches, and CSS pixels (px) for wide objects and UI spans.` (150c) | `Full-Width Horizontal Online Screen & Pixel Ruler` |
| `/vertical-ruler` | `Vertical Online Ruler \| Left & Right Edge Screen Scale` (54c) | `Calibrated vertical online screen ruler with simultaneous Left and Right edge measurement scales in centimeters (cm), millimeters (mm), and 1/16″ inches.` (153c) | `Calibrated Vertical Online Screen Ruler` |
| `/how-to-use` | `How to Use an Online Ruler \| Screen Measurement Manual` (54c) | `Step-by-step instructions for calibrating your screen with a credit card or diagonal, placing guide lines, reading 1/16″ fractions, and printing at 100%.` (153c) | `How to Use Online Ruler Plus` |
| `/calibration-guide` | `Screen Calibration & PPI Guide \| Online Ruler Plus` (50c) | `Technical guide to screen pixel density (PPI), W3C CSS reference pixels, ISO/IEC 7810 credit card calibration, and reading metric and 1/16″ inch rulers.` (152c) | `Complete Screen Calibration & PPI Measurement Guide` |
| `/faq` | `Online Ruler FAQ \| Calibration, PPI & 1/16″ Guide` (49c) | `Answers to 16 common questions about online screen ruler calibration, CSS pixels vs physical PPI, 1/16″ inch fractions, multi-monitor setups, and mobile use.` (157c) | `Frequently Asked Questions` |
| `/about` | `About Online Ruler Plus \| Precision Screen Metrology` (52c) | `Learn how Online Ruler Plus turns laptops, desktop monitors, tablets, and phones into calibrated physical measuring rulers with zero tracking or camera prompts.` (160c) | `About Online Ruler Plus` |
| `/contact` | `Contact & Display Profile Submissions \| Online Ruler Plus` (57c) | `Contact the Online Ruler Plus team to submit a hardware display profile, report a calibration issue, or ask technical screen measurement questions.` (147c) | `Contact Online Ruler Plus` |
| `/privacy` | `Privacy Policy \| Online Ruler Plus (100% Client-Side)` (53c) | `Privacy Policy for OnlineRulerPlus.com. All ruler measurements, guide coordinates, and display calibrations are processed and stored locally in your browser.` (157c) | `Privacy Policy` |
| `/terms` | `Terms of Use & Metrology Disclaimer \| Online Ruler Plus` (55c) | `Terms of Use and metrology accuracy disclaimer for Online Ruler Plus. Review display calibration limitations, optical parallax factors, and hardware care.` (154c) | `Terms of Use & Metrology Disclaimer` |

---

## 5. E-E-A-T Strategy (`claude-seo` `references/eeat-framework.md`)

Without inventing fake author personas or fabricated user reviews, we strengthened verifiable **Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T)** through transparent engineering and standards citations:
1. **Experience (First-Hand Hardware & Optical Testing)**:
   - Documented real hardware viewport and pixel-pitch behavior across 8 common laptop/desktop panels (`13.3" MacBook Air`, `14.2" MacBook Pro`, `15.6" FHD Laptop at 100% & 125%`, `24" 1080p`, `27" 1080p/QHD/4K`), explaining why uncalibrated 96 PPI rulers produce `+17.6%` error on a 27-inch 1080p monitor and `-24.4%` error on a 14-inch MacBook Pro.
   - Provided practical optical alignment guidance (16px bezel inset datum, cover-glass parallax mitigation, portrait card alignment for narrow `<400px` mobile screens).
2. **Expertise (Mathematical & Standards Rigor)**:
   - Explicit formulas (`Physical PPI = √(W² + H²) / diagonalInches`, `pxPerMm = cardWidthPx / 85.60`, `devicePxPerMm = pxPerMm × dpr`) and primary standard citations (**W3C CSS Values and Units Module Level 4**, **ISO/IEC 7810:2019 ID-1**, **NIST / BIPM 1959 International Yard and Pound Agreement `1 in = 25.4 mm`**, **United States Mint** coin specifications, **European Central Bank** Euro coin specifications, **ISO 216** A4 paper, and **ISO 261 / DIN 13** M2–M10 metric screw threads).
3. **Trustworthiness (Honest Accuracy Disclosure & Privacy Transparency)**:
   - Live status badges distinguish between `Estimated calibration` (96 PPI fallback), `Detected profile` (device database match), and `Calibrated manually` (user-verified).
   - Clear metrology scope disclaimer on `/terms` and `/calibration-guide` stating that browser rulers must not replace NIST-traceable physical calipers in medical or safety-critical machining.
   - Full disclosure of the 4 client-side `localStorage` keys (`orp:calibration:v1`, `orp:preferences:v1`, `orp:history:v1`, `orp:theme`) on `/privacy`.
