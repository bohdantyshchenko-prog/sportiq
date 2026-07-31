(() => {
  'use strict';
  const N = window.NOVIQ;
  N.util = {
    clone: v => JSON.parse(JSON.stringify(v)),
    escape: value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])),
    format: value => new Intl.NumberFormat(N.state?.language === 'en' ? 'en-US' : N.state?.language === 'ua' ? 'uk-UA' : 'ru-RU').format(value),
    now: () => new Date().toISOString()
  };
  N.storage = {
    load() {
      try {
        const raw = localStorage.getItem(N.config.storageKey);
        if (!raw) return N.util.clone(N.defaultState);
        const saved = JSON.parse(raw);
        return { ...N.util.clone(N.defaultState), ...saved,
          skills:{...N.defaultState.skills,...(saved.skills||{})},
          skillTrust:{...N.defaultState.skillTrust,...(saved.skillTrust||{})},
          calibration:{...N.defaultState.calibration,...(saved.calibration||{})},
          notifications:{...N.defaultState.notifications,...(saved.notifications||{})},
          favorites:{...N.defaultState.favorites,...(saved.favorites||{})},
          account:{...N.defaultState.account,...(saved.account||{})}
        };
      } catch (error) {
        console.warn('NOVIQ state reset', error);
        return N.util.clone(N.defaultState);
      }
    },
    save() { localStorage.setItem(N.config.storageKey, JSON.stringify(N.state)); }
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
      const specificity=Math.min(96,54+Math.round((thesis.scenario.length+thesis.reason.length+thesis.risk.length)/8));
      const evidence=Math.min(94,55+(thesis.sources?.length||0)*10+(thesis.secondaryReason?.length>15?12:0));
      const risk=Math.min(92,thesis.risk.length>18?84:64);
      const calibration=thesis.confidence>80?62:thesis.confidence<55?70:86;
      return { specificity,evidence,risk,calibration,
        bias:thesis.confidence>80?'Overconfidence risk':'No dominant bias detected',
        question:'Какой факт из стартового состава заставит тебя изменить уверенность минимум на 10 пунктов?',
        alternative:thesis.alternative||'Соперник переживает стартовое давление и переводит игру в переходный сценарий.' };
    },
    async ask(question){
      await new Promise(r=>setTimeout(r,420));
      if(/увер|confidence/i.test(question)) return `Текущая калибровка — ${N.state.calibration.score}%. Главная ошибка находится в диапазоне 80%+: фактическая успешность заметно ниже заявленной.`;
      if(/похож|ошиб|memory/i.test(question)) return 'Похожий паттерн был в Inter — Bayern: сильное тактическое чтение, но недостаточный вес стандартов и слишком высокая уверенность.';
      return 'Смотри не только на владение, а на качество продвижения после отбора, структуру rest-defence и пространство за крайними защитниками.';
    }
  };
  N.pwa = {
    prompt:null,
    init(){
      if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
      window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();this.prompt=event;if(!N.state.installDismissed){const b=document.querySelector('#installBanner');if(b)b.hidden=false;}});
    }
  };
})();
