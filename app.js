(() => {
  'use strict';

  const STORAGE_KEY = 'noviq-v1.1-state';
  const LEGACY_KEY = 'noviq-v1-state';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clone = (v) => JSON.parse(JSON.stringify(v));

  const defaultState = {
    version: '1.1', language: 'ru', theme: 'dark', sportsIQ: 8542,
    skills: { tactical: 0.89, context: 0.74, data: 0.78, decision: 0.81, learning: 0.86 },
    skillTrust: { tactical: 82, context: 69, data: 72, decision: 77, learning: 80 },
    diagnostic: { completed: false, level: 'adaptive', answers: [], lastAt: null },
    thesis: null,
    calibration: {
      score: 72,
      bins: [
        { label: '50–59%', predicted: 55, actual: 58 },
        { label: '60–69%', predicted: 65, actual: 67 },
        { label: '70–79%', predicted: 75, actual: 69 },
        { label: '80–89%', predicted: 85, actual: 68 }
      ],
      history: [65, 66, 68, 67, 70, 71, 72]
    },
    mission: { id: 'alternative', title: 'Назови альтернативный сценарий', copy: 'Добавь его в следующий Thesis, чтобы усилить Decision IQ.', progress: 0, target: 1, completed: false },
    patterns: [
      { id: 'lineup-bias', icon: '△', title: 'Lineup Bias', summary: 'Сильный состав повышает твою уверенность сильнее, чем подтверждают контекст и нагрузка.', severity: 'medium', evidence: ['MCI—RMA · +12%', 'PSG—LIV · +9%', 'INT—BAY · +11%'], skill: 'Decision IQ' },
      { id: 'transition-reader', icon: '◎', title: 'Transition Reader', summary: 'Ты стабильно замечаешь риск быстрых переходов раньше среднего.', severity: 'strength', evidence: ['ARS—BAR · confirmed', 'INT—BAY · confirmed', 'POL—DKY · confirmed'], skill: 'Tactical IQ' },
      { id: 'playoff-uncertainty', icon: '◇', title: 'Playoff Uncertainty', summary: 'В плей-офф твоя калибровка хуже на 8 пунктов.', severity: 'medium', evidence: ['9 матчей', '81% → 66% actual', '3 повторения'], skill: 'Context IQ' }
    ],
    decisions: [
      { id: 'int-bay', match: 'Inter — Bayern', score: 82, date: '29 Jul', lesson: 'Сценарий был сильным, уверенность завышена.', completed: false },
      { id: 'psg-liv', match: 'PSG — Liverpool', score: 76, date: '26 Jul', lesson: 'Хорошо учтён контекст, пропущен риск стандартов.', completed: true },
      { id: 'ars-bar', match: 'Arsenal — Barcelona', score: 88, date: '22 Jul', lesson: 'Лучший тактический разбор месяца.', completed: true }
    ],
    lessonsCompleted: [], completedLoops: 12,
    notifications: { briefings: true, lineups: true, replay: true, weekly: true, patterns: true },
    installDismissed: false
  };

  const translations = {
    ru: { personalIntelligence:'PERSONAL INTELLIGENCE',adaptiveActive:'Adaptive model active',hello:'Привет, Богдан',heroSubtitle:'Твоя модель футбольного мышления обновляется после каждого решения.',reassess:'Диагностика',currentLoop:'Твой текущий цикл',howItWorks:'Как работает',calibrationTitle:'Точность твоей уверенности',calibrationCopy:'Ты точен в диапазоне 60–70%, но переуверен выше 80%.',memorySignals:'Сигналы из твоей истории',openAll:'Открыть всё',replayReady:'Готов новый разбор',nextLesson:'Следующий персональный урок',matches:'Матчи',matchesSubtitle:'Выбирай матчи не по шуму, а по аналитической ценности.',intelligence:'Интеллект',intelligenceSubtitle:'Навыки, калибровка, паттерны и доказательства прогресса.',progressDashboard:'Progress Dashboard',activePatterns:'Активные паттерны',recentDecisions:'Последние решения',profile:'Профиль',profileTagline:'Строю доказанную футбольную экспертизу, а не коллекцию случайных прогнозов.',personalization:'Персонализация',language:'Язык',appearance:'Оформление',notifications:'Уведомления',smartOnly:'Только значимые',accountData:'Аккаунт и данные',exportData:'Экспорт данных',exportText:'Thesis, Replay и Sports Memory',resetDemo:'Сбросить демо',resetText:'Удалить локальный прогресс',home:'Главная',installNoviq:'Установить NOVIQ',installCopy:'Открывай как отдельное приложение',install:'Установить'},
    ua: { personalIntelligence:'PERSONAL INTELLIGENCE',adaptiveActive:'Адаптивна модель активна',hello:'Привіт, Богдане',heroSubtitle:'Твоя модель футбольного мислення оновлюється після кожного рішення.',reassess:'Діагностика',currentLoop:'Твій поточний цикл',howItWorks:'Як працює',calibrationTitle:'Точність твоєї впевненості',calibrationCopy:'Ти точний у діапазоні 60–70%, але надто впевнений вище 80%.',memorySignals:'Сигнали з твоєї історії',openAll:'Відкрити все',replayReady:'Готовий новий розбір',nextLesson:'Наступний персональний урок',matches:'Матчі',matchesSubtitle:'Обирай матчі не за шумом, а за аналітичною цінністю.',intelligence:'Інтелект',intelligenceSubtitle:'Навички, калібрування, патерни й докази прогресу.',progressDashboard:'Панель прогресу',activePatterns:'Активні патерни',recentDecisions:'Останні рішення',profile:'Профіль',profileTagline:'Будую доведену футбольну експертизу, а не колекцію випадкових прогнозів.',personalization:'Персоналізація',language:'Мова',appearance:'Оформлення',notifications:'Сповіщення',smartOnly:'Лише важливі',accountData:'Акаунт і дані',exportData:'Експорт даних',exportText:'Thesis, Replay і Sports Memory',resetDemo:'Скинути демо',resetText:'Видалити локальний прогрес',home:'Головна',installNoviq:'Встановити NOVIQ',installCopy:'Відкривай як окремий застосунок',install:'Встановити'},
    en: { personalIntelligence:'PERSONAL INTELLIGENCE',adaptiveActive:'Adaptive model active',hello:'Hello, Bohdan',heroSubtitle:'Your football thinking model updates after every decision.',reassess:'Assessment',currentLoop:'Your current loop',howItWorks:'How it works',calibrationTitle:'Your confidence accuracy',calibrationCopy:'You are calibrated at 60–70%, but overconfident above 80%.',memorySignals:'Signals from your history',openAll:'Open all',replayReady:'New review ready',nextLesson:'Your next personal lesson',matches:'Matches',matchesSubtitle:'Choose matches by analytical value, not noise.',intelligence:'Intelligence',intelligenceSubtitle:'Skills, calibration, patterns and evidence of progress.',progressDashboard:'Progress Dashboard',activePatterns:'Active patterns',recentDecisions:'Recent decisions',profile:'Profile',profileTagline:'Building proven football expertise, not a collection of lucky predictions.',personalization:'Personalization',language:'Language',appearance:'Appearance',notifications:'Notifications',smartOnly:'Meaningful only',accountData:'Account and data',exportData:'Export data',exportText:'Thesis, Replay and Sports Memory',resetDemo:'Reset demo',resetText:'Delete local progress',home:'Home',installNoviq:'Install NOVIQ',installCopy:'Open it like a standalone app',install:'Install'}
  };

  const matches = [
    { id:'mci-rma', group:'for-you upcoming', tournament:'Champions League', time:'21:45', home:'Manchester City', away:'Real Madrid', hc:'MCI', ac:'RMA', intelligence:94, status:'Create Thesis' },
    { id:'ars-bar', group:'for-you live', tournament:'Champions League', time:"67'", score:'1–1', home:'Arsenal', away:'Barcelona', hc:'ARS', ac:'BAR', intelligence:88, status:'Follow Live' },
    { id:'int-bay', group:'for-you replay', tournament:'Champions League', time:'FT', score:'2–1', home:'Inter', away:'Bayern', hc:'INT', ac:'BAY', intelligence:91, status:'Decision Replay' },
    { id:'psg-liv', group:'upcoming', tournament:'Club World Cup', time:'19:00', home:'PSG', away:'Liverpool', hc:'PSG', ac:'LIV', intelligence:86, status:'Open Briefing' },
    { id:'pol-dyn', group:'for-you upcoming', tournament:'Ukraine', time:'17:00', home:'Polissya', away:'Dynamo Kyiv', hc:'POL', ac:'DKY', intelligence:83, status:'Create Thesis' }
  ];

  const diagnosticBank = [
    { id:'t1',skill:'tactical',tier:1,q:'Команда владеет мячом 68%, но редко входит в штрафную. Какой вывод сильнее?',o:['Она полностью контролирует матч','Владение без продвижения ещё не означает контроль','Соперник точно устал'],c:1,why:'Владение — лишь один сигнал. Нужны продвижение, качество входов и контроль переходов.' },
    { id:'t2',skill:'tactical',tier:2,q:'Соперник защищается узким низким блоком. Какой ответ наиболее логичен?',o:['Постоянно атаковать через центр','Растянуть блок шириной и менять направление атаки','Сразу перейти на дальние удары'],c:1,why:'Ширина и быстрые переводы вынуждают компактный блок двигаться и открывать коридоры.' },
    { id:'c1',skill:'context',tier:1,q:'Фаворит играет третий матч за семь дней. Как использовать этот факт?',o:['Автоматически прогнозировать поражение','Учесть вместе с ротацией, стилем и глубиной состава','Игнорировать: сильные всегда справляются'],c:1,why:'Нагрузка — фактор риска, но не самостоятельный приговор.' },
    { id:'c2',skill:'context',tier:2,q:'Команде достаточно ничьей в ответном матче. Что меняется?',o:['Ничего, стиль всегда одинаков','Ценность риска и темп игры могут измениться','Она обязательно будет только защищаться'],c:1,why:'Турнирная ситуация меняет цену владения, риска и переходов, но не гарантирует один сценарий.' },
    { id:'d1',skill:'data',tier:1,q:'xG вырос из-за одного пенальти. Что делать?',o:['Считать доказательством доминирования','Отделить пенальти и оценить остальные моменты','Не использовать xG вообще'],c:1,why:'Агрегат нужно разложить на происхождение моментов и контекст.' },
    { id:'d2',skill:'data',tier:2,q:'Команда нанесла 18 ударов, но 14 — из-за штрафной. Как интерпретировать?',o:['18 ударов всегда означают доминирование','Объём высокий, качество и зоны требуют проверки','Такая команда точно забьёт следующей'],c:1,why:'Количество без качества и расположения может вводить в заблуждение.' },
    { id:'de1',skill:'decision',tier:1,q:'Ты уверен на 80%, но ключевой состав ещё неизвестен.',o:['Оставить 80%','Повысить до 90%','Снизить уверенность из-за неизвестности'],c:2,why:'Уверенность должна отражать неизвестные факторы, а не только силу основной гипотезы.' },
    { id:'de2',skill:'decision',tier:2,q:'Два сценария почти равны, но один тебе эмоционально приятнее.',o:['Выбрать приятный','Записать оба и снизить уверенность','Не указывать риск'],c:1,why:'Альтернативный сценарий и пониженная уверенность защищают от эмоционального bias.' },
    { id:'l1',skill:'learning',tier:1,q:'Прогноз верный, но аргументы не подтвердились.',o:['Решение было отличным','Результат верный, логика требует пересмотра','Анализ не нужен'],c:1,why:'NOVIQ разделяет удачу и качество процесса.' },
    { id:'l2',skill:'learning',tier:2,q:'Ты дважды повторил одну ошибку. Лучший следующий шаг?',o:['Игнорировать малую выборку','Сформулировать правило и проверить его в похожем матче','Снизить все прогнозы до 50%'],c:1,why:'Обучение требует конкретного правила и нового проверяемого решения.' }
  ];

  let state = loadState();
  let activeFilter = 'for-you';
  let deferredInstallPrompt = null;
  let toastTimer = null;
  let diagnosticSession = null;

  const modalLayer = $('#modalLayer');
  const modalTitle = $('#modalTitle');
  const modalKicker = $('#modalKicker');
  const modalContent = $('#modalContent');

  function loadState(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(saved) return mergeDeep(clone(defaultState), saved);
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
      if(legacy){
        const migrated = mergeDeep(clone(defaultState), { language:legacy.language, theme:legacy.theme, sportsIQ:legacy.sportsIQ, thesis:legacy.thesis, decisions:legacy.decisions, notifications:legacy.notifications });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }catch(e){ console.warn('State recovery failed', e); }
    return clone(defaultState);
  }
  function mergeDeep(target, source){
    if(!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(k=>{ if(source[k] && typeof source[k]==='object' && !Array.isArray(source[k])) target[k]=mergeDeep(target[k]||{},source[k]); else if(source[k]!==undefined) target[k]=source[k]; });
    return target;
  }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function escapeHtml(v=''){ return String(v).replace(/[&<>'"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); }
  function formatNumber(n){ return new Intl.NumberFormat(state.language==='en'?'en-US':state.language==='ua'?'uk-UA':'ru-RU').format(n); }
  function skillLabel(key){ return ({tactical:'Tactical IQ',context:'Context IQ',data:'Data IQ',decision:'Decision IQ',learning:'Learning IQ'})[key]; }

  function applyState(){
    document.documentElement.dataset.theme=state.theme;
    document.documentElement.lang=state.language==='ua'?'uk':state.language;
    $$('[data-i18n]').forEach(n=>{ const v=translations[state.language]?.[n.dataset.i18n]; if(v)n.textContent=v; });
    $('#sportsIqValue').textContent=formatNumber(state.sportsIQ);
    $('#profileIQ').textContent=formatNumber(state.sportsIQ);
    $('#profileLoops').textContent=state.completedLoops;
    $('#calibrationValue').textContent=`${state.calibration.score}%`;
    $('#profileCalibration').textContent=`${state.calibration.score}%`;
    $('#currentTheme').textContent=state.theme==='dark'?'Dark Elite':'Light Elite';
    $('#currentLanguage').textContent=state.language==='ru'?'Русский':state.language==='ua'?'Українська':'English';
    $('#missionTitle').textContent=state.mission.title;
    $('#missionCopy').textContent=state.mission.copy;
    $('#missionProgressBar').style.setProperty('--progress',`${Math.min(100,state.mission.progress/state.mission.target*100)}%`);
    $('#missionProgressText').textContent=`${state.mission.progress}/${state.mission.target} completed`;
    renderHeroSkills(); renderLoop(); renderMiniCalibration(); renderMemory(); renderMatches(); renderSkills(); renderTrend(); renderPatterns(); renderDecisions();
  }

  function renderHeroSkills(){
    $('#heroSkillList').innerHTML=Object.entries(state.skills).map(([k,v])=>`<div class="mini-skill"><span>${skillLabel(k)}</span><b>${Math.round(v*100)}</b><i style="--value:${v*100}%"></i></div>`).join('');
    const trust=Math.round(Object.values(state.skillTrust).reduce((a,b)=>a+b,0)/5);
    $('#iqConfidenceLabel').textContent=`Model confidence ${trust}%`;
    $('#nextMilestone').textContent=`${Math.max(0,8900-state.sportsIQ)} IQ до Master Analyst`;
  }
  function currentLoopStage(){
    if(!state.diagnostic.completed) return 0;
    if(!state.thesis) return 1;
    if(!state.thesis.review) return 2;
    if(!state.thesis.locked) return 3;
    const replay=state.decisions.find(d=>d.id==='int-bay');
    if(replay && !replay.completed) return 4;
    return 5;
  }
  function renderLoop(){
    const stage=currentLoopStage();
    const steps=[['◎','Diagnose'],['◫','Briefing'],['✎','Thesis'],['✦','Review'],['↺','Replay'],['◇','Learn']];
    const copy=[['Начни диагностику','Создай стартовый профиль навыков'],['Открой AI Briefing','Собери факты, сигналы и неизвестные'],['Создай Match Thesis','Зафиксируй сценарий, риск и уверенность'],['Получи AI Review','Устрани противоречия и blind spots'],['Пройди Decision Replay','Сравни гипотезу с реальным матчем'],['Закрепи урок','Sports Memory обновит следующий шаг']][stage];
    $('#loopCard').innerHTML=`<div class="loop-steps">${steps.map((s,i)=>`${i?'<i class="loop-line"></i>':''}<div class="loop-step ${i<stage?'done':i===stage?'active':''}"><span>${i<stage?'✓':s[0]}</span><small>${s[1]}</small></div>`).join('')}</div><div class="loop-card-footer"><div><b>${copy[0]}</b><small>${copy[1]}</small></div><button class="compact-button pressable" data-action="continue-loop">Продолжить →</button></div>`;
  }
  function renderMiniCalibration(){
    const vals=state.calibration.history.slice(-7); $('#miniCalibrationChart').innerHTML=vals.map(v=>`<i style="--h:${Math.max(18,(v-55)*2.5)}px"></i>`).join('');
    $('#calibrationDelta').textContent=`+${Math.max(0,vals.at(-1)-vals[0])} this month`;
  }
  function renderMemory(){
    $('#homeMemoryCards').innerHTML=state.patterns.map(p=>`<button class="memory-card pressable" data-action="open-pattern" data-pattern="${p.id}"><div class="memory-card-top"><span>${p.skill}</span><i class="badge ${p.severity==='strength'?'badge-green':'badge-purple'}">${p.severity==='strength'?'STRENGTH':'WATCH'}</i></div><h3>${p.title}</h3><p>${p.summary}</p><div class="evidence-row">${p.evidence.slice(0,3).map(e=>`<i>${escapeHtml(e)}</i>`).join('')}</div></button>`).join('');
  }
  function renderMatches(){
    const list=$('#matchList'); if(!list)return;
    list.innerHTML=matches.filter(m=>m.group.includes(activeFilter)).map(m=>`<article class="match-list-card pressable" data-action="open-match-card" data-match-id="${m.id}"><div class="match-list-top"><span>${m.tournament}</span><span>Intelligence ${m.intelligence}</span></div><div class="match-list-teams"><div class="match-list-team"><span class="mini-crest">${m.hc}</span><span><b>${m.home}</b><small>Home</small></span></div><div class="match-list-center"><b>${m.score||m.time}</b><small>${m.score?m.time:'Today'}</small></div><div class="match-list-team"><span><b>${m.away}</b><small>Away</small></span><span class="mini-crest">${m.ac}</span></div></div><div class="match-list-footer"><span>${m.status}</span><button data-action="open-match-card" data-match-id="${m.id}">Open →</button></div></article>`).join('') || '<div class="panel"><p class="body-copy">Нет матчей в этом фильтре.</p></div>';
  }
  function renderSkills(){
    $('#skillDashboard').innerHTML=Object.entries(state.skills).map(([k,v])=>`<article class="skill-card pressable" data-action="open-skill" data-skill="${k}"><div class="skill-card-top"><h3>${skillLabel(k)}</h3><strong>${Math.round(v*100)}</strong></div><p>${skillDescription(k)}</p><div class="skill-bar"><i style="--value:${v*100}%"></i></div><div class="skill-trust">Evidence confidence ${state.skillTrust[k]}%</div></article>`).join('');
  }
  function skillDescription(k){return ({tactical:'Сценарии, пространство, фазы игры',context:'Составы, мотивация, нагрузка',data:'Качество и ограничения статистики',decision:'Риск, альтернативы, уверенность',learning:'Выводы и перенос уроков'})[k];}
  function renderTrend(){
    const iq=[66,70,72,75,78,82,86,90],cal=[62,63,64,67,68,70,71,72];
    $('#trendChart').innerHTML=iq.map((v,i)=>`<div class="trend-column"><i style="--iq:${v}%"></i><b style="--cal:${cal[i]}%"></b></div>`).join('');
  }
  function renderPatterns(){
    $('#patternList').innerHTML=state.patterns.map(p=>`<button class="pattern-card pressable" data-action="open-pattern" data-pattern="${p.id}"><span class="pattern-icon">${p.icon}</span><span><b>${p.title}</b><small>${p.summary}</small></span><i>${p.evidence.length} evidence</i></button>`).join('');
  }
  function renderDecisions(){
    const thesis=state.thesis?[{id:'current-thesis',match:'Manchester City — Real Madrid',score:state.thesis.locked?'LOCK':'DRAFT',date:'Today',lesson:state.thesis.reason||'Thesis in progress'}]:[];
    $('#decisionList').innerHTML=[...thesis,...state.decisions].map(d=>`<button class="decision-card pressable" data-action="open-decision" data-decision="${d.id}"><div><b>${d.match}</b><small>${d.date}</small><small>${escapeHtml(d.lesson)}</small></div><span>${d.score}</span></button>`).join('');
  }

  function navigate(page){ $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page)); $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.nav===page)); const sc=$(`.page[data-page="${page}"] .page-scroll`); if(sc)sc.scrollTop=0; }
  function openModal({title,kicker='NOVIQ 1.1',html}){ modalTitle.textContent=title; modalKicker.textContent=kicker; modalContent.innerHTML=html; modalLayer.classList.add('open'); modalLayer.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; setTimeout(()=> $('button,input,textarea,select',modalContent)?.focus({preventScroll:true}),250); }
  function closeModal(){ modalLayer.classList.remove('open'); modalLayer.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  function toast(msg){ const t=$('#toast'); clearTimeout(toastTimer); t.textContent=msg; t.classList.add('show'); if(navigator.vibrate)navigator.vibrate(8); toastTimer=setTimeout(()=>t.classList.remove('show'),2200); }

  function openDiagnostic(){
    const base=diagnosticBank.filter(q=>q.tier===1); const advanced=diagnosticBank.filter(q=>q.tier===2);
    diagnosticSession={queue:[...base],advanced,step:0,answers:[],selected:null,confidence:65};
    openModal({title:'Sports IQ Diagnostic V2',kicker:'ADAPTIVE ASSESSMENT',html:'<p class="modal-copy">10 ситуаций измерят не энциклопедические знания, а качество решений и честность уверенности. Сложность адаптируется после первых ответов.</p><div class="diagnostic-progress" id="diagnosticProgress"></div><div id="diagnosticQuestion"></div>'});
    renderDiagnosticQuestion();
  }
  function renderDiagnosticQuestion(){
    const s=diagnosticSession, q=s.queue[s.step];
    $('#diagnosticProgress',modalContent).innerHTML=Array.from({length:10},(_,i)=>`<i class="${i<s.step?'done':''}"></i>`).join('');
    $('#diagnosticQuestion',modalContent).innerHTML=`<div class="diagnostic-meta"><span class="badge badge-purple">${skillLabel(q.skill)} · ${q.tier===2?'ADVANCED':'CORE'}</span><span class="eyebrow">${s.step+1}/10</span></div><h3 style="font-size:18px;line-height:1.35;margin:12px 0">${q.q}</h3>${q.o.map((o,i)=>`<button class="quiz-option pressable" data-action="select-diagnostic" data-answer="${i}">${o}</button>`).join('')}<div class="quiz-confidence"><label class="eyebrow">Насколько ты уверен в ответе?</label><div class="range-wrap"><input type="range" id="diagnosticConfidence" min="40" max="95" value="65"><span class="confidence-value" id="diagnosticConfidenceValue">65%</span></div><button class="primary-button pressable" style="width:100%;margin-top:12px" data-action="submit-diagnostic" disabled id="diagnosticSubmit">Ответить →</button></div>`;
  }
  function selectDiagnostic(btn){ diagnosticSession.selected=Number(btn.dataset.answer); $$('.quiz-option',modalContent).forEach(b=>b.classList.toggle('selected',b===btn)); $('#diagnosticSubmit',modalContent).disabled=false; }
  function submitDiagnostic(){
    const s=diagnosticSession,q=s.queue[s.step]; if(s.selected===null)return;
    const confidence=Number($('#diagnosticConfidence',modalContent).value); const correct=s.selected===q.c;
    s.answers.push({id:q.id,skill:q.skill,tier:q.tier,correct,confidence});
    if(s.step<5){ const adv=s.advanced.find(x=>x.skill===q.skill); if(adv)s.queue.push(adv); }
    s.step++; s.selected=null;
    if(s.step<10){ renderDiagnosticQuestion(); return; }
    finishDiagnostic();
  }
  function finishDiagnostic(){
    const answers=diagnosticSession.answers; const bySkill={};
    Object.keys(state.skills).forEach(k=>{const a=answers.filter(x=>x.skill===k);const correct=a.filter(x=>x.correct).length;const cal=a.reduce((sum,x)=>sum+(x.correct?100-x.confidence:Math.max(0,80-x.confidence)),0)/(a.length||1);bySkill[k]=Math.min(0.96,0.56+correct*0.18+cal/500);});
    state.skills=bySkill; Object.keys(bySkill).forEach(k=>state.skillTrust[k]=Math.min(92,64+answers.filter(a=>a.skill===k).length*8));
    const avg=Object.values(bySkill).reduce((a,b)=>a+b,0)/5; state.sportsIQ=Math.max(7000,Math.round(6100+avg*3000));
    state.diagnostic={completed:true,level:'adaptive',answers,lastAt:new Date().toISOString()}; save(); applyState();
    const strongest=Object.entries(bySkill).sort((a,b)=>b[1]-a[1])[0], weakest=Object.entries(bySkill).sort((a,b)=>a[1]-b[1])[0];
    modalTitle.textContent='Твой адаптивный профиль';modalKicker.textContent='DIAGNOSTIC COMPLETE';
    modalContent.innerHTML=`<div class="replay-hero"><span>SPORTS IQ</span><strong>${formatNumber(state.sportsIQ)}</strong><p>Рейтинг рассчитан по качеству выбора, сложности вопроса и калибровке уверенности.</p></div>${Object.entries(bySkill).map(([k,v])=>`<div class="skill-result"><span>${skillLabel(k)}</span><b>${Math.round(v*100)}</b><i style="--value:${v*100}%"></i></div>`).join('')}<div class="review-card success"><h3>Сильнейший навык · ${skillLabel(strongest[0])}</h3><p>${skillDescription(strongest[0])}</p></div><div class="review-card warning"><h3>Первая зона развития · ${skillLabel(weakest[0])}</h3><p>NOVIQ подберёт миссию и матч, где этот навык можно проверить.</p></div><div class="modal-actions one"><button class="primary-button pressable" data-action="close-modal">Перейти в NOVIQ</button></div>`;
  }

  function thesisDefault(){return {mode:'expert',outcome:'mci',scenario:'',reason:'',secondaryReason:'',keyPlayer:'',risk:'',alternative:'',changeMind:'',confidence:68,sources:['briefing'],customFactors:[],versions:[],locked:false,review:null};}
  function openThesis(){ const t=state.thesis||thesisDefault(); openModal({title:t.locked?'Thesis зафиксирован':'Match Thesis V2',kicker:'UNIQUE INTELLIGENCE LOOP',html:t.locked?lockedThesisHtml(t):thesisFormHtml(t)}); if(!t.locked)bindThesisForm(t); }
  function thesisFormHtml(t){
    return `<p class="modal-copy">Создай проверяемую футбольную гипотезу. NOVIQ сохранит версии, проверит причинность, bias и честность уверенности.</p><div class="form-group"><label>Режим анализа <small>quick / expert</small></label><div class="mode-row"><button class="mode-button ${t.mode==='quick'?'selected':''}" data-mode="quick">Quick</button><button class="mode-button ${t.mode==='expert'?'selected':''}" data-mode="expert">Expert</button></div></div><div class="form-group"><label>Ожидаемый исход <small>обязательно</small></label><div class="option-grid">${[['mci','Man City'],['draw','Ничья'],['rma','Real Madrid']].map(([v,l])=>`<button class="option-button ${t.outcome===v?'selected':''}" data-outcome="${v}">${l}</button>`).join('')}</div></div><div class="form-group"><label>Источники решения <small>отметь использованные</small></label><div class="source-grid">${[['briefing','AI Briefing'],['stats','Statistics'],['lineups','Lineups'],['own','Own analysis']].map(([v,l])=>`<button class="source-chip ${t.sources.includes(v)?'selected':''}" data-source="${v}">${l}</button>`).join('')}</div></div><div class="form-group"><label for="thesisScenario">Сценарий матча <small>что будет происходить</small></label><textarea class="textarea" id="thesisScenario" placeholder="City контролирует территорию, Madrid ищет переходы...">${escapeHtml(t.scenario)}</textarea></div><div class="form-group"><label for="thesisReason">Ключевая причина <small>причина → сценарий</small></label><textarea class="textarea" id="thesisReason" placeholder="Свяжи прогноз с тактикой, контекстом или данными...">${escapeHtml(t.reason)}</textarea></div><div class="expert-only" ${t.mode==='quick'?'hidden':''}><div class="form-group"><label for="secondaryReason">Второй независимый аргумент <small>не повторяй первый</small></label><input class="input" id="secondaryReason" value="${escapeHtml(t.secondaryReason)}" placeholder="Контекст, данные или конкретный matchup"></div><div class="form-group"><label for="keyPlayer">Ключевой игрок / зона <small>почему важен</small></label><input class="input" id="keyPlayer" value="${escapeHtml(t.keyPlayer)}" placeholder="Игрок, полуфланг, прессинг-зона..."></div></div><div class="form-group"><label for="thesisRisk">Главный риск <small>обязательно</small></label><input class="input" id="thesisRisk" value="${escapeHtml(t.risk)}" placeholder="Что способно разрушить гипотезу?"></div><div class="form-group"><label for="alternative">Альтернативный сценарий <small>защита от tunnel vision</small></label><input class="input" id="alternative" value="${escapeHtml(t.alternative)}" placeholder="Как матч может пойти иначе?"></div><div class="form-group"><label for="changeMind">Что изменит твоё мнение? <small>falsification trigger</small></label><input class="input" id="changeMind" value="${escapeHtml(t.changeMind)}" placeholder="Факт или событие для пересмотра"></div><div class="form-group"><label>Уверенность <small>честная вероятность</small></label><div class="range-wrap"><input id="confidenceRange" type="range" min="40" max="95" value="${t.confidence}"><span class="confidence-value" id="confidenceValue">${t.confidence}%</span></div></div><div class="modal-actions"><button class="secondary-button pressable" data-action="save-thesis-draft">Сохранить версию</button><button class="primary-button pressable" data-action="review-thesis">AI Review V2 →</button></div>${t.versions.length?`<div class="form-group"><label>История версий <small>${t.versions.length}</small></label><div class="version-list">${t.versions.slice(-3).reverse().map((v,i)=>`<div class="version-item">v${t.versions.length-i} · ${new Date(v.savedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · ${v.confidence}% confidence</div>`).join('')}</div></div>`:''}`;
  }
  function bindThesisForm(t){
    modalContent.dataset.mode=t.mode;modalContent.dataset.outcome=t.outcome;modalContent.dataset.sources=JSON.stringify(t.sources||[]);
    $('#confidenceRange',modalContent).addEventListener('input',e=>$('#confidenceValue',modalContent).textContent=`${e.target.value}%`);
  }
  function collectThesis(){
    const mode=modalContent.dataset.mode||'expert'; let sources=[];try{sources=JSON.parse(modalContent.dataset.sources||'[]')}catch{}
    return {...(state.thesis||thesisDefault()),mode,outcome:modalContent.dataset.outcome||'mci',sources,scenario:$('#thesisScenario',modalContent)?.value.trim()||'',reason:$('#thesisReason',modalContent)?.value.trim()||'',secondaryReason:$('#secondaryReason',modalContent)?.value.trim()||'',keyPlayer:$('#keyPlayer',modalContent)?.value.trim()||'',risk:$('#thesisRisk',modalContent)?.value.trim()||'',alternative:$('#alternative',modalContent)?.value.trim()||'',changeMind:$('#changeMind',modalContent)?.value.trim()||'',confidence:Number($('#confidenceRange',modalContent)?.value||68),updatedAt:new Date().toISOString(),locked:false};
  }
  function saveThesisDraft(){ const t=collectThesis(); t.versions=[...(t.versions||[]),{savedAt:new Date().toISOString(),scenario:t.scenario,reason:t.reason,risk:t.risk,alternative:t.alternative,confidence:t.confidence}]; state.thesis=t;save();applyState();toast(`Версия v${t.versions.length} сохранена`);openThesis(); }
  function reviewThesis(){
    const t=collectThesis(); const missing=[]; if(t.scenario.length<25)missing.push('сценарий');if(t.reason.length<25)missing.push('причину');if(t.risk.length<8)missing.push('риск');if(t.alternative.length<8)missing.push('альтернативу');if(t.changeMind.length<8)missing.push('условие пересмотра');if(!t.sources.length)missing.push('источники');if(t.mode==='expert'&&t.secondaryReason.length<12)missing.push('второй аргумент');
    if(missing.length){toast(`Добавь: ${missing.join(', ')}`);return;}
    const review=buildReview(t); t.review=review; state.thesis=t;save();applyState();
    modalTitle.textContent='AI Thesis Review V2';modalKicker.textContent='BEFORE THE MATCH';modalContent.innerHTML=reviewHtml(t,review);
  }
  function buildReview(t){
    const specificity=Math.min(96,52+Math.round((t.scenario.length+t.reason.length+t.secondaryReason.length)/11)+t.sources.length*3);
    const causality=Math.min(94,58+(t.reason.includes('потому')||t.reason.includes('из-за')||t.reason.includes('because')?10:0)+(t.secondaryReason?12:0)+Math.min(14,Math.round(t.reason.length/14)));
    const risk=Math.min(96,50+Math.min(24,t.risk.length)+Math.min(14,t.alternative.length)+Math.min(10,t.changeMind.length));
    const evidence=Math.min(94,45+t.sources.length*10+(t.keyPlayer?8:0)+(t.secondaryReason?7:0));
    const over=t.confidence>78; const under=t.confidence<52; const bias=[];
    if(/последн|форма|серия|recent|streak/i.test(t.reason))bias.push('Recency bias possible');
    if(t.outcome==='mci'&&/сильн|лучше|класс/i.test(t.reason)&&t.risk.length<15)bias.push('Favorite bias possible');
    if(t.sources.length===1)bias.push('Single-source dependence');
    if(!bias.length)bias.push('No strong cognitive bias detected');
    return {specificity,causality,risk,evidence,confidenceNote:over?'Уверенность завышена для матча с двумя сильными сценариями.':under?'Аргументы сильнее заявленной уверенности.':'Уверенность находится в разумном диапазоне.',bias,overall:Math.round((specificity+causality+risk+evidence)/4)};
  }
  function reviewHtml(t,r){return `<div class="review-score-grid">${[['Specificity',r.specificity],['Causality',r.causality],['Risk quality',r.risk],['Evidence',r.evidence]].map(([l,v])=>`<div class="review-score"><span>${l}</span><b>${v}</b></div>`).join('')}</div><div class="review-card success"><h3>Сильная сторона · ${r.overall}/100</h3><p>Ты сформулировал проверяемый сценарий и указал, что способно его разрушить.</p></div><div class="review-card warning"><h3>Bias scan</h3><p>${r.bias.join(' · ')}</p></div><div class="review-card purple"><h3>Confidence Check · ${t.confidence}%</h3><p>${r.confidenceNote}</p></div><div class="info-card"><h3>Missing context</h3><p>${t.sources.includes('lineups')?'Составы учтены.':'Стартовые составы пока не отмечены как источник.'} Проверь свежесть данных и календарную нагрузку.</p></div><div class="info-card"><h3>Alternative scenario</h3><p>${escapeHtml(t.alternative)}</p></div><div class="info-card"><h3>Вопрос NOVIQ</h3><p>Как именно событие «${escapeHtml(t.changeMind)}» изменит твою уверенность и итоговый сценарий?</p></div><div class="modal-actions"><button class="secondary-button pressable" data-action="edit-thesis">Улучшить Thesis</button><button class="primary-button pressable" data-action="lock-thesis">Зафиксировать →</button></div>`;}
  function lockThesis(){ if(!state.thesis?.review){toast('Сначала пройди AI Review');return;} state.thesis={...state.thesis,locked:true,lockedAt:new Date().toISOString()};state.sportsIQ+=6;state.skills.decision=Math.min(0.98,state.skills.decision+0.005);if(state.thesis.alternative){state.mission.progress=1;state.mission.completed=true;}save();applyState();modalTitle.textContent='Thesis зафиксирован';modalKicker.textContent='DECISION LOCK';modalContent.innerHTML=lockedThesisHtml(state.thesis);toast('Decision timestamp сохранён'); }
  function lockedThesisHtml(t){const outcome=t.outcome==='mci'?'Manchester City':t.outcome==='rma'?'Real Madrid':'Ничья';return `<div class="review-card success"><h3 class="locked-badge">● DECISION LOCKED</h3><p>${new Date(t.lockedAt||t.updatedAt).toLocaleString()}</p></div><div class="info-card"><h3>${outcome} · ${t.confidence}%</h3><p>${escapeHtml(t.scenario)}</p></div><div class="info-card"><h3>Key logic</h3><p>${escapeHtml(t.reason)}</p></div><div class="info-card"><h3>Risk / alternative</h3><p>${escapeHtml(t.risk)} · ${escapeHtml(t.alternative)}</p></div><div class="review-score-grid"><div class="review-score"><span>Review score</span><b>${t.review?.overall||'—'}</b></div><div class="review-score"><span>Versions</span><b>${t.versions?.length||0}</b></div></div><div class="modal-actions one"><button class="primary-button pressable" data-action="open-replay">Открыть demo Decision Replay V2</button></div>`;}

  function openBriefing(){openModal({title:'AI Briefing',kicker:'FACTS · SIGNALS · UNKNOWNS',html:`<div class="review-card success"><h3>Подтверждённые факты</h3><p>City чаще контролирует территорию через позиционные перегрузки. Madrid сохраняет высокую угрозу после отбора.</p></div><div class="info-card"><h3>Аналитический вывод</h3><p>Ключевой конфликт — способность City защищать пространство за центральной линией после потери.</p></div><div class="review-card warning"><h3>Неизвестные факторы</h3><p>Стартовые составы, роль опорного полузащитника и уровень ротации.</p></div><div class="info-card"><h3>Что наблюдать в первые 15 минут</h3><p>Высоту крайних защитников City и направление первой передачи Madrid после отбора.</p></div><div class="modal-actions one"><button class="primary-button pressable" data-action="open-thesis">Создать Match Thesis V2 →</button></div>`});}
  function openReplay(){
    openModal({title:'Inter 2–1 Bayern',kicker:'DECISION REPLAY V2',html:`<div class="replay-hero"><span>OVERALL DECISION SCORE</span><strong>82</strong><p>Ты не угадал точный счёт, но правильно определил характер матча и главный тактический конфликт.</p></div><div class="score-breakdown">${scoreRow('Thesis Quality',88)}${scoreRow('Tactical IQ',91)}${scoreRow('Context IQ',76)}${scoreRow('Data Usage',74)}${scoreRow('Risk Management',72)}${scoreRow('Calibration',69)}</div><div class="timeline"><div class="timeline-item"><b>0′ · Исходная гипотеза</b><p>Inter вынуждает Bayern атаковать шире и получает пространство для вертикальных выходов.</p></div><div class="timeline-item"><b>23′ · Thesis confirmed</b><p>Bayern теряет структуру после продвижения крайних защитников.</p></div><div class="timeline-item"><b>51′ · Blind spot exposed</b><p>Стандарт создаёт момент, который не был учтён в рисках.</p></div><div class="timeline-item"><b>78′ · Decisive moment</b><p>Inter реализует переход после центральной потери.</p></div></div><div class="replay-card"><h3>Можно ли было предусмотреть?</h3><p>Переходы — да. Конкретный стандарт — нет, но его тип риска можно было назвать заранее.</p></div><div class="review-card warning"><h3>Calibration gap</h3><p>Ты поставил 81%, тогда как аргументы и неизвестные соответствовали диапазону 65–70%.</p></div><div class="form-group"><label for="replayReflection">Что ты понял после матча? <small>обязательно для Learning IQ</small></label><textarea class="textarea" id="replayReflection" placeholder="Сформулируй правило, которое применишь в следующем матче..."></textarea></div><div class="modal-actions one"><button class="primary-button pressable" data-action="complete-replay">Сохранить урок и обновить Sports IQ</button></div>`});
  }
  function scoreRow(l,v){return `<div class="score-row"><span>${l}</span><i><b style="width:${v}%"></b></i><b>${v}</b></div>`;}
  function completeReplay(){const reflection=$('#replayReflection',modalContent)?.value.trim()||'';if(reflection.length<18){toast('Сформулируй конкретный урок');return;}const d=state.decisions.find(x=>x.id==='int-bay');if(d&&!d.completed){d.completed=true;d.lesson=reflection;state.sportsIQ+=24;state.skills.learning=Math.min(0.98,state.skills.learning+0.018);state.skills.decision=Math.min(0.98,state.skills.decision+0.01);state.calibration.score=Math.min(100,state.calibration.score+2);state.calibration.history.push(state.calibration.score);state.completedLoops++;const p=state.patterns.find(x=>x.id==='playoff-uncertainty');p.evidence.unshift('Inter—Bayern · lesson applied');}save();applyState();modalTitle.textContent='Learning Loop активирован';modalKicker.textContent='SPORTS MEMORY UPDATED';modalContent.innerHTML=`<div class="review-card success"><h3>+24 Sports IQ</h3><p>Урок сохранён как проверяемое правило, а не общая фраза.</p></div><div class="info-card"><h3>Новое правило</h3><p>${escapeHtml(reflection)}</p></div><div class="info-card"><h3>Следующий похожий матч</h3><p>PSG — Liverpool: равный матч с высокой переходной угрозой и неопределённостью состава.</p></div><div class="modal-actions one"><button class="primary-button pressable" data-action="open-lesson">Пройти контрольный урок →</button></div>`;}

  function openCalibration(){openModal({title:'Confidence Lab',kicker:'CALIBRATION V2',html:`<p class="modal-copy">Калибровка отвечает на вопрос: когда ты говоришь «70%», подтверждается ли это примерно в 7 из 10 похожих решений?</p><div class="replay-hero"><span>CALIBRATION SCORE</span><strong>${state.calibration.score}%</strong><p>Сильный диапазон: 60–69%. Основной риск: переуверенность выше 80%.</p></div><div class="calibration-grid">${state.calibration.bins.map(b=>`<div class="calibration-bin"><span>${b.label}</span><i style="--actual:${b.actual}%"></i><b>${b.actual}%</b></div>`).join('')}</div><div class="review-card warning" style="margin-top:14px"><h3>Overconfidence zone</h3><p>В решениях с заявленной уверенностью 80–89% фактическая успешность составляет 68%.</p></div><div class="info-card"><h3>Рекомендация</h3><p>При неизвестном составе начинай с диапазона 60–70% и повышай его только после подтверждения ключевого условия.</p></div>`});}
  function openMission(){openModal({title:state.mission.title,kicker:'PERSONAL MISSION',html:`<p class="modal-copy">Миссия выбрана из повторяющегося паттерна и должна быть выполнена внутри реального решения.</p><div class="mission-big-progress"><i style="--progress:${state.mission.progress/state.mission.target*100}%"></i></div><div class="review-score-grid"><div class="review-score"><span>Progress</span><b>${state.mission.progress}/${state.mission.target}</b></div><div class="review-score"><span>Reward</span><b>+12 IQ</b></div></div><div class="info-card"><h3>Условие выполнения</h3><p>${state.mission.copy}</p></div><div class="info-card"><h3>Почему это важно</h3><p>Альтернативный сценарий уменьшает tunnel vision и улучшает калибровку при равных матчах.</p></div><div class="modal-actions one"><button class="primary-button pressable" data-action="open-thesis">Применить в Thesis →</button></div>`});}
  function openLesson(){openModal({title:'Контроль мяча ≠ контроль матча',kicker:'LEARNING LOOP · 4 MIN',html:`<p class="modal-copy">Владение показывает, у кого мяч. Контроль матча требует оценки территории, качества продвижения, угрозы после потерь и способности навязывать выгодный сценарий.</p><div class="info-card"><h3>Пример</h3><p>Команда может владеть 68%, но создавать мало моментов и постоянно отдавать сопернику опасные переходы.</p></div><div class="lesson-quiz"><h3 style="font-size:13px">Контрольный вопрос</h3><button class="quiz-option" data-action="answer-lesson" data-correct="false">Команда с большим владением всегда контролирует матч</button><button class="quiz-option" data-action="answer-lesson" data-correct="true">Нужно проверить продвижение, территорию и переходы</button><button class="quiz-option" data-action="answer-lesson" data-correct="false">Достаточно сравнить число ударов</button></div><div id="lessonFeedback"></div>`});}
  function answerLesson(btn){const ok=btn.dataset.correct==='true';$$('.quiz-option',modalContent).forEach(b=>b.disabled=true);$('#lessonFeedback',modalContent).innerHTML=`<div class="review-card ${ok?'success':'warning'}" style="margin-top:10px"><h3>${ok?'Верно':'Нужно пересмотреть'}</h3><p>${ok?'Ты отделил владение от качества контроля. Урок сохранён в Sports Memory.':'Контроль требует нескольких независимых сигналов.'}</p></div>${ok?'<div class="modal-actions one"><button class="primary-button" data-action="complete-lesson">Сохранить урок</button></div>':''}`;}
  function completeLesson(){if(!state.lessonsCompleted.includes('possession-control')){state.lessonsCompleted.push('possession-control');state.sportsIQ+=8;state.skills.learning=Math.min(0.98,state.skills.learning+0.007);save();applyState();}closeModal();toast('+8 Sports IQ · урок сохранён');}

  function openPattern(id){const p=state.patterns.find(x=>x.id===id);if(!p)return;openModal({title:p.title,kicker:'SPORTS MEMORY V2',html:`<div class="review-card ${p.severity==='strength'?'success':'warning'}"><h3>${p.skill}</h3><p>${p.summary}</p></div><div class="info-card"><h3>Доказательства</h3><div class="evidence-row">${p.evidence.map(e=>`<i>${escapeHtml(e)}</i>`).join('')}</div></div><div class="info-card"><h3>Как NOVIQ использует паттерн</h3><p>Он влияет на персональные миссии, выбор матчей и вопросы AI Review. Один матч никогда не создаёт устойчивый вывод.</p></div><div class="modal-actions"><button class="secondary-button" data-action="dispute-pattern" data-pattern="${p.id}">Оспорить вывод</button><button class="primary-button" data-action="open-mission">Открыть миссию</button></div>`});}
  function openSkill(key){openModal({title:skillLabel(key),kicker:'SKILL EVIDENCE',html:`<div class="replay-hero"><span>${skillLabel(key).toUpperCase()}</span><strong>${Math.round(state.skills[key]*100)}</strong><p>Уровень доверия к оценке: ${state.skillTrust[key]}%.</p></div><div class="info-card"><h3>Что измеряется</h3><p>${skillDescription(key)}.</p></div><div class="info-card"><h3>Последнее доказательство</h3><p>Inter — Bayern: решение оценено через Thesis Quality, фактический сценарий и постматчевый урок.</p></div><div class="review-card warning"><h3>Ограничение</h3><p>Нужно больше решений в разных турнирах, чтобы подтвердить устойчивость навыка.</p></div>`});}
  function openDecision(id){if(id==='current-thesis'){openThesis();return;}if(id==='int-bay'){openReplay();return;}const d=state.decisions.find(x=>x.id===id);openModal({title:d?.match||'Decision',kicker:'DECISION HISTORY',html:`<div class="replay-hero"><span>DECISION SCORE</span><strong>${d?.score||'—'}</strong><p>${escapeHtml(d?.lesson||'No lesson')}</p></div><div class="info-card"><h3>Archived replay</h3><p>Исторический Decision Replay сохранён в локальной демо-памяти.</p></div>`});}
  function openMatchCard(id){const m=matches.find(x=>x.id===id);if(!m)return;openModal({title:`${m.home} — ${m.away}`,kicker:`${m.tournament} · INTELLIGENCE ${m.intelligence}`,html:`<div class="match-main"><div class="team"><span class="crest">${m.hc}</span><b>${m.home}</b></div><div class="match-center"><b>${m.score||m.time}</b><small>${m.score?m.time:'Today'}</small></div><div class="team"><span class="crest">${m.ac}</span><b>${m.away}</b></div></div><div class="info-card"><h3>Почему матч выбран</h3><p>Он проверяет твой навык управления риском и паттерн переоценки сильного состава.</p></div><div class="action-row"><button class="secondary-button" data-action="open-briefing">AI Briefing</button><button class="primary-button" data-action="${m.id==='int-bay'?'open-replay':'open-thesis'}">${m.id==='int-bay'?'Decision Replay':'Create Thesis'}</button></div>`});}

  function openAICore(){openModal({title:'Спроси NOVIQ',kicker:'AI CORE · DEMO',html:`<div class="ai-orb-large"><b>✦</b></div><p class="modal-copy" style="text-align:center">AI не заменяет решение. Он ищет пробелы, противоречия, альтернативные сценарии и похожие ошибки.</p><div class="ai-suggestions"><button class="ai-suggestion" data-action="use-ai-suggestion">Где слабое место Madrid?</button><button class="ai-suggestion" data-action="use-ai-suggestion">Проверь мою уверенность</button><button class="ai-suggestion" data-action="use-ai-suggestion">Покажи похожую ошибку</button></div><textarea class="textarea" id="aiQuestion" placeholder="Спроси о тактике, рисках, данных или Sports Memory..."></textarea><div class="modal-actions one"><button class="primary-button" data-action="ask-ai">Анализировать →</button></div><div id="aiAnswer"></div>`});}
  function askAI(){const q=$('#aiQuestion',modalContent)?.value.trim()||'';if(q.length<4){toast('Сформулируй вопрос подробнее');return;}$('#aiAnswer',modalContent).innerHTML='<div class="review-card purple" style="margin-top:10px"><h3>NOVIQ analyzing…</h3><p>Сопоставляю вопрос с Briefing, Thesis и Sports Memory.</p></div>';setTimeout(()=>{const text=/увер|confidence/i.test(q)?`Твоя текущая калибровка ${state.calibration.score}%. Главная проблема — диапазон выше 80%. До публикации составов разумнее удерживать 60–70%.`:/ошиб|похож/i.test(q)?'Похожая ошибка была в Inter — Bayern: сильный тактический сценарий, но недооценён риск стандартов и завышена уверенность.':'Ключевой риск Madrid — пространство за крайними защитниками соперника после потери. Смотри не только на владение, а на качество первой передачи после отбора.';$('#aiAnswer',modalContent).innerHTML=`<div class="review-card success" style="margin-top:10px"><h3>NOVIQ AI</h3><p>${text}</p></div><div class="info-card"><h3>Уровень уверенности</h3><p>Demo inference · средний. Реальный серверный AI и источники будут подключены в следующем техническом этапе.</p></div>`;},650);}

  function openNotifications(){openModal({title:'Уведомления',kicker:'NOTIFICATION INTELLIGENCE',html:`<p class="modal-copy">NOVIQ уведомляет только тогда, когда изменилась ценность решения.</p>${Object.entries(state.notifications).map(([k,v])=>`<button class="setting-row" data-action="toggle-notification" data-notification="${k}"><span class="setting-icon">${v?'●':'○'}</span><span><b>${({briefings:'AI Briefing',lineups:'Стартовые составы',replay:'Decision Replay',weekly:'Weekly Report',patterns:'Новый паттерн'})[k]}</b><small>${v?'Включено':'Выключено'}</small></span><i>›</i></button>`).join('')}`});}
  function changeLanguage(){openModal({title:'Язык',kicker:'LOCALIZATION',html:`<div class="option-grid">${[['ru','Русский'],['ua','Українська'],['en','English']].map(([v,l])=>`<button class="option-button ${state.language===v?'selected':''}" data-action="set-language" data-language="${v}">${l}</button>`).join('')}</div><div class="info-card" style="margin-top:12px"><h3>Language behavior</h3><p>Основная навигация локализована. Часть демонстрационного аналитического контента остаётся на русском до подключения серверной локализации.</p></div>`});}
  function toggleTheme(){state.theme=state.theme==='dark'?'light':'dark';save();applyState();toast(state.theme==='dark'?'Dark Elite активирован':'Light Elite активирован');}
  function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`noviq-1.1-export-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('Экспорт подготовлен');}
  function resetDemo(){openModal({title:'Сбросить локальный прогресс?',kicker:'DATA CONTROL',html:`<div class="review-card warning"><h3>Будут удалены</h3><p>Диагностика, Thesis, Replay, миссии, настройки и Sports Memory, сохранённые на этом устройстве.</p></div><div class="modal-actions"><button class="secondary-button" data-action="close-modal">Отмена</button><button class="primary-button" data-action="confirm-reset">Сбросить</button></div>`});}
  function openLoopMap(){openModal({title:'Intelligence Loop',kicker:'HOW NOVIQ WORKS',html:`${[['1','Diagnostic','Измеряет стартовый профиль и уверенность.'],['2','AI Briefing','Разделяет факты, сигналы и неизвестные.'],['3','Match Thesis','Фиксирует сценарий, аргументы, риск и уверенность.'],['4','AI Review','Проверяет причинность, bias и blind spots.'],['5','Decision Replay','Сравнивает ожидание с реальным матчем.'],['6','Learning Loop','Сохраняет правило и обновляет Sports Memory.']].map(x=>`<div class="info-card"><h3>${x[0]}. ${x[1]}</h3><p>${x[2]}</p></div>`).join('')}`});}
  function openIQMethod(){openModal({title:'Методология Sports IQ V2',kicker:'TRANSPARENCY',html:`<div class="info-card"><h3>Что повышает рейтинг</h3><p>Качество причинности, сложность матча, использование независимых данных, управление риском, калибровка и конкретный постматчевый урок.</p></div><div class="info-card"><h3>Что почти не влияет</h3><p>Количество открытий приложения, случайно угаданный результат, лайки и бессодержательные действия.</p></div><div class="review-card warning"><h3>Уровень доверия</h3><p>Каждый поднавык показывает evidence confidence. Рейтинг не считается полностью подтверждённым при малом числе решений.</p></div>`});}

  function continueLoop(){const s=currentLoopStage();if(s===0)openDiagnostic();else if(s===1)openBriefing();else if(s===2||s===3)openThesis();else if(s===4)openReplay();else openLesson();}

  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action;
    const handlers={
      'go-home':()=>navigate('home'),'open-profile':()=>navigate('profile'),'navigate':()=>navigate(el.dataset.nav),'go-intelligence':()=>navigate('intelligence'),
      'close-modal':closeModal,'open-diagnostic':openDiagnostic,'continue-loop':continueLoop,'open-loop-map':openLoopMap,'open-briefing':openBriefing,'open-thesis':openThesis,
      'open-calibration':openCalibration,'open-mission':openMission,'open-replay':openReplay,'open-lesson':openLesson,'open-ai-core':openAICore,'open-notifications':openNotifications,
      'change-language':changeLanguage,'toggle-theme':toggleTheme,'export-data':exportData,'reset-demo':resetDemo,'open-iq-method':openIQMethod,
      'open-pattern':()=>openPattern(el.dataset.pattern),'open-skill':()=>openSkill(el.dataset.skill),'open-decision':()=>openDecision(el.dataset.decision),'open-match-card':()=>openMatchCard(el.dataset.matchId),
      'select-diagnostic':()=>selectDiagnostic(el),'submit-diagnostic':submitDiagnostic,'save-thesis-draft':saveThesisDraft,'review-thesis':reviewThesis,'edit-thesis':openThesis,'lock-thesis':lockThesis,
      'complete-replay':completeReplay,'answer-lesson':()=>answerLesson(el),'complete-lesson':completeLesson,'ask-ai':askAI,'use-ai-suggestion':()=>{const q=$('#aiQuestion',modalContent);if(q){q.value=el.textContent.trim();q.focus();}},
      'toggle-notification':()=>{const k=el.dataset.notification;state.notifications[k]=!state.notifications[k];save();openNotifications();},
      'set-language':()=>{state.language=el.dataset.language;save();applyState();closeModal();toast('Язык изменён');},
      'confirm-reset':()=>{localStorage.removeItem(STORAGE_KEY);state=clone(defaultState);save();applyState();closeModal();toast('Локальный прогресс сброшен');},
      'dispute-pattern':()=>toast('Отметка сохранена: паттерн будет перепроверен'),'memory-filters':()=>toast('Фильтры Sports Memory будут расширены в 1.2'),
      'install-app':installApp,'dismiss-install':()=>{state.installDismissed=true;save();$('#installBanner').hidden=true;}
    };
    if(handlers[a])handlers[a]();
  });
  document.addEventListener('click',e=>{
    const mode=e.target.closest('[data-mode]');if(mode){modalContent.dataset.mode=mode.dataset.mode;$$('[data-mode]',modalContent).forEach(b=>b.classList.toggle('selected',b===mode));$$('.expert-only',modalContent).forEach(x=>x.hidden=mode.dataset.mode==='quick');}
    const outcome=e.target.closest('[data-outcome]');if(outcome){modalContent.dataset.outcome=outcome.dataset.outcome;$$('[data-outcome]',modalContent).forEach(b=>b.classList.toggle('selected',b===outcome));}
    const source=e.target.closest('[data-source]');if(source){let arr=[];try{arr=JSON.parse(modalContent.dataset.sources||'[]')}catch{};arr=arr.includes(source.dataset.source)?arr.filter(x=>x!==source.dataset.source):[...arr,source.dataset.source];modalContent.dataset.sources=JSON.stringify(arr);source.classList.toggle('selected');}
    const filter=e.target.closest('[data-filter]');if(filter){activeFilter=filter.dataset.filter;$$('[data-filter]').forEach(b=>b.classList.toggle('active',b===filter));renderMatches();}
  });
  document.addEventListener('input',e=>{if(e.target.id==='diagnosticConfidence')$('#diagnosticConfidenceValue',modalContent).textContent=`${e.target.value}%`;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalLayer.classList.contains('open'))closeModal();});

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;if(!state.installDismissed)$('#installBanner').hidden=false;});
  async function installApp(){if(!deferredInstallPrompt){toast('На iPhone: Поделиться → На экран «Домой»');return;}deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$('#installBanner').hidden=true;}
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

  applyState();
})();
