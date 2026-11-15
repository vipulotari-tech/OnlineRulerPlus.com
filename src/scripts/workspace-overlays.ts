import { renderRulerToCanvas } from '../lib/ruler/canvas-renderer.ts';
import {
  formatInchFraction,
  interiorAngleDeg,
  normalizeFullAngleDeg,
  pointToFullAngle,
  pointToProtractorAngle,
  raySweepAngleDeg,
  supplementaryAngleDeg,
  type MeasurementRecord,
  type RulerPreferences,
} from '../lib/ruler/index.ts';
import { formatTemplate, getRuntimeDict } from '../i18n/runtime.ts';

export interface GuideLine {
  readonly id: string;
  readonly axis: 'x' | 'y';
  /** Coordinate in CSS px from the ruler 0 origin. */
  readonly px: number;
}

export interface FloatingRuler {
  readonly id: string;
  readonly orientation: 'horizontal' | 'vertical';
  readonly x: number;
  readonly y: number;
  readonly lengthPx: number;
  /** Arbitrary angle in degrees [0, 360). Defaults to 0 (horizontal) or 90 (vertical). */
  readonly angleDeg?: number;
}

export interface RenderGuidesOptions {
  readonly layerEl: HTMLElement;
  readonly stageEl: HTMLElement;
  readonly guides: readonly GuideLine[];
  readonly enabled: boolean;
  readonly originInsetPx: number;
  readonly formatCoord: (px: number) => string;
  readonly onUpdateGuide: (id: string, nextPx: number) => void;
  readonly onRemoveGuide: (id: string) => void;
}

export function renderGuidesLayer(opts: RenderGuidesOptions): void {
  const {
    layerEl,
    stageEl,
    guides,
    enabled,
    originInsetPx,
    formatCoord,
    onUpdateGuide,
    onRemoveGuide,
  } = opts;

  layerEl.innerHTML = '';
  layerEl.classList.toggle('hidden', !enabled);

  const clearBtn = document.getElementById('btn-clear-guides');
  if (clearBtn) {
    clearBtn.classList.toggle('hidden', guides.length === 0);
  }

  if (!enabled) {
    updateGuideSpanBadge(guides, formatCoord);
    return;
  }

  for (const guide of guides) {
    const isX = guide.axis === 'x';
    const posInStage = originInsetPx + guide.px;

    const line = document.createElement('div');
    line.className = isX
      ? 'guide-line pointer-events-auto touch-none absolute top-0 bottom-0 w-px bg-link cursor-ew-resize group z-20'
      : 'guide-line pointer-events-auto touch-none absolute left-0 right-0 h-px bg-link cursor-ns-resize group z-20';
    line.dataset.guideId = guide.id;
    line.dataset.guideAxis = guide.axis;
    line.style.left = isX ? `${posInStage}px` : '0px';
    line.style.top = isX ? '0px' : `${posInStage}px`;

    const hit = document.createElement('div');
    hit.className = isX
      ? 'absolute -left-2 -right-2 inset-y-0'
      : 'absolute -top-2 -bottom-2 inset-x-0';
    line.appendChild(hit);

    const pill = document.createElement('div');
    pill.className =
      'absolute flex items-center gap-1 rounded-full bg-primary text-on-primary px-2.5 py-0.5 font-mono text-[11px] font-semibold leading-4 whitespace-nowrap select-none';
    if (isX) {
      pill.style.top = '10px';
      pill.style.left = '6px';
    } else {
      pill.style.left = '10px';
      pill.style.top = '6px';
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = formatCoord(guide.px);
    pill.appendChild(textSpan);

    const rt = getRuntimeDict();
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className =
      'ml-0.5 inline-flex min-h-[24px] min-w-[24px] items-center justify-center opacity-80 hover:opacity-100 font-sans font-semibold text-xs leading-none';
    removeBtn.setAttribute('aria-label', rt.removeGuideAria);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemoveGuide(guide.id);
    });
    pill.appendChild(removeBtn);
    line.appendChild(pill);

    line.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      e.preventDefault();
      e.stopPropagation();
      line.setPointerCapture(e.pointerId);
      const onMove = (me: PointerEvent) => {
        const stageRect = stageEl.getBoundingClientRect();
        const maxCoord = isX
          ? Math.max(0, stageRect.width - originInsetPx)
          : Math.max(0, stageRect.height - originInsetPx);
        const raw = isX
          ? me.clientX - stageRect.left - originInsetPx
          : me.clientY - stageRect.top - originInsetPx;
        const clamped = Math.max(0, Math.min(maxCoord, Math.round(raw * 10) / 10));
        line.style.left = isX ? `${originInsetPx + clamped}px` : '0px';
        line.style.top = isX ? '0px' : `${originInsetPx + clamped}px`;
        textSpan.textContent = formatCoord(clamped);
        onUpdateGuide(guide.id, clamped);
      };
      const onUp = () => {
        line.removeEventListener('pointermove', onMove);
        line.removeEventListener('pointerup', onUp);
        line.removeEventListener('pointercancel', onUp);
      };
      line.addEventListener('pointermove', onMove);
      line.addEventListener('pointerup', onUp);
      line.addEventListener('pointercancel', onUp);
    });

    layerEl.appendChild(line);
  }

  // Render bounding-box highlight when at least 2 X and 2 Y guides exist
  const xSorted = guides.filter((g) => g.axis === 'x').sort((a, b) => a.px - b.px);
  const ySorted = guides.filter((g) => g.axis === 'y').sort((a, b) => a.px - b.px);
  if (xSorted.length >= 2 && ySorted.length >= 2) {
    const x1 = xSorted[xSorted.length - 2].px;
    const x2 = xSorted[xSorted.length - 1].px;
    const y1 = ySorted[ySorted.length - 2].px;
    const y2 = ySorted[ySorted.length - 1].px;
    const w = x2 - x1;
    const h = y2 - y1;
    if (w > 0 && h > 0) {
      const box = document.createElement('div');
      box.dataset.boundingBox = 'true';
      box.className =
        'pointer-events-none absolute border border-dashed border-link bg-link/5 z-10';
      box.style.left = `${originInsetPx + x1}px`;
      box.style.top = `${originInsetPx + y1}px`;
      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
      layerEl.appendChild(box);
    }
  }

  updateGuideSpanBadge(guides, formatCoord);
}

