(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  function buildHomeCommandCenter() {
    const home = q('[data-page="home"] .page-scroll');
    if (!home || home.dataset.worldLayout === 'ready') return;
    home.dataset.worldLayout = 'ready';

    const hero = q('.daily-hero', home);
    const matchSection = q('#featuredMatchCard', home)?.closest('.section');
    const updateSection = qa('.section', home).find(section => section.textContent.includes('Что изменилось'));
    const liveSection = q('#liveSection', home);
    if (!hero || !matchSection) return;

    hero.classList.add('world-hero');
    const heading = q('.daily-heading', hero);
    const grid = q('.daily-grid', hero);
    const cta = q('.hero-cta', hero);

    const heroMeta = document.createElement('div');
    heroMeta.className = 'world-hero-meta';
    heroMeta.innerHTML = '<span class="world-live-dot"></span><span>Personal intelligence active</span><span class="world-separator"></span><span>3 signals updated</span>';
    hero.prepend(heroMeta);

    if (heading) heading.classList.add('world-hero-heading');
    if (grid) grid.classList.add('world-metrics');
    if (cta) cta.classList.add('world-primary-cta');

    const commandGrid = document.createElement('section');
    commandGrid.className = 'world-command-grid';
    const matchCard = q('.match-hero-card', matchSection);
    if (matchCard) {
      matchCard.classList.add('world-match-card');
      commandGrid.append(matchCard);
    }
    if (liveSection) {
      liveSection.classList.add('world-live-panel');
      commandGrid.append(liveSection);
    }
    matchSection.replaceWith(commandGrid);

    if (updateSection) {
      updateSection.classList.add('world-insight-strip');
      commandGrid.after(updateSection);
    }

    qa('.section', home).forEach((section, index) => {
      if (!section.classList.contains('world-insight-strip') && !section.closest('.world-command-grid')) {
        section.classList.add('world-secondary-section');
        if (index > 5) section.classList.add('world-deferred');
      }
    });
  }

  function enhanceMatches() {
    const page = q('[data-page="matches"]');
    if (!page || page.dataset.worldLayout === 'ready') return;
    page.dataset.worldLayout = 'ready';
    q('.page-heading', page)?.classList.add('world-page-heading');
    q('.match-toolbar', page)?.classList.add('world-sticky-toolbar');
    q('.source-banner', page)?.classList.add('world-data-banner');
    q('.match-list', page)?.classList.add('world-match-list');
  }

  function enhanceProfile() {
    const page = q('[data-page="profile"]');
    if (!page || page.dataset.worldLayout === 'ready') return;
    page.dataset.worldLayout = 'ready';
    q('.profile-hero', page)?.classList.add('world-profile-hero');
    q('.profile-stats', page)?.classList.add('world-profile-stats');
    q('.account-card', page)?.classList.add('world-account-card');
  }

  function enhanceShell() {
    q('.topbar')?.classList.add('world-topbar');
    q('.bottom-nav')?.classList.add('world-bottom-nav');
    q('.brand i')?.replaceChildren(document.createTextNode('3.0'));
    buildHomeCommandCenter();
    enhanceMatches();
    enhanceProfile();
  }

  N.applyWorldLayout = enhanceShell;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhanceShell, { once: true });
  else enhanceShell();
})();
