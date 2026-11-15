import {
  STORAGE_KEYS,
  computeQuadrantMetrics,
  parseCalibrationStore,
  pxToUnit,
  readDisplayInfo,
  resolveCalibration,
  type Unit,
} from '../lib/ruler/index.ts';

export function initQuadrantPlotter(): void {
  const root = document.getElementById('quadrant-app');
  if (!root) return;

  let unit: Unit = 'cm';
  let pointX = 0; // offset in CSS px from canvas center (+ right)
  let pointY = 0; // offset in CSS px from canvas center (+ up in math coords)
  let initializedPoint = false;

  const canvas = document.getElementById('quadrant-canvas') as HTMLCanvasElement | null;
  const resetBtn = document.getElementById('btn-quadrant-reset');

  const getCal = () => {
    const disp = readDisplayInfo(window);
    const store = parseCalibrationStore(localStorage.getItem(STORAGE_KEYS.calibration));
    return resolveCalibration(store, disp);
  };

  const render = () => {
    const cal = getCal();
    if (!initializedPoint) {
      pointX = Math.round(cal.pxPerMm * 30); // +3.0 cm default vector
      pointY = Math.round(cal.pxPerMm * 20); // +2.0 cm default vector
      initializedPoint = true;
    }

    if (canvas) {
      const parent = canvas.parentElement;
      const cssW = Math.max(280, parent ? parent.clientWidth : 640);
      const cssH = Math.max(280, Math.min(480, Math.round(cssW * 0.65)));
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);
      if (canvas.width !== targetW) canvas.width = targetW;
      if (canvas.height !== targetH) canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dark = document.documentElement.classList.contains('dark');
        const cx = cssW / 2;
        const cy = cssH / 2;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = dark ? '#1d1d1f' : '#ffffff';
        ctx.fillRect(0, 0, cssW, cssH);

        // Calibrated grid lines (every 10mm or 1/2 in depending on unit)
        const stepMm = unit === 'in' ? 12.7 : 10;
        const stepPx = Math.max(12, unit === 'px' ? 50 : stepMm * cal.pxPerMm);
        ctx.strokeStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        ctx.lineWidth = 1;
        for (let d = stepPx; cx + d < cssW || cx - d > 0; d += stepPx) {
          ctx.beginPath();
          ctx.moveTo(cx + d, 0);
          ctx.lineTo(cx + d, cssH);
          ctx.moveTo(cx - d, 0);
          ctx.lineTo(cx - d, cssH);
          ctx.stroke();
        }
        for (let d = stepPx; cy + d < cssH || cy - d > 0; d += stepPx) {
          ctx.beginPath();
          ctx.moveTo(0, cy + d);
          ctx.lineTo(cssW, cy + d);
          ctx.moveTo(0, cy - d);
          ctx.lineTo(cssW, cy - d);
          ctx.stroke();
        }

        // Principal X & Y Axes
        ctx.strokeStyle = dark ? '#a1a1a6' : '#424245';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(cssW, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, cssH);
        ctx.stroke();

        // Quadrant watermark tags
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.28)' : 'rgba(29,29,31,0.28)';
        ctx.font = '600 12px ui-monospace, monospace';
        ctx.fillText('I (+,+)', cssW - 64, 22);
        ctx.fillText('II (−,+)', 14, 22);
        ctx.fillText('III (−,−)', 14, cssH - 12);
        ctx.fillText('IV (+,−)', cssW - 68, cssH - 12);

        // Vector from origin to active point (screen Y is downward -> cy - pointY)
        const pxScreenX = cx + pointX;
        const pxScreenY = cy - pointY;

        ctx.strokeStyle = dark ? '#2997ff' : '#0071e3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pxScreenX, pxScreenY);
        ctx.stroke();

        // Projection components X/Y dashed
        ctx.strokeStyle = dark ? 'rgba(41,151,255,0.45)' : 'rgba(0,113,227,0.45)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pxScreenX, cy);
        ctx.lineTo(pxScreenX, pxScreenY);
        ctx.moveTo(cx, pxScreenY);
        ctx.lineTo(pxScreenX, pxScreenY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Origin & target point markers
        ctx.fillStyle = dark ? '#ffffff' : '#1d1d1f';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = dark ? '#2997ff' : '#0071e3';
        ctx.beginPath();
        ctx.arc(pxScreenX, pxScreenY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }
    }

    const xVal = pxToUnit(pointX, unit, cal.pxPerMm);
    const yVal = pxToUnit(pointY, unit, cal.pxPerMm);
    const m = computeQuadrantMetrics(xVal, yVal);
    const dec = unit === 'px' ? 0 : unit === 'in' ? 3 : unit === 'mm' ? 1 : 2;
    const fmtSigned = (n: number) => `${n < 0 ? '−' : '+'}${Math.abs(n).toFixed(dec)} ${unit}`;

    const set = (id: string, val: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('quad-x-val', fmtSigned(m.xUnit));
    set('quad-y-val', fmtSigned(m.yUnit));
    set('quad-r-val', `${m.rUnit.toFixed(dec)} ${unit}`);
    set('quad-angle-val', `${m.angleDeg.toFixed(1)}°`);
    set('quad-label-val', m.quadrantLabel);
    set('quad-cal-ppi', `${cal.cssPpi.toFixed(1)} PPI`);

    document.querySelectorAll<HTMLButtonElement>('[data-quad-unit]').forEach((btn) => {
      const active = btn.dataset.quadUnit === unit;
      btn.dataset.active = String(active);
      btn.setAttribute('aria-pressed', String(active));
    });
  };

  document.querySelectorAll<HTMLButtonElement>('[data-quad-unit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const u = btn.dataset.quadUnit;
      if (u === 'cm' || u === 'mm' || u === 'in' || u === 'px') {
        unit = u;
        render();
      }
    });
  });

  resetBtn?.addEventListener('click', () => {
    pointX = 0;
    pointY = 0;
    render();
  });

  canvas?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const updateFromPointer = (pe: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointX = Math.round(pe.clientX - rect.left - rect.width / 2);
      pointY = Math.round(-(pe.clientY - rect.top - rect.height / 2));
      render();
    };
    updateFromPointer(e);
    const onMove = (me: PointerEvent) => updateFromPointer(me);
    const onUp = () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
  });

  window.addEventListener('resize', render);
  window.addEventListener('orp:calibration-changed', render);
  window.addEventListener('orp:toggle-theme', () => window.setTimeout(render, 20));
  render();
}
