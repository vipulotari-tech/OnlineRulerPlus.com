// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const LOCALE_MAP = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  it: 'it',
  pt: 'pt',
  ja: 'ja',
  ko: 'ko',
  nl: 'nl',
  tr: 'tr',
  id: 'id',
  pl: 'pl',
};

// https://astro.build/config
export default defineConfig({
  site: 'https://onlinerulerplus.com',
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'en',
    locales: Object.keys(LOCALE_MAP),
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: LOCALE_MAP,
      },
    }),
  ],
  vite: {
    cacheDir: '.vite-cache',
    plugins: [tailwindcss()],
  },
});