export function updateGuideSpanBadge(
  guides: readonly GuideLine[],
  formatCoord: (px: number) => string,
): void {
  const badge = document.getElementById('guide-span-readout');
  if (!badge) return;
  const xGuides = guides.filter((g) => g.axis === 'x').sort((a, b) => a.px - b.px);
  const yGuides = guides.filter((g) => g.axis === 'y').sort((a, b) => a.px - b.px);

  const xSpanPx = xGuides.length >= 2 ? xGuides[xGuides.length - 1].px - xGuides[xGuides.length - 2].px : 0;
  const ySpanPx = yGuides.length >= 2 ? yGuides[yGuides.length - 1].px - yGuides[yGuides.length - 2].px : 0;
  const diagPx = xSpanPx > 0 && ySpanPx > 0 ? Math.hypot(xSpanPx, ySpanPx) : 0;

  const parts: string[] = [];
  if (xSpanPx > 0) parts.push(`ΔX: ${formatCoord(xSpanPx)}`);
  if (ySpanPx > 0) parts.push(`ΔY: ${formatCoord(ySpanPx)}`);
  if (diagPx > 0) parts.push(`Diag: ${formatCoord(diagPx)}`);

  if (parts.length > 0) {
    badge.classList.remove('hidden');
    const valText = document.getElementById('guide-span-value');
    if (valText) valText.textContent = parts.join(' · ');
    const rt = getRuntimeDict();
    if (xSpanPx > 0 && ySpanPx > 0) {
      badge.dataset.spanPx = String(xSpanPx);
      badge.dataset.spanLabel = formatTemplate(rt.spanGuideLabel, { axis: 'ΔX' });
      badge.dataset.spanYPx = String(ySpanPx);
      badge.dataset.spanYLabel = formatTemplate(rt.spanGuideLabel, { axis: 'ΔY' });
      badge.dataset.spanDiagPx = String(diagPx);
    } else if (xSpanPx > 0) {
      badge.dataset.spanPx = String(xSpanPx);
      badge.dataset.spanLabel = formatTemplate(rt.spanGuideLabel, { axis: 'ΔX' });
      delete badge.dataset.spanYPx;
      delete badge.dataset.spanYLabel;
      delete badge.dataset.spanDiagPx;
    } else {
      badge.dataset.spanPx = String(ySpanPx);
      badge.dataset.spanLabel = formatTemplate(rt.spanGuideLabel, { axis: 'ΔY' });
      delete badge.dataset.spanYPx;
      delete badge.dataset.spanYLabel;
      delete badge.dataset.spanDiagPx;
    }
  } else {
    badge.classList.add('hidden');
    delete badge.dataset.spanPx;
    delete badge.dataset.spanLabel;
    delete badge.dataset.spanYPx;
    delete badge.dataset.spanYLabel;
    delete badge.dataset.spanDiagPx;
  }
}

