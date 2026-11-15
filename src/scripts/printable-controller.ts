import {
  buildPrintableRulerSvg,
  type PaperFormat,
  type PrintSheetTemplate,
} from '../lib/ruler/print-svg.ts';

export function initPrintableRuler(): void {
  const root = document.getElementById('printable-ruler-app');
  if (!root) return;

  let template: PrintSheetTemplate = 'ruler-15cm';
  let paper: PaperFormat = 'a4';
  let currentSvg = '';

  const previewHost = document.getElementById('printable-svg-sheet');
  const dimsBadge = document.getElementById('print-sheet-dims');
  const paperSelect = document.getElementById('select-print-paper') as HTMLSelectElement | null;
  const printBtn = document.getElementById('btn-print-sheet');
  const downloadBtn = document.getElementById('btn-download-svg');

  const render = () => {
    const res = buildPrintableRulerSvg(template, paper);
    currentSvg = res.svg;
    if (previewHost) {
      previewHost.innerHTML = res.svg;
      const svgEl = previewHost.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = '100%';
        svgEl.style.height = 'auto';
        svgEl.style.display = 'block';
        svgEl.style.margin = '0 auto';
      }
    }
    if (dimsBadge) {
      dimsBadge.textContent = `${res.widthMm} × ${res.heightMm} mm (${res.orientation})`;
    }
    document.querySelectorAll<HTMLButtonElement>('[data-print-template]').forEach((btn) => {
      const active = btn.dataset.printTemplate === template;
      btn.dataset.active = String(active);
      btn.setAttribute('aria-pressed', String(active));
    });
  };

  document.querySelectorAll<HTMLButtonElement>('[data-print-template]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.printTemplate as PrintSheetTemplate | undefined;
      if (next) {
        template = next;
        render();
      }
    });
  });

  paperSelect?.addEventListener('change', () => {
    paper = paperSelect.value === 'letter' ? 'letter' : 'a4';
    render();
  });

  printBtn?.addEventListener('click', () => {
    window.print();
  });

  downloadBtn?.addEventListener('click', () => {
    if (!currentSvg) return;
    const blob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `onlinerulerplus-${template}-${paper}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  render();
}
