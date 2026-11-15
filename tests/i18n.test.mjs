import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  normalizeRoutePath,
  getLocaleFromPath,
  stripLocalePrefix,
  localizedPath,
  detectBestLocale,
  getLocaleStaticPaths,
  getHreflangAlternates,
} from '../src/i18n/config.ts';
import { renderInlineMarkup } from '../src/i18n/markup.ts';
import {
  formatTemplate,
  translateStatusLabel,
  translateDeviceLabel,
  translateBasis,
  translateError,
} from '../src/i18n/runtime.ts';

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'src', 'i18n', 'locales');

function loadLocaleJson(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  assert.ok(fs.existsSync(filePath), `Missing locale file: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectPlaceholders(str) {
  const matches = str.match(/\{[a-zA-Z0-9_]+\}/g);
  return matches ? [...matches].sort() : [];
}

function collectMarkupKinds(str) {
  const matches = [];
  const re = /\[\[(link|ext|mailto):([^|\]]+)\|([\s\S]*?)\]\]|\[\[(code|strong|kbd):([\s\S]*?)\]\]/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    if (m[1]) {
      matches.push(`${m[1]}:${m[2]}`);
    } else if (m[4]) {
      matches.push(m[4]);
    }
  }
  return matches.sort();
}

function assertDeepStructureMatches(enVal, locVal, locale, keyPath) {
  if (Array.isArray(enVal)) {
    assert.ok(Array.isArray(locVal), `${locale}:${keyPath} must be an array`);
    assert.equal(
      locVal.length,
      enVal.length,
      `${locale}:${keyPath} array length mismatch (expected ${enVal.length}, got ${locVal.length})`,
    );
    for (let i = 0; i < enVal.length; i++) {
      assertDeepStructureMatches(enVal[i], locVal[i], locale, `${keyPath}[${i}]`);
    }
    return;
  }

  if (enVal !== null && typeof enVal === 'object') {
    assert.ok(
      locVal !== null && typeof locVal === 'object' && !Array.isArray(locVal),
      `${locale}:${keyPath} must be an object`,
    );
    const enKeys = Object.keys(enVal).sort();
    const locKeys = Object.keys(locVal).sort();
    assert.deepEqual(
      locKeys,
      enKeys,
      `${locale}:${keyPath} keys do not match en.json`,
    );
    for (const k of enKeys) {
      assertDeepStructureMatches(enVal[k], locVal[k], locale, keyPath ? `${keyPath}.${k}` : k);
    }
    return;
  }

  assert.equal(
    typeof locVal,
    typeof enVal,
    `${locale}:${keyPath} type mismatch (expected ${typeof enVal}, got ${typeof locVal})`,
  );

  if (typeof enVal === 'string') {
    assert.ok(locVal.trim().length > 0, `${locale}:${keyPath} must not be empty`);

    const enPlaceholders = collectPlaceholders(enVal);
    const locPlaceholders = collectPlaceholders(locVal);
    assert.deepEqual(
      locPlaceholders,
      enPlaceholders,
      `${locale}:${keyPath} placeholder mismatch: expected ${JSON.stringify(enPlaceholders)}, got ${JSON.stringify(locPlaceholders)}`,
    );

    const enLinks = collectMarkupKinds(enVal).filter((m) => m.includes(':'));
    const locLinks = collectMarkupKinds(locVal).filter((m) => m.includes(':'));
    assert.deepEqual(
      locLinks,
      enLinks,
      `${locale}:${keyPath} inline link/mailto tag mismatch: expected ${JSON.stringify(enLinks)}, got ${JSON.stringify(locLinks)}`,
    );

    // Ensure no unbalanced [[ or ]] brackets remain
    const cleaned = locVal.replace(
      /\[\[(?:link|ext|mailto):[^|\]]+\|[\s\S]*?\]\]|\[\[(?:code|strong|kbd):[\s\S]*?\]\]/g,
      '',
    );
    assert.ok(
      !cleaned.includes('[[') && !cleaned.includes(']]'),
      `${locale}:${keyPath} contains malformed [[...]] markup`,
    );
  }
}

test('all 12 locale JSON files exist, parse cleanly, and match en.json schema & placeholders', () => {
  assert.equal(LOCALES.length, 12);
  const enDict = loadLocaleJson('en');

  for (const locale of LOCALES) {
    const dict = loadLocaleJson(locale);
    assertDeepStructureMatches(enDict, dict, locale, '');

    if (locale !== 'en') {
      assert.notEqual(
        dict.hero.headline,
        enDict.hero.headline,
        `${locale} hero.headline must be genuinely translated, not English`,
      );
      assert.notEqual(
        dict.nav.links.howToUse,
        enDict.nav.links.howToUse,
        `${locale} nav.links.howToUse must be translated`,
      );
      assert.notEqual(
        dict.pages.cmRuler.hero.headline,
        enDict.pages.cmRuler.hero.headline,
        `${locale} pages.cmRuler.hero.headline must be translated`,
      );
      assert.notEqual(
        dict.pages.privacy.heroHeadline,
        enDict.pages.privacy.heroHeadline,
        `${locale} pages.privacy.heroHeadline must be translated`,
      );
      assert.notEqual(
        dict.runtime.statusLabels.detected,
        enDict.runtime.statusLabels.detected,
        `${locale} runtime.statusLabels.detected must be translated`,
      );
    }
  }
});

test('i18n routing helpers normalize paths, extract locales, and build hreflang links', () => {
  assert.equal(DEFAULT_LOCALE, 'en');
  assert.equal(isLocale('en'), true);
  assert.equal(isLocale('pl'), true);
  assert.equal(isLocale('xx'), false);

  assert.equal(normalizeRoutePath(''), '/');
  assert.equal(normalizeRoutePath('/cm-ruler/'), '/cm-ruler');

  assert.equal(getLocaleFromPath('/'), 'en');
  assert.equal(getLocaleFromPath('/cm-ruler'), 'en');
  assert.equal(getLocaleFromPath('/fr'), 'fr');
  assert.equal(getLocaleFromPath('/fr/cm-ruler'), 'fr');
  assert.equal(getLocaleFromPath('/es/calibration-guide/'), 'es');

  assert.equal(stripLocalePrefix('/fr/cm-ruler'), '/cm-ruler');
  assert.equal(stripLocalePrefix('/ja'), '/');
  assert.equal(stripLocalePrefix('/about'), '/about');

  assert.equal(localizedPath('en', '/'), '/');
  assert.equal(localizedPath('en', '/fr/cm-ruler?unit=mm#ruler-tool'), '/cm-ruler?unit=mm#ruler-tool');
  assert.equal(localizedPath('ja', '/'), '/ja');
  assert.equal(localizedPath('ja', '/cm-ruler?unit=cm#calibration'), '/ja/cm-ruler?unit=cm#calibration');
  assert.equal(localizedPath('de', '/es/faq'), '/de/faq');
  assert.equal(localizedPath('pt', '#calibration'), '#calibration');
  assert.equal(localizedPath('it', 'https://example.com'), 'https://example.com');

  const alts = getHreflangAlternates('https://onlinerulerplus.com/', '/fr/cm-ruler');
  assert.equal(alts.length, 13);
  assert.deepEqual(alts.find((a) => a.hreflang === 'en'), {
    hreflang: 'en',
    href: 'https://onlinerulerplus.com/cm-ruler',
  });
  assert.deepEqual(alts.find((a) => a.hreflang === 'fr'), {
    hreflang: 'fr',
    href: 'https://onlinerulerplus.com/fr/cm-ruler',
  });
  assert.deepEqual(alts.find((a) => a.hreflang === 'x-default'), {
    hreflang: 'x-default',
    href: 'https://onlinerulerplus.com/cm-ruler',
  });

  const staticPaths = getLocaleStaticPaths();
  assert.equal(staticPaths.length, 12);
  assert.equal(staticPaths[0].params.lang, undefined);
  assert.equal(staticPaths[1].params.lang, 'es');
});

test('detectBestLocale maps browser language tags accurately and falls back to en', () => {
  assert.equal(detectBestLocale(['es-MX', 'en-US']), 'es');
  assert.equal(detectBestLocale(['fr-CA']), 'fr');
  assert.equal(detectBestLocale(['ja']), 'ja');
  assert.equal(detectBestLocale(['in-ID']), 'id'); // Legacy Indonesian tag
  assert.equal(detectBestLocale(['zh-CN', 'pt-BR']), 'pt');
  assert.equal(detectBestLocale(['zh-CN', 'ru-RU']), 'en');
  assert.equal(detectBestLocale([]), 'en');
});

test('renderInlineMarkup escapes HTML and localizes internal links cleanly', () => {
  const input = 'Visit [[link:/calibration-guide|Guide]] & press [[kbd:H]] or [[code:devicePixelRatio]] <script>alert(1)</script> [[ext:https://astro.build|Astro]] [[mailto:support@onlinerulerplus.com|Email]] [[strong:Important]]';
  const html = renderInlineMarkup(input, 'fr');
  assert.ok(html.includes('href="/fr/calibration-guide"'));
  assert.ok(html.includes('<kbd class="font-mono font-semibold text-ink">H</kbd>'));
  assert.ok(html.includes('<code class="font-mono text-ink">devicePixelRatio</code>'));
  assert.ok(html.includes('href="https://astro.build"'));
  assert.ok(html.includes('href="mailto:support@onlinerulerplus.com"'));
  assert.ok(html.includes('<strong class="font-semibold text-ink">Important</strong>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>'));
});

test('runtime translators handle exact maps and dynamic templates', () => {
  const esDict = loadLocaleJson('es');
  const rt = esDict.runtime;

  assert.equal(formatTemplate('A: {x} / {y}', { x: 10, y: 'cm' }), 'A: 10 / cm');
  assert.equal(translateStatusLabel('detected', rt), rt.statusLabels.detected);
  assert.equal(
    translateDeviceLabel('15.6″ Screen Diagonal', rt),
    formatTemplate(rt.manualDiagBasis, { diag: '15.6' }),
  );
  assert.equal(
    translateDeviceLabel('1920×1080 display', rt),
    formatTemplate(rt.displaySizeSuffix, { long: '1920', short: '1080' }),
  );
  assert.equal(
    translateBasis('Assumes a typical 24″ screen at this resolution', rt),
    formatTemplate(rt.typMonitorBasis, { diag: '24' }),
  );
  assert.equal(
    translateBasis('CSS reference scale (96 px per inch)', rt),
    rt.basisMap['CSS reference scale (96 px per inch)'],
  );
  assert.equal(
    translateError('Enter your screen diagonal in inches.', rt),
    rt.errorMap['Enter your screen diagonal in inches.'],
  );
});
