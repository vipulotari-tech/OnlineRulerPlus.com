import {
  CARD_CORNER_RADIUS_MM,
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  cardHeightForWidth,
  cardHeightPx,
  cardWidthPx,
  classifyDisplayChange,
  createManualProfile,
  cssPpi,
  detectCalibration,
  parseDiagonal,
  pxPerMmFromCardHeight,
  pxPerMmFromCardWidth,
  pxPerMmFromDiagonal,
  readDisplayInfo,
  removeProfileForDisplay,
  saveProfileToStore,
  type CalibrationMethod,
  type DisplayInfo,
} from '../lib/ruler/index.ts';
import {
  formatTemplate,
  getRuntimeDict,
  translateBasis,
  translateDeviceLabel,
  translateError,
  translateStatusLabel,
} from '../i18n/runtime.ts';
import type { WorkspaceController } from './workspace-controller.ts';

export class CalibrationController {
  private readonly workspace: WorkspaceController;
  private activeTab: CalibrationMethod = 'card';
  private cardPortrait = false;
  private manualCardOrientation = false;
  /** Current card long-edge width in CSS px during interactive sizing. */
  private currentCardWidthPx: number;
  private lastScreenX = window.screenX;
  private lastScreenY = window.screenY;

  constructor(workspace: WorkspaceController) {
    this.workspace = workspace;
    const cal = this.workspace.getCalibration();
    this.currentCardWidthPx = cal.cardWidthPx ?? cardWidthPx(cal.pxPerMm);

    // Default to portrait card on narrow mobile viewports so the 85.6mm card never overflows
    if (window.innerWidth < 500) {
      this.cardPortrait = true;
    }

    this.bindTabs();
    this.bindAutoDetectControls();
    this.bindDiagonalControls();
    this.bindCardControls();
    this.bindResetButtons();
    this.bindDisplayWatchers();

    window.addEventListener('orp:calibration-changed', () => {
      this.syncUI();
    });

    this.syncUI();
  }

  public setTab(tab: CalibrationMethod, moveFocus = false): void {
    this.activeTab = tab;
    document.querySelectorAll<HTMLButtonElement>('[data-cal-tab]').forEach((btn) => {
      const selected = btn.dataset.calTab === tab;
      btn.setAttribute('aria-selected', String(selected));
      btn.setAttribute('tabindex', selected ? '0' : '-1');
      btn.dataset.active = String(selected);
      if (selected && moveFocus) btn.focus();
    });
    document.querySelectorAll<HTMLElement>('[data-cal-panel]').forEach((panel) => {
      const visible = panel.dataset.calPanel === tab;
      panel.classList.toggle('hidden', !visible);
    });
  }

  public syncUI(): void {
    const cal = this.workspace.getCalibration();
    const disp = this.workspace.getDisplay();
    const rt = getRuntimeDict();

    // Update all status badges across toolbar and calibration section
    document.querySelectorAll<HTMLElement>('[data-cal-status-label]').forEach((el) => {
      el.textContent = translateStatusLabel(cal.status, rt);
      el.dataset.status = cal.status;
    });

    document.querySelectorAll<HTMLElement>('[data-cal-ppi]').forEach((el) => {
      el.textContent = `${cal.cssPpi.toFixed(1)} PPI`;
    });

    document.querySelectorAll<HTMLElement>('[data-cal-px-per-mm]').forEach((el) => {
      el.textContent = `${cal.pxPerMm.toFixed(3)} px/mm`;
    });

    document.querySelectorAll<HTMLElement>('[data-cal-device-label]').forEach((el) => {
      el.textContent = translateDeviceLabel(cal.label, rt);
    });

    document.querySelectorAll<HTMLElement>('[data-cal-basis]').forEach((el) => {
      el.textContent = translateBasis(cal.basis, rt);
    });

    // Update Auto-Detect telemetry fields
    const autoResult = detectCalibration(disp);
    const autoDeviceEl = document.getElementById('auto-detected-device');
    if (autoDeviceEl) autoDeviceEl.textContent = translateDeviceLabel(autoResult.label, rt);

    const autoStatusEl = document.getElementById('auto-detected-kind');
    if (autoStatusEl) {
      autoStatusEl.textContent = translateStatusLabel(autoResult.kind, rt);
      autoStatusEl.dataset.status = autoResult.kind;
    }

    const autoPpiEl = document.getElementById('auto-detected-ppi');
    if (autoPpiEl) autoPpiEl.textContent = `${autoResult.cssPpi.toFixed(1)} CSS px/in`;

    const autoResEl = document.getElementById('auto-detected-resolution');
    if (autoResEl) {
      autoResEl.textContent = `${disp.screenWidth} × ${disp.screenHeight} CSS px`;
    }

    const autoDprEl = document.getElementById('auto-detected-dpr');
    if (autoDprEl) autoDprEl.textContent = `${disp.dpr.toFixed(2)}×`;

    const autoOrientEl = document.getElementById('auto-detected-orientation');
    if (autoOrientEl) {
      const isLandscape = window.innerWidth >= window.innerHeight;
      autoOrientEl.textContent = isLandscape ? rt.orientLandscape : rt.orientPortrait;
    }

    // Sync diagonal input if calibrated via diagonal
    const diagInput = document.getElementById('input-diagonal') as HTMLInputElement | null;
    if (diagInput && cal.diagonalIn !== undefined && document.activeElement !== diagInput) {
      diagInput.value = String(cal.diagonalIn);
      this.updateDiagonalPreview(String(cal.diagonalIn));
    }

    // Sync card sizer
    this.currentCardWidthPx = cal.cardWidthPx ?? cardWidthPx(cal.pxPerMm);
    this.renderCardBox();
    this.renderVerificationShapes(cal.pxPerMm);
  }

