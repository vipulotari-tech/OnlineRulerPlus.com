# Confirmed Bugs & Verified Fixes — OnlineRulerPlus.com

**Process Followed:** Strict **Red -> Green -> Full Suite Verification** for all functional UI regressions.  
**Verification Browsers:** Google Chrome `157.0.8103.79` & Microsoft Edge `157.0.4341.60`

---

## Summary Table

| ID | Severity | Component / File(s) | Summary | Regression Coverage | Post-Fix Status |
|:---|:---|:---|:---|:---|:---|
| **BUG-01** | **High** | `src/scripts/app.ts`, `src/scripts/workspace-controller.ts` | Spoke pages (`/cm-ruler`, `/horizontal-ruler`, `?unit=`, `?edges=`) silently overwrote user's saved home preferences in `localStorage` | `tests/e2e/audit-regressions.spec.ts` (`BUG-01`) | **FIXED & VERIFIED** |
| **BUG-02** | **High** | `src/scripts/workspace-controller.ts` | Toggling off all 4 edges left zero visible rulers in the workspace | `tests/e2e/audit-regressions.spec.ts` (`BUG-02`) | **FIXED & VERIFIED** |
| **BUG-03** | **High** | `src/scripts/workspace-overlays.ts`, `src/scripts/workspace-controller.ts` | `updateGuideSpanBadge` dropped `ΔY` whenever `>= 2` X guides existed; `Save to History` dropped `ΔY` | `tests/e2e/audit-regressions.spec.ts` (`BUG-03 & BUG-07`) | **FIXED & VERIFIED** |
| **BUG-04** | **High** | `src/components/Header.astro`, `src/styles/global.css` | Horizontal page overflow on `320×568` (`scrollWidth: 327`) and `844×390` landscape (`scrollWidth: 954`) due to `xs:` non-existent Tailwind prefix and `834px` nav breakpoint | `tests/e2e/audit-regressions.spec.ts` (`BUG-04 & BUG-05`) | **FIXED & VERIFIED** |
| **BUG-05** | **High** | `src/scripts/workspace-overlays.ts` | Protractor widget used fixed `320×180` canvas (`354px` widget), overflowing `#ruler-stage` on `<400px` mobile devices | `tests/e2e/audit-regressions.spec.ts` (`BUG-04 & BUG-05`) | **FIXED & VERIFIED** |
| **BUG-06** | **High** | `src/scripts/app.ts` | Pressing `Escape` inside `#help-shortcuts-modal` failed to close modal when `#toggle-shortcuts-enabled` checkbox had focus or was unchecked | `tests/e2e/audit-regressions.spec.ts` (`BUG-06`) | **FIXED & VERIFIED** |
| **BUG-07** | **Medium** | `src/scripts/workspace-controller.ts` | In `Dual cm/in` mode, `#crosshair-badge` formatted X in dual units (`cm · in`) while leaving Y single-unit | `tests/e2e/audit-regressions.spec.ts` (`BUG-03 & BUG-07`) | **FIXED & VERIFIED** |
| **BUG-08** | **Medium** | `src/scripts/calibration-controller.ts` | Invalid diagonal left stale `"Calculated scale: ..."` text next to error; out-of-range `#input-card-px` (`50`, `99999`) stayed desynced on `change`; card orientation ignored viewport rotation after initial load | `tests/e2e/audit-regressions.spec.ts` (`BUG-08`) | **FIXED & VERIFIED** |
| **BUG-09** | **Medium** | `src/pages/how-to-use.astro` | Keyboard reference table listed `D -> Toggle Dual cm / in Scale`, contradicting actual `D -> Toggle light and dark mode` | `tests/e2e/audit-regressions.spec.ts` (`BUG-09`) | **FIXED & VERIFIED** |
| **BUG-10** | **Low-Med** | `src/scripts/workspace-overlays.ts`, `src/scripts/workspace-controller.ts` | Pointer drag listeners lacked `pointercancel` cleanup; rotating floating rulers near stage boundaries could leave origin un-clamped | Code audit + E2E overlay suite | **FIXED & VERIFIED** |

---

## Detailed Root Causes & Fixes

