window.NOVIQ = window.NOVIQ || {};
(() => {
  'use strict';
  const N = window.NOVIQ;
  const app = N.app;
  const $ = app.$, $$ = app.$$, esc = app.escapeHtml;
  let deferredInstallPrompt = null;

  function openDataStatus() {
    const status = N.services.sports.status();
    app.openModal({ title: 'Sports Data Gateway', kicker: 'DATA TRANSPARENCY', html: `<div class="data-status-card"><span class="status-dot"></span><div><b>${esc(status.provider)}</b><p>Mode: ${esc(status.mode)} · ${esc(status.freshness)}</p></div></div>
      <div class="truth-list"><span class="truth-ready">✓ Provider adapter and normalized match model</span><span class="truth-ready">✓ Demo fallback and graceful error states</span><span class="truth-ready">✓ Dynamic Briefing and live-timeline UI</span><span class="truth-demo">◌ No official live feed connected</span><span class="truth-next">→ Add server endpoints and commercial data rights before production</span></div>
      <div class="info-card"><h3>Expected server contract</h3><p><code>GET /matches</code>, <code>GET /matches/:id</code>, <code>GET /matches/:id/timeline</code>. API keys must stay on the server, never in this public repository.</p></div>
      <div class="review-card warning"><h3>Current limitation</h3><p>${(status.limitations || []).map(esc).join(' · ') || 'Server configuration required.'}</p></div>` });
  }

  function openNotifications() {
    const labels = { briefings: 'Dynamic AI Briefing', lineups: 'Starting lineups', live: 'Meaningful live changes', replay: 'Decision Replay', weekly: 'Weekly Report', patterns: 'New Sports Memory pattern' };
    app.openModal({ title: 'Smart notifications', kicker: 'NOTIFICATION INTELLIGENCE', html: `<p class="modal-copy">Only changes that affect a decision should interrupt the user. Browser push is not connected in this build.</p>${Object.entries(app.state.notifications).map(([key, enabled]) => `<button class="setting-row" data-action="toggle-notification" data-notification="${key}"><span class="setting-icon">${enabled ? '●' : '○'}</span><span><b>${labels[key]}</b><small>${enabled ? 'Enabled locally' : 'Disabled'}</small></span><i>›</i></button>`).join('')}` });
  }

  function openMatchPreferences() {
    const teams = ['Polissya', 'Dynamo Kyiv', 'Manchester City', 'Real Madrid'];
    const tournaments = ['Champions League', 'Ukraine', 'Club World Cup'];
    app.openModal({ title: 'Teams and competitions', kicker: 'PERSONAL MATCH CENTER', html: `<p class="modal-copy">Preferences affect recommendations and Match Center filters.</p><div class="form-group"><label>Teams</label><div class="source-grid">${teams.map((team) => `<button class="source-button ${app.state.favorites.teams.includes(team) ? 'selected' : ''}" data-action="toggle-favorite" data-kind="teams" data-value="${team}">${team}</button>`).join('')}</div></div><div class="form-group"><label>Competitions</label><div class="source-grid">${tournaments.map((item) => `<button class="source-button ${app.state.favorites.tournaments.includes(item) ? 'selected' : ''}" data-action="toggle-favorite" data-kind="tournaments" data-value="${item}">${item}</button>`).join('')}</div></div><div class="info-card"><h3>Recommendation logic</h3><p>Preferences are combined with skill gaps, active patterns and unfinished loops. They do not override analytical value.</p></div>` });
  }

  function toggleFavorite(button) {
    const { kind, value } = button.dataset;
    const list = app.state.favorites[kind];
    app.state.favorites[kind] = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    app.save(); app.applyState(); openMatchPreferences();
  }

  function openAccount() {
    const connected = app.state.account.mode === 'connected';
    app.openModal({ title: connected ? 'Local demo session' : 'Guest Intelligence', kicker: 'ACCOUNT & SYNC', html: connected ? `<div class="review-card success"><h3>${esc(app.state.account.email)}</h3><p>This is a local demonstration of account state. No real Supabase session exists.</p></div><div class="info-card"><h3>Production requirements</h3><p>Supabase Auth, secure session storage, Row Level Security, account deletion and guest-data migration.</p></div><div class="modal-actions one"><button class="secondary-button" data-action="disconnect-demo-account">Return to guest mode</button></div>` : `<div class="truth-banner"><b>No forced login</b><p>The full intelligence loop remains testable in guest mode.</p></div><div class="form-group"><label for="demoEmail">Email for local account demonstration</label><input class="input" id="demoEmail" type="email" placeholder="name@example.com" autocomplete="email" /></div><div class="modal-actions one"><button class="primary-button" data-action="connect-demo-account">Create local demo session</button></div><div class="review-card warning"><h3>Not real authentication</h3><p>No password or external account is created. The value is stored only in this browser.</p></div>` });
  }

  function connectDemoAccount() {
    const email = $('#demoEmail')?.value.trim() || '';
    if (!/^\S+@\S+\.\S+$/.test(email)) return app.toast('Enter a valid email format');
    app.state.account = { mode: 'connected', email, syncedAt: new Date().toISOString() };
    app.save(); app.applyState(); openAccount(); app.toast('Local demo session created');
  }

  function disconnectDemoAccount() {
    app.state.account = { mode: 'guest', email: '', syncedAt: null };
    app.save(); app.applyState(); openAccount();
  }

  function openAICore() {
    app.openModal({ title: 'Ask NOVIQ', kicker: 'AI CORE · LOCAL DEMO', html: `<div class="ai-orb-large"><b>✦</b></div><p class="modal-copy center">AI is a critic and coach, not a match prophet.</p><div class="ai-suggestions"><button class="ai-suggestion" data-action="use-ai-suggestion">Check my confidence</button><button class="ai-suggestion" data-action="use-ai-suggestion">Show a similar mistake</button><button class="ai-suggestion" data-action="use-ai-suggestion">What should I watch live?</button></div><textarea class="textarea" id="aiQuestion" placeholder="Ask about tactics, uncertainty or Sports Memory..."></textarea><div class="modal-actions one"><button class="primary-button" data-action="ask-ai">Analyse →</button></div><div id="aiAnswer"></div>` });
  }

  async function askAI() {
    const question = $('#aiQuestion')?.value.trim() || '';
    if (question.length < 4) return app.toast('Write a more specific question');
    $('#aiAnswer').innerHTML = '<div class="loading-card"><i></i><b>NOVIQ is analysing…</b></div>';
    const answer = await N.services.ai.answer(question, app.state);
    $('#aiAnswer').innerHTML = `<div class="review-card success"><h3>NOVIQ AI · demo</h3><p>${esc(answer)}</p></div><div class="info-card"><h3>Confidence and source</h3><p>Medium-confidence local demo inference based on the bundled test dataset and your local state.</p></div>`;
  }

  function openIQMethod() {
    app.openModal({ title: 'Sports IQ methodology', kicker: 'EXPLAINABLE RATING', html: `<div class="info-card"><h3>What increases Sports IQ</h3><p>Causal reasoning, multiple evidence types, explicit risks, honest confidence, match difficulty and reusable learning.</p></div><div class="info-card"><h3>What barely matters</h3><p>Opening the app, likes, random score guesses and mass low-effort predictions.</p></div><div class="review-card warning"><h3>Evidence confidence</h3><p>Each skill score has a trust level. The product must avoid presenting weak evidence as proven expertise.</p></div>` });
  }

  function openMatchCard(matchId) {
    const match = app.getMatch(matchId);
    if (!match) return;
    const thesis = app.getThesis(matchId);
    const mainAction = match.status === 'finished' ? ['open-replay', 'Decision Replay'] : match.status === 'live' ? ['open-live', 'Live Tracking'] : ['open-thesis', thesis?.locked ? 'View locked Thesis' : 'Create Thesis'];
    app.openModal({ title: `${match.home} — ${match.away}`, kicker: `${match.tournament} · INTELLIGENCE ${match.intelligence}`, html: `<div class="match-main modal-match"><div class="team"><span class="crest">${match.homeCode}</span><b>${esc(match.home)}</b></div><div class="match-center"><b>${match.score || match.kickoff}</b><small>${match.status.toUpperCase()}</small></div><div class="team"><span class="crest">${match.awayCode}</span><b>${esc(match.away)}</b></div></div><div class="info-card"><h3>Why it is valuable</h3><p>${esc(match.signals.join(' · '))}</p></div><div class="action-row"><button class="secondary-button" data-action="open-briefing" data-match-id="${matchId}">AI Briefing</button><button class="primary-button" data-action="${mainAction[0]}" data-match-id="${matchId}">${mainAction[1]} →</button></div>` });
  }

  function openDecision(id) {
    if (id.startsWith('thesis:')) return N.thesis.openThesis(id.split(':')[1]);
    const decision = app.state.decisions.find((item) => item.id === id);
    if (!decision) return;
    if (/int-bay/.test(id)) return N.live.openReplay('int-bay');
    app.openModal({ title: decision.match, kicker: 'DECISION HISTORY', html: `<div class="replay-hero"><span>DECISION SCORE</span><strong>${decision.score}</strong><p>${esc(decision.lesson)}</p></div><div class="info-card"><h3>Archive status</h3><p>This historical demo decision remains local to the device.</p></div>` });
  }

  function continueLoop() {
    const thesis = app.getThesis('mci-rma');
    if (!thesis) return N.thesis.openBriefing('mci-rma');
    if (!thesis.locked) return N.thesis.openThesis('mci-rma');
    if (!app.state.completedReplays.includes('int-bay')) return N.live.openLive('ars-bar');
    return N.intelligence.openWeeklyReport();
  }

  function changeLanguage() {
    app.openModal({ title: 'Language', kicker: 'LOCALIZATION', html: `<div class="option-grid"><button class="option-button ${app.state.language === 'ru' ? 'selected' : ''}" data-action="set-language" data-language="ru">Русский</button><button class="option-button ${app.state.language === 'ua' ? 'selected' : ''}" data-action="set-language" data-language="ua">Українська</button><button class="option-button ${app.state.language === 'en' ? 'selected' : ''}" data-action="set-language" data-language="en">English</button></div><div class="review-card warning"><h3>1.2 limitation</h3><p>Core system controls change locale. The full analytical demo copy is still primarily Russian/English and needs server-side localization before production.</p></div>` });
  }

  function toggleTheme() {
    app.state.theme = app.state.theme === 'dark' ? 'light' : 'dark';
    app.save(); app.applyState(); app.toast(`${app.state.theme === 'dark' ? 'Dark' : 'Light'} Elite activated`);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(app.state, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `noviq-1.2-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
    app.toast('Export prepared');
  }

  function resetDemo() {
    app.openModal({ title: 'Reset local progress?', kicker: 'DATA CONTROL', html: `<div class="review-card warning"><h3>This cannot be undone locally</h3><p>Thesis, live notes, replay lessons, Sports Memory and preferences will be removed from this browser.</p></div><div class="modal-actions"><button class="secondary-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="confirm-reset">Reset</button></div>` });
  }

  function installApp() {
    if (!deferredInstallPrompt) return app.toast('On iPhone: Share → Add to Home Screen');
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => { deferredInstallPrompt = null; $('#installBanner').hidden = true; });
  }

  document.addEventListener('click', (event) => {
    const element = event.target.closest('[data-action]');
    if (!element) return;
    const action = element.dataset.action;
    const handlers = {
      'go-home': () => app.navigate('home'), 'navigate': () => app.navigate(element.dataset.nav), 'open-profile': () => app.navigate('profile'), 'go-intelligence': () => app.navigate('intelligence'),
      'close-modal': () => app.closeModal(), 'open-data-status': openDataStatus, 'open-notifications': openNotifications, 'open-match-preferences': openMatchPreferences,
      'open-account': openAccount, 'connect-demo-account': connectDemoAccount, 'disconnect-demo-account': disconnectDemoAccount,
      'open-ai-core': openAICore, 'ask-ai': askAI, 'use-ai-suggestion': () => { const input = $('#aiQuestion'); if (input) { input.value = element.textContent.trim(); input.focus(); } },
      'open-iq-method': openIQMethod, 'continue-loop': continueLoop, 'open-match-card': () => openMatchCard(element.dataset.matchId), 'open-decision': () => openDecision(element.dataset.decision),
      'open-briefing': () => N.thesis.openBriefing(element.dataset.matchId || 'mci-rma'), 'open-thesis': () => N.thesis.openThesis(element.dataset.matchId || 'mci-rma'),
      'save-thesis-draft': () => N.thesis.saveDraft(element.dataset.matchId), 'review-thesis': () => N.thesis.reviewThesis(element.dataset.matchId), 'edit-thesis': () => N.thesis.openThesis(element.dataset.matchId), 'lock-thesis': () => N.thesis.lockThesis(element.dataset.matchId),
      'open-live': () => N.live.openLive(element.dataset.matchId || 'ars-bar'), 'save-live-note': () => N.live.saveLiveNote(element.dataset.matchId), 'open-replay': () => N.live.openReplay(element.dataset.matchId || 'int-bay'), 'complete-replay': () => N.live.completeReplay(element.dataset.matchId),
      'open-calibration': N.intelligence.openCalibration, 'open-pattern': () => N.intelligence.openPattern(element.dataset.pattern), 'open-mission': N.intelligence.openMission,
      'open-lesson': N.intelligence.openLesson, 'answer-lesson': () => N.intelligence.answerLesson(element), 'complete-lesson': N.intelligence.completeLesson,
      'open-weekly-report': N.intelligence.openWeeklyReport, 'open-recommendations': N.intelligence.openRecommendations, 'open-recommendation': () => N.intelligence.openRecommendation(element.dataset.recommendation), 'open-skill': () => N.intelligence.openSkill(element.dataset.skill),
      'change-language': changeLanguage, 'toggle-theme': toggleTheme, 'export-data': exportData, 'reset-demo': resetDemo,
      'toggle-favorite': () => toggleFavorite(element), 'toggle-notification': () => { const key = element.dataset.notification; app.state.notifications[key] = !app.state.notifications[key]; app.save(); openNotifications(); },
      'set-language': () => { app.state.language = element.dataset.language; app.save(); app.applyState(); app.closeModal(); app.toast('Language changed'); },
      'confirm-reset': () => { try { localStorage.removeItem(N.config.storageKey); } catch {} location.reload(); },
      'dispute-pattern': () => app.toast('Pattern marked for re-evaluation'), 'memory-filters': () => app.toast('Evidence filters prepared for server data'),
      'install-app': installApp, 'dismiss-install': () => { app.state.installDismissed = true; app.save(); $('#installBanner').hidden = true; }
    };
    if (handlers[action]) handlers[action]();
  });

  document.addEventListener('click', (event) => {
    const mode = event.target.closest('[data-mode]');
    if (mode && $('#modalContent')) {
      $('#modalContent').dataset.mode = mode.dataset.mode;
      $$('[data-mode]', $('#modalContent')).forEach((item) => item.classList.toggle('selected', item === mode));
      $$('.expert-only', $('#modalContent')).forEach((item) => { item.hidden = mode.dataset.mode === 'quick'; });
    }
    const outcome = event.target.closest('[data-outcome]');
    if (outcome && $('#modalContent')) {
      $('#modalContent').dataset.outcome = outcome.dataset.outcome;
      $$('[data-outcome]', $('#modalContent')).forEach((item) => item.classList.toggle('selected', item === outcome));
    }
    const source = event.target.closest('[data-source]');
    if (source && $('#modalContent')) {
      let sources = [];
      try { sources = JSON.parse($('#modalContent').dataset.sources || '[]'); } catch {}
      sources = sources.includes(source.dataset.source) ? sources.filter((item) => item !== source.dataset.source) : [...sources, source.dataset.source];
      $('#modalContent').dataset.sources = JSON.stringify(sources);
      source.classList.toggle('selected');
    }
    const filter = event.target.closest('[data-filter]');
    if (filter) { app.activeFilter = filter.dataset.filter; $$('[data-filter]').forEach((item) => item.classList.toggle('active', item === filter)); app.renderMatches(); }
    const date = event.target.closest('[data-date]');
    if (date) { app.activeDate = date.dataset.date; $$('[data-date]').forEach((item) => item.classList.toggle('active', item === date)); app.renderMatches(); }
  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'matchSearch') { app.search = event.target.value; app.renderMatches(); }
    if (event.target.id === 'confidenceRange') $('#confidenceValue').textContent = `${event.target.value}%`;
  });

  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && app.modalOpen) app.closeModal(); });
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstallPrompt = event; if (!app.state.installDismissed) $('#installBanner').hidden = false; });

  async function boot() {
    try { app.matches = await N.services.sports.listMatches(); }
    catch (error) { console.warn('Sports feed fallback active', error); app.toast('Sports feed unavailable · demo fallback'); }
    app.applyState();
    app.navigate(app.state.lastPage || 'home');
    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('SW registration skipped', error)));
  }
  boot();
})();
