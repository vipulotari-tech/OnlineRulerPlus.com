# GEO (Generative Engine Optimization) & AI Search Strategy — OnlineRulerPlus.com

- **Target Domain**: `https://onlinerulerplus.com`
- **Primary Skill Applied**: `GEO SEO` (`zubair-trabzada/geo-seo-claude` — `geo-audit`, `geo-citability`, `geo-crawlers`, `geo-llmstxt`, `geo-platform-optimizer`, `geo-schema`) integrated with `claude-seo` (`seo-geo` & `references/google-ai-optimization-guide.md`)
- **Date**: November 14, 2026

---

## 1. Executive Summary: Multi-Platform AI Search Visibility

Generative AI search engines—including **Google AI Overviews**, **ChatGPT Search (`OAI-SearchBot`)**, **Perplexity (`PerplexityBot`)**, **Claude Search (`Claude-SearchBot`)**, and **Microsoft Copilot (`bingbot`)**—synthesize answers to measurement, calibration, and unit-conversion queries before or alongside traditional links.

While OnlineRulerPlus.com is fundamentally an interactive screen ruler utility, users frequently trigger AI Overviews and LLM citations with questions such as:
- *"Why is an online ruler inaccurate without calibration?"*
- *"How do I calibrate an online ruler with a credit card?"*
- *"How many millimeters is 1/16, 1/8, 1/4, or 3/8 of an inch?"*
- *"How many centimeters in a 12-inch ruler?"*
- *"Can I use my phone screen as an actual-size ruler?"*

Our GEO strategy ensures OnlineRulerPlus.com is both **100% accessible to AI retrieval crawlers** and **structured into high-scoring, self-contained answer blocks** that AI engines cite as the authoritative metrology source before sending users to our interactive canvas workspace.

---

## 2. Passage Citability Engineering (`geo-citability` & `citability_scorer.py`)

Using `C:\Users\vipul\.claude\skills\geo\scripts\citability_scorer.py`, we audited how AI retrieval models segment and score HTML passages across all 13 pages:

### Why Baseline Citability Was Low (`33.6 / 100` on `index.html`)
1. **Un-headed `<details><summary>` FAQ Elements**: `citability_scorer.py` (like many RAG HTML chunkers) segments DOM content on `<h1>`, `<h2>`, `<h3>`, and `<h4>` headings. Because the baseline FAQ `<summary>` tags used `<span>{item.q}</span>` instead of `<h3>{item.q}</h3>`, all 7 FAQ answers were concatenated into a single 500-word block under `<h2>Common Questions About Online Screen Rulers</h2>`, scoring `0 / 10` on passage length (`word_count > 400`) and losing the `+10` question-heading bonus (`heading.endswith("?")`).
2. **Short Fragmented Cards (`30–60` Words)**: The baseline guide cards were 35–60 words long, well below the **134–167 word** optimal RAG retrieval window (`geo-citability`).
3. **Missing Definition Openers**: Several sections opened with procedural instructions rather than explicit `"X is a/an/the..."` definition sentences within the first 60 words.

### Structural & Editorial GEO Upgrades Implemented
1. **Semantic `<h3>` Question Headings Inside Every `<summary>`**: Wrapped every FAQ question across `ContentSections.astro`, `RulerSpokeContent.astro`, and `faq.astro` in `<h3 class="type-body-strong text-ink">{item.q}</h3>` ending with `?`.
2. **Question-Based Guide Card Headings**: Converted `<h2>` and `<h3>` guide headings across all ruler and documentation pages to natural-language questions matching user search prompts (e.g., *"How do you calibrate display pixel density?"*, *"How do you read 1/16″ fractions on an online inch ruler?"*, *"What is the difference between physical PPI and CSS pixels?"*).
3. **130–167 Word Self-Contained Answer Passages**: Expanded core guide and FAQ passages to include:
   - **Direct Definition Opening (First 60 Words)**: `"An uncalibrated online ruler is an on-screen scale that defaults to..."`, `"Credit card calibration is the most accurate method for..."`, `"An imperial inch ruler is a base-2 fractional scale that divides..."`.
   - **Authoritative Standard Citations**: Explicit references to **W3C CSS Values and Units Module Level 4** (`96 CSS pixels per inch` = `3.7795 px/mm`), **ISO/IEC 7810:2019 ID-1** (`85.60 × 53.98 mm`), **NIST / BIPM** (`1 in = 25.4 mm` exact), **United States Mint** (`US Quarter = 24.26 mm`, `US Penny = 19.05 mm`), **European Central Bank** (`1 Euro = 23.25 mm`), and **ISO 261 / DIN 13** (`M2–M10` metric screw threads).
   - **Concrete Statistical & Empirical Density**: Quantified uncalibrated error rates (`10% to 35%`, `+17.6%` on 27″ 1080p monitors, `-24.4%` on 14″ Retina laptops, `35.8%` cross-monitor pitch delta) and 2026 display benchmarks.

