# Keyword Mapping & Intent Architecture — OnlineRulerPlus.com

**Primary Target Keyword:** `Online Ruler`  
**Audience Focus:** US English primary (inches first alongside metric cm/mm)  
**Architecture Principle:** Map keywords to distinct user intents across existing dedicated pages—no keyword stuffing and no doorway pages.

---

## 1. Site-Wide Keyword Mapping Table

| Page Route | Canonical URL | Primary Intent / Target Keyword | Supporting Keywords Mapped | Page Role & Title (Len) |
|:---|:---|:---|:---|:---|
| `/` | `https://onlinerulerplus.com/` | **`online ruler`** (Core interactive tool) | `free online ruler`, `online ruler actual size`, `actual size online ruler`, `online ruler to scale`, `accurate online ruler`, `online ruler tool`, `real online ruler`, `online ruler camera` (limitations FAQ) | `Online Ruler \| Free Actual-Size Ruler in Inches, cm & mm` (`56`) |
| `/inch-ruler` | `https://onlinerulerplus.com/inch-ruler` | **`online ruler inches`** | `online ruler inches actual size`, `12 inch online ruler`, `online ruler 12 inch` | `Inches Ruler Online \| Actual-Size 12-Inch & 1/16″ Ruler` (`55`) |
| `/cm-ruler` | `https://onlinerulerplus.com/cm-ruler` | **`online ruler cm`** | `online ruler in cm`, cm-to-inch conversion chart | `CM Ruler Online \| Actual-Size Centimeter Ruler & cm to in` (`57`) |
| `/mm-ruler` | `https://onlinerulerplus.com/mm-ruler` | **`online ruler mm`** | `online ruler in mm`, `mm online ruler`, metric fastener/PCB tables | `MM Ruler Online \| Calibrated Millimeter Screen Ruler (mm)` (`57`) |
| `/horizontal-ruler` | `https://onlinerulerplus.com/horizontal-ruler` | Horizontal screen & CSS pixel ruler | Wide object & viewport px measurement (`Top` + `Bottom` active strips) | `Horizontal Online Ruler \| Top & Bottom Screen & Pixel Ruler` (`59`) |
| `/vertical-ruler` | `https://onlinerulerplus.com/vertical-ruler` | Vertical screen & portrait mobile ruler | Height measurement, portrait phone strips (`Left` + `Right` active edges) | `Vertical Online Screen Ruler \| Left & Right Edge Scale` (`54`) |
| `/calibration-guide` | `https://onlinerulerplus.com/calibration-guide` | Display PPI calibration & scale precision | `accurate online ruler`, `online ruler to scale`, W3C 96 CSS PPI formula | `Screen Calibration & PPI Guide \| Online Ruler Plus` (`50`) |
| `/how-to-use` | `https://onlinerulerplus.com/how-to-use` | Step-by-step usage manual & shortcuts | `online ruler tool`, guide lines, protractor, 100% print scale notes | `How to Use an Online Ruler \| Screen Measurement Manual` (`54`) |
| `/faq` | `https://onlinerulerplus.com/faq` | Measurement & Office/phone Q&As | Phone vs. camera measurement, Word/PowerPoint Online rulers, multi-monitor persistence | `Online Ruler FAQ \| Calibration, PPI & 1/16″ Guide` (`49`) |

---

## 2. Homepage Placement of Primary & Supporting Terms

Rather than cramming all 17 secondary variations unnaturally onto `/`, homepage copy places exact terms only where helpful to readers:

- **Title & H1:** `Online Ruler` opens `<title>` (`Online Ruler | Free Actual-Size Ruler in Inches, cm & mm`) and appears prominently in `H1` (`Actual-Size Online Ruler in Inches, cm & mm`).
- **Meta Description & Hero:** Incorporates `free actual-size online ruler`, `to scale`, and `accurate`.
- **Section 1 Supporting Guide (`#how-it-works`):** Naturally explains `free online ruler`, `12-inch online ruler`, `mm online ruler`, `accurate online ruler to scale`, and `real online ruler` while linking contextually to `/inch-ruler`, `/cm-ruler`, `/mm-ruler`, `/calibration-guide`, and `/vertical-ruler`.
- **Section 4 FAQ (`#faq`):** Addresses `online ruler camera` limitations honestly under *"Can I use my camera as a ruler?"* alongside smartphone, Word Online, and PowerPoint Online intents.

---

## 3. Compliance & Relevance Metrics (Observed Post-Edit via `claude-seo`)

Measured on compiled HTML across core tool pages via `page_checks.py` (`findings=0` on every page):

| Route | Title Relevance Score | Description Relevance Score | Word Count (HTML `page_checks`) | H1 Count |
|:---|:---|:---|:---|:---|
| `/` | `1.0` | `1.0` | `2,941` | `1` |
| `/inch-ruler/` | `1.0` | `0.91` | `2,383` | `1` |
| `/cm-ruler/` | `1.0` | `1.0` | `2,375` | `1` |
| `/mm-ruler/` | `1.0` | `1.0` | `2,441` | `1` |
| `/horizontal-ruler/` | `1.0` | `1.0` | `2,204` | `1` |
| `/vertical-ruler/` | `1.0` | `1.0` | `2,287` | `1` |
| `/calibration-guide/` | `1.0` | `1.0` | `1,533` | `1` |
| `/how-to-use/` | `1.0` | `0.85` | `1,682` | `1` |
| `/faq/` | `0.83` | `0.8` | `2,035` | `1` |