export interface RenderFloatingRulersOptions {
  readonly layerEl: HTMLElement;
  readonly stageEl: HTMLElement;
  readonly rulers: readonly FloatingRuler[];
  readonly prefs: RulerPreferences;
  readonly pxPerMm: number;
  readonly originInsetPx: number;
  readonly dark: boolean;
  readonly onRotate: (id: string) => void;
  readonly onSetAngle: (id: string, angleDeg: number) => void;
  readonly onMove: (id: string, x: number, y: number) => void;
  readonly onCommit: () => void;
  readonly onRemove: (id: string) => void;
}

export function renderFloatingRulersLayer(opts: RenderFloatingRulersOptions): void {
  const {
    layerEl,
    stageEl,
    rulers,
    prefs,
    pxPerMm,
    originInsetPx,
    dark,
    onRotate,
    onSetAngle,
    onMove,
    onCommit,
    onRemove,
  } = opts;

  layerEl.innerHTML = '';

  for (const fr of rulers) {
    const isOrthogonalVertical =
      fr.orientation === 'vertical' &&
      (fr.angleDeg === undefined || Math.abs(fr.angleDeg - 90) < 0.05);
    const angle = fr.angleDeg ?? (fr.orientation === 'vertical' ? 90 : 0);
    const isOblique = !isOrthogonalVertical && Math.abs(angle % 360) >= 0.05;
    const thickness = 44;

    const wrapper = document.createElement('div');
    wrapper.className =
      'floating-ruler pointer-events-auto touch-none apple-product-shadow absolute z-30 rounded-[8px] border border-hairline bg-canvas-elevated select-none cursor-move';
    wrapper.dataset.floatingId = fr.id;
    wrapper.dataset.angleDeg = angle.toFixed(1);
    wrapper.style.left = `${fr.x}px`;
    wrapper.style.top = `${fr.y}px`;
    wrapper.style.opacity = String(prefs.opacity);

    if (isOblique) {
      wrapper.style.transformOrigin = '22px 22px';
      wrapper.style.transform = `rotate(${angle.toFixed(1)}deg)`;
    }

    const canvas = document.createElement('canvas');
    canvas.style.width = isOrthogonalVertical ? `${thickness}px` : `${fr.lengthPx}px`;
    canvas.style.height = isOrthogonalVertical ? `${fr.lengthPx}px` : `${thickness}px`;
    canvas.className = 'block rounded-[8px]';

    renderRulerToCanvas(canvas, {
      edge: isOrthogonalVertical ? 'left' : 'top',
      lengthPx: fr.lengthPx,
      thicknessPx: thickness,
      originInsetPx,
      unit: prefs.unit,
      dualUnit: prefs.dualUnit,
      dualPair: prefs.dualPair,
      inchDivisor: prefs.inchDivisor,
      pxPerMm,
      dpr: window.devicePixelRatio || 1,
      dark,
    });
    wrapper.appendChild(canvas);

    const controls = document.createElement('div');
    controls.className =
      'absolute right-1 top-1 flex items-center gap-0.5 rounded-full bg-canvas-parchment border border-hairline px-1.5 py-0.5 text-[11px] font-mono';

    const rt = getRuntimeDict();

    if (isOblique) {
      const degBadge = document.createElement('span');
      degBadge.className = 'px-1 text-[10px] font-semibold text-link';
      degBadge.textContent = `${angle.toFixed(0)}°`;
      controls.appendChild(degBadge);
    }

    const tiltBtn = document.createElement('button');
    tiltBtn.type = 'button';
    tiltBtn.dataset.floatingTiltBtn = fr.id;
    tiltBtn.className =
      'inline-flex min-h-[24px] min-w-[24px] items-center justify-center text-[10px] font-semibold text-ink hover:text-link px-1';
    tiltBtn.title = rt.tiltFloatingTitle ?? '+15° angle';
    tiltBtn.setAttribute('aria-label', rt.tiltFloatingAria ?? 'Rotate +15 degrees');
    tiltBtn.textContent = '+15°';
    tiltBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSetAngle(fr.id, normalizeFullAngleDeg(angle + 15));
    });

    const rotateBtn = document.createElement('button');
    rotateBtn.type = 'button';
    rotateBtn.className =
      'inline-flex min-h-[24px] min-w-[24px] items-center justify-center text-ink hover:text-link';
    rotateBtn.title = rt.rotateFloatingTitle;
    rotateBtn.setAttribute('aria-label', rt.rotateFloatingAria);
    rotateBtn.textContent = '↻';
    rotateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onRotate(fr.id);
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className =
      'inline-flex min-h-[24px] min-w-[24px] items-center justify-center text-ink hover:text-error';
    closeBtn.title = rt.removeFloatingTitle;
    closeBtn.setAttribute('aria-label', rt.removeFloatingAria);
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(fr.id);
    });

    controls.appendChild(tiltBtn);
    controls.appendChild(rotateBtn);
    controls.appendChild(closeBtn);
    wrapper.appendChild(controls);

    // Free-angle drag knob on the right tip (when horizontal)
    const angleHandle = document.createElement('button');
    angleHandle.type = 'button';
    angleHandle.dataset.floatingAngleHandle = fr.id;
    angleHandle.setAttribute('aria-label', rt.dragFloatingAngleAria ?? 'Drag to rotate ruler angle');
    angleHandle.title = rt.dragFloatingAngleAria ?? 'Drag to rotate ruler angle';
    angleHandle.className =
      'touch-none absolute -right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-link text-[10px] font-bold text-on-primary shadow cursor-grab active:cursor-grabbing';
    angleHandle.textContent = '⟳';
    angleHandle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      angleHandle.setPointerCapture(e.pointerId);
      const stageRect = stageEl.getBoundingClientRect();
      const pivotX = stageRect.left + fr.x + 22;
      const pivotY = stageRect.top + fr.y + 22;

      const onMoveAngle = (me: PointerEvent) => {
        const dx = me.clientX - pivotX;
        const dy = me.clientY - pivotY;
        const deg = normalizeFullAngleDeg((Math.atan2(dy, dx) * 180) / Math.PI);
        wrapper.dataset.angleDeg = deg.toFixed(1);
        wrapper.style.transformOrigin = '22px 22px';
        wrapper.style.transform = `rotate(${deg.toFixed(1)}deg)`;
        onSetAngle(fr.id, deg);
      };
      const onUpAngle = () => {
        angleHandle.removeEventListener('pointermove', onMoveAngle);
        angleHandle.removeEventListener('pointerup', onUpAngle);
        angleHandle.removeEventListener('pointercancel', onUpAngle);
        onCommit();
      };
      angleHandle.addEventListener('pointermove', onMoveAngle);
      angleHandle.addEventListener('pointerup', onUpAngle);
      angleHandle.addEventListener('pointercancel', onUpAngle);
    });
    if (!isOrthogonalVertical) {
      wrapper.appendChild(angleHandle);
    }

    wrapper.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      e.preventDefault();
      e.stopPropagation();
      wrapper.setPointerCapture(e.pointerId);
      const startX = e.clientX - fr.x;
      const startY = e.clientY - fr.y;
      const onPointerMove = (me: PointerEvent) => {
        const stageRect = stageEl.getBoundingClientRect();
        const maxX = Math.max(0, stageRect.width - 48);
        const maxY = Math.max(0, stageRect.height - 48);
        const nextX = Math.max(0, Math.min(maxX, me.clientX - startX));
        const nextY = Math.max(0, Math.min(maxY, me.clientY - startY));
        wrapper.style.left = `${nextX}px`;
        wrapper.style.top = `${nextY}px`;
        onMove(fr.id, nextX, nextY);
      };
      const onPointerUp = () => {
        wrapper.removeEventListener('pointermove', onPointerMove);
        wrapper.removeEventListener('pointerup', onPointerUp);
        wrapper.removeEventListener('pointercancel', onPointerUp);
        onCommit();
      };
      wrapper.addEventListener('pointermove', onPointerMove);
      wrapper.addEventListener('pointerup', onPointerUp);
      wrapper.addEventListener('pointercancel', onPointerUp);
    });

    layerEl.appendChild(wrapper);
  }
}

