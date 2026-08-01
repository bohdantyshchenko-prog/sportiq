(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const runtime = window.NOVIQ_RUNTIME_CONFIG || {};
  N.config = {
    version: '2.0.0',
    storageKey: 'noviq-v2-state',
    legacyKeys: ['noviq-v1.4-state', 'noviq-v1.2-state', 'noviq-v1.1-state', 'noviq-v1-state'],
    demoMode: runtime.demoMode !== false,
    apiBaseUrl: String(runtime.apiBaseUrl || '').trim(),
    requestTimeoutMs: Number(runtime.requestTimeoutMs) || 8000,
    provider: runtime.provider || 'NOVIQ Demo Sports Gateway',
    buildDate: '2026-08-01'
  };
  N.defaultState = {
    version: '2.0.0', language: 'ru', theme: 'dark', sportsIQ: 8542,
    skills: { tactical: 89, context: 74, data: 78, decision: 81, learning: 86 },
    skillTrust: { tactical: 82, context: 69, data: 72, decision: 77, learning: 80 },
    calibration: {
      score: 72,
      history: [65,66,68,67,70,71,72],
      bins: [
        { label:'50–59%', predicted:55, actual:58 },
        { label:'60–69%', predicted:65, actual:67 },
        { label:'70–79%', predicted:75, actual:69 },
        { label:'80–89%', predicted:85, actual:64 }
      ]
    },
    diagnostic: { completed:false, answers:[], lastAt:null },
    thesis: null,
    liveNotes: [],
    completedLoops: 12,
    lessonsCompleted: [],
    mission: { id:'alternative-scenario', title:'Назови альтернативный сценарий', copy:'Добавь альтернативный сценарий в следующий Thesis.', progress:0, target:1 },
    patterns: [
      { id:'lineup-bias', icon:'△', title:'Lineup bias', skill:'Decision IQ', severity:'warning', confidence:78, summary:'Сильный стартовый состав повышает твою уверенность в среднем на 11% сильнее, чем подтверждают контекст и нагрузка.', evidence:['4 из 6 последних Thesis','Inter — Bayern','PSG — Liverpool'] },
      { id:'transition-reader', icon:'◎', title:'Transition reader', skill:'Tactical IQ', severity:'strength', confidence:84, summary:'Ты стабильно замечаешь риск быстрых переходов раньше среднего пользователя.', evidence:['82% точных сигналов','Arsenal — Barcelona','Man City — Real Madrid'] },
      { id:'playoff-uncertainty', icon:'◇', title:'Playoff uncertainty', skill:'Context IQ', severity:'warning', confidence:71, summary:'В матчах плей-офф твоя калибровка ниже на 8 пунктов.', evidence:['9 матчей','Средняя уверенность 79%','Фактическая успешность 66%'] }
    ],
    decisions: [
      { id:'int-bay', match:'Inter — Bayern', score:82, date:'29 Jul', lesson:'Сценарий был сильным, но уверенность завышена.' },
      { id:'psg-liv', match:'PSG — Liverpool', score:76, date:'26 Jul', lesson:'Контекст учтён хорошо, риск стандартов пропущен.' },
      { id:'ars-bar', match:'Arsenal — Barcelona', score:88, date:'22 Jul', lesson:'Лучший тактический разбор месяца.' }
    ],
    favorites: { teams:['Polissya','Dynamo Kyiv'], tournaments:['Champions League'] },
    notifications: { briefings:true, lineups:true, live:true, replay:true, weekly:true, patterns:true },
    account: { mode:'guest', email:null, synced:false },
    runtime: { mode:'unknown', connected:false, checkedAt:null, lastError:null },
    installDismissed:false,
    activeDate:'today',
    activeFilter:'for-you'
  };
  N.i18n = {
    ru: { hello:'Привет, Богдан', dailyBrief:'DAILY INTELLIGENCE BRIEF' },
    ua: { hello:'Привіт, Богдане', dailyBrief:'DAILY INTELLIGENCE BRIEF' },
    en: { hello:'Hello, Bohdan', dailyBrief:'DAILY INTELLIGENCE BRIEF' }
  };
})();
