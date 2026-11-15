import { localizedPath, type Locale } from './config.ts';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TOKEN_RE = /\[\[(link|ext|mailto|code|strong|kbd):([^\]]+)\]\]/g;

/**
 * Safely renders whitelisted inline markup tokens inside translated copy:
 * - [[link:/path|Label]] -> internal locale-aware <a>
 * - [[ext:https://...|Label]] -> external <a> with noopener noreferrer
 * - [[mailto:addr]] or [[mailto:addr|Label]] -> mailto <a>
 * - [[code:...]], [[strong:...]], [[kbd:...]]
 * Any raw HTML characters outside or inside tokens are escaped.
 */
export function renderInlineMarkup(input: string, locale: Locale): string {
  let out = '';
  let lastIndex = 0;

  for (const match of input.matchAll(TOKEN_RE)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      out += escapeHtml(input.slice(lastIndex, idx));
    }

    const kind = match[1];
    const payload = match[2] ?? '';
    const pipeIdx = payload.indexOf('|');
    const first = pipeIdx >= 0 ? payload.slice(0, pipeIdx) : payload;
    const second = pipeIdx >= 0 ? payload.slice(pipeIdx + 1) : payload;

    if (kind === 'link') {
      const href = localizedPath(locale, first.trim());
      out += `<a href="${escapeHtml(href)}" class="text-link underline">${escapeHtml(second)}</a>`;
    } else if (kind === 'ext' && /^https:\/\//i.test(first.trim())) {
      out += `<a href="${escapeHtml(first.trim())}" target="_blank" rel="noopener noreferrer" class="text-link underline">${escapeHtml(second)}</a>`;
    } else if (kind === 'mailto') {
      const email = first.trim();
      out += `<a href="mailto:${escapeHtml(email)}" class="text-link underline">${escapeHtml(second)}</a>`;
    } else if (kind === 'code') {
      out += `<code class="font-mono text-ink">${escapeHtml(payload)}</code>`;
    } else if (kind === 'strong') {
      out += `<strong class="font-semibold text-ink">${escapeHtml(payload)}</strong>`;
    } else if (kind === 'kbd') {
      out += `<kbd class="font-mono font-semibold text-ink">${escapeHtml(payload)}</kbd>`;
    } else {
      out += escapeHtml(match[0]);
    }

    lastIndex = idx + match[0].length;
  }

  if (lastIndex < input.length) {
    out += escapeHtml(input.slice(lastIndex));
  }

  return out;
}
