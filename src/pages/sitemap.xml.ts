import type { APIRoute } from 'astro';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import {
  DEFAULT_LOCALE,
  LOCALES,
  PAGE_SLUGS,
  getHreflangAlternates,
  localizedPath,
} from '../i18n/config.ts';
import { BLOG_CATEGORIES } from '../lib/blog.ts';

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const gitDateCache = new Map<string, string>();

function getLastModForFiles(relativePaths: string[]): string | undefined {
  const existing = relativePaths.filter((rel) =>
    fs.existsSync(path.resolve(process.cwd(), rel)),
  );
  if (existing.length === 0) return undefined;

  const cacheKey = existing.join('|');
  const cached = gitDateCache.get(cacheKey);
  if (cached) return cached;

  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', ...existing],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) {
      gitDateCache.set(cacheKey, out);
      return out;
    }
  } catch {
    // Fall back to filesystem mtime if git metadata is unavailable
  }

  let latestMs = 0;
  for (const rel of existing) {
    try {
      const mtime = fs.statSync(path.resolve(process.cwd(), rel)).mtimeMs;
      if (mtime > latestMs) latestMs = mtime;
    } catch {
      // ignore missing path
    }
  }
  const fallback = latestMs > 0 ? toIsoDate(new Date(latestMs)) : undefined;
  if (fallback) gitDateCache.set(cacheKey, fallback);
  return fallback;
}

export const GET: APIRoute = async ({ site }) => {
  const siteOrigin = (site?.origin ?? 'https://onlinerulerplus.com').replace(/\/+$/, '');
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  // 1. Multilingual indexable routes (12 locales × 19 slugs = 228 URLs; excludes /embed utility & /404)
  for (const slug of PAGE_SLUGS) {
    const baseRoute = slug === '' ? '/' : `/${slug}`;
    const templateFile =
      slug === '' ? 'src/pages/[...lang]/index.astro' : `src/pages/[...lang]/${slug}.astro`;
    const alternates = getHreflangAlternates(siteOrigin, baseRoute);

    for (const locale of LOCALES) {
      const routePath = localizedPath(locale, baseRoute);
      const url = `${siteOrigin}${routePath === '/' ? '/' : routePath}`;
      const dictFile =
        locale === DEFAULT_LOCALE
          ? 'src/i18n/locales/en.json'
          : `src/i18n/locales/${locale}.json`;
      const enJson = 'src/i18n/locales/en.json';
      const lastmod = getLastModForFiles([templateFile, dictFile, enJson]);

      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(url)}</loc>`);
      if (lastmod) {
        lines.push(`    <lastmod>${lastmod}</lastmod>`);
      }
      for (const alt of alternates) {
        const altHref = alt.href === siteOrigin ? `${siteOrigin}/` : alt.href;
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(altHref)}" />`,
        );
      }
      lines.push('  </url>');
    }
  }

  // 2. Editorial blog index, category archives, and published articles (English-only)
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) =>
      (b.data.updatedDate ?? b.data.pubDate).getTime() -
      (a.data.updatedDate ?? a.data.pubDate).getTime(),
  );

  const latestPostDate =
    posts.length > 0
      ? toIsoDate(posts[0].data.updatedDate ?? posts[0].data.pubDate)
      : getLastModForFiles(['src/pages/blog/index.astro']);

  lines.push('  <url>');
  lines.push(`    <loc>${escapeXml(`${siteOrigin}/blog`)}</loc>`);
  if (latestPostDate) {
    lines.push(`    <lastmod>${latestPostDate}</lastmod>`);
  }
  lines.push('  </url>');

  for (const cat of BLOG_CATEGORIES) {
    const catPosts = posts.filter((p) => p.data.category === cat.slug);
    const catLastmod =
      catPosts.length > 0
        ? toIsoDate(catPosts[0].data.updatedDate ?? catPosts[0].data.pubDate)
        : getLastModForFiles(['src/pages/blog/[category].astro', 'src/lib/blog.ts']);

    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(`${siteOrigin}/blog/${cat.slug}`)}</loc>`);
    if (catLastmod) {
      lines.push(`    <lastmod>${catLastmod}</lastmod>`);
    }
    lines.push('  </url>');
  }

  for (const post of posts) {
    const postLastmod = toIsoDate(post.data.updatedDate ?? post.data.pubDate);
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(`${siteOrigin}/blog/${post.id}`)}</loc>`);
    lines.push(`    <lastmod>${postLastmod}</lastmod>`);
    lines.push('  </url>');
  }

  lines.push('</urlset>');

  return new Response(`${lines.join('\n')}\n`, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
