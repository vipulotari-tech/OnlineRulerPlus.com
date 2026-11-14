import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

test('Build output, all 12 routes, Apple DESIGN.md classes & SEO artifacts exist when dist is present', (t) => {
  if (!fs.existsSync(distDir)) {
    t.skip('dist directory not yet built');
    return;
  }

  const expectedArtifacts = [
    'index.html',
    'cm-ruler/index.html',
    'mm-ruler/index.html',
    'inch-ruler/index.html',
    'horizontal-ruler/index.html',
    'vertical-ruler/index.html',
    'how-to-use/index.html',
    'calibration-guide/index.html',
    'faq/index.html',
    'about/index.html',
    'contact/index.html',
    'privacy/index.html',
    'terms/index.html',
    'robots.txt',
    'sitemap-index.xml',
    'sitemap-0.xml',
    'llms.txt',
    'llms-full.txt',
    'og-image.png',
  ];

  for (const rel of expectedArtifacts) {
    const full = path.join(distDir, rel);
    assert.ok(fs.existsSync(full), `Expected build artifact ${rel} to exist`);
  }

  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  assert.match(indexHtml, /<link rel="canonical" href="https:\/\/onlinerulerplus\.com\/"/);
  assert.match(indexHtml, /application\/ld\+json/);
  assert.match(indexHtml, /Organization/);
  assert.match(indexHtml, /WebSite/);
  assert.match(indexHtml, /WebApplication/);
  assert.match(indexHtml, /FAQPage/);
  assert.match(indexHtml, /og-image\.png/);
  assert.match(indexHtml, /id="ruler-workspace"/);
  assert.match(indexHtml, /id="ruler-canvas-top"/);
  assert.match(indexHtml, /id="ruler-canvas-bottom"/);
  assert.match(indexHtml, /id="ruler-canvas-left"/);
  assert.match(indexHtml, /id="ruler-canvas-right"/);
  assert.match(indexHtml, /id="card-calibration-box"/);
  assert.match(indexHtml, /id="input-diagonal"/);
  assert.match(indexHtml, /apple-subnav-frosted/);
  assert.match(indexHtml, /apple-btn-primary/);

  // Verify sitemap-0.xml URLs match canonical URLs across all 13 pages
  const sitemapXml = fs.readFileSync(path.join(distDir, 'sitemap-0.xml'), 'utf-8');
  const routeMap = [
    ['index.html', 'https://onlinerulerplus.com/'],
    ['cm-ruler/index.html', 'https://onlinerulerplus.com/cm-ruler'],
    ['mm-ruler/index.html', 'https://onlinerulerplus.com/mm-ruler'],
    ['inch-ruler/index.html', 'https://onlinerulerplus.com/inch-ruler'],
    ['horizontal-ruler/index.html', 'https://onlinerulerplus.com/horizontal-ruler'],
    ['vertical-ruler/index.html', 'https://onlinerulerplus.com/vertical-ruler'],
    ['how-to-use/index.html', 'https://onlinerulerplus.com/how-to-use'],
    ['calibration-guide/index.html', 'https://onlinerulerplus.com/calibration-guide'],
    ['faq/index.html', 'https://onlinerulerplus.com/faq'],
    ['about/index.html', 'https://onlinerulerplus.com/about'],
    ['contact/index.html', 'https://onlinerulerplus.com/contact'],
    ['privacy/index.html', 'https://onlinerulerplus.com/privacy'],
    ['terms/index.html', 'https://onlinerulerplus.com/terms'],
  ];

  const validPaths = new Set(['/', ...routeMap.slice(1).map(([, u]) => new URL(u).pathname)]);

  for (const [relFile, expectedCanonical] of routeMap) {
    assert.ok(
      sitemapXml.includes(`<loc>${expectedCanonical}</loc>`),
      `Expected sitemap-0.xml to contain <loc>${expectedCanonical}</loc>`,
    );

    const html = fs.readFileSync(path.join(distDir, relFile), 'utf-8');
    assert.ok(
      html.includes(`<link rel="canonical" href="${expectedCanonical}">`) ||
        html.includes(`<link rel="canonical" href="${expectedCanonical}"/>`),
      `Expected ${relFile} canonical to match ${expectedCanonical}`,
    );

    // Validate JSON-LD parses cleanly
    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, `Expected JSON-LD script in ${relFile}`);
    const parsedLd = JSON.parse(ldMatch[1]);
    assert.ok(Array.isArray(parsedLd) && parsedLd.length >= 2, `Expected JSON-LD graph array in ${relFile}`);

    // Verify internal hrefs resolve to valid routes
    const hrefMatches = html.matchAll(/href="(\/[^"]*)"/g);
    for (const m of hrefMatches) {
      const rawHref = m[1];
      if (rawHref.startsWith('/_astro/') || rawHref.startsWith('/favicon')) continue;
      const cleanPath = rawHref.split('#')[0].split('?')[0] || '/';
      assert.ok(validPaths.has(cleanPath), `Broken internal link ${rawHref} in ${relFile}`);
    }
  }
});
