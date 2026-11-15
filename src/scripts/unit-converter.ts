import {
  MM_PER_INCH,
  STORAGE_KEYS,
  cssPpi,
  formatInchFraction,
  parseCalibrationStore,
  pxToUnit,
  readDisplayInfo,
  resolveCalibration,
  unitToPx,
} from '../lib/ruler/index.ts';

function getActivePxPerMm(): number {
  const disp = readDisplayInfo(window);
  const store = parseCalibrationStore(localStorage.getItem(STORAGE_KEYS.calibration));
  return resolveCalibration(store, disp).pxPerMm;
}

export function initUnitConverter(): void {
  const root = document.getElementById('unit-converter-bar');
  if (!root) return;

  const inputMm = document.getElementById('conv-mm') as HTMLInputElement | null;
  const inputCm = document.getElementById('conv-cm') as HTMLInputElement | null;
  const inputIn = document.getElementById('conv-in') as HTMLInputElement | null;
  const inputPx = document.getElementById('conv-px') as HTMLInputElement | null;
  const fracReadout = document.getElementById('conv-frac-readout');
  const ppiBadge = document.getElementById('conv-ppi-badge');

  let currentMm = 85.6;

  const syncFromMm = (mm: number, source?: 'mm' | 'cm' | 'in' | 'px') => {
    if (!Number.isFinite(mm) || mm < 0) return;
    currentMm = Math.min(1_000_000, mm);
    const pxPerMm = getActivePxPerMm();
    const cm = currentMm / 10;
    const inches = currentMm / MM_PER_INCH;
    const px = unitToPx(currentMm, 'mm', pxPerMm);

    if (source !== 'mm' && inputMm) inputMm.value = currentMm.toFixed(2);
    if (source !== 'cm' && inputCm) inputCm.value = cm.toFixed(2);
    if (source !== 'in' && inputIn) inputIn.value = inches.toFixed(3);
    if (source !== 'px' && inputPx) inputPx.value = String(Math.round(px));
    if (fracReadout) {
      fracReadout.textContent = `${formatInchFraction(inches, 16)} (${formatInchFraction(inches, 32)})`;
    }
    if (ppiBadge) {
      ppiBadge.textContent = `@ ${cssPpi(pxPerMm).toFixed(1)} PPI`;
    }
  };

  inputMm?.addEventListener('input', () => {
    const val = Number(inputMm.value);
    if (Number.isFinite(val) && val >= 0) syncFromMm(val, 'mm');
  });
  inputCm?.addEventListener('input', () => {
    const val = Number(inputCm.value);
    if (Number.isFinite(val) && val >= 0) syncFromMm(val * 10, 'cm');
  });
  inputIn?.addEventListener('input', () => {
    const val = Number(inputIn.value);
    if (Number.isFinite(val) && val >= 0) syncFromMm(val * MM_PER_INCH, 'in');
  });
  inputPx?.addEventListener('input', () => {
    const val = Number(inputPx.value);
    if (Number.isFinite(val) && val >= 0) {
      syncFromMm(pxToUnit(val, 'mm', getActivePxPerMm()), 'px');
    }
  });

  window.addEventListener('orp:calibration-changed', () => syncFromMm(currentMm));
  syncFromMm(currentMm);
}
