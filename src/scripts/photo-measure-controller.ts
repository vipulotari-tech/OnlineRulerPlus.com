import {
  calibrateScaleFromTwoPoints,
  deltaStatsPx,
  distancePx,
  fitContainRect,
  formatPhotoLength,
  photoPxToUnit,
  type PhotoLengthUnit,
  type PhotoPoint,
  type PhotoScaleCalibration,
} from '../lib/ruler/photo-measure.ts';
import { type InchDivisor, type Unit } from '../lib/ruler/index.ts';

type PhotoTool = 'calibrate' | 'line' | 'rect';

interface SavedLine {
  readonly id: string;
  readonly kind: 'line';
  readonly a: PhotoPoint;
  readonly b: PhotoPoint;
}

interface SavedRect {
  readonly id: string;
  readonly kind: 'rect';
  readonly a: PhotoPoint;
  readonly b: PhotoPoint;
}

type SavedShape = SavedLine | SavedRect;

export interface PhotoControllerHost {
  getUnit: () => Unit;
  getInchDivisor: () => InchDivisor;
  onClose: () => void;
}

export class PhotoMeasureController {
  private readonly host: PhotoControllerHost;
  private readonly panelEl: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly fileInput: HTMLInputElement | null;
  private readonly readoutEl: HTMLElement | null;
  private readonly calBannerEl: HTMLElement | null;
  private readonly calLengthInput: HTMLInputElement | null;
  private readonly calUnitSelect: HTMLSelectElement | null;

  private img: HTMLImageElement | null = null;
  private zoomFactor = 1;
  private tool: PhotoTool = 'calibrate';
  private calA: PhotoPoint | null = null;
  private calB: PhotoPoint | null = null;
  private scale: PhotoScaleCalibration | null = null;

  private pendingStart: PhotoPoint | null = null;
  private hoverPt: PhotoPoint | null = null;
  private shapes: SavedShape[] = [];
  private isOpen = false;