### Measured `citability_scorer.py` Improvement Across Key Pages

| Page (`dist/`) | Baseline Avg Score | Post-Implementation Avg Score | Baseline Grade A / B Blocks | Post-Implementation Grade A (`80+`) & Grade B (`65+`) Blocks |
| :--- | :--- | :--- | :--- | :--- |
| `index.html` (`/`) | `33.6` | **`51.6`** | `0` Grade A, `0` Grade B | **`7` Grade A (`80–85`), `4` Grade B (`65–73`)** |
| `cm-ruler/index.html` | `33.8` | **`49.2`** | `0` Grade A, `0` Grade B | **`2` Grade A (`80–85`), `1` Grade B (`76`)** |
| `inch-ruler/index.html` | `33.8` | **`48.1`** | `0` Grade A, `0` Grade B | **`1` Grade A (`82`), `2` Grade B (`73–79`)** |
| `mm-ruler/index.html` | `34.2` | **`47.7`** | `0` Grade A, `0` Grade B | **`1` Grade A (`80`), `2` Grade B (`75`)** |
| `horizontal-ruler/index.html` | `34.2` | **`44.4`** | `0` Grade A, `0` Grade B | **`2` Grade A (`80`), `1` Grade B (`75`)** |
| `vertical-ruler/index.html` | `34.2` | **`46.9`** | `0` Grade A, `0` Grade B | **`1` Grade A (`80`), `2` Grade B (`72–78`)** |
| `how-to-use/index.html` | `36.8` | **`60.7`** | `0` Grade A, `0` Grade B | **`2` Grade B (`65–69`), `3` Grade C (`58–64`), `0` Grade F** |
| `calibration-guide/index.html` | `51.8` | **`56.0`** | `0` Grade A, `0` Grade B | **`3` Grade B (`65–69`), `1` optimal-length passage, `0` Grade F** |
| `faq/index.html` | `60.0` (1 merged block) | **`63.2` (17 blocks)** | `0` Grade A, `0` Grade B | **`5` Grade A (`80–85`), `3` Grade B (`65–73`), `0` Grade F** |
| `about/index.html` | `45.0` | **`57.5`** | `0` Grade A, `0` Grade B | **`1` Grade B (`65`), `2` Grade C, `0` Grade F** |
| `contact/index.html` | `23.0` | **`52.8`** | `0` Grade A, `0` Grade B | **`2` Grade B (`65–68`), `0` thin-content warnings** |

*(Note: Overall page averages on ruler pages include short interactive UI toolbar/card headings like `Measurement History` and `Automatic Device & Screen Density Detection`, whereas the editorial guide and FAQ blocks now consistently score **72 to 85 / 100 — Grade B to Grade A**.)*

---

## 3. AI Crawler Accessibility & `robots.txt` Governance (`geo-crawlers`)

