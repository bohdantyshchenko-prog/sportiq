(() => {
  'use strict';
  const N = window.NOVIQ;
  N.util = {
    clone: v => JSON.parse(JSON.stringify(v)),
    escape: value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])),
    format: value => new Intl.NumberFormat(N.state?.language === 'en' ? 'en-US' : N.state?.language === 'ua' ? 'uk-UA' : 'ru-RU').format(value),
    now: () => new Date().toISOString(),
    clamp: (value, min, max) => Math.min(max, Math.max(min, Number(value) || min))
  };

  const mergeState = saved => ({
    ...N.util.clone(N.defaultState),
    ...(saved || {}),
    version: N.config.version,
    skills: { ...N.defaultState.skills, ...(saved?.skills || {}) },
    skillTrust: { ...N.defaultState.skillTrust, ...(saved?.skillTrust || {}) },
    calibration: {
      ...N.defaultState.calibration,
      ...(saved?.calibration || {}),
      history: Array.isArray(saved?.calibration?.history) ? saved.calibration.history : N.defaultState.calibration.history,
      bins: Array.isArray(saved?.calibration?.bins) ? saved.calibration.bins : N.defaultState.calibration.bins
    },
    diagnostic: { ...N.defaultState.diagnostic, ...(saved?.diagnostic || {}) },
    mission: { ...N.defaultState.mission, ...(saved?.mission || {}) },
    notifications: { ...N.defaultState.notifications, ...(saved?.notifications || {}) },
    favorites: {
      ...N.defaultState.favorites,
      ...(saved?.favorites || {}),
      teams: Array.isArray(saved?.favorites?.teams) ? saved.favorites.teams : N.defaultState.favorites.teams,
      tournaments: Array.isArray(saved?.favorites?.tournaments) ? saved.favorites.tournaments : N.defaultState.favorites.tournaments
    },
    account: { ...N.defaultState.account, ...(saved?.account || {}) },
    patterns: Array.isArray(saved?.patterns) ? saved.patterns : N.defaultState.patterns,
    decisions: Array.isArray(saved?.decisions) ? saved.decisions : N.defaultState.decisions,
    liveNotes: Array.isArray(saved?.liveNotes) ? saved.liveNotes : [],
    lessonsCompleted: Array.isArray(saved?.lessonsCompleted) ? saved.lessonsCompleted : []
  });

  N.storage = {
    load() {
      const keys = [N.config.storageKey, ...(N.config.legacyKeys || [])];
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const state = mergeState(JSON.parse(raw));
          if (key !== N.config.storageKey) {
            localStorage.setItem(N.config.storageKey, JSON.stringify(state));
          }
          return state;
        } catch (error) {
          console.warn(`NOVIQ could not read state from ${key}`, error);
        }
      }
      return N.util.clone(N.defaultState);
    },
    save() {
      try {
        localStorage.setItem(N.config.storageKey, JSON.stringify(N.state));
        return true;
      } catch (error) {
        console.error('NOVIQ could not save local state', error);
        return false;
      }
    }
  };

  N.sportsGateway = {
    mode:'demo',
    async getMatches(){ return N.util.clone(N.matches); },
    async getMatch(id){ return N.util.clone(N.matches.find(m=>m.id===id)); },
    status(){ return { mode:'demo', provider:N.config.provider, updatedAt:N.util.now(), truthful:true, connected:false }; }
  };

  N.ai = {
    async briefing(match){
      await new Promise(r=>setTimeout(r,350));
      return {
        facts:['Матч и время взяты из демонстрационного набора 1.2.','Стартовые составы пока не подключены к внешнему провайдеру.'],
        signals:[`${match.home} вероятнее будет задавать базовую структуру владения.`,`${match.away} опаснее при изменении темпа и переходах.`],
        unknowns:['Подтверждённые составы','Свежие медицинские данные','Погодные условия'],
        change:'До получения составов не поднимай уверенность выше 70%.', confidence:'medium'
      };
    },
    async reviewThesis(thesis){
      await new Promise(r=>setTimeout(r,280));
      const scenario=String(thesis?.scenario||'');
      const reason=String(thesis?.reason||'');
      const riskText=String(thesis?.risk||'');
      const confidence=N.util.clamp(thesis?.confidence,0,100);
      const specificity=Math.min(96,54+Math.round((scenario.length+reason.length+riskText.length)/8));
      const evidence=Math.min(94,55+(thesis?.sources?.length||0)*10+(String(thesis?.secondaryReason||'').length>15?12:0));
      const risk=Math.min(92,riskText.length>18?84:64);
      const calibration=confidence>80?62:confidence<55?70:86;
      return { specificity,evidence,risk,calibration,
        bias:confidence>80?'Overconfidence risk':'No dominant bias detected',
        question:'Какой факт из стартового состава заставит тебя изменить уверенность минимум на 10 пунктов?',
        alternative:thesis?.alternative||'Соперник переживает стартовое давление и переводит игру в переходный сценарий.' };
    },
    async ask(question){
      await new Promise(r=>setTimeout(r,420));
      const safeQuestion=String(question||'').slice(0,600);
      if(/увер|confidence/i.test(safeQuestion)) return `Текущая калибровка — ${N.state.calibration.score}%. Главная ошибка находится в диапазоне 80%+: фактическая успешность заметно ниже заявленной.`;
      if(/похож|ошиб|memory/i.test(safeQuestion)) return 'Похожий паттерн был в Inter — Bayern: сильное тактическое чтение, но недостаточный вес стандартов и слишком высокая уверенность.';
      return 'Смотри не только на владение, а на качество продвижения после отбора, структуру rest-defence и пространство за крайними защитниками.';
    }
  };

  N.pwa = {
    prompt:null,
    init(){
      if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Service worker registration failed',error)));
      window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();this.prompt=event;if(!N.state.installDismissed){const b=document.querySelector('#installBanner');if(b)b.hidden=false;}});
    }
  };
})();
