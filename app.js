(() => {
  'use strict';

  const STORAGE_KEY = 'noviq-v1-state';
  const defaultState = {
    language: 'ru',
    theme: 'dark',
    sportsIQ: 8542,
    diagnosticCompleted: false,
    thesis: null,
    decisions: [
      { match: 'Inter — Bayern', score: 82, date: '29 Jul', lesson: 'Сценарий был сильным, уверенность завышена.' },
      { match: 'PSG — Liverpool', score: 76, date: '26 Jul', lesson: 'Хорошо учтён контекст, пропущен риск стандартов.' },
      { match: 'Arsenal — Barcelona', score: 88, date: '22 Jul', lesson: 'Лучший тактический разбор месяца.' }
    ],
    notifications: { briefings: true, lineups: true, replay: true, weekly: true },
    installedPromptSeen: false
  };

  const translations = {
    ru: {
      hello: 'Привет, Богдан', eliteProfile: 'Elite Intelligence', personalIntelligence: 'PERSONAL INTELLIGENCE', recheck: 'Перепроверить', sportsIQ: 'SPORTS IQ', iqCaption: 'Выше 91% активных аналитиков', worldCup: 'World Cup Command Center', tournamentMode: 'TOURNAMENT MODE', worldCupTitle: 'Твой интеллект на главном турнире', worldCupText: 'Персональные сценарии, скрытые риски и турнирная память без перегрузки новостями.', matchesAnalyzed: 'матчей разобрано', scenarioAccuracy: 'точность сценариев', matchOfDay: 'MATCH OF THE DAY', aiBriefing: 'AI Briefing', refresh: 'Обновить', today: 'Сегодня', mainScenario: 'Главный сценарий', scenarioText: 'Контроль City против переходов Madrid', hiddenRisk: 'Скрытый риск', riskText: 'Пространство после потери в центре', fullBriefing: 'Полный briefing', createThesis: 'Создать Thesis', liveNow: 'LIVE NOW', liveIntelligence: 'Live Intelligence', allMatches: 'Все матчи', liveSignal: 'Твоя гипотеза держится, но риск через левый фланг растёт.', replayReady: 'REPLAY READY', replaySignal: 'Сильная логика, неверный уровень уверенности. Разбери решение.', yourTwin: 'Твоя модель мышления', patternDetected: 'PATTERN DETECTED', twinHeadline: 'Ты переоцениваешь влияние сильного состава', twinText: 'В 4 из 6 последних решений состав повышал твою уверенность сильнее, чем подтверждали контекст и нагрузка.', decisions: 'решений', calibrationImpact: 'влияние на калибровку', futureSelf: 'Следующая версия тебя', nextLevel: 'До уровня Master Analyst', personalMission: 'Персональная миссия', missionText: 'В следующем Thesis укажи фактор, который способен изменить твоё мнение.', startMission: 'Начать миссию', memoryMoment: 'Memory Moment', openTimeline: 'Вся история', breakthrough: 'BREAKTHROUGH', memoryTitle: 'Ты впервые снизил уверенность после проверки риска', memoryText: 'Это решение стало началом роста твоего Context IQ.', aroundYou: 'Футбол вокруг тебя', geoTitle: 'Локальный футбольный мир активен', geoText: '3 матча, 2 сообщества и одна аналитическая встреча рядом на этой неделе.', community: 'Интеллект друзей', open: 'Открыть', thesisBattle: 'Thesis Battle', challengeFriend: 'Вызвать друга', todayForYou: 'Твоя интеллектуальная лента', microLesson: 'МИКРО-УРОК · 4 МИН', lessonTitle: 'Как отличать контроль мяча от контроля матча', scenarioLabTitle: 'Что делать команде после удаления на 62-й минуте', weeklyReport: 'Твоя неделя в NOVIQ', wrappedHeadline: 'Ты стал точнее, но не осторожнее', wrappedText: 'Сценарии +9%. Калибровка уверенности −2%. Главный фокус следующей недели — управление риском.', home: 'Главная', matches: 'Матчи', insights: 'Интеллект', profile: 'Профиль', forYou: 'Для тебя', upcoming: 'Скоро', intelligence: 'Интеллект', activePatterns: 'Активные паттерны', recentDecisions: 'Последние решения', profileTagline: 'Строю доказанную футбольную экспертизу, а не коллекцию случайных прогнозов.', personalization: 'Персонализация', language: 'Язык', appearance: 'Оформление', notifications: 'Уведомления', smartOnly: 'Только значимые', accountData: 'Аккаунт и данные', exportData: 'Экспорт данных', exportText: 'Thesis, Replay и Sports Memory', resetDemo: 'Сбросить демо', resetText: 'Удалить локальный прогресс', installNoviq: 'Установить NOVIQ', installText: 'Открывай как отдельное приложение', install: 'Установить'
    },
    ua: {
      hello: 'Привіт, Богдане', eliteProfile: 'Elite Intelligence', personalIntelligence: 'PERSONAL INTELLIGENCE', recheck: 'Перевірити', sportsIQ: 'SPORTS IQ', iqCaption: 'Вище 91% активних аналітиків', worldCup: 'World Cup Command Center', tournamentMode: 'TOURNAMENT MODE', worldCupTitle: 'Твій інтелект на головному турнірі', worldCupText: 'Персональні сценарії, приховані ризики й турнірна пам’ять без перевантаження новинами.', matchesAnalyzed: 'матчів розібрано', scenarioAccuracy: 'точність сценаріїв', matchOfDay: 'MATCH OF THE DAY', aiBriefing: 'AI Briefing', refresh: 'Оновити', today: 'Сьогодні', mainScenario: 'Головний сценарій', scenarioText: 'Контроль City проти переходів Madrid', hiddenRisk: 'Прихований ризик', riskText: 'Простір після втрати в центрі', fullBriefing: 'Повний briefing', createThesis: 'Створити Thesis', liveNow: 'LIVE NOW', liveIntelligence: 'Live Intelligence', allMatches: 'Усі матчі', liveSignal: 'Твоя гіпотеза тримається, але ризик через лівий фланг зростає.', replayReady: 'REPLAY READY', replaySignal: 'Сильна логіка, хибний рівень упевненості. Розбери рішення.', yourTwin: 'Твоя модель мислення', patternDetected: 'PATTERN DETECTED', twinHeadline: 'Ти переоцінюєш вплив сильного складу', twinText: 'У 4 із 6 останніх рішень склад підвищував твою впевненість сильніше, ніж підтверджували контекст і навантаження.', decisions: 'рішень', calibrationImpact: 'вплив на калібрування', futureSelf: 'Наступна версія тебе', nextLevel: 'До рівня Master Analyst', personalMission: 'Персональна місія', missionText: 'У наступному Thesis вкажи фактор, здатний змінити твою думку.', startMission: 'Почати місію', memoryMoment: 'Memory Moment', openTimeline: 'Уся історія', breakthrough: 'BREAKTHROUGH', memoryTitle: 'Ти вперше знизив упевненість після перевірки ризику', memoryText: 'Це рішення стало початком зростання твого Context IQ.', aroundYou: 'Футбол навколо тебе', geoTitle: 'Локальний футбольний світ активний', geoText: '3 матчі, 2 спільноти й одна аналітична зустріч поруч цього тижня.', community: 'Інтелект друзів', open: 'Відкрити', thesisBattle: 'Thesis Battle', challengeFriend: 'Кинути виклик другу', todayForYou: 'Твоя інтелектуальна стрічка', microLesson: 'МІКРОУРОК · 4 ХВ', lessonTitle: 'Як відрізняти контроль м’яча від контролю матчу', scenarioLabTitle: 'Що робити команді після вилучення на 62-й хвилині', weeklyReport: 'Твій тиждень у NOVIQ', wrappedHeadline: 'Ти став точнішим, але не обережнішим', wrappedText: 'Сценарії +9%. Калібрування впевненості −2%. Головний фокус наступного тижня — керування ризиком.', home: 'Головна', matches: 'Матчі', insights: 'Інтелект', profile: 'Профіль', forYou: 'Для тебе', upcoming: 'Незабаром', intelligence: 'Інтелект', activePatterns: 'Активні патерни', recentDecisions: 'Останні рішення', profileTagline: 'Будую доведену футбольну експертизу, а не колекцію випадкових прогнозів.', personalization: 'Персоналізація', language: 'Мова', appearance: 'Оформлення', notifications: 'Сповіщення', smartOnly: 'Лише значущі', accountData: 'Акаунт і дані', exportData: 'Експорт даних', exportText: 'Thesis, Replay і Sports Memory', resetDemo: 'Скинути демо', resetText: 'Видалити локальний прогрес', installNoviq: 'Встановити NOVIQ', installText: 'Відкривай як окремий застосунок', install: 'Встановити'
    },
    en: {
      hello: 'Hello, Bohdan', eliteProfile: 'Elite Intelligence', personalIntelligence: 'PERSONAL INTELLIGENCE', recheck: 'Reassess', sportsIQ: 'SPORTS IQ', iqCaption: 'Above 91% of active analysts', worldCup: 'World Cup Command Center', tournamentMode: 'TOURNAMENT MODE', worldCupTitle: 'Your intelligence at the biggest tournament', worldCupText: 'Personal scenarios, hidden risks and tournament memory without a noisy news feed.', matchesAnalyzed: 'matches analyzed', scenarioAccuracy: 'scenario accuracy', matchOfDay: 'MATCH OF THE DAY', aiBriefing: 'AI Briefing', refresh: 'Refresh', today: 'Today', mainScenario: 'Main scenario', scenarioText: 'City control versus Madrid transitions', hiddenRisk: 'Hidden risk', riskText: 'Space after central turnovers', fullBriefing: 'Full briefing', createThesis: 'Create Thesis', liveNow: 'LIVE NOW', liveIntelligence: 'Live Intelligence', allMatches: 'All matches', liveSignal: 'Your thesis still holds, but the left-side risk is rising.', replayReady: 'REPLAY READY', replaySignal: 'Strong logic, weak confidence calibration. Review the decision.', yourTwin: 'Your thinking model', patternDetected: 'PATTERN DETECTED', twinHeadline: 'You overvalue a strong starting lineup', twinText: 'In 4 of your last 6 decisions, lineups increased confidence more than context and fatigue justified.', decisions: 'decisions', calibrationImpact: 'calibration impact', futureSelf: 'Your next version', nextLevel: 'Progress to Master Analyst', personalMission: 'Personal mission', missionText: 'In your next Thesis, state what evidence could change your mind.', startMission: 'Start mission', memoryMoment: 'Memory Moment', openTimeline: 'Full timeline', breakthrough: 'BREAKTHROUGH', memoryTitle: 'You first lowered confidence after checking risk', memoryText: 'That decision started the rise of your Context IQ.', aroundYou: 'Football around you', geoTitle: 'Your local football world is active', geoText: '3 matches, 2 communities and one analysis meetup nearby this week.', community: 'Friends intelligence', open: 'Open', thesisBattle: 'Thesis Battle', challengeFriend: 'Challenge a friend', todayForYou: 'Your intelligence feed', microLesson: 'MICRO LESSON · 4 MIN', lessonTitle: 'Possession control versus match control', scenarioLabTitle: 'How to respond to a red card in minute 62', weeklyReport: 'Your week in NOVIQ', wrappedHeadline: 'You became more accurate, not more cautious', wrappedText: 'Scenarios +9%. Confidence calibration −2%. Next focus: risk management.', home: 'Home', matches: 'Matches', insights: 'Intelligence', profile: 'Profile', forYou: 'For you', upcoming: 'Upcoming', intelligence: 'Intelligence', activePatterns: 'Active patterns', recentDecisions: 'Recent decisions', profileTagline: 'Building proven football expertise, not a collection of lucky predictions.', personalization: 'Personalization', language: 'Language', appearance: 'Appearance', notifications: 'Notifications', smartOnly: 'Meaningful only', accountData: 'Account and data', exportData: 'Export data', exportText: 'Thesis, Replay and Sports Memory', resetDemo: 'Reset demo', resetText: 'Delete local progress', installNoviq: 'Install NOVIQ', installText: 'Open it like a standalone app', install: 'Install'
    }
  };

  const matches = [
    { id: 'mci-rma', group: 'for-you upcoming', tournament: 'Champions League', time: '21:45', home: 'Manchester City', away: 'Real Madrid', homeCode: 'MCI', awayCode: 'RMA', intelligence: 94, status: 'Create Thesis' },
    { id: 'ars-bar', group: 'for-you live', tournament: 'Champions League', time: "67'", home: 'Arsenal', away: 'Barcelona', homeCode: 'ARS', awayCode: 'BAR', intelligence: 88, status: 'Follow Live', score: '1–1' },
    { id: 'int-bay', group: 'for-you replay', tournament: 'Champions League', time: 'FT', home: 'Inter', away: 'Bayern', homeCode: 'INT', awayCode: 'BAY', intelligence: 91, status: 'Decision Replay', score: '2–1' },
    { id: 'psg-liv', group: 'upcoming', tournament: 'Club World Cup', time: '19:00', home: 'PSG', away: 'Liverpool', homeCode: 'PSG', awayCode: 'LIV', intelligence: 86, status: 'Open Briefing' },
    { id: 'pol-dyn', group: 'for-you upcoming', tournament: 'Ukraine', time: '17:00', home: 'Polissya', away: 'Dynamo Kyiv', homeCode: 'POL', awayCode: 'DKY', intelligence: 83, status: 'Create Thesis' }
  ];

  const patterns = [
    { icon: '△', title: 'Lineup bias', text: 'Сильный состав повышает твою уверенность в среднем на 11% сильнее нормы.', evidence: '6 матчей' },
    { icon: '◎', title: 'Transition reader', text: 'Ты стабильно замечаешь риск быстрых переходов раньше среднего.', evidence: '82% signal' },
    { icon: '◇', title: 'Playoff uncertainty', text: 'В плей-офф твоя калибровка хуже на 8 пунктов.', evidence: '9 матчей' }
  ];

  let state = loadState();
  let deferredInstallPrompt = null;
  let toastTimer = null;
  let activeFilter = 'for-you';
  let diagnosticStep = 0;
  let diagnosticAnswers = [];

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const modalLayer = qs('#modalLayer');
  const modalTitle = qs('#modalTitle');
  const modalKicker = qs('#modalKicker');
  const modalContent = qs('#modalContent');

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaultState, ...parsed, notifications: { ...defaultState.notifications, ...(parsed?.notifications || {}) } };
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyState() {
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.lang = state.language === 'ua' ? 'uk' : state.language;
    qs('#sportsIqValue').textContent = formatNumber(state.sportsIQ);
    qs('#currentTheme').textContent = state.theme === 'dark' ? 'Dark Elite' : 'Light Elite';
    qs('#currentLanguage').textContent = state.language === 'ru' ? 'Русский' : state.language === 'ua' ? 'Українська' : 'English';
    translatePage();
    renderMatches();
    renderPatterns();
    renderDecisions();
  }

  function translatePage() {
    const dict = translations[state.language] || translations.ru;
    qsa('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      if (dict[key]) node.textContent = dict[key];
    });
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(state.language === 'en' ? 'en-US' : state.language === 'ua' ? 'uk-UA' : 'ru-RU').format(value);
  }

  function navigate(pageName) {
    qsa('.page').forEach((page) => page.classList.toggle('active', page.dataset.page === pageName));
    qsa('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.nav === pageName));
    const activePage = qs(`.page[data-page="${pageName}"] .page-scroll`);
    if (activePage) activePage.scrollTop = 0;
  }

  function renderMatches() {
    const list = qs('#matchList');
    if (!list) return;
    const visible = matches.filter((match) => match.group.includes(activeFilter));
    list.innerHTML = visible.map((match) => `
      <article class="match-list-card pressable" data-action="open-match-card" data-match-id="${match.id}">
        <div class="match-list-top"><span>${match.tournament}</span><span>Intelligence ${match.intelligence}</span></div>
        <div class="match-list-teams">
          <div class="match-list-team"><span class="mini-crest">${match.homeCode}</span><span><b>${match.home}</b><small>Home</small></span></div>
          <div class="match-list-center"><b>${match.score || match.time}</b><small>${match.score ? match.time : 'Today'}</small></div>
          <div class="match-list-team"><span><b>${match.away}</b><small>Away</small></span><span class="mini-crest">${match.awayCode}</span></div>
        </div>
        <div class="match-list-footer"><span>${match.status}</span><button class="pressable" data-action="open-match-card" data-match-id="${match.id}">Open →</button></div>
      </article>`).join('');
  }

  function renderPatterns() {
    const list = qs('#patternList');
    if (!list) return;
    list.innerHTML = patterns.map((pattern) => `
      <button class="pattern-card pressable" data-action="open-pattern" data-pattern="${pattern.title}">
        <span class="pattern-icon">${pattern.icon}</span>
        <span><b>${pattern.title}</b><small>${pattern.text}</small></span>
        <i>${pattern.evidence}</i>
      </button>`).join('');
  }

  function renderDecisions() {
    const list = qs('#decisionList');
    if (!list) return;
    const thesisDecision = state.thesis ? [{ match: 'Manchester City — Real Madrid', score: 'LOCK', date: 'Today', lesson: state.thesis.reason || 'Thesis зафиксирован и ждёт Decision Replay.' }] : [];
    list.innerHTML = [...thesisDecision, ...state.decisions].map((decision) => `
      <button class="decision-card pressable" data-action="open-decision" data-match="${escapeHtml(decision.match)}">
        <div><b>${decision.match}</b><small>${decision.date}</small><small>${escapeHtml(decision.lesson)}</small></div>
        <span>${decision.score}</span>
      </button>`).join('');
  }

  function openModal({ title, kicker = 'NOVIQ', html }) {
    modalTitle.textContent = title;
    modalKicker.textContent = kicker;
    modalContent.innerHTML = html;
    modalLayer.classList.add('open');
    modalLayer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => qs('button, input, textarea, select', modalContent)?.focus({ preventScroll: true }), 330);
  }

  function closeModal() {
    modalLayer.classList.remove('open');
    modalLayer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showToast(message) {
    const toast = qs('#toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    if (navigator.vibrate) navigator.vibrate(10);
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveState();
    applyState();
    showToast(state.theme === 'dark' ? 'Dark Elite активирован' : 'Light Elite активирован');
  }

  function openThesis() {
    const existing = state.thesis || { outcome: 'mci', scenario: '', reason: '', risk: '', changeMind: '', confidence: 68 };
    openModal({
      kicker: 'UNIQUE INTELLIGENCE LOOP',
      title: state.thesis?.locked ? 'Thesis зафиксирован' : 'Match Thesis',
      html: state.thesis?.locked ? lockedThesisHtml(existing) : thesisFormHtml(existing)
    });
    if (!state.thesis?.locked) bindThesisForm(existing);
  }

  function thesisFormHtml(thesis) {
    return `
      <p class="modal-copy">Зафиксируй не только результат, а свою футбольную гипотезу: сценарий, аргументы, риск и уровень уверенности.</p>
      <div class="form-group"><label>Ожидаемый исход <small>обязательно</small></label><div class="option-grid" id="outcomeOptions">
        <button class="option-button pressable ${thesis.outcome === 'mci' ? 'selected' : ''}" data-outcome="mci">Man City</button>
        <button class="option-button pressable ${thesis.outcome === 'draw' ? 'selected' : ''}" data-outcome="draw">Ничья</button>
        <button class="option-button pressable ${thesis.outcome === 'rma' ? 'selected' : ''}" data-outcome="rma">Real Madrid</button>
      </div></div>
      <div class="form-group"><label for="thesisScenario">Сценарий матча <small>что будет происходить</small></label><textarea class="textarea" id="thesisScenario" placeholder="Например: City контролирует территорию, Madrid ищет быстрые переходы...">${escapeHtml(thesis.scenario)}</textarea></div>
      <div class="form-group"><label for="thesisReason">Ключевая причина <small>почему</small></label><textarea class="textarea" id="thesisReason" placeholder="Свяжи прогноз с тактикой, контекстом или данными...">${escapeHtml(thesis.reason)}</textarea></div>
      <div class="form-group"><label for="thesisRisk">Главный риск <small>что разрушит гипотезу</small></label><input class="input" id="thesisRisk" value="${escapeHtml(thesis.risk)}" placeholder="Ранний гол, состав, усталость, стандарты..." /></div>
      <div class="form-group"><label for="changeMind">Что изменит твоё мнение? <small>защита от bias</small></label><input class="input" id="changeMind" value="${escapeHtml(thesis.changeMind)}" placeholder="Факт или событие, после которого ты пересмотришь прогноз" /></div>
      <div class="form-group"><label>Уверенность <small>не точность, а честная вероятность</small></label><div class="range-wrap"><input id="confidenceRange" type="range" min="40" max="95" value="${thesis.confidence}" /><span class="confidence-value" id="confidenceValue">${thesis.confidence}%</span></div></div>
      <div class="modal-actions"><button class="secondary-button pressable" data-action="save-thesis-draft">Сохранить черновик</button><button class="primary-button pressable" data-action="review-thesis">AI Review →</button></div>`;
  }

  function bindThesisForm(thesis) {
    let selectedOutcome = thesis.outcome;
    qsa('[data-outcome]', modalContent).forEach((button) => button.addEventListener('click', () => {
      selectedOutcome = button.dataset.outcome;
      qsa('[data-outcome]', modalContent).forEach((item) => item.classList.toggle('selected', item === button));
    }));
    qs('#confidenceRange', modalContent).addEventListener('input', (event) => { qs('#confidenceValue', modalContent).textContent = `${event.target.value}%`; });
    modalContent.dataset.selectedOutcome = selectedOutcome;
    modalContent.addEventListener('click', (event) => {
      const outcomeButton = event.target.closest('[data-outcome]');
      if (outcomeButton) modalContent.dataset.selectedOutcome = outcomeButton.dataset.outcome;
    });
  }

  function collectThesis() {
    return {
      outcome: modalContent.dataset.selectedOutcome || 'mci',
      scenario: qs('#thesisScenario', modalContent)?.value.trim() || '',
      reason: qs('#thesisReason', modalContent)?.value.trim() || '',
      risk: qs('#thesisRisk', modalContent)?.value.trim() || '',
      changeMind: qs('#changeMind', modalContent)?.value.trim() || '',
      confidence: Number(qs('#confidenceRange', modalContent)?.value || 68),
      updatedAt: new Date().toISOString(),
      locked: false
    };
  }

  function saveThesisDraft() {
    state.thesis = collectThesis();
    saveState();
    renderDecisions();
    showToast('Черновик Thesis сохранён');
  }

  function reviewThesis() {
    const thesis = collectThesis();
    const missing = [];
    if (thesis.scenario.length < 18) missing.push('сценарий');
    if (thesis.reason.length < 20) missing.push('ключевую причину');
    if (thesis.risk.length < 8) missing.push('риск');
    if (missing.length) {
      showToast(`Добавь: ${missing.join(', ')}`);
      return;
    }
    state.thesis = thesis;
    saveState();
    const specificity = Math.min(94, 58 + Math.round((thesis.scenario.length + thesis.reason.length) / 10));
    const calibration = thesis.confidence > 78 ? 'Уверенность выглядит завышенной для равного матча.' : thesis.confidence < 55 ? 'Ты осторожен. Проверь, не недооцениваешь ли силу аргументов.' : 'Уровень уверенности выглядит реалистично.';
    modalTitle.textContent = 'AI Thesis Review';
    modalKicker.textContent = 'BEFORE THE MATCH';
    modalContent.innerHTML = `
      <div class="review-card success"><h3>Сильная сторона · ${specificity}/100</h3><p>Ты связал ожидаемый сценарий с конкретной причиной, а не ограничился выбором победителя.</p></div>
      <div class="review-card warning"><h3>Blind spot</h3><p>${thesis.risk ? `Ты назвал риск: «${escapeHtml(thesis.risk)}». Добавь, как он изменит структуру матча.` : 'Главный риск пока не сформулирован.'}</p></div>
      <div class="review-card purple"><h3>Confidence Check · ${thesis.confidence}%</h3><p>${calibration}</p></div>
      <div class="info-card"><h3>Alternative Scenario</h3><p>Madrid переживает первые 25 минут без гола, затем провоцирует потери в полуфлангах и переводит матч в переходный режим.</p></div>
      <div class="info-card"><h3>Вопрос NOVIQ</h3><p>Какой один факт после публикации составов заставит тебя снизить или повысить уверенность?</p></div>
      <div class="modal-actions"><button class="secondary-button pressable" data-action="edit-thesis">Улучшить Thesis</button><button class="primary-button pressable" data-action="lock-thesis">Зафиксировать →</button></div>`;
  }

  function lockedThesisHtml(thesis) {
    const outcomeLabel = thesis.outcome === 'mci' ? 'Manchester City' : thesis.outcome === 'rma' ? 'Real Madrid' : 'Ничья';
    return `
      <div class="review-card success"><h3>Decision timestamp сохранён</h3><p>${new Date(thesis.lockedAt || thesis.updatedAt).toLocaleString()}</p></div>
      <div class="info-card"><h3>Исход · ${outcomeLabel} · ${thesis.confidence}%</h3><p>${escapeHtml(thesis.scenario)}</p></div>
      <div class="info-card"><h3>Почему</h3><p>${escapeHtml(thesis.reason)}</p></div>
      <div class="info-card"><h3>Риск</h3><p>${escapeHtml(thesis.risk)}</p></div>
      <div class="modal-actions one"><button class="primary-button pressable" data-action="open-demo-replay">Открыть demo Decision Replay</button></div>`;
  }

  function lockThesis() {
    state.thesis = { ...state.thesis, locked: true, lockedAt: new Date().toISOString() };
    state.sportsIQ += 8;
    saveState();
    applyState();
    modalTitle.textContent = 'Thesis зафиксирован';
    modalKicker.textContent = 'DECISION LOCK';
    modalContent.innerHTML = lockedThesisHtml(state.thesis);
    showToast('Thesis зафиксирован. Скрытое редактирование отключено.');
  }

  function openReplay() {
    openModal({
      kicker: 'DECISION REPLAY',
      title: 'Inter 2–1 Bayern',
      html: `
        <div class="replay-hero"><span>OVERALL DECISION SCORE</span><strong>82</strong><p>Ты не угадал точный счёт, но правильно определил характер матча и главный тактический конфликт.</p></div>
        <div class="score-breakdown">
          ${scoreRow('Thesis Quality', 88)}${scoreRow('Tactical IQ', 91)}${scoreRow('Context IQ', 76)}${scoreRow('Risk Management', 72)}${scoreRow('Calibration', 69)}
        </div>
        <div class="replay-card"><h3>Что подтвердилось</h3><p>Inter действительно вынудил Bayern атаковать через широкие зоны и получил пространство для вертикальных выходов.</p></div>
        <div class="replay-card"><h3>Что ты пропустил</h3><p>Ты недооценил влияние стандартов и поставил 81% уверенности там, где разумный диапазон был ближе к 65–70%.</p></div>
        <div class="review-card success"><h3>Sports Memory обновлена</h3><p>Новый паттерн: сильное тактическое чтение, но завышенная уверенность в равных матчах плей-офф.</p></div>
        <div class="modal-actions one"><button class="primary-button pressable" data-action="complete-replay">Сохранить урок и получить +24 IQ</button></div>`
    });
  }

  function completeReplay() {
    if (!state.decisions.some((d) => d.match === 'Inter — Bayern' && d.completedNow)) {
      state.sportsIQ += 24;
      state.decisions.unshift({ match: 'Inter — Bayern', score: 82, date: 'Today', lesson: 'Урок сохранён: снизить уверенность в равных матчах плей-офф.', completedNow: true });
      saveState();
      applyState();
    }
    closeModal();
    showToast('+24 Sports IQ · урок сохранён');
  }

  function scoreRow(label, score) {
    return `<div class="score-row"><span>${label}</span><i><b style="width:${score}%"></b></i><b>${score}</b></div>`;
  }

  function openDiagnostic() {
    diagnosticStep = 0;
    diagnosticAnswers = [];
    openModal({ kicker: 'STARTING ASSESSMENT', title: 'Sports IQ Diagnostic', html: diagnosticHtml() });
    renderDiagnosticQuestion();
  }

  const diagnosticQuestions = [
    { question: 'Команда владеет мячом 68%, но почти не входит в штрафную. Какой вывод сильнее?', options: ['Она полностью контролирует матч', 'Владение без продвижения ещё не означает контроль', 'Соперник точно устал'], correct: 1, skill: 'Tactical' },
    { question: 'Фаворит играет третий матч за семь дней. Как использовать этот факт?', options: ['Автоматически прогнозировать поражение', 'Учесть как риск вместе с ротацией и стилем', 'Игнорировать: сильные всегда справляются'], correct: 1, skill: 'Context' },
    { question: 'xG команды вырос из-за одного пенальти. Что делать?', options: ['Считать это доказательством доминирования', 'Отделить пенальти и посмотреть качество остальных моментов', 'Не использовать xG вообще'], correct: 1, skill: 'Data' },
    { question: 'Ты уверен в прогнозе на 80%, но ключевой состав ещё неизвестен.', options: ['Оставить 80%', 'Повысить до 90%', 'Снизить уверенность из-за неизвестности'], correct: 2, skill: 'Decision' },
    { question: 'Прогноз оказался верным, но аргументы не подтвердились.', options: ['Решение было отличным', 'Результат верный, логика требует пересмотра', 'Раз результат верный — анализ не нужен'], correct: 1, skill: 'Learning' }
  ];

  function diagnosticHtml() {
    return `<p class="modal-copy">Пять ситуаций измерят не знания фактов, а качество твоих решений.</p><div class="diagnostic-progress" id="diagnosticProgress"></div><div id="diagnosticQuestion"></div>`;
  }

  function renderDiagnosticQuestion() {
    const progress = qs('#diagnosticProgress', modalContent);
    progress.innerHTML = diagnosticQuestions.map((_, index) => `<i class="${index < diagnosticStep ? 'done' : ''}"></i>`).join('');
    const question = diagnosticQuestions[diagnosticStep];
    qs('#diagnosticQuestion', modalContent).innerHTML = `
      <span class="badge badge-purple">${question.skill} IQ · ${diagnosticStep + 1}/${diagnosticQuestions.length}</span>
      <h3 style="font-size:18px;line-height:1.35;margin:14px 0">${question.question}</h3>
      ${question.options.map((option, index) => `<button class="quiz-option pressable" data-action="answer-diagnostic" data-answer="${index}">${option}</button>`).join('')}`;
  }

  function answerDiagnostic(answerIndex) {
    const question = diagnosticQuestions[diagnosticStep];
    diagnosticAnswers.push(answerIndex === question.correct);
    diagnosticStep += 1;
    if (diagnosticStep < diagnosticQuestions.length) {
      renderDiagnosticQuestion();
      return;
    }
    const correct = diagnosticAnswers.filter(Boolean).length;
    const newIQ = 6900 + correct * 360 + Math.round(Math.random() * 90);
    state.sportsIQ = Math.max(state.sportsIQ, newIQ);
    state.diagnosticCompleted = true;
    saveState();
    applyState();
    modalTitle.textContent = 'Твой стартовый профиль';
    modalKicker.textContent = 'DIAGNOSTIC COMPLETE';
    modalContent.innerHTML = `
      <div class="replay-hero"><span>SPORTS IQ</span><strong>${formatNumber(state.sportsIQ)}</strong><p>${correct}/5 сильных решений. Лучший сигнал — понимание разницы между результатом и качеством логики.</p></div>
      <div class="review-card success"><h3>Сильная сторона</h3><p>Tactical reasoning: ты не путаешь владение с реальным контролем.</p></div>
      <div class="review-card warning"><h3>Первая зона развития</h3><p>Confidence calibration: чаще снижай уверенность, когда важные данные ещё неизвестны.</p></div>
      <div class="modal-actions one"><button class="primary-button pressable" data-action="close-modal">Перейти в NOVIQ</button></div>`;
  }

  function openAICore() {
    openModal({
      kicker: 'AI CORE',
      title: 'Спроси NOVIQ',
      html: `
        <div class="ai-orb-large"><b>✦</b></div>
        <p class="modal-copy" style="text-align:center">AI не заменяет твоё решение. Он находит пробелы, альтернативные сценарии и повторяющиеся ошибки.</p>
        <div class="ai-suggestions">
          <button class="ai-suggestion pressable" data-action="use-ai-suggestion">Где слабое место Madrid?</button>
          <button class="ai-suggestion pressable" data-action="use-ai-suggestion">Проверь мою уверенность</button>
          <button class="ai-suggestion pressable" data-action="use-ai-suggestion">Покажи старую похожую ошибку</button>
        </div>
        <textarea class="textarea" id="aiQuestion" placeholder="Спроси о тактике, рисках, данных или своей Sports Memory..."></textarea>
        <div class="modal-actions one"><button class="primary-button pressable" data-action="ask-ai">Анализировать →</button></div>
        <div id="aiAnswer"></div>`
    });
  }

  function askAI() {
    const input = qs('#aiQuestion', modalContent);
    const question = input.value.trim();
    if (question.length < 4) { showToast('Сформулируй вопрос подробнее'); return; }
    const answer = qs('#aiAnswer', modalContent);
    answer.innerHTML = `<div class="review-card purple" style="margin-top:12px"><h3>NOVIQ is analyzing…</h3><p>Сопоставляю вопрос с AI Briefing и твоей Sports Memory.</p></div>`;
    setTimeout(() => {
      answer.innerHTML = `<div class="review-card success" style="margin-top:12px"><h3>NOVIQ AI</h3><p>Ключевой риск — не само владение City, а качество первой передачи после отбора Madrid. Твоя история показывает, что ты иногда переоцениваешь стартовый состав и недооцениваешь календарную нагрузку. Проверь оба фактора до фиксации Thesis.</p></div><div class="info-card"><h3>Что наблюдать</h3><p>Позицию крайних защитников City, расстояние между линиями после потери и готовность Madrid атаковать свободный полуфланг.</p></div>`;
    }, 650);
  }

  function openLanguage() {
    openModal({
      kicker: 'LOCALIZATION',
      title: 'Язык приложения',
      html: `<p class="modal-copy">Язык меняется сразу и не требует выхода из приложения.</p><div class="language-grid">
        ${languageOption('ru', 'Русский', 'Russian')}${languageOption('ua', 'Українська', 'Ukrainian')}${languageOption('en', 'English', 'English')}
      </div>`
    });
  }

  function languageOption(code, label, sub) {
    return `<button class="language-option pressable ${state.language === code ? 'selected' : ''}" data-action="set-language" data-language="${code}"><span><b>${label}</b><small>${sub}</small></span><i>${state.language === code ? '✓' : '›'}</i></button>`;
  }

  function setLanguage(language) {
    state.language = language;
    saveState();
    applyState();
    openLanguage();
    showToast(language === 'ru' ? 'Язык: Русский' : language === 'ua' ? 'Мова: Українська' : 'Language: English');
  }

  function openNotificationsSettings() {
    openModal({
      kicker: 'NOTIFICATION INTELLIGENCE',
      title: 'Умные уведомления',
      html: `<p class="modal-copy">NOVIQ не отправляет шум. Только события, влияющие на твой анализ.</p>
        ${notificationToggle('briefings', 'AI Briefing готов', 'Перед выбранными матчами')}
        ${notificationToggle('lineups', 'Опубликованы составы', 'Только когда это влияет на Thesis')}
        ${notificationToggle('replay', 'Decision Replay доступен', 'После завершения матча')}
        ${notificationToggle('weekly', 'Weekly Intelligence', 'Один отчёт в неделю')}`
    });
  }

  function notificationToggle(key, title, text) {
    const enabled = state.notifications[key];
    return `<div class="toggle-row"><span class="toggle-copy"><b>${title}</b><small>${text}</small></span><button class="switch pressable ${enabled ? 'on' : ''}" data-action="toggle-notification" data-key="${key}" aria-pressed="${enabled}"><i></i></button></div>`;
  }

  function toggleNotification(key) {
    state.notifications[key] = !state.notifications[key];
    saveState();
    openNotificationsSettings();
  }

  function openSimple(title, kicker, body, actionLabel = 'Готово', action = 'close-modal') {
    openModal({ kicker, title, html: `${body}<div class="modal-actions one"><button class="primary-button pressable" data-action="${action}">${actionLabel}</button></div>` });
  }

  function openMatchById(id) {
    const match = matches.find((item) => item.id === id) || matches[0];
    if (match.group.includes('replay')) { openReplay(); return; }
    if (match.group.includes('live')) {
      openSimple(`${match.home} ${match.score} ${match.away}`, 'LIVE INTELLIGENCE', `<div class="review-card purple"><h3>Твоя Thesis: активна</h3><p>Основной сценарий держится на 68%. События матча пока не разрушили ключевое предположение.</p></div><div class="info-card"><h3>Изменившийся фактор</h3><p>Левый фланг ${match.away} создаёт больше продвижений, чем ожидалось. Следи за следующими 10 минутами.</p></div>`, 'Продолжить наблюдение');
      return;
    }
    if (id === 'mci-rma') { openThesis(); return; }
    openSimple(`${match.home} — ${match.away}`, match.tournament.toUpperCase(), `<div class="info-card"><h3>Почему матч выбран</h3><p>Он подходит для развития твоего слабого навыка: оценки риска в равных матчах.</p></div><div class="review-card purple"><h3>AI Briefing</h3><p>Ожидается борьба за пространство между линиями. Ключевой неизвестный фактор — стартовая структура без мяча.</p></div>`, 'Создать Thesis', 'open-thesis');
  }

  function exportData() {
    const data = JSON.stringify({ exportedAt: new Date().toISOString(), version: '1.0', state }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'noviq-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Экспорт NOVIQ подготовлен');
  }

  function resetDemo() {
    openModal({
      kicker: 'DATA CONTROL',
      title: 'Сбросить локальный прогресс?',
      html: `<p class="modal-copy">Будут удалены Thesis, диагностический результат и локальная Sports Memory этого демо.</p><div class="modal-actions"><button class="secondary-button pressable" data-action="close-modal">Отмена</button><button class="primary-button pressable" data-action="confirm-reset">Сбросить</button></div>`
    });
  }

  function confirmReset() {
    state = structuredClone(defaultState);
    saveState();
    applyState();
    closeModal();
    navigate('home');
    showToast('Демо сброшено');
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function handleAction(action, target) {
    const actions = {
      'close-modal': closeModal,
      'toggle-theme': toggleTheme,
      'open-thesis': openThesis,
      'save-thesis-draft': saveThesisDraft,
      'review-thesis': reviewThesis,
      'edit-thesis': openThesis,
      'lock-thesis': lockThesis,
      'open-demo-replay': openReplay,
      'open-replay': openReplay,
      'complete-replay': completeReplay,
      'open-diagnostic': openDiagnostic,
      'open-ai-core': openAICore,
      'ask-ai': askAI,
      'open-language': openLanguage,
      'open-notification-settings': openNotificationsSettings,
      'export-data': exportData,
      'reset-demo': resetDemo,
      'confirm-reset': confirmReset,
      'open-matches': () => navigate('matches'),
      'open-profile': () => navigate('profile'),
      'refresh-briefing': () => showToast('AI Briefing обновлён: новых критических факторов нет'),
      'open-match-detail': () => openSimple('Полный AI Briefing', 'MANCHESTER CITY — REAL MADRID', `<div class="info-card"><h3>Confirmed facts</h3><p>Матч демонстрационный. В production здесь будут свежие составы, травмы, форма и источник каждого факта.</p></div><div class="review-card purple"><h3>Main scenario</h3><p>City стремится закрепиться высоко, Madrid будет искать быстрые вертикальные выходы после отбора.</p></div><div class="review-card warning"><h3>Unknowns</h3><p>Стартовые составы и реальная готовность ключевых игроков пока не подтверждены.</p></div>`),
      'open-insight': () => openSimple(target.dataset.insight === 'risk' ? 'Скрытый риск' : 'Главный сценарий', 'AI BRIEFING', target.dataset.insight === 'risk' ? `<div class="review-card warning"><h3>Риск</h3><p>Потеря в центральной зоне при высоком расположении крайних защитников открывает Madrid прямой путь к воротам.</p></div>` : `<div class="review-card purple"><h3>Сценарий</h3><p>City контролирует территорию и заставляет Madrid защищаться ниже, но качество контроля зависит от защиты после потери.</p></div>`),
      'open-live-match': () => openMatchById('ars-bar'),
      'open-command-center': () => openSimple('World Cup Command Center', 'WORLD CUP 2026', `<div class="review-card purple"><h3>Турнирная память</h3><p>NOVIQ будет сравнивать твои решения по этапам турнира, сборным и типам матчей.</p></div><div class="info-card"><h3>Личный турнирный режим</h3><p>Briefing → Thesis → Replay → World Cup Wrapped для каждого важного матча.</p></div>`),
      'open-twin': () => openSimple('Sports Twin', 'YOUR THINKING MODEL', `<div class="review-card purple"><h3>Predicted blind spot</h3><p>Перед следующим матчем ты, вероятно, снова повысишь уверенность после публикации сильного состава. NOVIQ напомнит проверить нагрузку и структуру без мяча.</p></div><div class="info-card"><h3>Evidence</h3><p>6 решений, 4 повторения паттерна, среднее влияние на уверенность +11%.</p></div>`),
      'start-mission': () => { openThesis(); showToast('Миссия активна: укажи, что изменит твоё мнение'); },
      'open-memory': () => navigate('insights'),
      'open-geo': () => openSimple('Geo Intelligence', 'ZHYTOMYR', `<div class="info-card"><h3>Privacy first</h3><p>Геолокация не включена автоматически. В реальной версии NOVIQ запросит отдельное согласие и объяснит пользу.</p></div><div class="review-card success"><h3>Рядом на этой неделе</h3><p>Демо: 3 матча, 2 локальных сообщества и одна встреча для совместного анализа.</p></div>`),
      'open-community': () => openSimple('Friends Intelligence', 'COMMUNITY PULSE', `<div class="info-card"><h3>Репутация вместо лайков</h3><p>Профили сравниваются по качеству Thesis, калибровке и подтверждённым навыкам.</p></div><div class="review-card purple"><h3>Anti-copy rule</h3><p>Чужая гипотеза открывается только после фиксации собственной.</p></div>`),
      'open-friend': () => openSimple(target.dataset.friend, 'INTELLIGENCE PROFILE', `<div class="review-card success"><h3>Verified strength</h3><p>Сильная экспертиза в Tactical IQ и матчах Лиги чемпионов.</p></div><div class="info-card"><h3>Compare</h3><p>Ты сильнее в Context IQ. ${target.dataset.friend} стабильнее калибрует уверенность.</p></div>`, 'Предложить Thesis Battle', 'start-battle'),
      'start-battle': () => openSimple('Thesis Battle', 'FRIENDS INTELLIGENCE', `<div class="info-card"><h3>Независимый анализ</h3><p>Оба участника сначала фиксируют собственные Thesis. Затем система открывает аргументы и после матча оценивает качество решений.</p></div>`,'Выбрать матч'),
      'open-lesson': () => openSimple('Контроль мяча ≠ контроль матча', 'MICRO LESSON · 4 MIN', `<div class="info-card"><h3>1. Продвижение</h3><p>Владение важно, только если команда регулярно продвигает мяч в опасные зоны.</p></div><div class="info-card"><h3>2. Защита после потери</h3><p>Команда может владеть мячом и одновременно оставаться уязвимой в переходах.</p></div><div class="review-card success"><h3>Проверочный вопрос</h3><p>Какая команда контролирует сценарий, если соперник добровольно отдаёт мяч, но создаёт лучшие моменты?</p></div>`),
      'open-scenario-lab': () => openSimple('Scenario Lab', 'TRAINING MODE', `<div class="info-card"><h3>62′ · красная карточка</h3><p>Команда ведёт 1–0, но остаётся в меньшинстве. Выбери: низкий блок, сохранение прессинга или гибридная структура.</p></div><div class="review-card purple"><h3>Твоя задача</h3><p>Выбери решение, назови главный риск и укажи уверенность.</p></div>`,'Начать тренировку', 'start-scenario-training'),
      'start-scenario-training': () => openSimple('Твоё решение', 'SCENARIO LAB · STEP 1', `<div class="form-group"><label>Выбери структуру</label><div class="option-grid"><button class="option-button selected">Низкий блок</button><button class="option-button">Гибрид</button><button class="option-button">Прессинг</button></div></div><div class="form-group"><label>Главный риск</label><textarea class="textarea" placeholder="Что может разрушить решение?"></textarea></div>`, 'Зафиксировать тренировку'),
      'open-wrapped': () => openSimple('Weekly Intelligence', 'WEEK 31', `<div class="replay-hero"><span>SPORTS IQ CHANGE</span><strong>+64</strong><p>7 Thesis, 5 Decision Replay и одна исправленная повторяющаяся ошибка.</p></div><div class="review-card success"><h3>Лучший рост</h3><p>Tactical IQ +9% благодаря более конкретным сценариям.</p></div><div class="review-card warning"><h3>Фокус недели</h3><p>Не повышай уверенность только из-за имени клуба или сильного состава.</p></div>`),
      'open-notifications': openNotificationsSettings,
      'share-profile': () => navigator.share ? navigator.share({ title: 'NOVIQ Sports IQ', text: `My NOVIQ Sports IQ: ${state.sportsIQ}` }).catch(() => {}) : showToast('Ссылка на профиль скопирована'),
      'toggle-match-filter': () => showToast('Фильтры: турнир, команда, сложность и тип навыка'),
      'open-pattern': () => openSimple(target.dataset.pattern, 'SPORTS MEMORY EVIDENCE', `<div class="info-card"><h3>Почему NOVIQ так считает</h3><p>Вывод построен на нескольких решениях. В production пользователь увидит каждый связанный матч и сможет оспорить паттерн.</p></div>`),
      'open-decision': () => openReplay(),
      'open-match-card': () => openMatchById(target.dataset.matchId),
      'answer-diagnostic': () => answerDiagnostic(Number(target.dataset.answer)),
      'use-ai-suggestion': () => { qs('#aiQuestion', modalContent).value = target.textContent.trim(); qs('#aiQuestion', modalContent).focus(); },
      'set-language': () => setLanguage(target.dataset.language),
      'toggle-notification': () => toggleNotification(target.dataset.key),
      'install-app': installApp,
      'dismiss-install': dismissInstall
    };
    actions[action]?.();
  }

  document.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-nav]');
    if (nav) { navigate(nav.dataset.nav); return; }
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      activeFilter = filter.dataset.filter;
      qsa('[data-filter]').forEach((item) => item.classList.toggle('active', item === filter));
      renderMatches();
      return;
    }
    const actionTarget = event.target.closest('[data-action]');
    if (actionTarget) handleAction(actionTarget.dataset.action, actionTarget);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalLayer.classList.contains('open')) closeModal();
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (!state.installedPromptSeen) qs('#installBanner').hidden = false;
  });

  async function installApp() {
    if (!deferredInstallPrompt) { showToast('На iPhone: Поделиться → На экран «Домой»'); return; }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    qs('#installBanner').hidden = true;
  }

  function dismissInstall() {
    state.installedPromptSeen = true;
    saveState();
    qs('#installBanner').hidden = true;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  applyState();
})();
