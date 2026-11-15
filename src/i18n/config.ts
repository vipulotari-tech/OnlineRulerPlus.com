export const LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ja',
  'ko',
  'nl',
  'tr',
  'id',
  'pl',
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'orp:locale:v1';
export const LOCALE_SOURCE_STORAGE_KEY = 'orp:locale-source:v1';

export interface LocaleMeta {
  readonly code: Locale;
  readonly bcp47: string;
  readonly ogLocale: string;
  readonly nativeName: string;
  readonly englishName: string;
  readonly shortCode: string;
  readonly flagEmoji: string;
}

export const LOCALE_META: Readonly<Record<Locale, LocaleMeta>> = {
  en: { code: 'en', bcp47: 'en-US', ogLocale: 'en_US', nativeName: 'English', englishName: 'English', shortCode: 'EN', flagEmoji: '🇺🇸' },
  es: { code: 'es', bcp47: 'es-ES', ogLocale: 'es_ES', nativeName: 'Español', englishName: 'Spanish', shortCode: 'ES', flagEmoji: '🇪🇸' },
  fr: { code: 'fr', bcp47: 'fr-FR', ogLocale: 'fr_FR', nativeName: 'Français', englishName: 'French', shortCode: 'FR', flagEmoji: '🇫🇷' },
  de: { code: 'de', bcp47: 'de-DE', ogLocale: 'de_DE', nativeName: 'Deutsch', englishName: 'German', shortCode: 'DE', flagEmoji: '🇩🇪' },
  it: { code: 'it', bcp47: 'it-IT', ogLocale: 'it_IT', nativeName: 'Italiano', englishName: 'Italian', shortCode: 'IT', flagEmoji: '🇮🇹' },
  pt: { code: 'pt', bcp47: 'pt-PT', ogLocale: 'pt_PT', nativeName: 'Português', englishName: 'Portuguese', shortCode: 'PT', flagEmoji: '🇵🇹' },
  ja: { code: 'ja', bcp47: 'ja-JP', ogLocale: 'ja_JP', nativeName: '日本語', englishName: 'Japanese', shortCode: 'JA', flagEmoji: '🇯🇵' },
  ko: { code: 'ko', bcp47: 'ko-KR', ogLocale: 'ko_KR', nativeName: '한국어', englishName: 'Korean', shortCode: 'KO', flagEmoji: '🇰🇷' },
  nl: { code: 'nl', bcp47: 'nl-NL', ogLocale: 'nl_NL', nativeName: 'Nederlands', englishName: 'Dutch', shortCode: 'NL', flagEmoji: '🇳🇱' },
  tr: { code: 'tr', bcp47: 'tr-TR', ogLocale: 'tr_TR', nativeName: 'Türkçe', englishName: 'Turkish', shortCode: 'TR', flagEmoji: '🇹🇷' },
  id: { code: 'id', bcp47: 'id-ID', ogLocale: 'id_ID', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', shortCode: 'ID', flagEmoji: '🇮🇩' },
  pl: { code: 'pl', bcp47: 'pl-PL', ogLocale: 'pl_PL', nativeName: 'Polski', englishName: 'Polish', shortCode: 'PL', flagEmoji: '🇵🇱' },
};

export const PAGE_SLUGS = [
  '',
  'cm-ruler',
  'mm-ruler',
  'inch-ruler',
  'horizontal-ruler',
  'vertical-ruler',
  'photo-ruler',
  'protractor',
  'circle-ruler',
  'quadrant',
  'screen-size-detector',
  'printable-ruler',
  'how-to-use',
  'calibration-guide',
  'faq',
  'about',
  'contact',
  'privacy',
  'terms',
] as const;

export const UTILITY_SLUGS = ['embed'] as const;

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function normalizeRoutePath(pathname: string): string {
  const clean = pathname.trim().replace(/\/+$/, '');
  return clean === '' ? '/' : clean.startsWith('/') ? clean : `/${clean}`;
}

export function getLocaleFromPath(pathname: string): Locale {
  const normalized = normalizeRoutePath(pathname);
  const firstSegment = normalized.slice(1).split('/')[0] ?? '';
  return isLocale(firstSegment) && firstSegment !== DEFAULT_LOCALE ? firstSegment : DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizeRoutePath(pathname);
  if (normalized === '/') return '/';
  const segments = normalized.slice(1).split('/');
  const first = segments[0] ?? '';
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    const rest = segments.slice(1).join('/');
    return rest === '' ? '/' : `/${rest}`;
  }
  return normalized;
}

/**
 * Resolve an internal route path (e.g. '/', '/cm-ruler', '/#calibration', '/cm-ruler#ruler-tool')
 * into a locale-prefixed path respecting `trailingSlash: 'never'` and `prefixDefaultLocale: false`.
 */
export function localizedPath(locale: Locale, targetPath: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(targetPath) || targetPath.startsWith('#')) {
    return targetPath;
  }

  const hashIdx = targetPath.indexOf('#');
  const hash = hashIdx >= 0 ? targetPath.slice(hashIdx) : '';
  const withoutHash = hashIdx >= 0 ? targetPath.slice(0, hashIdx) : targetPath;

  const queryIdx = withoutHash.indexOf('?');
  const query = queryIdx >= 0 ? withoutHash.slice(queryIdx) : '';
  const rawPath = queryIdx >= 0 ? withoutHash.slice(0, queryIdx) : withoutHash;

  const baseRoute = stripLocalePrefix(rawPath || '/');

  if (locale === DEFAULT_LOCALE) {
    return `${baseRoute}${query}${hash}`;
  }

  const localizedBase = baseRoute === '/' ? `/${locale}` : `/${locale}${baseRoute}`;
  return `${localizedBase}${query}${hash}`;
}

/**
 * Match navigator.languages entries (e.g. ['es-MX', 'en-US']) against the 12 supported locales.
 */
export function detectBestLocale(languages: readonly string[]): Locale {
  for (const raw of languages) {
    const tag = raw.trim().toLowerCase();
    if (!tag) continue;
    const primary = tag.split(/[-_]/)[0] ?? '';
    const mapped = primary === 'in' ? 'id' : primary;
    if (isLocale(mapped)) {
      return mapped;
    }
  }
  return DEFAULT_LOCALE;
}

export function getLocaleStaticPaths() {
  return LOCALES.map((locale) => ({
    params: { lang: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}

export function getHreflangAlternates(siteOrigin: string, baseRoutePath: string): Array<{ hreflang: string; href: string }> {
  const origin = siteOrigin.replace(/\/+$/, '');
  const cleanBase = stripLocalePrefix(baseRoutePath);
  const alternates = LOCALES.map((loc) => ({
    hreflang: loc,
    href: `${origin}${localizedPath(loc, cleanBase)}`,
  }));
  alternates.push({
    hreflang: 'x-default',
    href: `${origin}${localizedPath(DEFAULT_LOCALE, cleanBase)}`,
  });
  return alternates;
}
