# Keyword Mapping & Intent Architecture — OnlineRulerPlus.com

**Primary Homepage Target Keyword:** `Online Ruler`  
**Audience Focus:** USA, UK, Canada, Australia (`en-US` primary with regional US/UK/CA/AU coin, paper, and postal references)  
**Architecture Principle:** Map transactional tool queries to dedicated interactive ruler routes and informational/how-to/conversion/troubleshooting queries to `/blog` — zero keyword stuffing and zero doorway pages.

---

## 1. Core Tool & Documentation Pages

| Page Route | Canonical URL | Primary Target Keyword | Supporting Keywords Mapped | Role |
|:---|:---|:---|:---|:---|
| `/` | `https://onlinerulerplus.com/` | **`online ruler`** | `free online ruler`, `online ruler actual size`, `actual size online ruler`, `online ruler to scale`, `accurate online ruler`, `online ruler tool`, `real online ruler`, `online ruler camera` (honest limitations FAQ) | Primary Interactive Workspace + ~600w Guide + 9 Ruler FAQs |
| `/inch-ruler` | `https://onlinerulerplus.com/inch-ruler` | **`online ruler inches`** | `online ruler inches actual size`, `12 inch online ruler`, `online ruler 12 inch` | Dedicated Imperial 1/16″ & 12-Inch Tool Spoke |
| `/cm-ruler` | `https://onlinerulerplus.com/cm-ruler` | **`online ruler cm`** | `online ruler in cm`, `how to measure cm online` | Dedicated Metric Centimeter Tool Spoke + 1–30 cm Chart |
| `/mm-ruler` | `https://onlinerulerplus.com/mm-ruler` | **`online ruler mm`** | `online ruler in mm`, `mm online ruler` | Dedicated Millimeter Tool Spoke + M2–M10 / Watch Lug Charts |
| `/horizontal-ruler` | `https://onlinerulerplus.com/horizontal-ruler` | Horizontal screen & pixel ruler | Wide object & CSS pixel (`px`) measurement | Top + Bottom Simultaneous Edge Spoke |
| `/vertical-ruler` | `https://onlinerulerplus.com/vertical-ruler` | Vertical screen & portrait ruler | Standing object height & mobile portrait mode | Left + Right Simultaneous Edge Spoke |
| `/photo-ruler` | `https://onlinerulerplus.com/photo-ruler` | Photo & screenshot ruler | Client-side 2-point image calibration (`Ctrl+V`) — explicitly NOT live camera | Offline Photo/Clipboard Measurement Spoke |
| `/protractor` | `https://onlinerulerplus.com/protractor` | Online 360° protractor | Dual-ray angle measurement | Angle Geometry Spoke |
| `/circle-ruler` | `https://onlinerulerplus.com/circle-ruler` | Concentric circle & ring gauge | Ring, coin, and bolt diameter sizing | Diameter Gauge Spoke |
| `/quadrant` | `https://onlinerulerplus.com/quadrant` | 4-quadrant coordinate plane | ΔX/ΔY vector measurement | Coordinate Plane Spoke |
| `/printable-ruler` | `https://onlinerulerplus.com/printable-ruler` | Printable actual-size SVG ruler | `15 cm`, `30 cm`, `12 in`, `100 mm / 4 in` print verification bar | Vector Print Generator Spoke |
| `/screen-size-detector` | `https://onlinerulerplus.com/screen-size-detector` | Screen size & PPI detector | CSS viewport resolution, DPR, diagonal lookup | Hardware Diagnostic Spoke |
| `/calibration-guide` | `https://onlinerulerplus.com/calibration-guide` | Online ruler calibration | ISO/IEC 7810 ID-1 card, W3C 96 CSS PPI formula, Windows/macOS scaling | Technical Calibration Reference |
| `/how-to-use` | `https://onlinerulerplus.com/how-to-use` | How to use an online ruler | `how to read a ruler online`, shortcuts, guide lines, 100% print scale | Step-by-Step User Manual |
| `/faq` | `https://onlinerulerplus.com/faq` | Online ruler FAQ | Phone limits, camera caveats, Word Online & PowerPoint Online rulers, multi-monitor persistence | Complete 20-Item Knowledge Base |

---

## 2. Blog & Category Cluster Mapping (English Editorial System)

| Route | Canonical URL | Target Intent | Notes |
|:---|:---|:---|:---|
| `/blog` | `https://onlinerulerplus.com/blog` | Online ruler guides, conversions & calibration hub | Filterable by category + live keyword search |
| `/blog/ruler-fundamentals` | `https://onlinerulerplus.com/blog/ruler-fundamentals` | Reading rulers, 1/16″ fractions, Office web rulers, datum & parallax | Pillar A (10 planned, 3 Phase 1 published) |
| `/blog/measuring-without-tools` | `https://onlinerulerplus.com/blog/measuring-without-tools` | Phones, cameras vs. photo calibration, cards, coins, paper references | Pillar B (10 planned, 3 Phase 1 published) |
| `/blog/unit-conversions` | `https://onlinerulerplus.com/blog/unit-conversions` | Inches, cm, mm, 12-inch (30.48 cm), 1/16″ fraction conversion tables | Pillar C (10 planned, 3 Phase 1 published) |
| `/blog/screen-calibration` | `https://onlinerulerplus.com/blog/screen-calibration` | 96 CSS PPI fallacy, credit card calibration, Windows/macOS HiDPI scaling | Pillar D (10 planned, 3 Phase 1 published) |
| `/blog/printable-practical` | `https://onlinerulerplus.com/blog/printable-practical` | 100% scale printing, USPS/Royal Mail/Canada Post/AusPost boxes, angles | Pillar E (10 planned, 3 Phase 1 published) |
| `/blog/[slug]` | `https://onlinerulerplus.com/blog/<slug>` | Individual long-tail informational / how-to queries | See `docs/EDITORIAL-50-ARTICLE-ROADMAP.md` for all 50 slugs & unique keywords |

---

## 3. FAQ Assignment & Non-Duplication Policy

- **Homepage (`/`):** 9 focused FAQs covering online availability, how to use, how to read, 1-inch visual check, cm/mm measurement, smartphone measurement, camera limitations (honest no-live-camera disclosure), 96 PPI calibration/zoom, and multi-monitor privacy.
- **Knowledge Base (`/faq`):** Hosts all 9 homepage FAQs plus 11 extended FAQs including verified **Word Online** and **PowerPoint Online** ruler instructions (never placed on unrelated tool pages like `/inch-ruler` or `/mm-ruler`).
- **Dedicated Office Article (`/blog/how-to-show-ruler-word-online-powerpoint-online`):** Deep-dives into Microsoft Word for the web (`Editing` -> `View` -> `Ruler`) and PowerPoint for the web (no layout Ruler; Smart Guides, `Draw > Ruler`, or `Open in Desktop App`), keeping Microsoft Office instructions cleanly isolated from unrelated ruler pages.
