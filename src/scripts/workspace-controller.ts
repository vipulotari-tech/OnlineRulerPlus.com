import { renderRulerToCanvas, type RulerEdge } from '../lib/ruler/canvas-renderer.ts';
import {
  DEFAULT_PREFERENCES,
  EMPTY_CALIBRATION_STORE,
  STORAGE_KEYS,
  appendHistoryRecord,
  formatInchFraction,
  formatNumber,
  formatValue,
  isUnit,
  parseCalibrationStore,
  parseHistory,
  parsePreferences,
  pxToUnit,
  readDisplayInfo,
  resolveCalibration,
  type ActiveCalibration,
  type CalibrationStore,
  type DisplayInfo,
  type MeasurementRecord,
  type RulerPreferences,
  type RulerThickness,
  type Unit,
} from '../lib/ruler/index.ts';
import { formatTemplate, getRuntimeDict } from '../i18n/runtime.ts';
import {
  renderFloatingRulersLayer,
  renderGuidesLayer,
  renderHistoryList,
  renderProtractorOverlay,
  updateGuideSpanBadge,
  type FloatingRuler,
  type GuideLine,
  type ProtractorState,
} from './workspace-overlays.ts';

export const ORIGIN_INSET_PX = 16;

export class WorkspaceController {
  private prefs: RulerPreferences = DEFAULT_PREFERENCES;
  private store: CalibrationStore = EMPTY_CALIBRATION_STORE;
  private display: DisplayInfo;
  private activeCal: ActiveCalibration;
  private history: readonly MeasurementRecord[] = [];
  private guides: readonly GuideLine[] = [];
  private floatingRulers: readonly FloatingRuler[] = [];
  private cursorX: number | null = null;
  private cursorY: number | null = null;
  private guidePlacementAxis: 'both' | 'x' | 'y' = 'x';
  private pseudoFullscreen = false;
  private protractor: ProtractorState = { enabled: false, angleDeg: 45 };

  private readonly workspaceEl: HTMLElement;
  private readonly stageEl: HTMLElement;
  private readonly guidesLayerEl: HTMLElement;
  private readonly floatingLayerEl: HTMLElement;
  private readonly protractorLayerEl: HTMLElement | null;
  private readonly crosshairXEl: HTMLElement;
  private readonly crosshairYEl: HTMLElement;
  private readonly crosshairBadgeEl: HTMLElement;
  private readonly canvases: Readonly<Record<RulerEdge, HTMLCanvasElement>>;

  constructor(root: Document = document) {
    this.display = readDisplayInfo(window);
    this.loadFromStorage();
    this.activeCal = resolveCalibration(this.store, this.display);

    this.workspaceEl = root.getElementById('ruler-workspace') as HTMLElement;
    this.stageEl = root.getElementById('ruler-stage') as HTMLElement;
    this.guidesLayerEl = root.getElementById('guides-layer') as HTMLElement;
    this.floatingLayerEl = root.getElementById('floating-rulers-layer') as HTMLElement;
    this.protractorLayerEl = root.getElementById('protractor-layer');
    this.crosshairXEl = root.getElementById('crosshair-x') as HTMLElement;
    this.crosshairYEl = root.getElementById('crosshair-y') as HTMLElement;
    this.crosshairBadgeEl = root.getElementById('crosshair-badge') as HTMLElement;

    this.canvases = {
      top: root.getElementById('ruler-canvas-top') as HTMLCanvasElement,
      bottom: root.getElementById('ruler-canvas-bottom') as HTMLCanvasElement,
      left: root.getElementById('ruler-canvas-left') as HTMLCanvasElement,
      right: root.getElementById('ruler-canvas-right') as HTMLCanvasElement,
    };

    this.bindToolbarEvents();
    this.bindStageEvents();
    this.bindKeyboardShortcuts();
    this.observeWorkspaceResize();
    this.syncAll();
  }

  public getCalibration(): ActiveCalibration {
    return this.activeCal;
  }

  public getDisplay(): DisplayInfo {
    return this.display;
  }

  public getStore(): CalibrationStore {
    return this.store;
  }

  public getPreferences(): RulerPreferences {
    return this.prefs;
  }

