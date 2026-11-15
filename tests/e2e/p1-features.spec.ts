import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import zlib from 'node:zlib';

/** Builds a valid minimal RGBA PNG buffer purely in Node without external dependencies. */
function makeSolidPng(width: number, height: number): Buffer {
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  const crc32 = (buf: Buffer): number => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer): Buffer => {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOff = y * rowSize;
    raw[rowOff] = 0;
    for (let x = 0; x < width; x++) {
      const p = rowOff + 1 + x * 4;
      raw[p] = 240;
      raw[p + 1] = 244;
      raw[p + 2] = 248;
      raw[p + 3] = 255;
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

test.describe('P1 Features — Reference Calibration, cm+px/in+px & 1/32", Bounding Box, Client-Side Photo/Ctrl+V', () => {
  test('P1.1: direct corner pointer drag and A4 / 2x-3x Card / Quarter / Custom presets persist across reload', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    // 1. Direct corner-drag handle resizes card calibration box smoothly
    const boxBefore = Number(
      await page.locator('#card-calibration-box').getAttribute('data-card-width-px'),
    );
    const handle = page.locator('#card-drag-handle');
    await handle.scrollIntoViewIfNeeded();
    const hb = await handle.boundingBox();
    expect(hb).not.toBeNull();
    await page.mouse.move(hb!.x + hb!.width / 2, hb!.y + hb!.height / 2);
    await page.mouse.down();
    await page.mouse.move(hb!.x + hb!.width / 2 + 48, hb!.y + hb!.height / 2 + 12, { steps: 6 });
    await page.mouse.up();

    const boxAfterDrag = Number(
      await page.locator('#card-calibration-box').getAttribute('data-card-width-px'),
    );
    expect(boxAfterDrag).toBeCloseTo(boxBefore + 48, 0);

    // 2. Coin preset displays circular geometry
    await page.locator('[data-ref-preset="us-quarter"]').click();
    await expect(page.locator('#card-calibration-box')).toHaveAttribute('data-ref-preset', 'us-quarter');
    const borderRad = await page.locator('#card-calibration-box').evaluate((el) => el.style.borderRadius);
    expect(borderRad).toBe('9999px');

    fs.mkdirSync('docs/qa-screenshots', { recursive: true });
    await page.locator('#calibration').screenshot({ path: 'docs/qa-screenshots/p1-reference-presets.png' });

    // 3. 2x Card preset displays 171.20 mm reference
    await page.locator('[data-ref-preset="card-2x"]').click();
    await expect(page.locator('#card-ref-width-label')).toHaveText('171.20 mm');

    // 4. Custom object input (50 cm = 500 mm)
    await page.locator('[data-ref-preset="custom"]').click();
    await expect(page.locator('#custom-ref-row')).toBeVisible();
    await page.locator('#select-custom-ref-unit').selectOption('cm');
    await page.locator('#input-custom-ref-length').fill('50');
    await expect(page.locator('#card-ref-width-label')).toHaveText('500.00 mm');

    // 5. A4 Width (210 mm) at 840 px = 4.0000 px/mm persists across reload
    await page.locator('[data-ref-preset="a4-width"]').click();
    await page.locator('#input-card-px').fill('840');
    await page.locator('#input-card-px').dispatchEvent('change');
    await page.locator('#btn-apply-card').click();

    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-px-per-mm', '4.0000');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-css-ppi', '101.60');
    await page.reload();
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-px-per-mm', '4.0000');
  });

  test('P1.3: cm+px, in+px, 1/8-1/32 inch divisor, and guide bounding-box ΔX/ΔY/Diag', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // cm+px dual scale + crosshair readout
    await page.locator('#btn-dual-cm-px').click();
    await expect(page.locator('#btn-dual-cm-px')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'cm');

    await page.locator('#btn-toggle-crosshair').click();
    const stageBox = await page.locator('#ruler-stage').boundingBox();
    expect(stageBox).not.toBeNull();
    await page.mouse.move(stageBox!.x + 216, stageBox!.y + 116);
    await expect(page.locator('#live-cursor-readout')).toContainText('px)');

    // in+px reveals 1/8, 1/16, 1/32 precision selector and updates inch ticks at 6 px/mm
    await page.locator('[data-ref-preset="a4-width"]').click();
    await page.locator('#input-card-px').fill('1260'); // 1260 / 210 = 6.000 px/mm
    await page.locator('#input-card-px').dispatchEvent('change');
    await page.locator('#btn-apply-card').click();

    await page.locator('#btn-dual-in-px').click();
    await expect(page.locator('#inch-divisor-group')).toBeVisible();
    await page.locator('[data-inch-divisor="8"]').click();
    const ticksDiv8 = Number(await page.locator('#ruler-canvas-top').getAttribute('data-tick-count'));
    await page.locator('[data-inch-divisor="32"]').click();
    const ticksDiv32 = Number(await page.locator('#ruler-canvas-top').getAttribute('data-tick-count'));
    expect(ticksDiv32).toBeGreaterThan(ticksDiv8 * 2);

    // Reload preserves in + 1/32 + dualPair=px
    await page.reload();
    await expect(page.locator('[data-inch-divisor="32"]')).toHaveAttribute('aria-pressed', 'true');

    // Bounding-box guide highlights ΔX, ΔY & Diagonal
    await page.locator('[data-unit-btn="cm"]').click();
    await page.locator('[data-guide-axis-btn="x"]').click();
    await page.locator('#ruler-stage').click({ position: { x: 80, y: 80 } });
    await page.locator('#ruler-stage').click({ position: { x: 200, y: 80 } });
    await page.locator('[data-guide-axis-btn="y"]').click();
    await page.locator('#ruler-stage').click({ position: { x: 140, y: 60 } });
    await page.locator('#ruler-stage').click({ position: { x: 140, y: 150 } });

    await expect(page.locator('#guides-layer [data-bounding-box="true"]')).toBeVisible();
    await expect(page.locator('#guide-span-readout')).toContainText('ΔX:');
    await expect(page.locator('#guide-span-readout')).toContainText('ΔY:');
    await expect(page.locator('#guide-span-readout')).toContainText('Diag:');
    expect(Number(await page.locator('#guide-span-readout').getAttribute('data-span-diag-px'))).toBeCloseTo(
      150,
      0,
    );
  });

  test('P1.2: client-side Ctrl+V clipboard paste, file load, 2-point calibration, Line & ΔX/ΔY measurement, Annotated PNG export, zero outbound uploads, and WCAG/mobile checks', async ({
    page,
  }) => {
    const outboundUploads: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      const isLocalRead =
        req.method() === 'GET' &&
        (url.startsWith('http://localhost:4321') ||
          url.startsWith('blob:http://localhost:4321') ||
          url.startsWith('data:'));
      if (!isLocalRead) {
        outboundUploads.push(`${req.method()} ${url}`);
      }
    });

    await page.setViewportSize({ width: 1280, height: 860 });
    await page.goto('/');

    // 1. Ctrl+V paste on window auto-opens client-side Photo Mode and loads synthetic PNG
    const pngBase64 = makeSolidPng(800, 600).toString('base64');
    await page.evaluate((b64) => {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const file = new File([bytes], 'pasted-specimen.png', { type: 'image/png' });
      const dt = new DataTransfer();
      dt.items.add(file);
      const evt = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
      window.dispatchEvent(evt);
    }, pngBase64);

    await expect(page.locator('#photo-measure-panel')).toBeVisible();
    await expect(page.locator('#photo-measure-readout')).toContainText('800×600');

    // 2. Two-point reference calibration on image canvas: horizontal 400 image px -> 10 cm
    const canvasBox = await page.locator('#photo-measure-canvas').boundingBox();
    expect(canvasBox).not.toBeNull();
    // Compute exact client coordinates mapping natural (200, 300) and (600, 300) inside fitContainRect(800, 600, w, h, 18)
    const availW = canvasBox!.width - 36;
    const availH = canvasBox!.height - 36;
    const scale = Math.min(availW / 800, availH / 600);
    const offX = (canvasBox!.width - 800 * scale) / 2;
    const offY = (canvasBox!.height - 600 * scale) / 2;
    const toClient = (ix: number, iy: number) => ({
      x: canvasBox!.x + offX + ix * scale,
      y: canvasBox!.y + offY + iy * scale,
    });

    const cA = toClient(200, 300);
    const cB = toClient(600, 300);
    await page.mouse.click(cA.x, cA.y);
    await page.mouse.click(cB.x, cB.y);
    await expect(page.locator('#photo-measure-readout')).toHaveText(/Reference span: (39[6-9]|40[0-4]) px/);

    await page.locator('#photo-cal-unit').selectOption('cm');
    await page.locator('#photo-cal-length').fill('10');
    await page.locator('#btn-photo-apply-cal').click();

    await expect(page.locator('#photo-cal-status')).toContainText(/4\.0[0-5] px\/mm/);
    await expect(page.locator('[data-photo-tool="line"]')).toHaveAttribute('aria-pressed', 'true');

    // 3. Measure 200 image px line -> ~5.00 cm (within 1 screen-pixel quantization tolerance)
    const lA = toClient(100, 150);
    const lB = toClient(100, 350);
    await page.mouse.click(lA.x, lA.y);
    await page.mouse.click(lB.x, lB.y);
    await expect(page.locator('#photo-measure-readout')).toHaveText(/Line #1: (4\.9[5-9]|5\.0[0-5]) cm/);

    // 4. Measure ΔX / ΔY Bounding Box (200 x 150 image px = ~5.00 cm x ~3.75 cm)
    await page.locator('[data-photo-tool="rect"]').click();
    const rA = toClient(250, 150);
    const rB = toClient(450, 300);
    await page.mouse.click(rA.x, rA.y);
    await page.mouse.click(rB.x, rB.y);
    await expect(page.locator('#photo-measure-readout')).toHaveText(/Box ΔX: (4\.9[5-9]|5\.0[0-5]) cm · .*ΔY: (3\.7[0-9]|3\.80) cm/);

    // Capture P1 desktop evidence screenshot
    fs.mkdirSync('docs/qa-screenshots', { recursive: true });
    await page.screenshot({ path: 'docs/qa-screenshots/p1-photo-measure-desktop.png' });

    // 5. Annotated PNG download works locally without uploads
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#btn-photo-export').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^onlinerulerplus-annotated-\d+\.png$/);
    const dlPath = await download.path();
    expect(dlPath).not.toBeNull();
    const dlHeader = fs.readFileSync(dlPath!).subarray(0, 4);
    expect(dlHeader.equals(Buffer.from([137, 80, 78, 71]))).toBe(true);

    // 6. Axe WCAG 2.1 AA scan with Photo Mode open
    const axePhoto = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(axePhoto.violations).toEqual([]);

    // 7. Mobile viewport responsiveness & file upload works cleanly at 375x667
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('#photo-file-input').setInputFiles({
      name: 'mobile-upload.png',
      mimeType: 'image/png',
      buffer: makeSolidPng(400, 300),
    });
    await expect(page.locator('#photo-measure-readout')).toContainText('400×300');
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(mobileOverflow).toBe(false);
    await page.screenshot({ path: 'docs/qa-screenshots/p1-photo-mobile-375.png' });

    // Assert zero outbound requests or uploads occurred during all photo/clipboard steps
    expect(outboundUploads).toEqual([]);
  });
});
