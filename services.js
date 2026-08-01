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
    runtime: { ...N.defaultState.runtime, ...(saved?.runtime || {}) },
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
          if (key !== N.config.storageKey) localStorage.setItem(N.config.storageKey, JSON.stringify(state));
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

  const demoBriefing = match => ({
    facts:['Матч и время взяты из демонстрационного набора NOVIQ.','Стартовые составы пока не подтверждены внешним провайдером.'],
    signals:[`${match.home} вероятнее будет задавать базовую структуру владения.`,`${match.away} опаснее при изменении темпа и переходах.`],
    unknowns:['Подтверждённые составы','Свежие медицинские данные','Погодные условия'],
    change:'До получения составов не поднимай уверенность выше 70%.', confidence:'medium', sourceMode:'demo'
  });

  N.runtime = {
    async check() {
      if (!N.config.apiBaseUrl || N.config.demoMode) {
        N.state.runtime = { mode:'demo', connected:false, checkedAt:N.util.now(), lastError:null };
        N.storage.save();
        return N.state.runtime;
      }
      try {
        await N.api.health();
        N.state.runtime = { mode:'remote', connected:true, checkedAt:N.util.now(), lastError:null };
      } catch (error) {
        N.state.runtime = { mode:'fallback', connected:false, checkedAt:N.util.now(), lastError:error.code || 'API_ERROR' };
      }
      N.storage.save();
      return N.state.runtime;
    }
  };

  N.sportsGateway = {
    get mode(){ return N.state?.runtime?.connected ? 'remote' : 'demo'; },
    async getMatches(params = {}) {
      if (N.config.apiBaseUrl && !N.config.demoMode) {
        try {
          const result = await N.api.matches(params);
          if (Array.isArray(result?.matches)) return result.matches;
        } catch (error) {
          console.warn('Remote sports feed unavailable; using demo data', error);
        }
      }
      return N.util.clone(N.matches);
    },
    async getMatch(id) {
      if (N.config.apiBaseUrl && !N.config.demoMode) {
        try { return await N.api.match(id); }
        catch (error) { console.warn('Remote match unavailable; using demo data', error); }
      }
      return N.util.clone(N.matches.find(m => m.id === id));
    },
    status() {
      const connected = Boolean(N.state?.runtime?.connected);
      return {
        mode: connected ? 'remote' : 'demo',
        provider: connected ? (N.config.provider || 'NOVIQ API') : 'NOVIQ Demo Sports Gateway',
        updatedAt: N.state?.runtime?.checkedAt || N.util.now(),
        truthful:true,
        connected,
        fallback: !connected && Boolean(N.config.apiBaseUrl)
      };
    }
  };

  N.ai = {
    async briefing(match) {
      if (N.config.apiBaseUrl && !N.config.demoMode) {
        try { return await N.api.briefing(match.id); }
        catch (error) { console.warn('Remote briefing unavailable; using demo analysis', error); }
      }
      await new Promise(r => setTimeout(r, 250));
      return demoBriefing(match);
    },
    async reviewThesis(thesis) {
      if (N.config.apiBaseUrl && !N.config.demoMode) {
        try { return await N.api.reviewThesis(thesis); }
        catch (error) { console.warn('Remote thesis review unavailable; using local model', error); }
      }
      await new Promise(r=>setTimeout(r,220));
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
        alternative:thesis?.alternative||'Соперник переживает стартовое давление и переводит игру в переходный сценарий.',
        sourceMode:'local-fallback' };
    },
    async ask(question) {
      const safeQuestion=String(question||'').slice(0,600);
      if (N.config.apiBaseUrl && !N.config.demoMode) {
        try { return await N.api.ask(safeQuestion, { sportsIQ:N.state.sportsIQ, patterns:N.state.patterns.slice(0,5) }); }
        catch (error) { console.warn('Remote AI unavailable; using local response', error); }
      }
      await new Promise(r=>setTimeout(r,260));
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