  private bindTabs(): void {
    const tabOrder: readonly CalibrationMethod[] = ['card', 'diagonal', 'auto-detect'];
    document.querySelectorAll<HTMLButtonElement>('[data-cal-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.calTab as CalibrationMethod | undefined;
        if (tab === 'auto-detect' || tab === 'diagonal' || tab === 'card') {
          this.setTab(tab);
        }
      });

      btn.addEventListener('keydown', (e) => {
        const idx = tabOrder.indexOf(this.activeTab);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.setTab(tabOrder[(idx + 1) % tabOrder.length], true);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.setTab(tabOrder[(idx - 1 + tabOrder.length) % tabOrder.length], true);
        } else if (e.key === 'Home') {
          e.preventDefault();
          this.setTab(tabOrder[0], true);
        } else if (e.key === 'End') {
          e.preventDefault();
          this.setTab(tabOrder[tabOrder.length - 1], true);
        }
      });
    });

    // Toolbar "Calibrate" button smoothly opens/scrolls to calibration section
    document.querySelectorAll<HTMLElement>('[data-open-calibration]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.openCalibration as CalibrationMethod | undefined;
        if (targetTab === 'auto-detect' || targetTab === 'diagonal' || targetTab === 'card') {
          this.setTab(targetTab);
        }
        const section = document.getElementById('calibration');
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  private bindAutoDetectControls(): void {
    const runBtn = document.getElementById('btn-apply-autodetect');
    runBtn?.addEventListener('click', () => {
      const disp = readDisplayInfo(window);
      // Clearing manual profile for this display activates auto-detect
      const nextStore = removeProfileForDisplay(this.workspace.getStore(), disp);
      this.workspace.updateCalibrationStore(nextStore, disp);
      const rt = getRuntimeDict();
      const cal = this.workspace.getCalibration();
      this.showBanner(
        formatTemplate(rt.autoAppliedBanner, {
          label: translateDeviceLabel(cal.label, rt),
          pxPerMm: cal.pxPerMm.toFixed(3),
        }),
        'info',
      );
    });
  }

  private updateDiagonalPreview(rawValue: string): void {
    const previewEl = document.getElementById('diagonal-preview');
    const errorEl = document.getElementById('diagonal-error');
    const disp = this.workspace.getDisplay();
    const rt = getRuntimeDict();

    const formulaText = `CSS PPI = √(${disp.screenWidth}² + ${disp.screenHeight}²) / diagonal`;

    const parsed = parseDiagonal(rawValue);
    if (!parsed.ok) {
      if (rawValue.trim() === '') {
        errorEl?.classList.add('hidden');
        if (previewEl) {
          previewEl.textContent = rt.enterDiagonalPrompt;
        }
      } else {
        if (errorEl) {
          errorEl.textContent = translateError(parsed.error, rt);
          errorEl.classList.remove('hidden');
        }
        if (previewEl) {
          previewEl.textContent = formulaText;
        }
      }
      return;
    }

    const calc = pxPerMmFromDiagonal(disp.screenWidth, disp.screenHeight, parsed.value);
    if (!calc.ok) {
      if (errorEl) {
        errorEl.textContent = translateError(calc.error, rt);
        errorEl.classList.remove('hidden');
      }
      if (previewEl) {
        previewEl.textContent = formulaText;
      }
      return;
    }

    errorEl?.classList.add('hidden');
    if (previewEl) {
      const ppi = cssPpi(calc.value);
      previewEl.textContent = formatTemplate(rt.calculatedScale, {
        ppi: ppi.toFixed(1),
        pxPerMm: calc.value.toFixed(3),
      });
    }
  }

  private bindDiagonalControls(): void {
    const form = document.getElementById('form-diagonal') as HTMLFormElement | null;
    const input = document.getElementById('input-diagonal') as HTMLInputElement | null;
    const errorEl = document.getElementById('diagonal-error');

    input?.addEventListener('input', () => {
      this.updateDiagonalPreview(input.value);
    });

    document.querySelectorAll<HTMLButtonElement>('[data-diagonal-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.diagonalPreset ?? '';
        if (input) {
          input.value = val;
          this.updateDiagonalPreview(val);
        }
      });
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!input) return;
      const parsed = parseDiagonal(input.value);
      const rt = getRuntimeDict();
      if (!parsed.ok) {
        if (errorEl) {
          errorEl.textContent = translateError(parsed.error, rt);
          errorEl.classList.remove('hidden');
        }
        return;
      }

      const disp = readDisplayInfo(window);
      const calc = pxPerMmFromDiagonal(disp.screenWidth, disp.screenHeight, parsed.value);
      if (!calc.ok) {
        if (errorEl) {
          errorEl.textContent = translateError(calc.error, rt);
          errorEl.classList.remove('hidden');
        }
        return;
      }

      errorEl?.classList.add('hidden');
      const profile = createManualProfile(
        disp,
        calc.value,
        'diagonal',
        `${parsed.value}″ Screen Diagonal`,
        { diagonalIn: parsed.value },
      );
      const cleanStore = removeProfileForDisplay(this.workspace.getStore(), disp);
      const nextStore = saveProfileToStore(cleanStore, profile);
      this.workspace.updateCalibrationStore(nextStore, disp);
      this.showBanner(
        formatTemplate(rt.diagonalSavedBanner, {
          ppi: cssPpi(calc.value).toFixed(1),
          pxPerMm: calc.value.toFixed(3),
          diag: parsed.value,
        }),
        'info',
      );
    });
  }

  private renderCardBox(): void {
    const box = document.getElementById('card-calibration-box');
    const slider = document.getElementById('slider-card-width') as HTMLInputElement | null;
    const numInput = document.getElementById('input-card-px') as HTMLInputElement | null;
    const scaleReadout = document.getElementById('card-scale-readout');
    const orientBtn = document.getElementById('btn-card-orientation');
    const pxLabel = document.getElementById('label-card-px');

    const widthPx = Math.max(120, Math.min(900, this.currentCardWidthPx));
    const heightPx = cardHeightForWidth(widthPx);
    const pxPerMm = widthPx / CARD_WIDTH_MM;
    const radiusPx = CARD_CORNER_RADIUS_MM * pxPerMm;

    if (pxLabel) {
      pxLabel.textContent = this.cardPortrait
        ? (pxLabel.dataset.labelLong ?? 'Long Edge (px):')
        : (pxLabel.dataset.labelWidth ?? 'Width (px):');
    }

    if (box) {
      const displayW = this.cardPortrait ? heightPx : widthPx;
      const displayH = this.cardPortrait ? widthPx : heightPx;
      box.style.width = `${displayW.toFixed(1)}px`;
      box.style.height = `${displayH.toFixed(1)}px`;
      box.style.borderRadius = `${radiusPx.toFixed(1)}px`;
      box.dataset.cardWidthPx = widthPx.toFixed(2);
      box.dataset.cardHeightPx = heightPx.toFixed(2);
      box.dataset.orientation = this.cardPortrait ? 'portrait' : 'landscape';
    }

    if (slider && document.activeElement !== slider) {
      slider.value = widthPx.toFixed(1);
    }
    if (numInput && document.activeElement !== numInput) {
      numInput.value = widthPx.toFixed(1);
    }
    if (scaleReadout) {
      scaleReadout.textContent = `${cssPpi(pxPerMm).toFixed(1)} CSS PPI · ${pxPerMm.toFixed(3)} px/mm`;
    }
    if (orientBtn) {
      orientBtn.textContent = this.cardPortrait
        ? (orientBtn.dataset.labelPortrait ?? 'Portrait (53.98 × 85.60 mm)')
        : (orientBtn.dataset.labelLandscape ?? 'Landscape (85.60 × 53.98 mm)');
    }
  }

  private setCardWidth(nextWidthPx: number): void {
    const clamped = Math.max(120, Math.min(900, Math.round(nextWidthPx * 10) / 10));
    this.currentCardWidthPx = clamped;
    this.renderCardBox();
  }

  private bindCardControls(): void {
    const slider = document.getElementById('slider-card-width') as HTMLInputElement | null;
    const numInput = document.getElementById('input-card-px') as HTMLInputElement | null;
    const minusBtn = document.getElementById('btn-card-minus');
    const plusBtn = document.getElementById('btn-card-plus');
    const orientBtn = document.getElementById('btn-card-orientation');
    const applyBtn = document.getElementById('btn-apply-card');
    const cardArea = document.getElementById('card-interactive-area');

    slider?.addEventListener('input', () => {
      this.setCardWidth(Number(slider.value));
    });

    numInput?.addEventListener('input', () => {
      const v = Number(numInput.value);
      if (Number.isFinite(v) && v >= 120 && v <= 900) {
        this.setCardWidth(v);
      }
    });

    numInput?.addEventListener('change', () => {
      const v = Number(numInput.value);
      if (numInput.value.trim() !== '' && Number.isFinite(v)) {
        const clamped = Math.max(120, Math.min(900, v));
        this.setCardWidth(clamped);
        numInput.value = clamped.toFixed(1);
      } else {
        numInput.value = this.currentCardWidthPx.toFixed(1);
      }
    });

    minusBtn?.addEventListener('click', () => {
      this.setCardWidth(this.currentCardWidthPx - 1);
    });

    plusBtn?.addEventListener('click', () => {
      this.setCardWidth(this.currentCardWidthPx + 1);
    });

    orientBtn?.addEventListener('click', () => {
      this.manualCardOrientation = true;
      this.cardPortrait = !this.cardPortrait;
      this.renderCardBox();
    });

    // Keyboard arrow support on card calibration panel
    cardArea?.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.setCardWidth(this.currentCardWidthPx + step);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.setCardWidth(this.currentCardWidthPx - step);
      }
    });

    applyBtn?.addEventListener('click', () => {
      const res = this.cardPortrait
        ? pxPerMmFromCardHeight(cardHeightForWidth(this.currentCardWidthPx))
        : pxPerMmFromCardWidth(this.currentCardWidthPx);
      if (!res.ok) return;

      const disp = readDisplayInfo(window);
      const profile = createManualProfile(
        disp,
        res.value,
        'card',
        'ISO/IEC 7810 ID-1 Card (85.60 mm)',
        { cardWidthPx: this.currentCardWidthPx },
      );
      const cleanStore = removeProfileForDisplay(this.workspace.getStore(), disp);
      const nextStore = saveProfileToStore(cleanStore, profile);
      this.workspace.updateCalibrationStore(nextStore, disp);
      const rt = getRuntimeDict();
      const cal = this.workspace.getCalibration();
      this.showBanner(
        formatTemplate(rt.cardSavedBanner, {
          label: translateDeviceLabel(cal.label, rt),
          pxPerMm: res.value.toFixed(3),
          ppi: cssPpi(res.value).toFixed(1),
        }),
        'info',
      );
    });
  }

  private renderVerificationShapes(pxPerMm: number): void {
    const cardRef = document.getElementById('verify-shape-card');
    if (cardRef) {
      cardRef.style.width = `${cardWidthPx(pxPerMm).toFixed(1)}px`;
      cardRef.style.height = `${cardHeightPx(pxPerMm).toFixed(1)}px`;
      cardRef.style.borderRadius = `${(CARD_CORNER_RADIUS_MM * pxPerMm).toFixed(1)}px`;
    }

    const quarterRef = document.getElementById('verify-shape-quarter');
    if (quarterRef) {
      const d = 24.26 * pxPerMm;
      quarterRef.style.width = `${d.toFixed(1)}px`;
      quarterRef.style.height = `${d.toFixed(1)}px`;
    }

    const euroRef = document.getElementById('verify-shape-euro');
    if (euroRef) {
      const d = 23.25 * pxPerMm;
      euroRef.style.width = `${d.toFixed(1)}px`;
      euroRef.style.height = `${d.toFixed(1)}px`;
    }

    const pennyRef = document.getElementById('verify-shape-penny');
    if (pennyRef) {
      const d = 19.05 * pxPerMm;
      pennyRef.style.width = `${d.toFixed(1)}px`;
      pennyRef.style.height = `${d.toFixed(1)}px`;
    }

    const bar50Ref = document.getElementById('verify-shape-50mm');
    if (bar50Ref) {
      bar50Ref.style.width = `${(50 * pxPerMm).toFixed(1)}px`;
    }
  }

  private bindResetButtons(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-reset-calibration]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const disp = readDisplayInfo(window);
        const nextStore = removeProfileForDisplay(this.workspace.getStore(), disp);
        this.workspace.updateCalibrationStore(nextStore, disp);
        const diagInput = document.getElementById('input-diagonal') as HTMLInputElement | null;
        if (diagInput) diagInput.value = '';
        const rt = getRuntimeDict();
        const cal = this.workspace.getCalibration();
        this.showBanner(
          formatTemplate(rt.resetBanner, {
            label: translateDeviceLabel(cal.label, rt),
            pxPerMm: cal.pxPerMm.toFixed(3),
          }),
          'info',
        );
      });
    });
  }

  private bindDisplayWatchers(): void {
    const checkDisplay = () => {
      const prev = this.workspace.getDisplay();
      const next = readDisplayInfo(window);
      const change = classifyDisplayChange(prev, next);

      if (change === 'none') return;
      this.workspace.refreshForDisplayChange(next);
      this.syncUI();

      const rt = getRuntimeDict();
      if (change === 'orientation') {
        this.showBanner(
          formatTemplate(rt.displayOrientationBanner, {
            w: next.screenWidth,
            h: next.screenHeight,
          }),
          'info',
        );
      } else if (change === 'zoom') {
        const cal = this.workspace.getCalibration();
        if (cal.rescaledForZoom) {
          this.showBanner(rt.displayZoomManualBanner, 'info');
        } else {
          this.showBanner(
            formatTemplate(rt.displayZoomAutoBanner, {
              w: next.screenWidth,
              h: next.screenHeight,
            }),
            'warning',
          );
        }
      } else if (change === 'display') {
        const cal = this.workspace.getCalibration();
        this.showBanner(
          formatTemplate(rt.displaySwitchedBanner, {
            w: next.screenWidth,
            h: next.screenHeight,
            label: translateDeviceLabel(cal.label, rt),
          }),
          'warning',
        );
      }
    };

    window.addEventListener('resize', () => {
      if (!this.manualCardOrientation && (window.innerWidth < 500) !== this.cardPortrait) {
        this.cardPortrait = window.innerWidth < 500;
        this.renderCardBox();
      }
      checkDisplay();
    });
    window.screen.orientation?.addEventListener('change', checkDisplay);

    // Poll window.screenX/screenY lightly when moving between multi-monitor setups of identical resolution
    window.setInterval(() => {
      if (window.screenX !== this.lastScreenX || window.screenY !== this.lastScreenY) {
        this.lastScreenX = window.screenX;
        this.lastScreenY = window.screenY;
        checkDisplay();
      }
    }, 1500);
  }

  private showBanner(message: string, tone: 'info' | 'warning'): void {
    const banner = document.getElementById('display-change-banner');
    const text = document.getElementById('display-change-text');
    if (!banner || !text) return;
    text.textContent = message;
    banner.dataset.tone = tone;
    banner.classList.remove('hidden');
  }
}
