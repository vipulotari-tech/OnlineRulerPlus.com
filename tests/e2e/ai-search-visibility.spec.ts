import { test, expect } from '@playwright/test';

const SITE_ORIGIN = 'https://onlinerulerplus.com';

test.describe('Phase 11 — ChatGPT Search Visibility, GEO & AI Crawler Readiness', () => {
  test('robots.txt explicitly allows OAI-SearchBot, ChatGPT-User, Bingbot & PerplexityBot while separating GPTBot and listing sitemap', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/plain');
    const body = await res.text();

    // Parse per-user-agent directives to verify explicit non-blocking stanzas
    const stanzas = body.split(/\r?\n\s*\r?\n/);
    const findStanza = (bot: string) =>
      stanzas.find((s) => new RegExp(`^User-agent:\\s*${bot}$`, 'm').test(s)) ?? '';

    const oaiSearch = findStanza('OAI-SearchBot');
    const chatGptUser = findStanza('ChatGPT-User');
    const gptBot = findStanza('GPTBot');
    const bingBot = findStanza('Bingbot');
    const perplexityBot = findStanza('PerplexityBot');

    expect(oaiSearch).toContain('Allow: /');
    expect(oaiSearch).not.toMatch(/^Disallow:\s*\/$/m);

    expect(chatGptUser).toContain('Allow: /');
    expect(chatGptUser).not.toMatch(/^Disallow:\s*\/$/m);

    // GPTBot lives in its own separate stanza from OAI-SearchBot search permissions
    expect(gptBot).toContain('User-agent: GPTBot');
    expect(bingBot).toContain('Allow: /');
    expect(perplexityBot).toContain('Allow: /');

    expect(body).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
    expect(body).not.toMatch(/^Disallow:\s*\/(?:_astro|blog|visuals|fonts|og)/im);
  });

  test('llms.txt and llms-full.txt return HTTP 200 with accurate canonical tool & blog URLs', async ({
    request,
  }) => {
    for (const docPath of ['/llms.txt', '/llms-full.txt']) {
      const res = await request.get(docPath);
      expect(res.status(), docPath).toBe(200);
      const text = await res.text();
      expect(text).toContain('https://onlinerulerplus.com/');
      expect(text).toContain('https://onlinerulerplus.com/printable-ruler');
      expect(text).toContain('https://onlinerulerplus.com/circle-ruler');
      expect(text).toContain('https://onlinerulerplus.com/photo-ruler');
      expect(text).toContain('https://onlinerulerplus.com/protractor');
    }
  });

  test('raw static HTML renders crawlable Q&A content, authoritative citations, entity JSON-LD, and working anchors without JS execution', async ({
    request,
  }) => {
    const coreRoutes = [
      {
        path: '/',
        requiredText: ['Online Ruler Plus', 'What Is an Online Ruler?', '25.4 mm', '96 CSS pixels'],
        requiredLinks: ['/cm-ruler', '/inch-ruler', '/mm-ruler', '/calibration-guide', '/blog'],
        requireStandards: ['nist.gov', 'bipm.org', 'w3.org', 'iso.org'],
      },
      {
        path: '/printable-ruler',
        requiredText: ['Printable Rulers', '100.0 mm / 4.00 in', 'Why Do Printed Rulers Shrink'],
        requiredLinks: ['/blog/how-to-print-actual-size-ruler-100-percent-scale'],
        requireStandards: ['nist.gov'],
      },
      {
        path: '/cm-ruler',
        requiredText: ['Centimeter Ruler', '1 in = 25.4 mm'],
        requiredLinks: ['/inch-ruler', '/mm-ruler'],
        requireStandards: [],
      },
      {
        path: '/inch-ruler',
        requiredText: ['Inch Ruler', '1/16'],
        requiredLinks: ['/cm-ruler', '/mm-ruler'],
        requireStandards: [],
      },
      {
        path: '/about',
        requiredText: ['About Online Ruler Plus'],
        requiredLinks: ['/contact', '/privacy'],
        requireStandards: [],
      },
    ];

    for (const spec of coreRoutes) {
      const res = await request.get(spec.path, { maxRedirects: 0 });
      expect(res.status(), spec.path).toBe(200);
      const html = await res.text();

      expect(html).toMatch(/<h1[^>]*>[\s\S]+?<\/h1>/);
      const expectedCanonical = spec.path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${spec.path}`;
      expect(html).toContain(`<link rel="canonical" href="${expectedCanonical}">`);

      for (const snippet of spec.requiredText) {
        expect(html, `${spec.path} missing text "${snippet}"`).toContain(snippet);
      }
      for (const href of spec.requiredLinks) {
        expect(html, `${spec.path} missing HTML link href="${href}"`).toContain(`href="${href}"`);
      }
      for (const domain of spec.requireStandards) {
        expect(html, `${spec.path} missing authoritative reference ${domain}`).toContain(domain);
      }

      const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      expect(ldMatch, `${spec.path} JSON-LD`).toBeTruthy();
      const nodes = JSON.parse(ldMatch![1]) as Array<Record<string, unknown>>;
      const org = nodes.find((n) => n['@type'] === 'Organization');
      expect(org?.name).toBe('Online Ruler Plus');
      expect(org?.alternateName).toBe('OnlineRulerPlus.com');
      expect(org?.url).toBe(`${SITE_ORIGIN}/`);
    }
  });
});