### BUG-01 — Cross-Route Preference Overwrite
- **Repro:** Set `/` to `in` + `All Edges`, navigate to `/cm-ruler` then `/horizontal-ruler`, return to `/` -> workspace unexpectedly switched to `cm` and `horizontal` edges.
- **Root Cause:** `bootstrapRulerApp()` called `workspace.setUnit()` and `workspace.setEdgePreset()`, both of which unconditionally persisted to `localStorage['orp:preferences:v1']`.
- **Fix:** Added `persist = true` optional flag to `setUnit()` and `setEdgePreset()` (`workspace-controller.ts`) and passed `false` for URL query / route-forced defaults (`app.ts`).

### BUG-02 — Blank Workspace with All Edges Toggled Off
- **Repro:** On default `/` (`top` + `left` active), click `Top` then `Left` -> `visibleCanvases: []`.
- **Root Cause:** `toggleEdge()` flipped boolean state without checking remaining active edges.
- **Fix:** Guarded `toggleEdge()` so turning off an edge returns early when `enabledCount <= 1`.

### BUG-03 — Simultaneous X & Y Guide Span Loss
- **Repro:** Select `Both` axis guides and click twice in `#ruler-stage` (2 X + 2 Y guides). Badge displayed only `ΔX` and omitted `ΔY` from display and history.
- **Root Cause:** `updateGuideSpanBadge` used an exclusive `if (xGuides >= 2) ... else if (yGuides >= 2)` branch.
- **Fix:** Computed both `xSpanPx` and `ySpanPx`, rendered `ΔX: ... · ΔY: ...` joined output, and updated `btn-save-span` to record both axes when present.

### BUG-04 — Mobile & Landscape Header Overflow
- **Repro:** Load `/` at `320×568` (`scrollWidth = 327`) or `844×390` (`scrollWidth = 954`).
- **Root Cause:** `Header.astro` used invalid `xs:inline` on `Shortcuts` `<kbd>` plus uncompacted mobile gaps (`gap-4`), and `global.css` switched to `.apple-nav-desktop` at `834px` even though 8 global nav links require `~954px`.
- **Fix:** Compacted mobile header gaps/padding and changed `<kbd>` to `hidden sm:inline` (`Header.astro`), and moved desktop nav collapse breakpoint to `1023px / 1024px` (`global.css`).

### BUG-05 — Protractor Horizontal Overflow on `<400px` Viewports
- **Repro:** Open protractor at `375×667` (`stageW = 293px`); fixed `320×180` canvas forced `.protractor-widget` to `354px`, clipping right-side graduations.
- **Fix:** Dynamically sized canvas width `cssW = Math.min(320, Math.max(180, stageAvail))` with proportional height, radius, vertical origin offset, and label inset (`workspace-overlays.ts`).

### BUG-06 — `Escape` Blocked Inside Help Modal
- **Repro:** Open `#help-shortcuts-modal`, uncheck `#toggle-shortcuts-enabled`, focus checkbox, press `Escape` -> dialog remained open blocking page clicks.
- **Root Cause:** Global `bindKeyboardShortcuts` aborted on `INPUT` focus and `shortcutsEnabled === false`.
- **Fix:** Added a `window` `Escape` handler inside `initHelpDialog()` (`app.ts`) whenever `#help-shortcuts-modal` is open.

### BUG-07 — Asymmetric Dual `cm/in` Crosshair Coordinates
- **Repro:** Enable `Crosshair` + `Dual cm/in` -> floating badge displayed `"3.55 cm · 1 3/8 in, 2.75 cm"`.
- **Fix:** Updated `#crosshair-badge` formatting to call `this.formatCoord(y)` symmetrically with X.

### BUG-08 — Calibration Validation Stale Preview, Input Sync & Portrait Rotation
- **Fix:** Cleared stale scale preview back to formula text on invalid diagonal inputs; added `change` handler on `#input-card-px` clamping finite inputs to `[120, 900]` and syncing `.value`; updated resize listener to adapt portrait card mode across `500px` unless manually overridden (`calibration-controller.ts`).

### BUG-09 — Outdated Shortcut Documentation on `/how-to-use`
- **Fix:** Updated `shortcuts` table entry `D` in `src/pages/how-to-use.astro` to `Toggle Light / Dark Theme`.

### BUG-10 — Pointer Cancellation & Floating Ruler Rotation Bounds
- **Fix:** Added `pointercancel` listener cleanup alongside `pointerup` on guides, floating rulers, and protractor canvas (`workspace-overlays.ts`); clamped floating ruler `x`/`y` within stage dimensions on `onRotate` (`workspace-controller.ts`).