  constructor(host: PhotoControllerHost) {
    this.host = host;
    this.panelEl = document.getElementById('photo-measure-panel') as HTMLElement;
    this.canvas = document.getElementById('photo-measure-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext('2d') ?? null;
    this.fileInput = document.getElementById('photo-file-input') as HTMLInputElement | null;
    this.readoutEl = document.getElementById('photo-measure-readout');
    this.calBannerEl = document.getElementById('photo-cal-status');
    this.calLengthInput = document.getElementById('photo-cal-length') as HTMLInputElement | null;
    this.calUnitSelect = document.getElementById('photo-cal-unit') as HTMLSelectElement | null;

    this.bindEvents();
    this.syncUI();
  }

  public setOpen(open: boolean): void {
    this.isOpen = open;
    this.panelEl.classList.toggle('hidden', !open);
    if (open) {
      window.requestAnimationFrame(() => this.render());
    }
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public refreshUnit(): void {
    this.render();
    this.syncUI();
  }

  public handlePasteEvent(e: ClipboardEvent): boolean {
    const items = e.clipboardData?.items;
    if (!items) return false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          e.preventDefault();
          void this.loadBlob(blob);
          return true;
        }
      }
    }
    return false;
  }

  public async pasteFromClipboardButton(): Promise<void> {
    if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
      this.setReadoutError('Press Ctrl+V (Cmd+V on Mac) to paste a screenshot.');
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith('image/'));
        if (imgType) {
          const blob = await item.getType(imgType);
          await this.loadBlob(blob);
          return;
        }
      }
      this.setReadoutError('No image found in clipboard. Copy an image or press Ctrl+V.');
    } catch {
      this.setReadoutError('Clipboard read blocked by browser — press Ctrl+V anywhere in this panel.');
    }
  }

  public loadBlob(blob: Blob): Promise<void> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        this.img = image;
        this.zoomFactor = 1;
        this.calA = null;
        this.calB = null;
        this.scale = null;
        this.pendingStart = null;
        this.shapes = [];
        this.tool = 'calibrate';
        if (!this.isOpen) this.setOpen(true);
        this.syncUI();
        this.render();
        resolve();
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        this.setReadoutError('Could not read the dropped or pasted image file.');
        resolve();
      };
      image.src = url;
    });
  }

  private setReadoutError(msg: string): void {
    if (this.readoutEl) {
      this.readoutEl.textContent = msg;
      this.readoutEl.dataset.state = 'error';
    }
  }

  private setTool(next: PhotoTool): void {
    this.tool = next;
    this.pendingStart = null;
    this.syncUI();
    this.render();
  }

  private getCanvasLayout(): {
    readonly w: number;
    readonly h: number;
    readonly offsetX: number;
    readonly offsetY: number;
    readonly scale: number;
  } {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(240, Math.round(rect.width || this.panelEl.clientWidth || 640));
    const h = Math.max(220, Math.round(rect.height || 360));
    if (!this.img) {
      return { w, h, offsetX: 0, offsetY: 0, scale: 1 };
    }
    const base = fitContainRect(this.img.naturalWidth, this.img.naturalHeight, w, h, 18);
    const zoomedScale = base.scale * this.zoomFactor;
    const drawW = this.img.naturalWidth * zoomedScale;
    const drawH = this.img.naturalHeight * zoomedScale;
    return {
      w,
      h,
      offsetX: (w - drawW) / 2,
      offsetY: (h - drawH) / 2,
      scale: zoomedScale,
    };
  }

  private clientToImagePoint(clientX: number, clientY: number): PhotoPoint | null {
    if (!this.img) return null;
    const rect = this.canvas.getBoundingClientRect();
    const layout = this.getCanvasLayout();
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const ix = (cx - layout.offsetX) / layout.scale;
    const iy = (cy - layout.offsetY) / layout.scale;
    return {
      x: Math.max(0, Math.min(this.img.naturalWidth, ix)),
      y: Math.max(0, Math.min(this.img.naturalHeight, iy)),
    };
  }

  private applyTwoPointCalibration(): void {
    if (!this.calA || !this.calB) {
      this.setReadoutError('Click 2 reference points on the photo first.');
      return;
    }
    const val = Number(this.calLengthInput?.value ?? '');
    const lenUnit = (this.calUnitSelect?.value ?? 'mm') as PhotoLengthUnit;
    const res = calibrateScaleFromTwoPoints(this.calA, this.calB, val, lenUnit);
    if (!res.ok || !res.value) {
      this.setReadoutError(res.error ?? 'Invalid reference length.');
      return;
    }
    this.scale = res.value;
    this.tool = 'line';
    this.syncUI();
    this.render();
  }

  private bindEvents(): void {
    this.fileInput?.addEventListener('change', () => {
      const file = this.fileInput?.files?.[0];
      if (file) {
        void this.loadBlob(file);
        this.fileInput.value = '';
      }
    });

    document.getElementById('btn-photo-choose')?.addEventListener('click', () => {
      this.fileInput?.click();
    });

    document.getElementById('btn-photo-paste')?.addEventListener('click', () => {
      void this.pasteFromClipboardButton();
    });

    document.getElementById('btn-photo-close')?.addEventListener('click', () => {
      this.setOpen(false);
      this.host.onClose();
    });

    document.querySelectorAll<HTMLButtonElement>('[data-photo-tool]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.photoTool as PhotoTool | undefined;
        if (next === 'calibrate' || next === 'line' || next === 'rect') {
          this.setTool(next);
        }
      });
    });

    document.getElementById('btn-photo-apply-cal')?.addEventListener('click', () => {
      this.applyTwoPointCalibration();
    });

    document.getElementById('btn-photo-card-preset')?.addEventListener('click', () => {
      if (this.calLengthInput) this.calLengthInput.value = '85.6';
      if (this.calUnitSelect) this.calUnitSelect.value = 'mm';
      if (this.calA && this.calB) this.applyTwoPointCalibration();
    });

    document.getElementById('btn-photo-zoom-in')?.addEventListener('click', () => {
      this.zoomFactor = Math.min(6, Math.round(this.zoomFactor * 1.25 * 100) / 100);
      this.render();
    });

    document.getElementById('btn-photo-zoom-out')?.addEventListener('click', () => {
      this.zoomFactor = Math.max(0.25, Math.round((this.zoomFactor / 1.25) * 100) / 100);
      this.render();
    });

    document.getElementById('btn-photo-zoom-fit')?.addEventListener('click', () => {
      this.zoomFactor = 1;
      this.render();
    });

    document.getElementById('btn-photo-undo')?.addEventListener('click', () => {
      if (this.pendingStart) {
        this.pendingStart = null;
      } else if (this.shapes.length > 0) {
        this.shapes = this.shapes.slice(0, -1);
      } else if (this.tool === 'calibrate') {
        if (this.calB) this.calB = null;
        else this.calA = null;
      }
      this.syncUI();
      this.render();
    });

    document.getElementById('btn-photo-clear')?.addEventListener('click', () => {
      this.shapes = [];
      this.pendingStart = null;
      this.syncUI();
      this.render();
    });

    document.getElementById('btn-photo-export')?.addEventListener('click', () => {
      this.exportAnnotatedPng();
    });

    // Drag & Drop support onto panel
    this.panelEl.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    this.panelEl.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        void this.loadBlob(file);
      }
    });

    // Interactive click-to-place & pointer preview on photo canvas
    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.img) return;
      this.hoverPt = this.clientToImagePoint(e.clientX, e.clientY);
      if (this.pendingStart || (this.tool === 'calibrate' && this.calA && !this.calB)) {
        this.render();
      }
    });

    this.canvas.addEventListener('pointerleave', () => {
      this.hoverPt = null;
      this.render();
    });

    this.canvas.addEventListener('click', (e) => {
      const pt = this.clientToImagePoint(e.clientX, e.clientY);
      if (!pt) return;

      if (this.tool === 'calibrate') {
        if (!this.calA || (this.calA && this.calB)) {
          this.calA = pt;
          this.calB = null;
        } else {
          this.calB = pt;
          if (this.calLengthInput && Number(this.calLengthInput.value) > 0) {
            // Keep preview ready; allow explicit Apply or immediate update if desired
          }
        }
        this.syncUI();
        this.render();
        return;
      }

      if (!this.pendingStart) {
        this.pendingStart = pt;
      } else {
        const dist = distancePx(this.pendingStart, pt);
        if (dist >= 1) {
          this.shapes = [
            ...this.shapes,
            {
              id: `ps-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              kind: this.tool === 'rect' ? 'rect' : 'line',
              a: this.pendingStart,
              b: pt,
            },
          ];
        }
        this.pendingStart = null;
      }
      this.syncUI();
      this.render();
    });

    window.addEventListener('resize', () => {
      if (this.isOpen) this.render();
    });
  }

  private syncUI(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-photo-tool]').forEach((btn) => {
      const active = btn.dataset.photoTool === this.tool;
      btn.dataset.active = String(active);
      btn.setAttribute('aria-pressed', String(active));
    });

    const emptyEl = document.getElementById('photo-empty-state');
    if (emptyEl) emptyEl.classList.toggle('hidden', this.img !== null);

    const exportBtn = document.getElementById('btn-photo-export') as HTMLButtonElement | null;
    if (exportBtn) exportBtn.disabled = this.img === null;

    if (this.calBannerEl) {
      if (this.scale) {
        this.calBannerEl.textContent = `Calibrated: ${this.scale.pxPerMm.toFixed(2)} px/mm (${Math.round(this.scale.referencePx)} px = ${this.scale.referenceMm.toFixed(1)} mm) · Local-only`;
        this.calBannerEl.dataset.calibrated = 'true';
      } else {
        this.calBannerEl.textContent =
          'Step 1: Click 2 reference points & set known length (flat perspective recommended) · Never uploaded';
        this.calBannerEl.dataset.calibrated = 'false';
      }
    }

    if (this.readoutEl) {
      this.readoutEl.dataset.state = 'ok';
      const unit = this.host.getUnit();
      const divisor = this.host.getInchDivisor();
      if (!this.img) {
        this.readoutEl.textContent = 'Paste image (Ctrl+V), drop a photo, or choose a file to measure offline.';
      } else if (this.shapes.length > 0) {
        const last = this.shapes[this.shapes.length - 1];
        if (last.kind === 'line') {
          const d = distancePx(last.a, last.b);
          this.readoutEl.textContent = `Line #${this.shapes.length}: ${formatPhotoLength(d, unit, this.scale, divisor)}`;
        } else {
          const st = deltaStatsPx(last.a, last.b);
          const dxLabel = formatPhotoLength(st.dxPx, unit, this.scale, divisor);
          const dyLabel = formatPhotoLength(st.dyPx, unit, this.scale, divisor);
          const diagLabel = formatPhotoLength(st.diagPx, unit, this.scale, divisor);
          this.readoutEl.textContent = `Box ΔX: ${dxLabel} · ΔY: ${dyLabel} · Diag: ${diagLabel}`;
        }
      } else if (this.calA && this.calB) {
        const px = Math.round(distancePx(this.calA, this.calB));
        this.readoutEl.textContent = `Reference span: ${px} px — enter known length and click Apply Scale.`;
      } else if (this.calA) {
        this.readoutEl.textContent = 'Click the second reference point on your image.';
      } else {
        this.readoutEl.textContent = `Loaded ${this.img.naturalWidth}×${this.img.naturalHeight} px · Click 2 reference points or switch tool.`;
      }
    }
  }

  private drawOverlayShapes(
    ctx: CanvasRenderingContext2D,
    toCanvas: (p: PhotoPoint) => PhotoPoint,
    fontPx: number,
  ): void {
    const unit = this.host.getUnit();
    const divisor = this.host.getInchDivisor();

    // Draw reference line if present
    if (this.calA) {
      const ca = toCanvas(this.calA);
      const cb = this.calB ? toCanvas(this.calB) : this.hoverPt && this.tool === 'calibrate' ? toCanvas(this.hoverPt) : null;
      ctx.save();
      ctx.strokeStyle = '#ff9500';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      if (cb) {
        ctx.beginPath();
        ctx.moveTo(ca.x, ca.y);
        ctx.lineTo(cb.x, cb.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff9500';
      ctx.beginPath();
      ctx.arc(ca.x, ca.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      if (this.calB) {
        ctx.beginPath();
        ctx.arc(cb!.x, cb!.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const drawLabel = (text: string, x: number, y: number, bg = '#0066cc') => {
      ctx.save();
      ctx.font = `600 ${fontPx}px ui-monospace, SFMono-Regular, monospace`;
      const padX = 6;
      const metrics = ctx.measureText(text);
      const boxW = metrics.width + padX * 2;
      const boxH = fontPx + 8;
      ctx.fillStyle = bg;
      ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    const drawShape = (shape: SavedShape, dashed = false) => {
      const ca = toCanvas(shape.a);
      const cb = toCanvas(shape.b);
      ctx.save();
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 2;
      if (dashed) ctx.setLineDash([5, 4]);

      if (shape.kind === 'line') {
        ctx.beginPath();
        ctx.moveTo(ca.x, ca.y);
        ctx.lineTo(cb.x, cb.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#0066cc';
        for (const p of [ca, cb]) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        const dist = distancePx(shape.a, shape.b);
        const label = formatPhotoLength(dist, unit, this.scale, divisor);
        drawLabel(label, (ca.x + cb.x) / 2, (ca.y + cb.y) / 2 - 14);
      } else {
        const minX = Math.min(ca.x, cb.x);
        const minY = Math.min(ca.y, cb.y);
        const w = Math.abs(cb.x - ca.x);
        const h = Math.abs(cb.y - ca.y);
        ctx.fillStyle = 'rgba(0, 102, 204, 0.08)';
        ctx.fillRect(minX, minY, w, h);
        ctx.strokeRect(minX, minY, w, h);
        const st = deltaStatsPx(shape.a, shape.b);
        const dxStr = formatPhotoLength(st.dxPx, unit, this.scale, divisor);
        const dyStr = formatPhotoLength(st.dyPx, unit, this.scale, divisor);
        drawLabel(`ΔX: ${dxStr}`, minX + w / 2, Math.max(14, minY - 12));
        drawLabel(`ΔY: ${dyStr}`, minX + w / 2, minY + h + 14);
      }
      ctx.restore();
    };

    for (const s of this.shapes) {
      drawShape(s, false);
    }

    if (this.pendingStart && this.hoverPt) {
      drawShape(
        {
          id: 'preview',
          kind: this.tool === 'rect' ? 'rect' : 'line',
          a: this.pendingStart,
          b: this.hoverPt,
        },
        true,
      );
    }

    void photoPxToUnit;
  }

  public render(): void {
    const ctx = this.ctx;
    if (!ctx || !this.canvas) return;
    const layout = this.getCanvasLayout();
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(1, Math.round(layout.w * dpr));
    const targetH = Math.max(1, Math.round(layout.h * dpr));
    if (this.canvas.width !== targetW) this.canvas.width = targetW;
    if (this.canvas.height !== targetH) this.canvas.height = targetH;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, layout.w, layout.h);

    if (this.img) {
      ctx.drawImage(
        this.img,
        layout.offsetX,
        layout.offsetY,
        this.img.naturalWidth * layout.scale,
        this.img.naturalHeight * layout.scale,
      );
      this.drawOverlayShapes(
        ctx,
        (p) => ({
          x: layout.offsetX + p.x * layout.scale,
          y: layout.offsetY + p.y * layout.scale,
        }),
        11,
      );
    }
    ctx.restore();
  }

  public exportAnnotatedPng(): void {
    if (!this.img) return;
    const offscreen = document.createElement('canvas');
    offscreen.width = this.img.naturalWidth;
    offscreen.height = this.img.naturalHeight;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(this.img, 0, 0);
    const fontPx = Math.max(12, Math.round(Math.min(offscreen.width, offscreen.height) * 0.02));
    this.drawOverlayShapes(ctx, (p) => p, fontPx);

    // Subtle footer calibration stamp inside image export
    const stamp = this.scale
      ? `OnlineRulerPlus.com · Scale: ${this.scale.pxPerMm.toFixed(2)} px/mm · Client-side photo measurement`
      : 'OnlineRulerPlus.com · Uncalibrated pixel measurement · Client-side';
    ctx.save();
    ctx.font = `600 ${Math.max(11, Math.round(fontPx * 0.85))}px ui-monospace, SFMono-Regular, monospace`;
    ctx.fillStyle = 'rgba(29, 29, 31, 0.82)';
    const stampH = fontPx + 10;
    ctx.fillRect(0, offscreen.height - stampH, offscreen.width, stampH);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(stamp, 10, offscreen.height - stampH / 2);
    ctx.restore();

    offscreen.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onlinerulerplus-annotated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }
}