  public updateCalibrationStore(nextStore: CalibrationStore, nextDisplay?: DisplayInfo): void {
    this.store = nextStore;
    if (nextDisplay) this.display = nextDisplay;
    try {
      localStorage.setItem(STORAGE_KEYS.calibration, JSON.stringify(this.store));
    } catch {
      // Storage quota or private mode; continue in-memory
    }
    this.activeCal = resolveCalibration(this.store, this.display);
    this.syncAll();
    window.dispatchEvent(
      new CustomEvent('orp:calibration-changed', {
        detail: { calibration: this.activeCal, display: this.display },
      }),
    );
  }

  public refreshForDisplayChange(nextDisplay: DisplayInfo): void {
    this.display = nextDisplay;
    this.activeCal = resolveCalibration(this.store, this.display);
    this.syncAll();
  }

  private loadFromStorage(): void {
    try {
      this.prefs = parsePreferences(localStorage.getItem(STORAGE_KEYS.preferences));
      this.store = parseCalibrationStore(localStorage.getItem(STORAGE_KEYS.calibration));
      this.history = parseHistory(localStorage.getItem(STORAGE_KEYS.history));
    } catch {
      this.prefs = DEFAULT_PREFERENCES;
      this.store = EMPTY_CALIBRATION_STORE;
      this.history = [];
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(this.prefs));
    } catch {
      // Ignore storage errors
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(this.history));
    } catch {
      // Ignore storage errors
    }
  }

  public setUnit(unit: Unit, persist = true): void {
    this.prefs = { ...this.prefs, unit };
    if (persist) this.savePreferences();
    this.syncAll();
  }

  public toggleEdge(edge: RulerEdge): void {
    const enabledCount = Object.values(this.prefs.edges).filter(Boolean).length;
    if (this.prefs.edges[edge] && enabledCount <= 1) return;
    const nextEdges = { ...this.prefs.edges, [edge]: !this.prefs.edges[edge] };
    this.prefs = { ...this.prefs, edges: nextEdges };
    this.savePreferences();
    this.syncAll();
  }

  public setAllEdges(): void {
    const allOn =
      this.prefs.edges.top &&
      this.prefs.edges.bottom &&
      this.prefs.edges.left &&
      this.prefs.edges.right;
    this.prefs = {
      ...this.prefs,
      edges: allOn
        ? { top: true, left: true, bottom: false, right: false }
        : { top: true, bottom: true, left: true, right: true },
    };
    this.savePreferences();
    this.syncAll();
  }

  public setEdgePreset(preset: 'horizontal' | 'vertical' | 'all' | 'top-left', persist = true): void {
    const edges =
      preset === 'horizontal'
        ? { top: true, bottom: true, left: false, right: false }
        : preset === 'vertical'
          ? { top: false, bottom: false, left: true, right: true }
          : preset === 'all'
            ? { top: true, bottom: true, left: true, right: true }
            : { top: true, bottom: false, left: true, right: false };
    this.prefs = { ...this.prefs, edges };
    if (persist) this.savePreferences();
    this.syncAll();
  }

  public toggleDualUnit(): void {
    this.prefs = { ...this.prefs, dualUnit: !this.prefs.dualUnit };
    this.savePreferences();
    this.syncAll();
  }

  public setThickness(thickness: RulerThickness): void {
    this.prefs = { ...this.prefs, thickness };
    this.savePreferences();
    this.syncAll();
  }

  public setOpacity(opacity: number): void {
    const clamped = Math.max(0.4, Math.min(1, Math.round(opacity * 100) / 100));
    this.prefs = { ...this.prefs, opacity: clamped };
    this.savePreferences();
    this.syncAll();
  }

  public toggleGuides(): void {
    this.prefs = { ...this.prefs, guidesEnabled: !this.prefs.guidesEnabled };
    this.savePreferences();
    this.syncAll();
  }

  public toggleCrosshair(): void {
    this.prefs = { ...this.prefs, crosshairEnabled: !this.prefs.crosshairEnabled };
    this.savePreferences();
    this.syncAll();
  }

  public toggleProtractor(): void {
    this.protractor = { ...this.protractor, enabled: !this.protractor.enabled };
    this.syncAll();
  }

  public clearGuides(): void {
    this.guides = [];
    this.syncOverlays();
    this.updateReadoutDOM();
  }

  public addGuide(axis: 'x' | 'y', px: number): void {
    const clamped = Math.max(0, Math.round(px * 10) / 10);
    const id = `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.guides = [...this.guides, { id, axis, px: clamped }];
    if (!this.prefs.guidesEnabled) {
      this.prefs = { ...this.prefs, guidesEnabled: true };
      this.savePreferences();
    }
    this.syncAll();
  }

  public addFloatingRuler(): void {
    if (this.floatingRulers.length >= 4) return;
    const offset = this.floatingRulers.length * 28;
    const stageRect = this.stageEl.getBoundingClientRect();
    const maxLen = Math.max(180, Math.min(420, Math.floor(stageRect.width - 64)));
    const x = Math.min(32 + offset, Math.max(8, Math.floor(stageRect.width - maxLen - 8)));
    const y = Math.min(56 + offset, Math.max(8, Math.floor(stageRect.height - 64)));
    this.floatingRulers = [
      ...this.floatingRulers,
      {
        id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        orientation: 'horizontal',
        x,
        y,
        lengthPx: maxLen,
      },
    ];
    this.syncOverlays();
  }

  public recordMeasurement(lengthPx: number, label: string): void {
    if (!(lengthPx > 0)) return;
    const lengthMm = pxToUnit(lengthPx, 'mm', this.activeCal.pxPerMm);
    const rec: MeasurementRecord = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lengthMm,
      lengthPx,
      unit: this.prefs.unit,
      label,
      createdAt: Date.now(),
    };
    this.history = appendHistoryRecord(this.history, rec);
    this.saveHistory();
    renderHistoryList(this.history);
  }

  public clearHistory(): void {
    this.history = [];
    this.saveHistory();
    renderHistoryList(this.history);
  }

  public async toggleFullscreen(): Promise<void> {
    if (!this.workspaceEl) return;
    if (document.fullscreenElement === this.workspaceEl) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore
      }
      this.pseudoFullscreen = false;
      this.syncFullscreenState();
      return;
    }
    if (this.pseudoFullscreen) {
      this.pseudoFullscreen = false;
      this.syncFullscreenState();
      return;
    }
    if (typeof this.workspaceEl.requestFullscreen === 'function') {
      try {
        await this.workspaceEl.requestFullscreen();
        this.syncFullscreenState();
        return;
      } catch {
        // Fallback to viewport-filling fixed mode when Fullscreen API is blocked
      }
    }
    this.pseudoFullscreen = !this.pseudoFullscreen;
    this.syncFullscreenState();
  }

  private syncFullscreenState(): void {
    const active = document.fullscreenElement === this.workspaceEl || this.pseudoFullscreen;
    this.workspaceEl.classList.toggle('fixed', this.pseudoFullscreen);
    this.workspaceEl.classList.toggle('inset-0', this.pseudoFullscreen);
    this.workspaceEl.classList.toggle('z-50', this.pseudoFullscreen);
    this.workspaceEl.classList.toggle('h-screen', this.pseudoFullscreen);
    this.workspaceEl.dataset.fullscreen = active ? 'true' : 'false';
    const btn = document.getElementById('btn-fullscreen');
    if (btn) {
      btn.setAttribute('aria-pressed', String(active));
      const span = btn.querySelector('span');
      if (span) {
        const nextText = active ? btn.dataset.labelExit : btn.dataset.labelEnter;
        if (nextText) span.textContent = nextText;
      }
    }
    this.syncAll();
  }

  public syncAll(): void {
    if (!this.workspaceEl) return;
    const { unit, edges, dualUnit, thickness, opacity, guidesEnabled, crosshairEnabled } =
      this.prefs;
    const dark = document.documentElement.classList.contains('dark');

    document.querySelectorAll<HTMLButtonElement>('[data-unit-btn]').forEach((btn) => {
      const active = btn.dataset.unitBtn === unit;
      btn.setAttribute('aria-pressed', String(active));
      btn.dataset.active = String(active);
    });

    (['top', 'bottom', 'left', 'right'] as const).forEach((edge) => {
      const btn = document.querySelector<HTMLButtonElement>(`[data-edge-btn="${edge}"]`);
      if (btn) {
        btn.setAttribute('aria-pressed', String(edges[edge]));
        btn.dataset.active = String(edges[edge]);
      }
    });

    const allEdgesOn = edges.top && edges.bottom && edges.left && edges.right;
    const allBtn = document.querySelector<HTMLButtonElement>('[data-edge-btn="all"]');
    if (allBtn) {
      allBtn.setAttribute('aria-pressed', String(allEdgesOn));
      allBtn.dataset.active = String(allEdgesOn);
    }

    const dualBtn = document.getElementById('btn-dual-unit');
    if (dualBtn) {
      dualBtn.setAttribute('aria-pressed', String(dualUnit));
      dualBtn.dataset.active = String(dualUnit);
    }

    const guidesBtn = document.getElementById('btn-toggle-guides');
    if (guidesBtn) {
      guidesBtn.setAttribute('aria-pressed', String(guidesEnabled));
      guidesBtn.dataset.active = String(guidesEnabled);
    }

    const crossBtn = document.getElementById('btn-toggle-crosshair');
    if (crossBtn) {
      crossBtn.setAttribute('aria-pressed', String(crosshairEnabled));
      crossBtn.dataset.active = String(crosshairEnabled);
    }

    const protBtn = document.getElementById('btn-toggle-protractor');
    if (protBtn) {
      protBtn.setAttribute('aria-pressed', String(this.protractor.enabled));
      protBtn.dataset.active = String(this.protractor.enabled);
    }

    const shortcutsToggle = document.getElementById(
      'toggle-shortcuts-enabled',
    ) as HTMLInputElement | null;
    if (shortcutsToggle) {
      shortcutsToggle.checked = this.prefs.shortcutsEnabled !== false;
    }

    const thicknessSelect = document.getElementById('select-thickness') as HTMLSelectElement | null;
    if (thicknessSelect) thicknessSelect.value = String(thickness);

    const opacitySlider = document.getElementById('slider-opacity') as HTMLInputElement | null;
    if (opacitySlider) opacitySlider.value = String(Math.round(opacity * 100));
    const opacityLabel = document.getElementById('label-opacity');
    if (opacityLabel) opacityLabel.textContent = `${Math.round(opacity * 100)}%`;

    const rect = this.workspaceEl.getBoundingClientRect();
    const totalW = Math.max(280, Math.floor(rect.width));
    const totalH = Math.max(260, Math.floor(rect.height));

    const leftOffset = edges.left ? thickness : 0;
    const rightOffset = edges.right ? thickness : 0;
    const topOffset = edges.top ? thickness : 0;
    const bottomOffset = edges.bottom ? thickness : 0;

    this.syncCornerBadges(edges, thickness, unit);

    const horizLength = Math.max(60, totalW - leftOffset - rightOffset);
    const vertLength = Math.max(60, totalH - topOffset - bottomOffset);

    this.configureEdgeCanvas('top', edges.top, {
      left: `${leftOffset}px`,
      top: '0px',
      width: `${horizLength}px`,
      height: `${thickness}px`,
      lengthPx: horizLength,
      cursorPosPx: this.cursorX,
      dark,
    });

    this.configureEdgeCanvas('bottom', edges.bottom, {
      left: `${leftOffset}px`,
      bottom: '0px',
      width: `${horizLength}px`,
      height: `${thickness}px`,
      lengthPx: horizLength,
      cursorPosPx: this.cursorX,
      dark,
    });

    this.configureEdgeCanvas('left', edges.left, {
      left: '0px',
      top: `${topOffset}px`,
      width: `${thickness}px`,
      height: `${vertLength}px`,
      lengthPx: vertLength,
      cursorPosPx: this.cursorY,
      dark,
    });

    this.configureEdgeCanvas('right', edges.right, {
      right: '0px',
      top: `${topOffset}px`,
      width: `${thickness}px`,
      height: `${vertLength}px`,
      lengthPx: vertLength,
      cursorPosPx: this.cursorY,
      dark,
    });

    this.stageEl.style.left = `${leftOffset}px`;
    this.stageEl.style.right = `${rightOffset}px`;
    this.stageEl.style.top = `${topOffset}px`;
    this.stageEl.style.bottom = `${bottomOffset}px`;

    this.workspaceEl.dataset.unit = unit;
    this.workspaceEl.dataset.pxPerMm = this.activeCal.pxPerMm.toFixed(4);
    this.workspaceEl.dataset.cssPpi = this.activeCal.cssPpi.toFixed(2);
    this.workspaceEl.dataset.calibrationStatus = this.activeCal.status;
    this.workspaceEl.dataset.edges = Object.entries(edges)
      .filter(([, on]) => on)
      .map(([k]) => k)
      .join(',');

    this.syncOverlays();
    renderHistoryList(this.history);
    this.updateReadoutDOM();
  }

  private syncOverlays(): void {
    const dark = document.documentElement.classList.contains('dark');
    const formatCoord = (px: number) => this.formatCoord(px);

    renderGuidesLayer({
      layerEl: this.guidesLayerEl,
      stageEl: this.stageEl,
      guides: this.guides,
      enabled: this.prefs.guidesEnabled,
      originInsetPx: ORIGIN_INSET_PX,
      formatCoord,
      onUpdateGuide: (id, nextPx) => {
        this.guides = this.guides.map((g) => (g.id === id ? { ...g, px: nextPx } : g));
        updateGuideSpanBadge(this.guides, formatCoord);
      },
      onRemoveGuide: (id) => {
        this.guides = this.guides.filter((g) => g.id !== id);
        this.syncOverlays();
        this.updateReadoutDOM();
      },
    });

    renderFloatingRulersLayer({
      layerEl: this.floatingLayerEl,
      stageEl: this.stageEl,
      rulers: this.floatingRulers,
      prefs: this.prefs,
      pxPerMm: this.activeCal.pxPerMm,
      originInsetPx: ORIGIN_INSET_PX,
      dark,
      onRotate: (id) => {
        const stageW = this.stageEl.clientWidth;
        const stageH = this.stageEl.clientHeight;
        this.floatingRulers = this.floatingRulers.map((r) => {
          if (r.id !== id) return r;
          const nextOrient = r.orientation === 'horizontal' ? 'vertical' : 'horizontal';
          const nextW = nextOrient === 'horizontal' ? r.lengthPx : 46;
          const nextH = nextOrient === 'horizontal' ? 46 : r.lengthPx;
          return {
            ...r,
            orientation: nextOrient,
            x: Math.max(0, Math.min(r.x, Math.max(0, stageW - Math.min(nextW, 48)))),
            y: Math.max(0, Math.min(r.y, Math.max(0, stageH - Math.min(nextH, 48)))),
          };
        });
        this.syncOverlays();
      },
      onMove: (id, x, y) => {
        this.floatingRulers = this.floatingRulers.map((r) =>
          r.id === id ? { ...r, x, y } : r,
        );
      },
      onRemove: (id) => {
        this.floatingRulers = this.floatingRulers.filter((r) => r.id !== id);
        this.syncOverlays();
      },
    });

    renderProtractorOverlay(
      this.protractorLayerEl,
      this.protractor,
      dark,
      (nextDeg) => {
        this.protractor = { ...this.protractor, angleDeg: nextDeg };
      },
      () => {
        this.protractor = { ...this.protractor, enabled: false };
        this.syncAll();
      },
    );

    const datumHint = document.getElementById('stage-datum-hint');
    if (datumHint) {
      const hasActiveStageItems =
        (this.prefs.guidesEnabled && this.guides.length > 0) ||
        this.floatingRulers.length > 0 ||
        this.protractor.enabled;
      datumHint.classList.toggle('opacity-0', hasActiveStageItems);
    }
  }

  private syncCornerBadges(
    edges: RulerPreferences['edges'],
    thickness: number,
    unit: Unit,
  ): void {
    const corners: readonly [string, boolean][] = [
      ['corner-top-left', edges.top && edges.left],
      ['corner-top-right', edges.top && edges.right],
      ['corner-bottom-left', edges.bottom && edges.left],
      ['corner-bottom-right', edges.bottom && edges.right],
    ];
    for (const [id, show] of corners) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle('hidden', !show);
      el.style.width = `${thickness}px`;
      el.style.height = `${thickness}px`;
      if (id === 'corner-top-left') el.textContent = unit;
    }
  }

  private configureEdgeCanvas(
    edge: RulerEdge,
    visible: boolean,
    geom: {
      readonly left?: string;
      readonly right?: string;
      readonly top?: string;
      readonly bottom?: string;
      readonly width: string;
      readonly height: string;
      readonly lengthPx: number;
      readonly cursorPosPx: number | null;
      readonly dark: boolean;
    },
  ): void {
    const canvas = this.canvases[edge];
    if (!canvas) return;
    canvas.classList.toggle('hidden', !visible);
    if (!visible) return;

    if (geom.left !== undefined) canvas.style.left = geom.left;
    if (geom.right !== undefined) canvas.style.right = geom.right;
    if (geom.top !== undefined) canvas.style.top = geom.top;
    if (geom.bottom !== undefined) canvas.style.bottom = geom.bottom;
    canvas.style.width = geom.width;
    canvas.style.height = geom.height;
    canvas.style.opacity = String(this.prefs.opacity);

    const { primaryTicks } = renderRulerToCanvas(canvas, {
      edge,
      lengthPx: geom.lengthPx,
      thicknessPx: this.prefs.thickness,
      originInsetPx: ORIGIN_INSET_PX,
      unit: this.prefs.unit,
      dualUnit: this.prefs.dualUnit,
      pxPerMm: this.activeCal.pxPerMm,
      dpr: window.devicePixelRatio || 1,
      dark: geom.dark,
      cursorPosPx: geom.cursorPosPx,
    });

    canvas.dataset.tickCount = String(primaryTicks.length);
    canvas.dataset.majorLabels = primaryTicks
      .filter((t) => t.label !== undefined)
      .map((t) => t.label)
      .join(',');
  }

  private formatCoord(px: number): string {
    const val = pxToUnit(px, this.prefs.unit, this.activeCal.pxPerMm);
    const primary = formatValue(val, this.prefs.unit);
    if (this.prefs.unit === 'in') {
      return `${primary} (${formatInchFraction(val, 16)})`;
    }
    if (this.prefs.dualUnit) {
      const inches = pxToUnit(px, 'in', this.activeCal.pxPerMm);
      return `${primary} · ${formatInchFraction(inches, 16)}`;
    }
    return primary;
  }

  private updateReadoutDOM(): void {
    const readoutEl = document.getElementById('live-cursor-readout');
    if (!readoutEl) return;

    if (this.cursorX === null || this.cursorY === null) {
      const maxW = Math.max(0, this.stageEl.clientWidth - ORIGIN_INSET_PX - 8);
      const maxH = Math.max(0, this.stageEl.clientHeight - ORIGIN_INSET_PX - 8);
      const wVal = formatValue(pxToUnit(maxW, this.prefs.unit, this.activeCal.pxPerMm), this.prefs.unit);
      const hVal = formatValue(pxToUnit(maxH, this.prefs.unit, this.activeCal.pxPerMm), this.prefs.unit);
      readoutEl.textContent = `${getRuntimeDict().rangeLabel} ${wVal} × ${hVal}`;
      return;
    }

    const xVal = pxToUnit(this.cursorX, this.prefs.unit, this.activeCal.pxPerMm);
    const yVal = pxToUnit(this.cursorY, this.prefs.unit, this.activeCal.pxPerMm);
    const xStr = formatNumber(xVal, this.prefs.unit);
    const yStr = formatNumber(yVal, this.prefs.unit);

    if (this.prefs.unit === 'in') {
      readoutEl.textContent = `X: ${xStr} in (${formatInchFraction(xVal, 16)}) · Y: ${yStr} in`;
    } else {
      readoutEl.textContent = `X: ${xStr} ${this.prefs.unit} · Y: ${yStr} ${this.prefs.unit}`;
    }
  }

  private bindToolbarEvents(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-unit-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const u = btn.dataset.unitBtn;
        if (isUnit(u)) this.setUnit(u);
      });
    });

    (['top', 'bottom', 'left', 'right'] as const).forEach((edge) => {
      const btn = document.querySelector<HTMLButtonElement>(`[data-edge-btn="${edge}"]`);
      btn?.addEventListener('click', () => this.toggleEdge(edge));
    });

    document.querySelector<HTMLButtonElement>('[data-edge-btn="all"]')?.addEventListener('click', () => this.setAllEdges());
    document.getElementById('btn-dual-unit')?.addEventListener('click', () => this.toggleDualUnit());
    document.getElementById('btn-toggle-guides')?.addEventListener('click', () => this.toggleGuides());
    document.getElementById('btn-clear-guides')?.addEventListener('click', () => this.clearGuides());
    document.getElementById('btn-toggle-crosshair')?.addEventListener('click', () => this.toggleCrosshair());
    document.getElementById('btn-toggle-protractor')?.addEventListener('click', () => this.toggleProtractor());
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => void this.toggleFullscreen());
    document.getElementById('btn-add-floating-ruler')?.addEventListener('click', () => this.addFloatingRuler());

    const shortcutsToggle = document.getElementById(
      'toggle-shortcuts-enabled',
    ) as HTMLInputElement | null;
    shortcutsToggle?.addEventListener('change', () => {
      this.prefs = { ...this.prefs, shortcutsEnabled: shortcutsToggle.checked };
      this.savePreferences();
    });

    document.getElementById('btn-save-span')?.addEventListener('click', () => {
      const rt = getRuntimeDict();
      const badge = document.getElementById('guide-span-readout');
      const px = Number(badge?.dataset.spanPx ?? 0);
      const label = badge?.dataset.spanLabel ?? formatTemplate(rt.spanGuideLabel, { axis: 'ΔX' });
      const yPx = Number(badge?.dataset.spanYPx ?? 0);
      const yLabel = badge?.dataset.spanYLabel ?? formatTemplate(rt.spanGuideLabel, { axis: 'ΔY' });
      if (px > 0) this.recordMeasurement(px, label);
      if (yPx > 0) this.recordMeasurement(yPx, yLabel);
    });

    document.getElementById('btn-clear-history')?.addEventListener('click', () => this.clearHistory());

    const thicknessSelect = document.getElementById('select-thickness') as HTMLSelectElement | null;
    thicknessSelect?.addEventListener('change', () => {
      const v = Number(thicknessSelect.value);
      if (v === 36 || v === 48 || v === 64) this.setThickness(v);
    });

    const opacitySlider = document.getElementById('slider-opacity') as HTMLInputElement | null;
    opacitySlider?.addEventListener('input', () => {
      this.setOpacity(Number(opacitySlider.value) / 100);
    });

    document.querySelectorAll<HTMLButtonElement>('[data-guide-axis-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const axis = btn.dataset.guideAxisBtn;
        if (axis === 'x' || axis === 'y' || axis === 'both') {
          this.guidePlacementAxis = axis;
          document.querySelectorAll<HTMLButtonElement>('[data-guide-axis-btn]').forEach((b) => {
            const active = b.dataset.guideAxisBtn === axis;
            b.dataset.active = String(active);
            b.setAttribute('aria-pressed', String(active));
          });
        }
      });
    });

    document.addEventListener('fullscreenchange', () => this.syncFullscreenState());
  }

  private bindStageEvents(): void {
    this.workspaceEl.addEventListener('pointermove', (e) => {
      const stageRect = this.stageEl.getBoundingClientRect();
      const x = Math.max(0, e.clientX - stageRect.left - ORIGIN_INSET_PX);
      const y = Math.max(0, e.clientY - stageRect.top - ORIGIN_INSET_PX);
      this.cursorX = x;
      this.cursorY = y;

      if (this.prefs.crosshairEnabled) {
        const stageX = ORIGIN_INSET_PX + x;
        const stageY = ORIGIN_INSET_PX + y;
        this.crosshairXEl.classList.remove('hidden');
        this.crosshairYEl.classList.remove('hidden');
        this.crosshairBadgeEl.classList.remove('hidden');
        this.crosshairXEl.style.left = `${stageX}px`;
        this.crosshairYEl.style.top = `${stageY}px`;
        this.crosshairBadgeEl.style.left = `${Math.min(stageRect.width - 150, stageX + 10)}px`;
        this.crosshairBadgeEl.style.top = `${Math.max(8, stageY - 28)}px`;
        this.crosshairBadgeEl.textContent = `${this.formatCoord(x)}, ${this.formatCoord(y)}`;
      } else {
        this.crosshairXEl.classList.add('hidden');
        this.crosshairYEl.classList.add('hidden');
        this.crosshairBadgeEl.classList.add('hidden');
      }
      this.updateReadoutDOM();
    });

    this.workspaceEl.addEventListener('pointerleave', () => {
      this.cursorX = null;
      this.cursorY = null;
      this.crosshairXEl.classList.add('hidden');
      this.crosshairYEl.classList.add('hidden');
      this.crosshairBadgeEl.classList.add('hidden');
      this.updateReadoutDOM();
    });

    (['top', 'bottom'] as const).forEach((edge) => {
      this.canvases[edge]?.addEventListener('click', (e) => {
        const rect = this.canvases[edge].getBoundingClientRect();
        const px = e.clientX - rect.left - ORIGIN_INSET_PX;
        if (px >= 0) this.addGuide('x', px);
      });
    });

    (['left', 'right'] as const).forEach((edge) => {
      this.canvases[edge]?.addEventListener('click', (e) => {
        const rect = this.canvases[edge].getBoundingClientRect();
        const px = e.clientY - rect.top - ORIGIN_INSET_PX;
        if (px >= 0) this.addGuide('y', px);
      });
    });

    this.stageEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.guide-line') ||
        target.closest('.floating-ruler') ||
        target.closest('.protractor-widget') ||
        target.closest('[data-stage-interactive]')
      ) {
        return;
      }
      if (!this.prefs.guidesEnabled) return;
      const stageRect = this.stageEl.getBoundingClientRect();
      const x = e.clientX - stageRect.left - ORIGIN_INSET_PX;
      const y = e.clientY - stageRect.top - ORIGIN_INSET_PX;
      if ((this.guidePlacementAxis === 'x' || this.guidePlacementAxis === 'both') && x >= 0) {
        this.addGuide('x', x);
      }
      if ((this.guidePlacementAxis === 'y' || this.guidePlacementAxis === 'both') && y >= 0) {
        this.addGuide('y', y);
      }
    });
  }

  private bindKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.isContentEditable)
      ) {
        if (e.key === 'Escape') active.blur();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (this.prefs.shortcutsEnabled === false && e.key !== 'Escape') return;

      switch (e.key.toLowerCase()) {
        case 'g':
          e.preventDefault();
          this.toggleGuides();
          break;
        case 'c':
          e.preventDefault();
          this.toggleCrosshair();
          break;
        case 'p':
          e.preventDefault();
          this.toggleProtractor();
          break;
        case 'f':
          e.preventDefault();
          void this.toggleFullscreen();
          break;
        case '1':
          e.preventDefault();
          this.setUnit('cm');
          break;
        case '2':
          e.preventDefault();
          this.setUnit('in');
          break;
        case '3':
          e.preventDefault();
          this.setUnit('px');
          break;
        case '4':
        case 'm':
          e.preventDefault();
          this.setUnit('mm');
          break;
        case 'd':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('orp:toggle-theme'));
          break;
        case 'h':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('orp:toggle-help'));
          break;
        case 'escape': {
          const helpModal = document.getElementById('help-shortcuts-modal');
          if (helpModal && !helpModal.classList.contains('hidden')) {
            window.dispatchEvent(new CustomEvent('orp:close-dialogs'));
          } else if (this.pseudoFullscreen) {
            this.pseudoFullscreen = false;
            this.syncFullscreenState();
          } else {
            this.clearGuides();
          }
          break;
        }
        default:
          break;
      }
    });
  }

  private observeWorkspaceResize(): void {
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => this.syncAll());
      ro.observe(this.workspaceEl);
    }
  }
}
