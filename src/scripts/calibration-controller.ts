import {
  CARD_CORNER_RADIUS_MM,
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  MM_PER_INCH,
  cardHeightForWidth,
  cardWidthPx,
  classifyDisplayChange,
  createManualProfile,
  cssPpi,
  detectCalibration,
  getReferencePreset,
  parseDiagonal,
  pxPerMmFromCardHeight,
  pxPerMmFromCardWidth,
  pxPerMmFromDiagonal,
  pxPerMmFromReference,
  readDisplayInfo,
  removeProfileForDisplay,
  saveProfileToStore,
  type CalibrationMethod,
  type DisplayInfo,
  type ReferencePresetId,
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
  private activeRefPreset: ReferencePresetId = 'card-1x';
  private customRefMm = 100;
  /** Current reference target width in CSS px during interactive sizing. */
  private currentCardWidthPx: number;
  private lastScreenX = window.screenX;
  private lastScreenY = window.screenY;
  private pinchWarningActive = false;

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

    // Sync reference sizer cleanly to current calibration scale
    const activeRefMm = this.getActiveRefMm();
    this.currentCardWidthPx =
      this.activeRefPreset === 'card-1x'
        ? (cal.cardWidthPx ?? cardWidthPx(cal.pxPerMm))
        : Math.round(activeRefMm * cal.pxPerMm * 10) / 10;
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

  private getActiveRefMm(): number {
    if (this.activeRefPreset === 'custom') return Math.max(5, this.customRefMm);
    return getReferencePreset(this.activeRefPreset).widthMm;
  }

  private getRefBounds(): { readonly min: number; readonly max: number } {
    if (this.activeRefPreset === 'card-1x') {
      return { min: 120, max: 900 };
    }
    const refMm = this.getActiveRefMm();
    const min = Math.max(40, Math.round(refMm * 1.5));
    const max = Math.min(2000, Math.max(min + 100, Math.round(refMm * 12)));
    return { min, max };
  }

  private setReferencePreset(presetId: ReferencePresetId): void {
    const cal = this.workspace.getCalibration();
    const currentPxPerMm =
      this.currentCardWidthPx > 0 ? this.currentCardWidthPx / this.getActiveRefMm() : cal.pxPerMm;
    this.activeRefPreset = presetId;
    const nextRefMm = this.getActiveRefMm();
    const bounds = this.getRefBounds();
    this.currentCardWidthPx = Math.max(
      bounds.min,
      Math.min(bounds.max, Math.round(nextRefMm * currentPxPerMm * 10) / 10),
    );
    document.querySelectorAll<HTMLButtonElement>('[data-ref-preset]').forEach((btn) => {
      const active = btn.dataset.refPreset === presetId;
      btn.dataset.active = String(active);
      btn.setAttribute('aria-pressed', String(active));
    });
    const customRow = document.getElementById('custom-ref-row');
    if (customRow) {
      customRow.classList.toggle('hidden', presetId !== 'custom');
      customRow.classList.toggle('flex', presetId === 'custom');
    }
    this.renderCardBox();
  }

  private renderCardBox(): void {
    const box = document.getElementById('card-calibration-box');
    const slider = document.getElementById('slider-card-width') as HTMLInputElement | null;
    const numInput = document.getElementById('input-card-px') as HTMLInputElement | null;
    const scaleReadout = document.getElementById('card-scale-readout');
    const orientBtn = document.getElementById('btn-card-orientation') as HTMLButtonElement | null;
    const pxLabel = document.getElementById('label-card-px');

    const bounds = this.getRefBounds();
    const refMm = this.getActiveRefMm();
    const isCard1x = this.activeRefPreset === 'card-1x';
    const preset = this.activeRefPreset === 'custom' ? null : getReferencePreset(this.activeRefPreset);
    const isCircular = Boolean(preset?.circular);

    const widthPx = Math.max(bounds.min, Math.min(bounds.max, this.currentCardWidthPx));
    const pxPerMm = widthPx / refMm;
    const heightPx = isCard1x
      ? cardHeightForWidth(widthPx)
      : isCircular
        ? widthPx
        : Math.max(72, Math.min(220, CARD_HEIGHT_MM * pxPerMm));
    const radiusPx = isCircular ? widthPx / 2 : CARD_CORNER_RADIUS_MM * pxPerMm;

    if (pxLabel) {
      pxLabel.textContent =
        isCard1x && this.cardPortrait
          ? (pxLabel.dataset.labelLong ?? 'Long Edge (px):')
          : (pxLabel.dataset.labelWidth ?? 'Width (px):');
    }

    if (box) {
      const usePortrait = isCard1x && this.cardPortrait;
      const displayW = usePortrait ? heightPx : widthPx;
      const displayH = usePortrait ? widthPx : heightPx;
      box.style.width = `${displayW.toFixed(1)}px`;
      box.style.height = `${displayH.toFixed(1)}px`;
      box.style.borderRadius = isCircular ? '9999px' : `${Math.min(18, radiusPx).toFixed(1)}px`;
      box.dataset.cardWidthPx = widthPx.toFixed(2);
      box.dataset.cardHeightPx = heightPx.toFixed(2);
      box.dataset.orientation = usePortrait ? 'portrait' : 'landscape';
      box.dataset.refPreset = this.activeRefPreset;

      const chipIcon = document.getElementById('card-chip-icon');
      const refTitle = document.getElementById('card-ref-title');
      const refWidthLabel = document.getElementById('card-ref-width-label');
      const refImperialLabel = document.getElementById('card-ref-imperial-label');
      const refHeightLabel = document.getElementById('card-ref-height-label');
      const placeTitle = document.getElementById('card-place-title');
      const refSubLabel = document.getElementById('card-ref-sub-label');
      const compactCircle = isCircular && widthPx < 160;
      if (chipIcon) chipIcon.classList.toggle('hidden', !isCard1x);
      if (refTitle) {
        refTitle.classList.toggle('hidden', compactCircle);
        refTitle.textContent =
          this.activeRefPreset === 'custom'
            ? `Custom (${refMm.toFixed(1)} mm)`
            : (preset?.multiplierLabel ?? 'ISO/IEC 7810 ID-1');
      }
      if (placeTitle) placeTitle.classList.toggle('hidden', compactCircle);
      if (refSubLabel) refSubLabel.classList.toggle('hidden', compactCircle);
      if (refImperialLabel) {
        refImperialLabel.classList.toggle('hidden', compactCircle);
        refImperialLabel.textContent = isCard1x
          ? '3.370 × 2.125 in'
          : `${(refMm / MM_PER_INCH).toFixed(3)} in`;
      }
      if (refWidthLabel) {
        refWidthLabel.textContent = `${refMm.toFixed(2)} mm`;
        refWidthLabel.classList.toggle('mx-auto', compactCircle);
      }
      if (refHeightLabel) {
        refHeightLabel.textContent = isCard1x ? `${CARD_HEIGHT_MM.toFixed(2)} mm` : '';
      }
      box.classList.toggle('justify-between', !compactCircle);
      box.classList.toggle('items-center', compactCircle);
      box.classList.toggle('justify-center', compactCircle);
      box.classList.toggle('p-2', compactCircle);
      box.classList.toggle('p-4', !compactCircle);
    }

    if (slider) {
      slider.min = String(bounds.min);
      slider.max = String(bounds.max);
      if (document.activeElement !== slider) slider.value = widthPx.toFixed(1);
    }
    if (numInput) {
      numInput.min = String(bounds.min);
      numInput.max = String(bounds.max);
      if (document.activeElement !== numInput) numInput.value = widthPx.toFixed(1);
    }
    if (scaleReadout) {
      scaleReadout.textContent = `${cssPpi(pxPerMm).toFixed(1)} CSS PPI · ${pxPerMm.toFixed(3)} px/mm`;
    }
    if (orientBtn) {
      orientBtn.classList.toggle('hidden', !isCard1x);
      orientBtn.textContent = this.cardPortrait
        ? (orientBtn.dataset.labelPortrait ?? 'Portrait (53.98 × 85.60 mm)')
        : (orientBtn.dataset.labelLandscape ?? 'Landscape (85.60 × 53.98 mm)');
    }
  }

  private setCardWidth(nextWidthPx: number): void {
    const bounds = this.getRefBounds();
    const clamped = Math.max(bounds.min, Math.min(bounds.max, Math.round(nextWidthPx * 10) / 10));
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
    const dragHandle = document.getElementById('card-drag-handle');
    const customLenInput = document.getElementById('input-custom-ref-length') as HTMLInputElement | null;
    const customUnitSelect = document.getElementById('select-custom-ref-unit') as HTMLSelectElement | null;

    document.querySelectorAll<HTMLButtonElement>('[data-ref-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.refPreset as ReferencePresetId | undefined;
        if (id) this.setReferencePreset(id);
      });
    });

    const syncCustomRef = () => {
      if (!customLenInput || !customUnitSelect) return;
      const raw = Number(customLenInput.value);
      if (!Number.isFinite(raw) || raw <= 0) return;
      const u = customUnitSelect.value;
      const mm = u === 'cm' ? raw * 10 : u === 'in' ? raw * MM_PER_INCH : raw;
      const clampedMm = Math.max(5, Math.min(2000, mm));
      this.customRefMm = clampedMm;
      if (this.activeRefPreset !== 'custom') {
        this.setReferencePreset('custom');
      } else {
        this.renderCardBox();
      }
    };
    customLenInput?.addEventListener('input', syncCustomRef);
    customUnitSelect?.addEventListener('change', syncCustomRef);

    // Direct corner/edge pointer drag handle on #card-calibration-box
    dragHandle?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragHandle.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidthPx = this.currentCardWidthPx;
      const usePortrait = this.activeRefPreset === 'card-1x' && this.cardPortrait;
      const boxEl = document.getElementById('card-calibration-box');
      if (boxEl) boxEl.dataset.dragging = 'true';

      const onMove = (me: PointerEvent) => {
        const dx = me.clientX - startX;
        const dy = me.clientY - startY;
        const delta = usePortrait ? dy : Math.abs(dx) >= Math.abs(dy) ? dx : dy * 1.4;
        this.setCardWidth(startWidthPx + delta);
      };
      const onUp = () => {
        if (boxEl) delete boxEl.dataset.dragging;
        dragHandle.removeEventListener('pointermove', onMove);
        dragHandle.removeEventListener('pointerup', onUp);
        dragHandle.removeEventListener('pointercancel', onUp);
      };
      dragHandle.addEventListener('pointermove', onMove);
      dragHandle.addEventListener('pointerup', onUp);
      dragHandle.addEventListener('pointercancel', onUp);
    });

    slider?.addEventListener('input', () => {
      this.setCardWidth(Number(slider.value));
    });

    numInput?.addEventListener('input', () => {
      const bounds = this.getRefBounds();
      const v = Number(numInput.value);
      if (Number.isFinite(v) && v >= bounds.min && v <= bounds.max) {
        this.setCardWidth(v);
      }
    });

    numInput?.addEventListener('change', () => {
      const bounds = this.getRefBounds();
      const v = Number(numInput.value);
      if (numInput.value.trim() !== '' && Number.isFinite(v)) {
        const clamped = Math.max(bounds.min, Math.min(bounds.max, v));
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
      const refMm = this.getActiveRefMm();
      const res =
        this.activeRefPreset === 'card-1x'
          ? this.cardPortrait
            ? pxPerMmFromCardHeight(cardHeightForWidth(this.currentCardWidthPx))
            : pxPerMmFromCardWidth(this.currentCardWidthPx)
          : pxPerMmFromReference(this.currentCardWidthPx, refMm);
      if (!res.ok) return;

      const disp = readDisplayInfo(window);
      const presetInfo =
        this.activeRefPreset === 'custom' ? null : getReferencePreset(this.activeRefPreset);
      const profileLabel =
        this.activeRefPreset === 'card-1x'
          ? 'ISO/IEC 7810 ID-1 Card (85.60 mm)'
          : this.activeRefPreset === 'custom'
            ? `Custom Reference (${refMm.toFixed(1)} mm)`
            : (presetInfo?.multiplierLabel ?? 'Reference calibration');
      const profile = createManualProfile(
        disp,
        res.value,
        'card',
        profileLabel,
        {
          cardWidthPx: cardWidthPx(res.value),
          referencePresetId: this.activeRefPreset,
          referenceMm: refMm,
        },
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

  private checkPinchZoom(info: DisplayInfo): void {
    const vvScale = info.visualViewportScale ?? 1;
    const isPinched = Math.abs(vvScale - 1) > 0.02;
    if (isPinched) {
      const rt = getRuntimeDict();
      this.pinchWarningActive = true;
      this.showBanner(
        formatTemplate(rt.pinchZoomBanner, { scale: vvScale.toFixed(2) }),
        'warning',
      );
    } else if (this.pinchWarningActive) {
      this.pinchWarningActive = false;
      document.getElementById('display-change-banner')?.classList.add('hidden');
    }
  }

  private bindDisplayWatchers(): void {
    this.checkPinchZoom(this.workspace.getDisplay());

    const checkDisplay = () => {
      const prev = this.workspace.getDisplay();
      const next = readDisplayInfo(window);
      const change = classifyDisplayChange(prev, next);

      if (change === 'none') {
        this.checkPinchZoom(next);
        return;
      }
      this.workspace.refreshForDisplayChange(next);
      this.syncUI();

      const rt = getRuntimeDict();
      if (Math.abs((next.visualViewportScale ?? 1) - 1) > 0.02) {
        this.checkPinchZoom(next);
        return;
      }
      this.pinchWarningActive = false;
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
    window.visualViewport?.addEventListener('resize', checkDisplay);

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
