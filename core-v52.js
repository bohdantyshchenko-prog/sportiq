(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const clone = value => structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const id = prefix => `${prefix}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  const cleanText = (value, max = 900) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const localeMap = { ru: 'ru-RU', uk: 'uk-UA', en: 'en-US' };

  N.config = {
    version: '5.2.0', schemaVersion: 7, storageKey: 'noviq-v5.2-state', backupKey: 'noviq-v5.2-backup',
    legacyKeys: ['noviq-v5.1-state','noviq-v5-state','noviq-v4.1-state','noviq-v4-state','noviq-v3.3-state'],
    provider: 'NOVIQ Curated Intelligence Pack', buildDate: '2026-08-04'
  };

  N.copy = {
    ru: {
      skip:'Перейти к содержанию', home:'Главная', matches:'Матчи', ai:'AI', profile:'Профиль', appearance:'Оформление', language:'Язык',
      hero:'Думай о спорте точнее.', heroCopy:'Отдели факты от предположений, зафиксируй решение и проверь качество мышления после матча.', continue:'Продолжить цикл',
      today:'Главное решение сегодня', allMatches:'Все матчи', snapshot:'Что важно сейчас', calibration:'Калибровка', activePattern:'Активный паттерн',
      matchCenter:'Матчи для анализа', all:'Все', forYou:'Для тебя', live:'В эфире', replay:'Replay', empty:'В этом разделе матчей нет.',
      briefing:'AI Briefing', createThesis:'Создать Thesis', facts:'Факты', signals:'Сигналы', unknowns:'Неизвестное', confidence:'Уверенность', source:'Источник',
      diagnostic:'Диагностика', diagnosticQuestion:'Насколько уверенно ты обычно оцениваешь матч до подтверждённых составов?',
      scenario:'Как будет развиваться матч?', reason:'Какие факты поддерживают гипотезу?', risk:'Что может сделать гипотезу неверной?', save:'Зафиксировать решение',
      required:'Нужен содержательный ответ от 12 символов.', duplicate:'Ответы должны описывать разные аспекты решения.', saved:'Решение зафиксировано.',
      originalDecision:'Исходное решение', declaredRisk:'Заявленный риск', decisionQuality:'Качество решения', completeReplay:'Завершить Replay', replayDone:'Replay сохранён. Sports IQ пересчитан.', alreadyReplayed:'Этот Replay уже завершён.',
      aiTitle:'Проверь свою мысль', aiCopy:'Локальный анализатор использует текущий Thesis, калибровку и прошлые Replay. Он не выдаёт прогноз за факт.', askPlaceholder:'Почему моя уверенность может быть завышена?', analyze:'Анализировать', conclusion:'Вывод', alternative:'Альтернатива',
      local:'Прогресс хранится на этом устройстве.', loops:'Циклы', export:'Экспорт данных', import:'Импорт данных', health:'Состояние приложения', reset:'Сбросить прогресс',
      healthy:'Все локальные проверки пройдены.', resetConfirm:'Удалить локальный прогресс?', resetBody:'Будут удалены Thesis, Replay, Sports IQ и настройки на этом устройстве.', cancel:'Отмена', confirm:'Удалить',
      invalidBackup:'Файл не является корректной резервной копией NOVIQ.', restorePreview:'Проверить резервную копию', restore:'Восстановить', restored:'Данные восстановлены.',
      onboarding:'Не угадывай. Учись принимать решения.', onboardingCopy:'Короткий цикл превращает просмотр матча в тренировку спортивного мышления.', start:'Начать',
      updateReady:'Доступна новая версия NOVIQ.', reload:'Обновить', close:'Закрыть', loading:'Анализирую аргументы…', error:'Не удалось выполнить действие. Повтори попытку.'
    },
    uk: {
      skip:'Перейти до вмісту', home:'Головна', matches:'Матчі', ai:'AI', profile:'Профіль', appearance:'Оформлення', language:'Мова',
      hero:'Думай про спорт точніше.', heroCopy:'Відокрем факти від припущень, зафіксуй рішення та перевір якість мислення після матчу.', continue:'Продовжити цикл',
      today:'Головне рішення сьогодні', allMatches:'Усі матчі', snapshot:'Що важливо зараз', calibration:'Калібрування', activePattern:'Активний патерн',
      matchCenter:'Матчі для аналізу', all:'Усі', forYou:'Для тебе', live:'Наживо', replay:'Replay', empty:'У цьому розділі матчів немає.',
      briefing:'AI Briefing', createThesis:'Створити Thesis', facts:'Факти', signals:'Сигнали', unknowns:'Невідоме', confidence:'Впевненість', source:'Джерело',
      diagnostic:'Діагностика', diagnosticQuestion:'Наскільки впевнено ти зазвичай оцінюєш матч до підтверджених складів?',
      scenario:'Як розвиватиметься матч?', reason:'Які факти підтримують гіпотезу?', risk:'Що може зробити гіпотезу хибною?', save:'Зафіксувати рішення',
      required:'Потрібна змістовна відповідь від 12 символів.', duplicate:'Відповіді мають описувати різні аспекти рішення.', saved:'Рішення зафіксовано.',
      originalDecision:'Початкове рішення', declaredRisk:'Заявлений ризик', decisionQuality:'Якість рішення', completeReplay:'Завершити Replay', replayDone:'Replay збережено. Sports IQ перераховано.', alreadyReplayed:'Цей Replay уже завершено.',
      aiTitle:'Перевір свою думку', aiCopy:'Локальний аналізатор використовує поточний Thesis, калібрування та попередні Replay. Він не видає прогноз за факт.', askPlaceholder:'Чому моя впевненість може бути завищена?', analyze:'Аналізувати', conclusion:'Висновок', alternative:'Альтернатива',
      local:'Прогрес зберігається на цьому пристрої.', loops:'Цикли', export:'Експорт даних', import:'Імпорт даних', health:'Стан застосунку', reset:'Скинути прогрес',
      healthy:'Усі локальні перевірки пройдено.', resetConfirm:'Видалити локальний прогрес?', resetBody:'Буде видалено Thesis, Replay, Sports IQ і налаштування на цьому пристрої.', cancel:'Скасувати', confirm:'Видалити',
      invalidBackup:'Файл не є коректною резервною копією NOVIQ.', restorePreview:'Перевірити резервну копію', restore:'Відновити', restored:'Дані відновлено.',
      onboarding:'Не вгадуй. Вчися приймати рішення.', onboardingCopy:'Короткий цикл перетворює перегляд матчу на тренування спортивного мислення.', start:'Почати',
      updateReady:'Доступна нова версія NOVIQ.', reload:'Оновити', close:'Закрити', loading:'Аналізую аргументи…', error:'Не вдалося виконати дію. Повтори спробу.'
    },
    en: {
      skip:'Skip to content', home:'Home', matches:'Matches', ai:'AI', profile:'Profile', appearance:'Appearance', language:'Language',
      hero:'Think about sport more clearly.', heroCopy:'Separate facts from assumptions, lock the decision, and review the quality of your reasoning after the match.', continue:'Continue loop',
      today:"Today's key decision", allMatches:'All matches', snapshot:'What matters now', calibration:'Calibration', activePattern:'Active pattern',
      matchCenter:'Matches to analyze', all:'All', forYou:'For you', live:'Live', replay:'Replay', empty:'No matches in this view.',
      briefing:'AI Briefing', createThesis:'Create Thesis', facts:'Facts', signals:'Signals', unknowns:'Unknowns', confidence:'Confidence', source:'Source',
      diagnostic:'Diagnostic', diagnosticQuestion:'How confident are you usually before confirmed lineups are available?',
      scenario:'How will the match develop?', reason:'Which facts support the thesis?', risk:'What could make the thesis wrong?', save:'Lock decision',
      required:'Add a meaningful answer of at least 12 characters.', duplicate:'Each answer must cover a different part of the decision.', saved:'Decision locked.',
      originalDecision:'Original decision', declaredRisk:'Declared risk', decisionQuality:'Decision quality', completeReplay:'Complete Replay', replayDone:'Replay saved. Sports IQ recalculated.', alreadyReplayed:'This Replay is already complete.',
      aiTitle:'Challenge your thinking', aiCopy:'The local analyzer uses the current Thesis, calibration, and past Replays. It never presents a prediction as fact.', askPlaceholder:'Why might my confidence be too high?', analyze:'Analyze', conclusion:'Conclusion', alternative:'Alternative',
      local:'Progress is stored on this device.', loops:'Loops', export:'Export data', import:'Import data', health:'App health', reset:'Reset progress',
      healthy:'All local checks passed.', resetConfirm:'Delete local progress?', resetBody:'This removes Thesis, Replay, Sports IQ, and settings from this device.', cancel:'Cancel', confirm:'Delete',
      invalidBackup:'This file is not a valid NOVIQ backup.', restorePreview:'Review backup', restore:'Restore', restored:'Data restored.',
      onboarding:'Do not guess. Learn to decide.', onboardingCopy:'A short loop turns watching a match into sports-thinking practice.', start:'Start',
      updateReady:'A new NOVIQ version is available.', reload:'Update', close:'Close', loading:'Analyzing evidence…', error:'The action failed. Try again.'
    }
  };

  N.t = key => (N.copy[N.state?.language || 'ru'] || N.copy.ru)[key] || key;
  N.util = { clone, now, id, cleanText, escape: value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])), format: value => new Intl.NumberFormat(localeMap[N.state?.language] || 'ru-RU').format(value) };

  const defaults = {
    version:N.config.version, schemaVersion:7, installId:null, createdAt:null, updatedAt:null, onboardingSeen:false,
    language:'ru', theme:'dark', activeScreen:'home', matchFilter:'all', sportsIQ:8542,
    diagnostic:{completed:false,answers:[],lastAt:null}, activeThesisId:null, theses:[], replays:[], completedReplayIds:[], completedLoops:12,
    calibration:{score:72,history:[65,66,68,67,70,71,72]},
    patterns:[
      {id:'lineup-bias',confidence:78,summary:'Сильный состав повышает уверенность сильнее, чем подтверждают контекст и нагрузка.'},
      {id:'transition-reader',confidence:84,summary:'Ты стабильно замечаешь риск быстрых переходов.'},
      {id:'playoff-uncertainty',confidence:71,summary:'В матчах плей-офф калибровка ниже обычной.'}
    ],
    account:{mode:'local',displayName:'Богдан Тищенко'}, diagnostics:{runtimeErrors:[],lastRunAt:null,lastResult:null}, dataControl:{lastBackupAt:null,lastImportAt:null}
  };

  function migrate(saved = {}) {
    const state = {...clone(defaults), ...saved};
    state.language = saved.language === 'ua' ? 'uk' : ['ru','uk','en'].includes(saved.language) ? saved.language : 'ru';
    state.onboardingSeen = Boolean(saved.onboardingSeen || saved.onboarding?.completed);
    state.theses = Array.isArray(saved.theses) ? saved.theses : saved.thesis ? [{id:saved.thesis.id || id('thesis'), ...saved.thesis}] : [];
    state.replays = Array.isArray(saved.replays) ? saved.replays : saved.replay?.completedAt ? [{id:saved.replay.id || id('replay'), ...saved.replay}] : [];
    state.completedReplayIds = Array.isArray(saved.completedReplayIds) ? saved.completedReplayIds : state.replays.map(r => r.thesisId).filter(Boolean);
    state.activeThesisId = saved.activeThesisId || (saved.thesis?.locked ? state.theses.at(-1)?.id : null);
    state.matchFilter = ['all','for-you','live','replay'].includes(saved.matchFilter) ? saved.matchFilter : 'all';
    state.version = N.config.version; state.schemaVersion = 7; state.installId ||= id('install'); state.createdAt ||= now(); state.updatedAt = now();
    return state;
  }

  function validate(state) {
    return Boolean(state && typeof state === 'object' && Number.isFinite(Number(state.sportsIQ)) && Array.isArray(state.theses) && Array.isArray(state.replays));
  }

  N.storage = {
    load(){
      for (const key of [N.config.storageKey, ...N.config.legacyKeys, N.config.backupKey]) {
        try { const raw=localStorage.getItem(key); if(!raw) continue; const candidate=JSON.parse(raw); const state=migrate(candidate.state || candidate); if(validate(state)){localStorage.setItem(N.config.storageKey,JSON.stringify(state));return state;} } catch(error){console.warn('NOVIQ storage read failed',key,error);}
      }
      return migrate(defaults);
    },
    save({backup=true}={}){N.state.updatedAt=now();const raw=JSON.stringify(N.state);localStorage.setItem(N.config.storageKey,raw);if(backup){localStorage.setItem(N.config.backupKey,raw);N.state.dataControl.lastBackupAt=N.state.updatedAt;}return true;},
    export(){return JSON.stringify({product:'NOVIQ',version:N.config.version,schemaVersion:7,exportedAt:now(),state:N.state},null,2);},
    inspect(raw){const payload=JSON.parse(raw);const state=migrate(payload.state || payload);if(!validate(state))throw new Error('INVALID_NOVIQ_BACKUP');return {state,summary:{version:payload.version || state.version,exportedAt:payload.exportedAt || null,sportsIQ:state.sportsIQ,theses:state.theses.length,replays:state.replays.length}};},
    import(raw){const {state}=this.inspect(raw);localStorage.setItem(N.config.backupKey,JSON.stringify(N.state));N.state=state;N.state.dataControl.lastImportAt=now();this.save({backup:false});return N.state;},
    reset(){localStorage.removeItem(N.config.storageKey);N.state=migrate(defaults);this.save();return N.state;}, validate
  };

  N.domain = {
    createThesis(input){const fields=['scenario','reason','risk'].map(k=>cleanText(input[k]));if(fields.some(v=>v.length<12))throw new Error('THESIS_TOO_SHORT');if(new Set(fields.map(v=>v.toLowerCase())).size<3)throw new Error('THESIS_DUPLICATE');return {id:id('thesis'),matchId:input.matchId,scenario:fields[0],reason:fields[1],risk:fields[2],confidence:Math.max(30,Math.min(95,Number(input.confidence)||65)),locked:true,createdAt:now()};},
    scoreReplay(thesis,reflection){const lengths=[thesis.scenario,thesis.reason,thesis.risk].map(v=>cleanText(v).length);const specificity=Math.min(8,Math.round(lengths[0]/30));const evidence=Math.min(8,Math.round(lengths[1]/30));const risk=Math.min(8,Math.round(lengths[2]/30));const calibration=Math.max(0,8-Math.round(Math.abs(thesis.confidence-70)/5));const reflectionScore=Math.min(8,Math.round(cleanText(reflection,500).length/35));const delta=Math.max(3,Math.min(28,specificity+evidence+risk+calibration+reflectionScore-4));return {delta,breakdown:{specificity,evidence,risk,calibration,reflection:reflectionScore}};},
    completeReplay(thesisId,reflection='Reviewed decision quality and alternative scenario.') {if(N.state.completedReplayIds.includes(thesisId))throw new Error('REPLAY_EXISTS');const thesis=N.state.theses.find(t=>t.id===thesisId);if(!thesis)throw new Error('THESIS_NOT_FOUND');const score=this.scoreReplay(thesis,reflection);const replay={id:id('replay'),thesisId,matchId:thesis.matchId,reflection:cleanText(reflection,500),score:score.breakdown,delta:score.delta,completedAt:now()};N.state.replays.push(replay);N.state.completedReplayIds.push(thesisId);N.state.completedLoops+=1;N.state.sportsIQ+=score.delta;N.state.activeThesisId=null;return replay;}
  };

  N.ai = {
    async briefing(match){await new Promise(r=>setTimeout(r,80));return {facts:[`${match.home} — ${match.away} is bundled demonstration content.`, 'No external lineup feed is connected.'],signals:[...match.signals.slice(0,2).map(s=>`${s[0]}: ${s[1]}`)],unknowns:['Confirmed lineups','Late injuries','Weather and pitch'],confidence:'medium',source:'offline-curated'};},
    async ask(question){await new Promise(r=>setTimeout(r,90));const thesis=N.state.theses.find(t=>t.id===N.state.activeThesisId);const history=N.state.replays.slice(-3);const q=cleanText(question,600);const overconfidence=thesis?.confidence>80 || /confidence|увер|впев/i.test(q);return {conclusion:overconfidence?`Your declared confidence${thesis?` is ${thesis.confidence}%`:''}. Compare it with a calibration score of ${N.state.calibration.score}% and keep unknowns visible.`:'The strongest next step is to separate observed evidence from the match story you expect.',confidence:'medium',source:'offline-rules-engine',evidence:[thesis?.reason || 'No active Thesis evidence',`Calibration ${N.state.calibration.score}%`,`${history.length} recent Replay records used`],unknowns:['No live provider data','No confirmed lineup changes'],alternative:thesis?.risk || 'The opponent changes the match through transitions or set pieces.'};}
  };

  N.health = {run(){const checks={state:validate(N.state),storage:(()=>{try{localStorage.setItem('noviq-health','1');localStorage.removeItem('noviq-health');return true;}catch{return false;}})(),matches:Array.isArray(N.matches)&&N.matches.length>0,history:Array.isArray(N.state.theses)&&Array.isArray(N.state.replays),serviceWorker:'serviceWorker' in navigator};const result={ok:Object.values(checks).every(Boolean),checks,version:N.config.version,checkedAt:now()};N.state.diagnostics.lastRunAt=result.checkedAt;N.state.diagnostics.lastResult=result;return result;}};
})();