window.NOVIQ = window.NOVIQ || {};
(() => {
  'use strict';
  const N = window.NOVIQ;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  const defaultState = {
    version: '1.2.0', language: 'ru', theme: 'dark', sportsIQ: 8542,
    skills: clone(N.demo.skills),
    calibration: { score: 72, bins: clone(N.demo.calibrationBins), history: [65, 66, 68, 67, 70, 71, 72] },
    thesisByMatch: {}, liveNotes: {},
    decisions: clone(N.demo.decisions), patterns: clone(N.demo.patterns),
    mission: { id: 'alternative-scenario', title: 'Назови альтернативный сценарий', copy: 'Добавь альтернативный сценарий в следующий Thesis.', progress: 0, target: 1 },
    favorites: { teams: ['Polissya', 'Dynamo Kyiv'], tournaments: ['Champions League'] },
    notifications: { briefings: true, lineups: true, live: true, replay: true, weekly: true, patterns: true },
    account: { mode: 'guest', email: '', syncedAt: null },
    installDismissed: false, completedLessons: [], completedReplays: [], lastPage: 'home'
  };

  function normalizeState(raw = {}) {
    return {
      ...clone(defaultState), ...raw,
      skills: { ...clone(defaultState.skills), ...(raw.skills || {}) },
      calibration: { ...clone(defaultState.calibration), ...(raw.calibration || {}), bins: raw.calibration?.bins || clone(defaultState.calibration.bins) },
      thesisByMatch: raw.thesisByMatch || {},
      decisions: Array.isArray(raw.decisions) ? raw.decisions : clone(defaultState.decisions),
      patterns: Array.isArray(raw.patterns) ? raw.patterns : clone(defaultState.patterns),
      notifications: { ...defaultState.notifications, ...(raw.notifications || {}) },
      favorites: { ...defaultState.favorites, ...(raw.favorites || {}) },
      account: { ...defaultState.account, ...(raw.account || {}) }
    };
  }

  function loadState() {
    try { return normalizeState(JSON.parse(localStorage.getItem(N.config.storageKey) || '{}')); }
    catch (error) { console.warn('State reset after parse error', error); return clone(defaultState); }
  }

  const app = {
    state: loadState(), matches: clone(N.demo.matches), activeFilter: 'for-you', activeDate: 'today', search: '', modalOpen: false,
    $, $$, clone, escapeHtml,
    save() { try { localStorage.setItem(N.config.storageKey, JSON.stringify(this.state)); } catch (error) { console.warn('Local persistence unavailable', error); } },
    formatNumber(value) {
      const locale = this.state.language === 'ua' ? 'uk-UA' : this.state.language === 'en' ? 'en-US' : 'ru-RU';
      return new Intl.NumberFormat(locale).format(value);
    },
    getMatch(id) { return this.matches.find((match) => match.id === id); },
    getThesis(id) { return this.state.thesisByMatch[id] || null; },
    setThesis(id, thesis) { this.state.thesisByMatch[id] = thesis; this.save(); },
    toastTimer: null,
    toast(message) {
      const node = $('#toast');
      clearTimeout(this.toastTimer);
      node.textContent = message;
      node.classList.add('show');
      if (navigator.vibrate) navigator.vibrate(10);
      this.toastTimer = setTimeout(() => node.classList.remove('show'), 2200);
    },
    openModal({ title, kicker = 'NOVIQ', html }) {
      $('#modalTitle').textContent = title;
      $('#modalKicker').textContent = kicker;
      $('#modalContent').innerHTML = html;
      $('#modalLayer').classList.add('open');
      $('#modalLayer').setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      this.modalOpen = true;
      setTimeout(() => $('#modalContent button, #modalContent input, #modalContent textarea')?.focus({ preventScroll: true }), 180);
    },
    closeModal() {
      $('#modalLayer').classList.remove('open');
      $('#modalLayer').setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      this.modalOpen = false;
    },
    navigate(pageName) {
      $$('.page').forEach((page) => page.classList.toggle('active', page.dataset.page === pageName));
      $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.nav === pageName));
      this.state.lastPage = pageName;
      this.save();
      const scroller = $(`.page[data-page="${pageName}"] .page-scroll`);
      if (scroller) scroller.scrollTop = 0;
    },
    applyTheme() {
      document.documentElement.dataset.theme = this.state.theme;
      document.documentElement.lang = this.state.language === 'ua' ? 'uk' : this.state.language;
      $('#currentTheme').textContent = this.state.theme === 'dark' ? 'Dark Elite' : 'Light Elite';
      $('#currentLanguage').textContent = this.state.language === 'ua' ? 'Українська' : this.state.language === 'en' ? 'English' : 'Русский';
      const themeMeta = $('meta[name="theme-color"]');
      if (themeMeta) themeMeta.content = this.state.theme === 'dark' ? '#07080d' : '#f4f1eb';
    },
    renderHeader() {
      $('#sportsIqValue').textContent = this.formatNumber(this.state.sportsIQ);
      $('#profileIQ').textContent = this.formatNumber(this.state.sportsIQ);
      $('#profileLoops').textContent = String(this.state.decisions.length + Object.keys(this.state.thesisByMatch).length);
      $('#profileCalibration').textContent = `${this.state.calibration.score}%`;
      $('#calibrationValue').textContent = `${this.state.calibration.score}%`;
      $('#dataModeLabel').textContent = N.config.dataMode === 'live' ? 'LIVE DATA' : 'DEMO DATA';
      $('#providerSummary').textContent = N.config.dataMode === 'live' ? 'Server provider' : 'Demo adapter · backend-ready';
      $('#matchDataMode').textContent = N.config.dataMode === 'live' ? 'Connected sports feed' : 'Demo sports feed';
    },
    renderFeatured() {
      const match = this.getMatch('mci-rma') || this.matches[0];
      if (!match) return;
      $('#featuredMatchHeading').textContent = `${match.home} — ${match.away}`;
      $('#featuredTournament').textContent = match.tournament;
      $('#featuredValue').textContent = `Intelligence value ${match.intelligence}`;
      $('#featuredHomeCode').textContent = match.homeCode;
      $('#featuredAwayCode').textContent = match.awayCode;
      $('#featuredHome').textContent = match.home;
      $('#featuredAway').textContent = match.away;
      $('#featuredHomeStyle').textContent = match.homeStyle;
      $('#featuredAwayStyle').textContent = match.awayStyle;
      $('#featuredTime').textContent = match.score || match.kickoff;
      $('#featuredDate').textContent = match.date === 'today' ? 'Today' : match.date;
      $('#featuredStatus').textContent = match.status.toUpperCase();
      $('#featuredSignals').innerHTML = match.signals.map((signal) => `<span><i>•</i>${escapeHtml(signal)}</span>`).join('');
    },
    renderMatches() {
      const list = $('#matchList');
      if (!list) return;
      const search = this.search.trim().toLowerCase();
      const matches = this.matches.filter((match) => {
        const filterOk = this.activeFilter === 'for-you' || match.bucket.includes(this.activeFilter);
        const dateOk = this.activeDate === 'week' || match.date === this.activeDate;
        const searchOk = !search || `${match.home} ${match.away} ${match.tournament}`.toLowerCase().includes(search);
        return filterOk && dateOk && searchOk;
      });
      list.innerHTML = matches.length ? matches.map((match) => {
        const thesis = this.getThesis(match.id);
        const status = match.status === 'live' ? `${match.minute}′ LIVE` : match.status === 'finished' ? 'REPLAY READY' : thesis?.locked ? 'THESIS LOCKED' : thesis ? 'DRAFT THESIS' : 'CREATE THESIS';
        return `<article class="match-list-card pressable" data-action="open-match-card" data-match-id="${match.id}">
          <div class="match-list-top"><span>${escapeHtml(match.tournament)}</span><span>INT ${match.intelligence}</span></div>
          <div class="match-list-teams"><div class="match-list-team"><span class="mini-crest">${match.homeCode}</span><span><b>${escapeHtml(match.home)}</b><small>${escapeHtml(match.homeStyle)}</small></span></div>
          <div class="match-list-center"><b>${match.score || match.kickoff}</b><small>${status}</small></div>
          <div class="match-list-team away"><span><b>${escapeHtml(match.away)}</b><small>${escapeHtml(match.awayStyle)}</small></span><span class="mini-crest">${match.awayCode}</span></div></div>
          <div class="match-list-footer"><span>${match.signals[0]}</span><button class="text-button" data-action="open-match-card" data-match-id="${match.id}">Open →</button></div>
        </article>`;
      }).join('') : '<div class="empty-state"><b>No matching games</b><p>Change the date, filter or search query.</p></div>';
    },
    renderRecommendations() {
      $('#recommendationRail').innerHTML = N.demo.recommendations.map((item) => `<button class="recommendation-card pressable" data-action="${item.action}" ${item.matchId ? `data-match-id="${item.matchId}"` : ''}>
        <span>${item.label}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.reason)}</p><i>→</i></button>`).join('');
    },
    renderSkills() {
      $('#skillDashboard').innerHTML = Object.entries(this.state.skills).map(([key, skill]) => `<button class="skill-dashboard-card pressable" data-action="open-skill" data-skill="${key}">
        <div><span>${escapeHtml(skill.label)}</span><b>${skill.score}</b></div><div class="skill-track"><i style="width:${skill.score}%"></i></div><small>Evidence confidence ${skill.trust}% · ${skill.delta >= 0 ? '+' : ''}${skill.delta}</small></button>`).join('');
      $('#trendChart').innerHTML = [38, 42, 47, 53, 51, 59, 63, 69, 74, 78, 84, 91].map((height, i) => `<i style="height:${height}%" title="Week ${i + 1}"></i>`).join('');
      $('#miniCalibrationChart').innerHTML = this.state.calibration.history.map((value) => `<i style="height:${value}%"></i>`).join('');
      $('#calibrationTable').innerHTML = this.state.calibration.bins.map((bin) => `<div class="calibration-row"><span>${bin.label}</span><i><b style="width:${bin.predicted}%"></b><em style="left:${bin.actual}%"></em></i><strong>${bin.predicted}% / ${bin.actual}%</strong></div>`).join('');
    },
    renderPatterns() {
      const card = (pattern) => `<button class="pattern-card pressable" data-action="open-pattern" data-pattern="${pattern.id}"><span class="pattern-icon">${pattern.icon}</span><span><b>${escapeHtml(pattern.title)}</b><small>${escapeHtml(pattern.summary)}</small></span><i>${pattern.confidence}%</i></button>`;
      $('#patternList').innerHTML = this.state.patterns.map(card).join('');
      $('#homeMemoryCards').innerHTML = this.state.patterns.slice(0, 3).map((pattern) => `<button class="memory-card pressable ${pattern.severity}" data-action="open-pattern" data-pattern="${pattern.id}"><span>${pattern.icon}</span><small>${pattern.skill}</small><h3>${escapeHtml(pattern.title)}</h3><p>${escapeHtml(pattern.summary)}</p><i>${pattern.confidence}% confidence</i></button>`).join('');
    },
    renderDecisions() {
      const thesisRows = Object.entries(this.state.thesisByMatch).map(([matchId, thesis]) => {
        const match = this.getMatch(matchId);
        return { id: `thesis:${matchId}`, match: match ? `${match.home} — ${match.away}` : matchId, score: thesis.locked ? 'LOCK' : 'DRAFT', date: 'Today', lesson: thesis.locked ? 'Decision timestamp stored. Waiting for replay.' : 'Draft thesis not locked.' };
      });
      $('#decisionList').innerHTML = [...thesisRows, ...this.state.decisions].map((decision) => `<button class="decision-card pressable" data-action="open-decision" data-decision="${escapeHtml(decision.id)}"><span><b>${escapeHtml(decision.match)}</b><small>${escapeHtml(decision.date)}</small><p>${escapeHtml(decision.lesson)}</p></span><i>${decision.score}</i></button>`).join('');
    },
    renderMission() {
      $('#dailyMissionTitle').textContent = this.state.mission.title;
      const done = this.state.mission.progress >= this.state.mission.target;
      if (done) $('#dailyMissionTitle').textContent = 'Mission completed';
    },
    renderAccount() {
      const isGuest = this.state.account.mode !== 'connected';
      $('#accountTitle').textContent = isGuest ? 'Guest Intelligence' : this.state.account.email;
      $('#accountCopy').textContent = isGuest
        ? 'Progress is stored on this device. Supabase Auth and cloud sync are prepared but not connected.'
        : `Local demo account · last sync ${this.state.account.syncedAt || 'not yet'}`;
      $('#favoritesSummary').textContent = [...this.state.favorites.teams, ...this.state.favorites.tournaments].join(' · ');
    },
    renderToday() {
      const locale = this.state.language === 'ua' ? 'uk-UA' : this.state.language === 'en' ? 'en-US' : 'ru-RU';
      const now = new Date();
      $('#todayLabel').textContent = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(now).toUpperCase();
      const offsets = { yesterday: -1, today: 0, tomorrow: 1 };
      Object.entries(offsets).forEach(([key, offset]) => {
        const button = $(`[data-date=\"${key}\"]`);
        if (!button) return;
        const date = new Date(now);
        date.setDate(now.getDate() + offset);
        const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date).replace('.', '').toUpperCase();
        const day = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date);
        const small = $('small', button);
        const bold = $('b', button);
        if (small) small.textContent = weekday;
        if (bold) bold.textContent = day;
      });
    },
    applyState() {
      this.applyTheme(); this.renderHeader(); this.renderToday(); this.renderFeatured(); this.renderMatches(); this.renderRecommendations();
      this.renderSkills(); this.renderPatterns(); this.renderDecisions(); this.renderMission(); this.renderAccount();
    }
  };

  N.app = app;
})();