export function renderHistoryList(history: readonly MeasurementRecord[]): void {
  const listEl = document.getElementById('measurement-history-list');
  const emptyEl = document.getElementById('measurement-history-empty');
  const clearBtn = document.getElementById('btn-clear-history');
  const exportCsvBtn = document.getElementById('btn-export-history-csv');
  const exportJsonBtn = document.getElementById('btn-export-history-json');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (emptyEl) emptyEl.classList.toggle('hidden', history.length > 0);
  if (clearBtn) clearBtn.classList.toggle('hidden', history.length === 0);
  if (exportCsvBtn) exportCsvBtn.classList.toggle('hidden', history.length === 0);
  if (exportJsonBtn) exportJsonBtn.classList.toggle('hidden', history.length === 0);

  for (const item of history) {
    const li = document.createElement('li');
    li.className =
      'flex items-center justify-between gap-2 rounded-[8px] border border-hairline bg-canvas-parchment px-3 py-2 text-xs font-mono';
    const mmVal = item.lengthMm;
    const cmVal = mmVal / 10;
    const inVal = mmVal / 25.4;
    const pxVal = Math.round(item.lengthPx);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'text-body font-sans truncate';
    labelSpan.textContent = item.label;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'text-ink font-semibold';
    valueSpan.textContent = `${cmVal.toFixed(2)} cm · ${mmVal.toFixed(1)} mm · ${formatInchFraction(inVal, 16)} · ${pxVal} px`;

    li.appendChild(labelSpan);
    li.appendChild(valueSpan);
    listEl.appendChild(li);
  }
}

