export function initVisualWalkthroughs(): void {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-motion-walkthrough]'));
  if (roots.length === 0) return;

  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (const root of roots) {
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"][data-scene]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-scene-panel]'));
    const toggleBtn = root.querySelector<HTMLButtonElement>('[data-motion-toggle]');
    const statusText = root.querySelector<HTMLElement>('[data-motion-status]');

    let userPaused = prefersReduced;
    let isIntersecting = true;

    const syncPausedState = () => {
      const effectivePaused = userPaused || !isIntersecting;
      root.dataset.motionPaused = effectivePaused ? 'true' : 'false';
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', String(userPaused));
        const labelEl = toggleBtn.querySelector<HTMLElement>('[data-toggle-label]');
        const playLabel = toggleBtn.dataset.labelPlay || 'Play';
        const pauseLabel = toggleBtn.dataset.labelPause || 'Pause';
        if (labelEl) {
          labelEl.textContent = userPaused ? playLabel : pauseLabel;
        }
        const iconPlay = toggleBtn.querySelector<HTMLElement>('[data-icon-play]');
        const iconPause = toggleBtn.querySelector<HTMLElement>('[data-icon-pause]');
        iconPlay?.classList.toggle('hidden', !userPaused);
        iconPause?.classList.toggle('hidden', userPaused);
      }
      if (statusText) {
        statusText.textContent = userPaused
          ? statusText.dataset.pausedText || 'Paused'
          : statusText.dataset.playingText || 'Playing';
      }
    };

    const activateScene = (sceneId: string) => {
      for (const tab of tabs) {
        const active = tab.dataset.scene === sceneId;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle('is-active', active);
      }
      for (const panel of panels) {
        const active = panel.dataset.scenePanel === sceneId;
        panel.hidden = !active;
        panel.dataset.active = active ? 'true' : 'false';
      }
    };

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        if (tab.dataset.scene) activateScene(tab.dataset.scene);
      });
      tab.addEventListener('keydown', (e) => {
        let nextIdx = -1;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = tabs.length - 1;
        if (nextIdx >= 0) {
          e.preventDefault();
          const nextTab = tabs[nextIdx];
          if (nextTab.dataset.scene) activateScene(nextTab.dataset.scene);
          nextTab.focus();
        }
      });
    });

    toggleBtn?.addEventListener('click', () => {
      userPaused = !userPaused;
      syncPausedState();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.target === root) {
              isIntersecting = entry.isIntersecting;
              syncPausedState();
            }
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(root);
    }

    syncPausedState();
  }
}
