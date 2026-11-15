// @ts-check
import { defineConfig } from 'astro/config';
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
  build: {
    format: 'file',
  },
  i18n: {
    defaultLocale: 'en',
    locales: Object.keys(LOCALE_MAP),
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    cacheDir: '.vite-cache',
    plugins: [tailwindcss()],
  },
});

