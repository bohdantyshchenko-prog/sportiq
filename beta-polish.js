(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const $ = (selector, root = document) => root.querySelector(selector);

  const getStep = () => {
    if (!N.state?.diagnostic?.completed) return 0;
    if (!N.state?.thesis) return 1;
    if (!N.state?.thesis?.locked) return 2;
    return 3;
  };

  const renderJourney = () => {
    const home = $('[data-page="home"] .page-scroll');
    const hero = $('.daily-hero', home);
    if (!home || !hero || $('#betaJourney')) return;
    const current = getStep();
    const labels = ['Диагностика', 'Briefing', 'Thesis', 'Replay'];
    const section = document.createElement('section');
    section.id = 'betaJourney';
    section.className = 'beta-journey';
    section.innerHTML = `<div class="beta-journey-head"><div><span class="eyebrow">INTELLIGENCE LOOP</span><h2>Твой следующий шаг</h2></div><b>${current + 1}/4</b></div><div class="beta-journey-steps">${labels.map((label, index) => `<span class="${index < current ? 'done' : index === current ? 'active' : ''}"><i>${index < current ? '✓' : index + 1}</i><small>${label}</small></span>`).join('')}</div>`;
    hero.after(section);
  };

  const openOnboarding = () => {
    if (!N.state || N.state.onboardingSeen || $('#betaOnboarding')) return;
    const layer = document.createElement('div');
    layer.id = 'betaOnboarding';
    layer.className = 'beta-onboarding';
    layer.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="betaOnboardingTitle"><span class="beta-mark">N</span><span class="eyebrow">NOVIQ 4.1</span><h1 id="betaOnboardingTitle">Думай о спорте точнее</h1><p>NOVIQ не выдаёт случайные прогнозы. Ты формируешь гипотезу, фиксируешь уверенность и после матча видишь, где рассуждал правильно.</p><div class="beta-value-grid"><div><b>01</b><span>Пойми контекст</span></div><div><b>02</b><span>Зафиксируй Thesis</span></div><div><b>03</b><span>Проверь решение</span></div></div><button type="button" class="primary-button" data-beta-action="start">Начать Intelligence Loop</button><button type="button" class="beta-skip" data-beta-action="skip">Открыть приложение</button></section>`;
    document.body.append(layer);
    requestAnimationFrame(() => layer.classList.add('visible'));
  };

  const closeOnboarding = (startLoop) => {
    const layer = $('#betaOnboarding');
    N.state.onboardingSeen = true;
    N.save?.();
    layer?.classList.remove('visible');
    setTimeout(() => layer?.remove(), 220);
    if (startLoop) setTimeout(() => N.openLoop?.(), 260);
  };

  const apply = () => {
    const badge = $('.brand i');
    if (badge) badge.textContent = N.config?.version || '4.1.0';
    renderJourney();
    openOnboarding();
    document.body.classList.add('beta-ready');
  };

  document.addEventListener('click', event => {
    const action = event.target.closest('[data-beta-action]')?.dataset.betaAction;
    if (action === 'start') closeOnboarding(true);
    if (action === 'skip') closeOnboarding(false);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(apply, 0), { once: true });
  else setTimeout(apply, 0);
})();