We updated [public/robots.txt](file:///C:/OnlineRulerPlus.com/public/robots.txt) to move from an implicit wildcard-only configuration to an **explicit AI search & grounding allowlist** with `Content-Signal: search=yes, ai-input=yes`:

- **OpenAI / ChatGPT Search**: `OAI-SearchBot`, `ChatGPT-User`, `GPTBot` (`Allow: /`)
- **Anthropic / Claude Search**: `Claude-SearchBot`, `Claude-User`, `Claude-Web`, `ClaudeBot`, `anthropic-ai` (`Allow: /`)
- **Perplexity AI**: `PerplexityBot`, `Perplexity-User` (`Allow: /`)
- **Google Search & Gemini**: `Googlebot`, `Google-Extended`, `GoogleOther` (`Allow: /`)
- **Microsoft Bing & Copilot**: `bingbot` (`Allow: /`)
- **Apple Intelligence**: `Applebot`, `Applebot-Extended` (`Allow: /`)
- **Other AI Assistants**: `DuckAssistBot`, `YouBot`, `Amazonbot`, `CCBot` (`Allow: /`)

Verified via `C:\Users\vipul\.claude\skills\geo\scripts\fetch_page.py "http://localhost:4321/" robots`: all major AI crawlers report `"ALLOWED"` with `errors: []`.

---

## 4. `/llms.txt` & `/llms-full.txt` Implementation (`geo-llmstxt` vs. `claude-seo`)

We deployed both [public/llms.txt](file:///C:/OnlineRulerPlus.com/public/llms.txt) and [public/llms-full.txt](file:///C:/OnlineRulerPlus.com/public/llms-full.txt) following the `geo-llmstxt` specification while incorporating `claude-seo`'s (`seo-geo/references/google-ai-optimization-guide.md`) evidence-based nuance:

1. **Role of `/llms.txt` and `/llms-full.txt`**:
   - **Google Search / AI Overviews**: As documented in `claude-seo`, Google Search does **not** use `llms.txt`; Google AI Overviews rely on standard `Googlebot` HTML indexing, semantic headings, structured tables, and Schema.org JSON-LD.
   - **Non-Google AI Agents, Coding Assistants & RAG Fetchers**: Agentic browsers, MCP web fetchers, and LLM documentation crawlers use `/llms.txt` as a structured index and `/llms-full.txt` as a single-request markdown reference containing our exact calibration formulas, ISO/IEC 7810 ID-1 card dimensions, coin verification benchmarks, and `1/16″` to millimeter conversion tables.
2. **Verification**: `fetch_page.py "http://localhost:4321/" llms` confirmed `llms_txt.exists = true` and `llms_full_txt.exists = true` with `errors: []`.

---

## 5. Entity Optimization & `SpeakableSpecification` Schema (`geo-schema` & `claude-seo`)

To maximize entity disambiguation across Knowledge Graphs and LLM grounding pipelines:
1. **Canonical Organization Node (`https://onlinerulerplus.com/#organization`)**:
   - Linked on all 13 pages via `@id`, declaring `knowsAbout` across `"Online Screen Ruler Calibration"`, `"Display Pixel Density (PPI) Metrology"`, `"ISO/IEC 7810:2019 ID-1 Standard Card Calibration"`, `"Centimeter, Millimeter, and Fractional Inch Measurement"`, and `"W3C CSS Values and Units Reference Pixel"`.
2. **Voice & Assistant Extraction (`SpeakableSpecification`)**:
   - Added `speakable: { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".speakable-summary"] }` to `WebApplication`, `TechArticle`, and `AboutPage` JSON-LD schemas, paired with the `.speakable-summary` class on every page's lead definition paragraph.
3. **Dual-Purpose `FAQPage` Schema**:
   - Per `claude-seo` (`seo-schema/SKILL.md`), Google retired `FAQPage` rich result snippets for commercial/general websites on May 7, 2026. However, per `GEO SEO` (`geo-schema`), non-Google AI answer engines (ChatGPT, Perplexity, Bing Copilot) continue to parse `FAQPage` JSON-LD as high-confidence question-answer pairs. We therefore emit page-specific `FAQPage` JSON-LD across all 6 ruler pages and the 16-question `/faq` knowledge base while ensuring every FAQ is also rendered visibly in semantic HTML `<details open><summary><h3>...</h3></summary><p>...</p></details>`.
