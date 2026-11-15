import {
  MM_PER_INCH,
  createManualProfile,
  cssPpi,
  pxPerMmFromDiagonal,
  readDisplayInfo,
  removeProfileForDisplay,
  resolveCalibration,
  saveProfileToStore,
  parseCalibrationStore,
  STORAGE_KEYS,
} from '../lib/ruler/index.ts';
import { getRuntimeDict, translateBasis, translateDeviceLabel, translateStatusLabel } from '../i18n/runtime.ts';

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function initScreenDetector(): void {
  const root = document.getElementById('screen-detector-app');
  if (!root) return;

  let selectedDiag = 24;

  const diagInput = document.getElementById('detector-diagonal-input') as HTMLInputElement | null;
  const saveBtn = document.getElementById('btn-detector-save-cal');
  const savedBanner = document.getElementById('detector-saved-banner');

  const updateTelemetry = () => {
    const disp = readDisplayInfo(window);
    const store = parseCalibrationStore(localStorage.getItem(STORAGE_KEYS.calibration));
    const cal = resolveCalibration(store, disp);
    const rt = getRuntimeDict();

    const longCss = Math.max(disp.screenWidth, disp.screenHeight);
    const shortCss = Math.min(disp.screenWidth, disp.screenHeight);
    const physW = Math.round(disp.screenWidth * disp.dpr);
    const physH = Math.round(disp.screenHeight * disp.dpr);
    const div = gcd(disp.screenWidth, disp.screenHeight);
    const ratioStr = `${Math.round(disp.screenWidth / div)}:${Math.round(disp.screenHeight / div)}`;
    const vv = disp.visualViewportScale ?? 1;

    const setEl = (id: string, val: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('det-css-res', `${disp.screenWidth} × ${disp.screenHeight} px`);
    setEl('det-phys-res', `${physW} × ${physH} px`);
    setEl('det-viewport', `${window.innerWidth} × ${window.innerHeight} px`);
    setEl('det-dpr', `${disp.dpr.toFixed(2)}×`);
    setEl('det-aspect', ratioStr);
    setEl('det-vv-scale', `${vv.toFixed(2)}×`);
    setEl('det-cal-status', `${translateStatusLabel(cal.status, rt)} — ${cal.cssPpi.toFixed(1)} PPI`);
    setEl('det-cal-basis', `${translateDeviceLabel(cal.label, rt)} · ${translateBasis(cal.basis, rt)}`);

    // Physical estimates for selected diagonal
    const calc = pxPerMmFromDiagonal(disp.screenWidth, disp.screenHeight, selectedDiag);
    if (calc.ok) {
      const pxPerMm = calc.value;
      const cssPpiVal = cssPpi(pxPerMm);
      const devPpiVal = cssPpiVal * disp.dpr;
      const widthCm = disp.screenWidth / (pxPerMm * 10);
      const heightCm = disp.screenHeight / (pxPerMm * 10);
      const pitchMm = MM_PER_INCH / devPpiVal;

      setEl('det-calc-width', `${widthCm.toFixed(1)} cm (${(widthCm / 2.54).toFixed(2)}")`);
      setEl('det-calc-height', `${heightCm.toFixed(1)} cm (${(heightCm / 2.54).toFixed(2)}")`);
      setEl('det-calc-css-ppi', `${cssPpiVal.toFixed(1)} CSS px/in`);
      setEl('det-calc-dev-ppi', `${devPpiVal.toFixed(1)} phys PPI`);
      setEl('det-calc-pitch', `${pitchMm.toFixed(3)} mm/px`);
    }

    document.querySelectorAll<HTMLButtonElement>('[data-detector-diag]').forEach((btn) => {
      const active = Number(btn.dataset.detectorDiag) === selectedDiag;
      btn.dataset.active = String(active);
      btn.setAttribute('aria-pressed', String(active));
    });
    void longCss;
    void shortCss;
  };

  document.querySelectorAll<HTMLButtonElement>('[data-detector-diag]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = Number(btn.dataset.detectorDiag);
      if (Number.isFinite(val) && val >= 3 && val <= 100) {
        selectedDiag = val;
        if (diagInput) diagInput.value = String(val);
        updateTelemetry();
      }
    });
  });

  diagInput?.addEventListener('input', () => {
    const val = Number(diagInput.value);
    if (Number.isFinite(val) && val >= 3 && val <= 100) {
      selectedDiag = val;
      updateTelemetry();
    }
  });

  saveBtn?.addEventListener('click', () => {
    const disp = readDisplayInfo(window);
    const res = pxPerMmFromDiagonal(disp.screenWidth, disp.screenHeight, selectedDiag);
    if (!res.ok) return;
    const store = parseCalibrationStore(localStorage.getItem(STORAGE_KEYS.calibration));
    const cleaned = removeProfileForDisplay(store, disp);
    const profile = createManualProfile(
      disp,
      res.value,
      'diagonal',
      `${selectedDiag}″ Screen Diagonal`,
      { diagonalIn: selectedDiag },
    );
    const nextStore = saveProfileToStore(cleaned, profile);
    localStorage.setItem(STORAGE_KEYS.calibration, JSON.stringify(nextStore));
    updateTelemetry();
    if (savedBanner) {
      savedBanner.textContent = `${selectedDiag}″ (${cssPpi(res.value).toFixed(1)} PPI · ${res.value.toFixed(3)} px/mm)`;
      savedBanner.classList.remove('hidden');
    }
  });

  window.addEventListener('resize', updateTelemetry);
  updateTelemetry();
}
