(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  N.config = {
    version: '5.1.0',
    storageKey: 'noviq-v5.1-state',
    legacyKeys: ['noviq-v5-state','noviq-v4.1-state','noviq-v4-state','noviq-v3.3-state','noviq-v3.2-state','noviq-v2-state','noviq-v1.4-state','noviq-v1.2-state','noviq-v1.1-state','noviq-v1-state'],
    demoMode: true,
    offlineProduction: true,
    apiBaseUrl: '',
    provider: 'NOVIQ Curated Intelligence Pack',
    buildDate: '2026-08-03'
  };
  N.defaultState = {
    version: '5.1.0', schemaVersion: 6, installId: null, createdAt: null, updatedAt: null,
    onboardingSeen: false, language: 'ru', theme: 'dark', activeScreen: 'home', sportsIQ: 8542,
    skills: { tactical: 89, context: 74, data: 78, decision: 81, learning: 86 },
    skillTrust: { tactical: 82, context: 69, data: 72, decision: 77, learning: 80 },
    calibration: { score: 72, history: [65,66,68,67,70,71,72], bins: [
      { label:'50–59%', predicted:55, actual:58 }, { label:'60–69%', predicted:65, actual:67 },
      { label:'70–79%', predicted:75, actual:69 }, { label:'80–89%', predicted:85, actual:64 }
    ] },
    diagnostic: { completed:false, answers:[], lastAt:null }, thesis: null, replay: null,
    liveNotes: [], completedLoops: 12, lessonsCompleted: [],
    mission: { id:'alternative-scenario', title:'Назови альтернативный сценарий', copy:'Добавь альтернативный сценарий в следующий Thesis.', progress:0, target:1 },
    patterns: [
      { id:'lineup-bias', icon:'triangle', title:'Lineup bias', skill:'Decision IQ', severity:'warning', confidence:78, summary:'Сильный стартовый состав повышает твою уверенность сильнее, чем подтверждают контекст и нагрузка.', evidence:['4 из 6 последних Thesis','Inter — Bayern','PSG — Liverpool'] },
      { id:'transition-reader', icon:'target', title:'Transition reader', skill:'Tactical IQ', severity:'strength', confidence:84, summary:'Ты стабильно замечаешь риск быстрых переходов раньше среднего пользователя.', evidence:['82% точных сигналов','Arsenal — Barcelona','Man City — Real Madrid'] },
      { id:'playoff-uncertainty', icon:'diamond', title:'Playoff uncertainty', skill:'Context IQ', severity:'warning', confidence:71, summary:'В матчах плей-офф твоя калибровка ниже на 8 пунктов.', evidence:['9 матчей','Средняя уверенность 79%','Фактическая успешность 66%'] }
    ],
    decisions: [
      { id:'int-bay', match:'Inter — Bayern', score:82, date:'29 Jul', lesson:'Сценарий был сильным, но уверенность завышена.' },
      { id:'psg-liv', match:'PSG — Liverpool', score:76, date:'26 Jul', lesson:'Контекст учтён хорошо, риск стандартов пропущен.' },
      { id:'ars-bar', match:'Arsenal — Barcelona', score:88, date:'22 Jul', lesson:'Лучший тактический разбор месяца.' }
    ],
    favorites: { teams:['Polissya','Dynamo Kyiv'], tournaments:['Champions League'] },
    account: { mode:'local', displayName:'Богдан Тищенко', synced:false },
    runtime: { mode:'offline-production', connected:false, checkedAt:null, lastError:null },
    diagnostics: { lastRunAt:null, lastResult:null, runtimeErrors:[] }
  };
})();