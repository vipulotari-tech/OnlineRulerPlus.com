import {
  LOCALE_META,
  LOCALE_SOURCE_STORAGE_KEY,
  LOCALE_STORAGE_KEY,
  isLocale,
  localizedPath,
} from '../i18n/config.ts';

function persistLocaleChoice(locale: string, source: 'manual' | 'auto'): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    localStorage.setItem(LOCALE_SOURCE_STORAGE_KEY, source);
  } catch {
    // Ignore storage access errors in private browsing modes
  }
}

function initLocaleSuggestionBanner(): void {
  const banner = document.getElementById('locale-suggestion-banner');
  const suggested = document.documentElement.dataset.suggestedLocale;
  if (!banner || !suggested || !isLocale(suggested) || suggested === 'en') return;

  const textEl = document.getElementById('locale-suggestion-text');
  const linkEl = document.getElementById('locale-suggestion-link') as HTMLAnchorElement | null;
  const dismissBtn = document.getElementById('locale-suggestion-dismiss');
  if (!textEl || !linkEl || !dismissBtn) return;

  const nativeName = LOCALE_META[suggested].nativeName;
  const template = banner.dataset.textTemplate ?? 'View this page in {language}?';
  textEl.textContent = template.replace('{language}', nativeName);
  const targetUrl = `${localizedPath(suggested, '/')}${window.location.search}${window.location.hash}`;
  linkEl.href = targetUrl;
  linkEl.textContent = `${banner.dataset.switchLabel ?? 'Switch'} (${nativeName})`;

  banner.classList.remove('hidden');

  linkEl.addEventListener('click', () => {
    persistLocaleChoice(suggested, 'auto');
    delete document.documentElement.dataset.suggestedLocale;
  });

  dismissBtn.addEventListener('click', () => {
    persistLocaleChoice('en', 'manual');
    delete document.documentElement.dataset.suggestedLocale;
    banner.classList.add('hidden');
  });
}

export function initLanguageSelector(): void {
  initLocaleSuggestionBanner();
  const root = document.querySelector<HTMLElement>('[data-language-selector]');
  if (!root) return;

  const trigger = root.querySelector<HTMLButtonElement>('[data-language-trigger]');
  const menu = root.querySelector<HTMLElement>('[data-language-menu]');
  const chevron = root.querySelector<SVGElement>('[data-language-chevron]');
  const options = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-language-option]'));

  if (!trigger || !menu || options.length === 0) return;

  let isOpen = false;
  let hideTimer: number | null = null;

  const setOpen = (open: boolean, focusStrategy: 'none' | 'active' | 'first' | 'last' = 'none') => {
    if (hideTimer !== null) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }

    isOpen = open;
    trigger.setAttribute('aria-expanded', String(open));
    chevron?.classList.toggle('rotate-180', open);

    if (open) {
      menu.hidden = false;
      // Force layout before setting data-open for smooth CSS opacity/transform entrance
      void menu.offsetHeight;
      menu.setAttribute('data-open', 'true');

      if (focusStrategy !== 'none') {
        const target =
          focusStrategy === 'first'
            ? options[0]
            : focusStrategy === 'last'
              ? options[options.length - 1]
              : options.find((el) => el.dataset.active === 'true') ?? options[0];
        target?.focus();
      }
    } else {
      menu.setAttribute('data-open', 'false');
      hideTimer = window.setTimeout(() => {
        if (!isOpen) {
          menu.hidden = true;
        }
      }, 150);
    }
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!isOpen, !isOpen ? 'active' : 'none');
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true, 'first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true, 'last');
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setOpen(false);
    }
  });

  menu.addEventListener('keydown', (e) => {
    const activeIndex = options.findIndex((el) => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = options[(activeIndex + 1) % options.length];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = options[(activeIndex - 1 + options.length) % options.length];
      prev?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      options[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      options[options.length - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      trigger.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      const targetLocale = option.dataset.languageOption;
      if (targetLocale && isLocale(targetLocale)) {
        persistLocaleChoice(targetLocale, 'manual');
      }

      // Preserve active query parameters (?unit=...&edges=...) and hash across locale switch
      const baseHref = option.getAttribute('href');
      if (baseHref) {
        const search = window.location.search;
        const hash = window.location.hash;
        if (search || hash) {
          option.setAttribute('href', `${baseHref.split('?')[0].split('#')[0]}${search}${hash}`);
        }
      }
      setOpen(false);
    });
  });

  document.addEventListener('click', (e) => {
    if (isOpen && !root.contains(e.target as Node)) {
      setOpen(false);
    }
  });

  window.addEventListener('orp:close-dialogs', () => {
    if (isOpen) setOpen(false);
  });
}
