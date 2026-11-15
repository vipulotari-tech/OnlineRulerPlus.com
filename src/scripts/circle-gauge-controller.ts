import {
  MAX_CIRCLE_MM,
  MIN_CIRCLE_MM,
  STORAGE_KEYS,
  clampCircleDiameterMm,
  computeCircleMetrics,
  parseCalibrationStore,
  readDisplayInfo,
  resolveCalibration,
} from '../lib/ruler/index.ts';

export function initCircleGauge(): void {
  const root = document.getElementById('circle-gauge-app');
  if (!root) return;

  let diameterMm = 24.26;
  const canvas = document.getElementById('circle-gauge-canvas') as HTMLCanvasElement | null;
  const slider = document.getElementById('circle-diameter-slider') as HTMLInputElement | null;
  const numInput = document.getElementById('circle-diameter-input') as HTMLInputElement | null;
  const minorBtn = document.getElementById('circle-minus-btn');
  const plusBtn = document.getElementById('circle-plus-btn');

  const getPxPerMm = () => {
    const disp = readDisplayInfo(window);
    const store = parseCalibrationStore(localStorage.getItem(STORAGE_KEYS.calibration));
    return resolveCalibration(store, disp);
  };

  const drawCanvas = (pxPerMm: number) => {
    if (!canvas) return;
    const parent = canvas.parentElement;
    const cssW = Math.max(260, Math.min(620, parent ? parent.clientWidth : 520));
    const cssH = Math.max(260, Math.min(460, Math.round(cssW * 0.78)));
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const targetW = Math.round(cssW * dpr);
    const targetH = Math.round(cssH * dpr);
    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dark = document.documentElement.classList.contains('dark');

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = dark ? '#1d1d1f' : '#ffffff';
    ctx.fillRect(0, 0, cssW, cssH);

    const cx = cssW / 2;
    const cy = cssH / 2;
    const diaPx = diameterMm * pxPerMm;
    const rPx = diaPx / 2;

    // Crosshairs
    ctx.strokeStyle = dark ? '#424245' : '#d2d2d7';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(cssW, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, cssH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Active measurement circle
    ctx.fillStyle = dark ? 'rgba(41, 151, 255, 0.14)' : 'rgba(0, 113, 227, 0.09)';
    ctx.strokeStyle = dark ? '#2997ff' : '#0071e3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner diameter line + arrows
    if (rPx >= 8) {
      ctx.strokeStyle = dark ? '#2997ff' : '#0071e3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - rPx, cy);
      ctx.lineTo(cx + rPx, cy);
      ctx.stroke();
    }

    // Center pivot
    ctx.fillStyle = dark ? '#ffffff' : '#1d1d1f';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Drag handle on right rim
    ctx.fillStyle = dark ? '#2997ff' : '#0071e3';
    ctx.beginPath();
    ctx.arc(cx + rPx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = dark ? '#ffffff' : '#1d1d1f';
    ctx.font = '600 13px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Ø ${diameterMm.toFixed(2)} mm (${Math.round(diaPx)} px)`, cx, Math.max(20, cy - rPx - 12));
    ctx.restore();
  };

  const sync = () => {
    const cal = getPxPerMm();
    const metrics = computeCircleMetrics(diameterMm);
    diameterMm = metrics.diameterMm;

    if (slider) slider.value = String(diameterMm);
    if (numInput) numInput.value = diameterMm.toFixed(2);

    const set = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set('cg-dia-mm', `${metrics.diameterMm.toFixed(2)} mm`);
    set('cg-rad-mm', `${metrics.radiusMm.toFixed(2)} mm`);
    set('cg-circ-mm', `${metrics.circumferenceMm.toFixed(2)} mm`);
    set('cg-area-mm', `${metrics.areaMm2.toFixed(1)} mm²`);
    set('cg-dia-in', `${metrics.diameterIn.toFixed(3)} in`);
    set('cg-px', `${Math.round(metrics.diameterMm * cal.pxPerMm)} px`);
    set(
      'cg-ring-match',
      metrics.nearestUsRing ? `${metrics.nearestUsRing} / EU ${metrics.nearestEuRing}` : '—',
    );
    set('cg-cal-ppi', `${cal.cssPpi.toFixed(1)} PPI`);

    document.querySelectorAll<HTMLButtonElement>('[data-circle-preset]').forEach((btn) => {
      const val = Number(btn.dataset.circlePreset);
      const active = Math.abs(val - diameterMm) < 0.05;
      btn.dataset.active = String(active);
      btn.setAttribute('aria-pressed', String(active));
    });

    drawCanvas(cal.pxPerMm);
  };

  slider?.addEventListener('input', () => {
    diameterMm = clampCircleDiameterMm(Number(slider.value));
    sync();
  });
  numInput?.addEventListener('change', () => {
    diameterMm = clampCircleDiameterMm(Number(numInput.value));
    sync();
  });
  minorBtn?.addEventListener('click', () => {
    diameterMm = clampCircleDiameterMm(diameterMm - 0.5);
    sync();
  });
  plusBtn?.addEventListener('click', () => {
    diameterMm = clampCircleDiameterMm(diameterMm + 0.5);
    sync();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-circle-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      diameterMm = clampCircleDiameterMm(Number(btn.dataset.circlePreset));
      sync();
    });
  });

  // Pointer radial drag on canvas to fit any real ring/coin/washer placed over screen
  canvas?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const cal = getPxPerMm();
    const updateFromEvent = (pe: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rPx = Math.hypot(pe.clientX - rect.left - cx, pe.clientY - rect.top - cy);
      diameterMm = clampCircleDiameterMm((rPx * 2) / cal.pxPerMm);
      sync();
    };
    updateFromEvent(e);
    const onMove = (me: PointerEvent) => updateFromEvent(me);
    const onUp = () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
  });

  window.addEventListener('resize', sync);
  window.addEventListener('orp:calibration-changed', sync);
  window.addEventListener('orp:toggle-theme', () => window.setTimeout(sync, 20));
  void MIN_CIRCLE_MM;
  void MAX_CIRCLE_MM;
  sync();
}
