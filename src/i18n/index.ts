import { DEFAULT_LOCALE, isLocale, type Locale } from './config.ts';
import type { LocaleDict } from './types.ts';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import tr from './locales/tr.json';
import id from './locales/id.json';
import pl from './locales/pl.json';

const DICTIONARIES: Readonly<Record<Locale, LocaleDict>> = {
  en: en as LocaleDict,
  es: es as LocaleDict,
  fr: fr as LocaleDict,
  de: de as LocaleDict,
  it: it as LocaleDict,
  pt: pt as LocaleDict,
  ja: ja as LocaleDict,
  ko: ko as LocaleDict,
  nl: nl as LocaleDict,
  tr: tr as LocaleDict,
  id: id as LocaleDict,
  pl: pl as LocaleDict,
};

export interface RuntimeI18nPayload {
  readonly locale: Locale;
  readonly runtime: LocaleDict['runtime'];
}

export function getDict(locale: Locale | string | undefined | null): LocaleDict {
  if (isLocale(locale)) {
    return DICTIONARIES[locale];
  }
  return DICTIONARIES[DEFAULT_LOCALE];
}

export function getRuntimePayload(locale: Locale): RuntimeI18nPayload {
  const dict = getDict(locale);
  return {
    locale,
    runtime: dict.runtime,
  };
}

export * from './config.ts';
export * from './types.ts';
export * from './markup.ts';
