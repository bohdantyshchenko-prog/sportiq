(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const home = document.querySelector('[data-page="home"] .page-scroll');
  const hero = home?.querySelector('.daily-hero');
  if (hero) {
    hero.classList.add('v3-hero');
    const topline = hero.querySelector('.hero-topline');
    if (topline) topline.insertAdjacentHTML('afterend', '<div class="v3-hero-label"><span>TONIGHT · 21:45</span><b>Manchester City <i>vs</i> Real Madrid</b><small>Champions League · AI confidence 87%</small></div>');
    const cta = hero.querySelector('.hero-cta');
    if (cta) {
      cta.innerHTML = '<span>Открыть AI Briefing</span><i>↗</i>';
      cta.classList.add('v3-primary');
    }
    const grid = hero.querySelector('.daily-grid');
    if (grid) grid.classList.add('v3-stat-dock');
  }

  const firstSection = home?.querySelector('.section');
  if (firstSection) firstSection.insertAdjacentHTML('beforebegin', `
    <section class="v3-now" aria-label="Today at NOVIQ">
      <button class="v3-now-main pressable" data-action="open-briefing" data-match-id="mci-rma">
        <span class="v3-live-dot"></span><div><small>AI SIGNAL NOW</small><b>Состав изменил сценарий матча</b><p>Контроль City ослаблен; переходы Madrid стали главным фактором.</p></div><i>→</i>
      </button>
      <button class="v3-compact-score pressable" data-action="open-iq-method"><small>SPORTS IQ</small><strong>8 542</strong><span>+86 week</span></button>
    </section>`);

  const matchPage = document.querySelector('[data-page="matches"] .page-scroll');
  const matchHeading = matchPage?.querySelector('.page-heading');
  if (matchHeading) {
    matchHeading.classList.add('v3-page-intro');
    matchHeading.insertAdjacentHTML('beforeend', '<div class="v3-context-chips"><span>12 live</span><span>4 for you</span><span>2 replay ready</span></div>');
  }

  const intelligence = document.querySelector('[data-page="intelligence"] .page-scroll');
  intelligence?.classList.add('v3-intelligence-page');
  const profile = document.querySelector('[data-page="profile"] .page-scroll');
  const profileHero = profile?.querySelector('.profile-hero');
  if (profileHero) {
    profileHero.classList.add('v3-profile-cover');
    profileHero.insertAdjacentHTML('beforeend', '<div class="v3-profile-rank"><small>CURRENT LEVEL</small><b>Elite Analyst</b><span>Top 8% this month</span></div>');
  }

  const navCore = document.querySelector('.nav-core');
  if (navCore) {
    navCore.setAttribute('aria-label', 'Ask NOVIQ AI');
    navCore.innerHTML = '<span>✦</span><small>AI</small>';
  }

  document.documentElement.dataset.experience = 'v3';
})();
