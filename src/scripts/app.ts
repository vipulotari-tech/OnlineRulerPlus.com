import { isUnit, STORAGE_KEYS } from '../lib/ruler/index.ts';
import { CalibrationController } from './calibration-controller.ts';
import { initLanguageSelector } from './language-selector.ts';
import { WorkspaceController } from './workspace-controller.ts';

function initTheme(onThemeChanged?: () => void): void {
  const syncButtons = (dark: boolean) => {
    document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(dark));
      if (btn.dataset.labelSwitch) {
        btn.setAttribute('aria-label', btn.dataset.labelSwitch);
      }
    });
  };

  syncButtons(document.documentElement.classList.contains('dark'));

  const applyTheme = (dark: boolean) => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, dark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
    syncButtons(dark);
    onThemeChanged?.();
  };

  const toggle = () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(!isDark);
  };

  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', toggle);
  });

  window.addEventListener('orp:toggle-theme', toggle);
}

function initMobileNav(): void {
  const toggleBtn = document.querySelector<HTMLButtonElement>('[data-mobile-menu-toggle]');
  const tray = document.getElementById('mobile-nav-tray');
  if (!toggleBtn || !tray) return;

  const setOpen = (open: boolean) => {
    tray.classList.toggle('hidden', !open);
    toggleBtn.setAttribute('aria-expanded', String(open));
  };

  toggleBtn.addEventListener('click', () => {
    const isHidden = tray.classList.contains('hidden');
    setOpen(isHidden);
  });

  tray.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  window.addEventListener('orp:close-dialogs', () => setOpen(false));
}

function initHelpDialog(): void {
  const modal = document.getElementById('help-shortcuts-modal');
  if (!modal) return;
  let previousFocus: HTMLElement | null = null;

  const setOpen = (open: boolean) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null;
    }
    modal.classList.toggle('hidden', !open);
    modal.setAttribute('aria-hidden', String(!open));
    document.querySelectorAll<HTMLButtonElement>('[data-help-toggle]').forEach((btn) => {
      btn.setAttribute('aria-expanded', String(open));
    });

    if (open) {
      const firstClose = modal.querySelector<HTMLElement>('[data-help-close]');
      firstClose?.focus();
    } else if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
      previousFocus = null;
    }
  };

  const toggle = () => {
    const isHidden = modal.classList.contains('hidden');
    setOpen(isHidden);
  };

  document.querySelectorAll<HTMLElement>('[data-help-toggle]').forEach((btn) => {
    btn.addEventListener('click', toggle);
  });

  document.querySelectorAll<HTMLElement>('[data-help-close]').forEach((btn) => {
    btn.addEventListener('click', () => setOpen(false));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) setOpen(false);
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('orp:toggle-help', toggle);
  window.addEventListener('orp:close-dialogs', () => setOpen(false));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  });
}

function initBannerDismiss(): void {
  const banner = document.getElementById('display-change-banner');
  const closeBtn = document.getElementById('btn-dismiss-banner');
  closeBtn?.addEventListener('click', () => {
    banner?.classList.add('hidden');
  });
}

function isEdgePreset(
  val: string | null | undefined,
): val is 'horizontal' | 'vertical' | 'all' | 'top-left' {
  return val === 'horizontal' || val === 'vertical' || val === 'all' || val === 'top-left';
}

export function bootstrapRulerApp(): void {
  const workspaceEl = document.getElementById('ruler-workspace');

  initLanguageSelector();
  initHelpDialog();
  initMobileNav();

  if (!workspaceEl) {
    initTheme();
    window.addEventListener('keydown', (e) => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('orp:toggle-theme'));
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('orp:toggle-help'));
      } else if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('orp:close-dialogs'));
      }
    });
    return;
  }

  const workspace = new WorkspaceController(document);
  const calibration = new CalibrationController(workspace);

  const params = new URLSearchParams(window.location.search);
  const queryUnit = params.get('unit');
  const queryEdges = params.get('edges');
  const forceUnit = workspaceEl.dataset.forceUnit;
  const defaultUnit = workspaceEl.dataset.defaultUnit;
  const forceEdges = workspaceEl.dataset.forceEdges;

  if (isUnit(queryUnit)) {
    workspace.setUnit(queryUnit, false);
  } else if (isUnit(forceUnit)) {
    workspace.setUnit(forceUnit, false);
  } else if (isUnit(defaultUnit) && !localStorage.getItem(STORAGE_KEYS.preferences)) {
    workspace.setUnit(defaultUnit, false);
  }

  if (isEdgePreset(queryEdges)) {
    workspace.setEdgePreset(queryEdges, false);
  } else if (isEdgePreset(forceEdges)) {
    workspace.setEdgePreset(forceEdges, false);
  }

  initTheme(() => {
    workspace.syncAll();
    calibration.syncUI();
  });
  initBannerDismiss();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapRulerApp);
  } else {
    bootstrapRulerApp();
  }
}
