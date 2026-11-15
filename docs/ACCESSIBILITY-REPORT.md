# Accessibility Audit Report (WCAG 2.0 / 2.1 A & AA) — OnlineRulerPlus.com

**Tooling:** `@axe-core/playwright` (`tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`) + Playwright keyboard focus/interaction assertions  
**Coverage:** All 13 canonical English routes + 3 localized routes (`/es`, `/ja`, `/de`), evaluated in **both Light Mode and Dark Mode**, plus **Help Modal Open** and **Mobile Drawer Open (`375px`)**, across both **Chrome** and **Edge**.

---

## 1. Automated Axe-Core Scan Results

| Scope / UI State | Routes Checked | Light Mode Violations | Dark Mode Violations |
| :--- | :--- | :--- | :--- |
| Primary & Spoke Routes (`/`, `/cm-ruler`, `/mm-ruler`, `/inch-ruler`, `/horizontal-ruler`, `/vertical-ruler`) | 6 × EN | **0** | **0** |
| Documentation & Legal Routes (`/how-to-use`, `/calibration-guide`, `/faq`, `/about`, `/contact`, `/privacy`, `/terms`) | 7 × EN | **0** | **0** |
| Localized Routes (`/es`, `/ja`, `/de`) | 3 × i18n | **0** | **0** |
| Interactive Overlay: Help Shortcuts Modal (`#help-shortcuts-modal` open on `/`) | `/` | **0** | Verified |
| Interactive Overlay: Mobile Navigation Tray (`#mobile-nav-tray` open at `375×667`) | `/` | **0** | Verified |

---

## 2. Remediated WCAG Findings

1. **Color Contrast (WCAG 2.1 AA 1.4.3) — BUG-QA-02 & BUG-QA-03:**
   - Remediated light muted tokens (`--text-ink-muted-48: #5f5f63`, `--text-faint: #5f5f63`), light link-on-soft badge (`--accent-link: #005bb8` over `rgba(0,102,204,0.09)`), and dark link-on-soft badge (`--accent-link: #5eb2ff` over `rgba(41,151,255,0.14)`).
   - Verified `0` contrast violations across every route in light and dark themes.
2. **Label in Name (WCAG 2.1 A 2.5.3) — BUG-QA-04:**
   - Fixed `[data-language-trigger]`, `[data-help-toggle]`, `[data-theme-toggle]`, and `[data-help-close]` so accessible names always lead with visible button text rather than mismatched `aria-label` overrides.
3. **Keyboard-Accessible Scrollable Regions (`scrollable-region-focusable`) — BUG-QA-05:**
   - Added `role="region" tabindex="0" aria-labelledby="..."` on PPI comparison table and unit comparison table containers (`ContentSections.astro`, `RulerSpokeContent.astro`, `calibration-guide.astro`, `how-to-use.astro`), complementing existing `#card-interactive-area` `tabindex="0"`.

---

## 3. Keyboard Navigation & Focus Management Verified

- **WAI-ARIA Language Menu (`LanguageSelector`):** Opens via click/Enter, supports `ArrowDown`, `ArrowUp`, `Home`, `End`, and `Escape` dismissal, highlighting the active locale cleanly.
- **WAI-ARIA Calibration Tablist (`#tab-card`, `#tab-diagonal`, `#tab-autodetect`):** Verified `ArrowRight`, `ArrowLeft`, `Home`, and `End` transitions updating `aria-selected` and `tabindex`.
- **Help Shortcuts Modal (`#help-shortcuts-modal`):**
  - Verified `Tab` focus trap keeps keyboard focus inside `#help-shortcuts-modal` while open.
  - Verified unchecking `#toggle-shortcuts-enabled` suppresses `G` / `H` shortcuts while `Escape` continues to close the modal reliably.
- **FAQ Accordions (`/faq`):** Native `<details open>` / `<summary>` toggle cleanly via click and keyboard.