export interface ProtractorState {
  readonly enabled: boolean;
  readonly angleDeg: number;
  readonly baseDeg?: number;
  readonly mode?: '180' | '360';
  readonly x?: number | null;
  readonly y?: number | null;
}

export function renderProtractorOverlay(
  layerEl: HTMLElement | null,
  stageEl: HTMLElement,
  state: ProtractorState,
  dark: boolean,
  onChange: (patch: Partial<ProtractorState>) => void,
  onClose: () => void,
): void {
  if (!layerEl) return;
  layerEl.innerHTML = '';
  layerEl.classList.toggle('hidden', !state.enabled);
  if (!state.enabled) return;

  const mode = state.mode ?? '180';
  const baseDeg = state.baseDeg ?? 0;

  const wrapper = document.createElement('div');
  const hasPos = typeof state.x === 'number' && typeof state.y === 'number';
  wrapper.className = hasPos
    ? 'protractor-widget pointer-events-auto apple-product-shadow absolute z-30 flex flex-col items-center rounded-[18px] border border-hairline bg-canvas-elevated p-3 sm:p-4 select-none max-w-[calc(100%-16px)]'
    : 'protractor-widget pointer-events-auto apple-product-shadow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center rounded-[18px] border border-hairline bg-canvas-elevated p-3 sm:p-4 select-none max-w-[calc(100%-16px)]';
  if (hasPos) {
    wrapper.style.left = `${state.x}px`;
    wrapper.style.top = `${state.y}px`;
  }
  wrapper.dataset.angleDeg = state.angleDeg.toFixed(1);
  wrapper.dataset.mode = mode;

  const header = document.createElement('div');
  header.className =
    'mb-1.5 flex w-full items-center justify-between gap-2 font-mono text-xs cursor-move touch-none';
  header.title = 'Drag to reposition protractor';

  const rt = getRuntimeDict();
  const readout = document.createElement('span');
  readout.id = 'protractor-angle-readout';
  readout.className = 'font-semibold text-ink';

  const updateReadoutText = (armDeg: number, bDeg: number) => {
    const interior = mode === '360' ? raySweepAngleDeg(bDeg, armDeg) : armDeg;
    const minInterior = interiorAngleDeg(bDeg, armDeg);
    const comp = supplementaryAngleDeg(minInterior);
    wrapper.dataset.angleDeg = interior.toFixed(1);
    readout.textContent =
      mode === '360'
        ? `${rt.angleLabel} ${interior.toFixed(1)}° · Comp ${comp.toFixed(1)}°`
        : `${rt.angleLabel} ${interior.toFixed(1)}°`;
  };
  updateReadoutText(state.angleDeg, baseDeg);

  const actions = document.createElement('div');
  actions.className = 'flex items-center gap-1';

  const modeBtn = document.createElement('button');
  modeBtn.id = 'btn-protractor-mode';
  modeBtn.type = 'button';
  modeBtn.className =
    'inline-flex min-h-[26px] items-center justify-center rounded-full border border-hairline bg-canvas-parchment px-2 text-[11px] font-semibold text-ink hover:text-link cursor-pointer';
  modeBtn.textContent = mode === '360' ? '360°' : '180°';
  modeBtn.title = 'Toggle 180° / 360° protractor';
  modeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nextMode = mode === '180' ? '360' : '180';
    onChange({ mode: nextMode });
  });

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className =
    'inline-flex min-h-[28px] min-w-[28px] items-center justify-center rounded-full border border-hairline bg-canvas-parchment px-2 text-ink hover:text-link cursor-pointer';
  closeBtn.setAttribute('aria-label', rt.closeProtractorAria);
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClose();
  });

  actions.appendChild(modeBtn);
  actions.appendChild(closeBtn);
  header.appendChild(readout);
  header.appendChild(actions);
  wrapper.appendChild(header);

  // Drag header to reposition entire protractor over any object on stage
  header.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    e.preventDefault();
    e.stopPropagation();
    header.setPointerCapture(e.pointerId);
    const stageRect = stageEl.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();
    const initX = wrapRect.left - stageRect.left;
    const initY = wrapRect.top - stageRect.top;
    wrapper.classList.remove('left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2');
    wrapper.style.left = `${initX}px`;
    wrapper.style.top = `${initY}px`;
    const grabX = e.clientX - initX;
    const grabY = e.clientY - initY;

    const onMoveWidget = (me: PointerEvent) => {
      const nextX = Math.max(0, Math.min(stageRect.width - wrapRect.width, me.clientX - grabX));
      const nextY = Math.max(0, Math.min(stageRect.height - wrapRect.height, me.clientY - grabY));
      wrapper.style.left = `${nextX}px`;
      wrapper.style.top = `${nextY}px`;
      onChange({ x: Math.round(nextX), y: Math.round(nextY) });
    };
    const onUpWidget = () => {
      header.removeEventListener('pointermove', onMoveWidget);
      header.removeEventListener('pointerup', onUpWidget);
      header.removeEventListener('pointercancel', onUpWidget);
    };
    header.addEventListener('pointermove', onMoveWidget);
    header.addEventListener('pointerup', onUpWidget);
    header.addEventListener('pointercancel', onUpWidget);
  });

  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'Protractor dial (use Arrow Left and Arrow Right to step angle)');
  const stageAvail = layerEl.clientWidth > 0 ? layerEl.clientWidth - 40 : 320;
  const cssW = Math.min(mode === '360' ? 280 : 320, Math.max(180, stageAvail));
  const scale = cssW / 320;
  const cssH = mode === '360' ? cssW : Math.round(180 * scale);
  const cyOffset = mode === '360' ? cssH / 2 : Math.round(18 * scale);
  const cy = mode === '360' ? cssH / 2 : cssH - cyOffset;
  const cx = cssW / 2;
  const r = mode === '360' ? Math.round(126 * scale) : Math.round(136 * scale);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.className = 'touch-none cursor-crosshair focus:outline-none focus:ring-2 focus:ring-primary-focus rounded-[12px]';

  let currentArm = state.angleDeg;
  let currentBase = baseDeg;

  const draw = (armDeg: number, bDeg: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // Outer arc / circle & baseline
    ctx.strokeStyle = dark ? '#ffffff' : '#1d1d1f';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    if (mode === '360') {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else {
      ctx.arc(cx, cy, r, Math.PI, 0, false);
      ctx.closePath();
    }
    ctx.stroke();

    // Degree ticks
    ctx.font = '600 10px "Geist Mono Variable", "Geist Mono", "SF Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxDeg = mode === '360' ? 359 : 180;
    for (let d = 0; d <= maxDeg; d += 1) {
      const isMajor = d % 30 === 0;
      const isMed = d % 10 === 0;
      const isFive = d % 5 === 0;
      if (!isMajor && !isMed && !isFive && r < 100) continue;

      const rad = (d * Math.PI) / 180;
      const len = isMajor ? 14 : isMed ? 10 : isFive ? 6 : 3;
      const x1 = cx + Math.cos(rad) * r;
      const y1 = cy - Math.sin(rad) * r;
      const x2 = cx + Math.cos(rad) * (r - len);
      const y2 = cy - Math.sin(rad) * (r - len);

      ctx.strokeStyle = isMed ? (dark ? '#ffffff' : '#1d1d1f') : dark ? '#cccccc' : '#7a7a7a';
      ctx.lineWidth = isMajor ? 1.25 : 0.85;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (isMajor && (mode === '180' || d < 360)) {
        const labelOffset = Math.round(24 * scale);
        const lx = cx + Math.cos(rad) * (r - labelOffset);
        const ly = cy - Math.sin(rad) * (r - labelOffset);
        ctx.fillStyle = dark ? '#ffffff' : '#1d1d1f';
        ctx.fillText(`${d}°`, lx, ly);
      }
    }

    // Reference baseline ray in 360° mode
    if (mode === '360') {
      const baseRad = (bDeg * Math.PI) / 180;
      ctx.strokeStyle = dark ? '#ff9f0a' : '#bf4800';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(baseRad) * (r - 2), cy - Math.sin(baseRad) * (r - 2));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Active ray arm in Action Blue (#0066cc) / Sky Link Blue (#2997ff)
    const armRad = (armDeg * Math.PI) / 180;
    const ax = cx + Math.cos(armRad) * (r - 2);
    const ay = cy - Math.sin(armRad) * (r - 2);

    ctx.strokeStyle = dark ? '#2997ff' : '#0066cc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    ctx.fillStyle = dark ? '#2997ff' : '#0066cc';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  draw(currentArm, currentBase);

  const updateFromPointer = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (mode === '360') {
      const deg = pointToFullAngle(cx, cy, px, py);
      if (e.shiftKey) {
        currentBase = deg;
        updateReadoutText(currentArm, currentBase);
        draw(currentArm, currentBase);
        onChange({ baseDeg: currentBase });
      } else {
        currentArm = deg;
        updateReadoutText(currentArm, currentBase);
        draw(currentArm, currentBase);
        onChange({ angleDeg: currentArm });
      }
    } else {
      const nextDeg = pointToProtractorAngle(cx, cy, px, py);
      currentArm = nextDeg;
      updateReadoutText(currentArm, currentBase);
      draw(currentArm, currentBase);
      onChange({ angleDeg: nextDeg });
    }
  };

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    canvas.focus();
    canvas.setPointerCapture(e.pointerId);
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

  canvas.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 5 : e.altKey ? 0.5 : 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      currentArm =
        mode === '360'
          ? normalizeFullAngleDeg(currentArm + step)
          : Math.min(180, Math.round((currentArm + step) * 10) / 10);
      updateReadoutText(currentArm, currentBase);
      draw(currentArm, currentBase);
      onChange({ angleDeg: currentArm });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      currentArm =
        mode === '360'
          ? normalizeFullAngleDeg(currentArm - step)
          : Math.max(0, Math.round((currentArm - step) * 10) / 10);
      updateReadoutText(currentArm, currentBase);
      draw(currentArm, currentBase);
      onChange({ angleDeg: currentArm });
    }
  });

  wrapper.appendChild(canvas);
  layerEl.appendChild(wrapper);
}
