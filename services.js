(() => {
  'use strict';
  const N=window.NOVIQ;
  N.util={
    clone:v=>JSON.parse(JSON.stringify(v)),
    escape:value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])),
    format:value=>new Intl.NumberFormat(N.state?.language==='en'?'en-US':N.state?.language==='ua'?'uk-UA':'ru-RU').format(value),
    now:()=>new Date().toISOString(),
    clamp:(value,min,max)=>Math.min(max,Math.max(min,Number(value)||min)),
    id:()=>crypto.randomUUID?.()||`noviq-${Date.now()}-${Math.random().toString(16).slice(2)}`
  };

  const mergeState=saved=>{
    const base=N.util.clone(N.defaultState), now=N.util.now();
    const state={...base,...(saved||{}),version:N.config.version,schemaVersion:N.config.schemaVersion,
      installId:saved?.installId||N.util.id(),createdAt:saved?.createdAt||now,updatedAt:now,
      skills:{...base.skills,...(saved?.skills||{})},skillTrust:{...base.skillTrust,...(saved?.skillTrust||{})},
      calibration:{...base.calibration,...(saved?.calibration||{}),history:Array.isArray(saved?.calibration?.history)?saved.calibration.history:base.calibration.history,bins:Array.isArray(saved?.calibration?.bins)?saved.calibration.bins:base.calibration.bins},
      diagnostic:{...base.diagnostic,...(saved?.diagnostic||{})},mission:{...base.mission,...(saved?.mission||{})},notifications:{...base.notifications,...(saved?.notifications||{})},
      favorites:{...base.favorites,...(saved?.favorites||{}),teams:Array.isArray(saved?.favorites?.teams)?saved.favorites.teams:base.favorites.teams,tournaments:Array.isArray(saved?.favorites?.tournaments)?saved.favorites.tournaments:base.favorites.tournaments},
      account:{...base.account,...(saved?.account||{}),mode:'local',synced:false},runtime:{...base.runtime,mode:'offline-production',connected:false,healthy:true,lastError:null},
      dataControl:{...base.dataControl,...(saved?.dataControl||{})},patterns:Array.isArray(saved?.patterns)?saved.patterns:base.patterns,decisions:Array.isArray(saved?.decisions)?saved.decisions:base.decisions,
      liveNotes:Array.isArray(saved?.liveNotes)?saved.liveNotes:[],lessonsCompleted:Array.isArray(saved?.lessonsCompleted)?saved.lessonsCompleted:[]};
    return state;
  };

  N.storage={
    validate(value){return Boolean(value&&typeof value==='object'&&Number.isFinite(Number(value.sportsIQ))&&value.skills&&value.calibration&&Array.isArray(value.patterns)&&Array.isArray(value.decisions));},
    load(){
      const keys=[N.config.storageKey,...(N.config.legacyKeys||[]),N.config.backupKey];
      for(const key of keys){try{const raw=localStorage.getItem(key);if(!raw)continue;const parsed=JSON.parse(raw);if(!this.validate(parsed))continue;const state=mergeState(parsed);localStorage.setItem(N.config.storageKey,JSON.stringify(state));return state;}catch(error){console.warn(`NOVIQ could not read ${key}`,error);}}
      return mergeState(N.defaultState);
    },
    save(){
      try{N.state.updatedAt=N.util.now();const serialized=JSON.stringify(N.state);localStorage.setItem(N.config.storageKey,serialized);localStorage.setItem(N.config.backupKey,serialized);N.state.dataControl.lastBackupAt=N.state.updatedAt;return true;}
      catch(error){console.error('NOVIQ could not save local state',error);return false;}
    },
    export(){return JSON.stringify({product:'NOVIQ',version:N.config.version,schemaVersion:N.config.schemaVersion,exportedAt:N.util.now(),state:N.state},null,2);},
    import(raw){const payload=JSON.parse(raw);const candidate=payload?.state||payload;if(!this.validate(candidate))throw new Error('INVALID_NOVIQ_BACKUP');N.state=mergeState(candidate);N.state.dataControl.lastImportAt=N.util.now();return this.save();},
    reset(){localStorage.removeItem(N.config.storageKey);localStorage.removeItem(N.config.backupKey);N.state=mergeState(N.defaultState);return this.save();}
  };

  const demoBriefing=match=>({facts:['Матч и время взяты из встроенного набора NOVIQ.','Стартовые составы не подтверждены внешним провайдером.'],signals:[`${match.home} вероятнее будет задавать базовую структуру владения.`,`${match.away} опаснее при изменении темпа и переходах.`],unknowns:['Подтверждённые составы','Свежие медицинские данные','Погодные условия'],change:'До получения составов не поднимай уверенность выше 70%.',confidence:'medium',sourceMode:'offline-curated'});

  N.runtime={async check(){N.state.runtime={mode:'offline-production',connected:false,checkedAt:N.util.now(),lastError:null,healthy:true};N.storage.save();return N.state.runtime;}};
  N.sportsGateway={
    get mode(){return'offline';},
    async getMatches(){return N.util.clone(N.matches);},
    async getMatch(id){return N.util.clone(N.matches.find(m=>m.id===id));},
    status(){return{mode:'offline-production',provider:N.config.provider,updatedAt:N.state?.runtime?.checkedAt||N.util.now(),truthful:true,connected:false,fallback:false};}
  };

  N.ai={
    async briefing(match){await new Promise(r=>setTimeout(r,120));return demoBriefing(match);},
    async reviewThesis(thesis){await new Promise(r=>setTimeout(r,120));const scenario=String(thesis?.scenario||''),reason=String(thesis?.reason||''),riskText=String(thesis?.risk||''),confidence=N.util.clamp(thesis?.confidence,0,100);const specificity=Math.min(96,54+Math.round((scenario.length+reason.length+riskText.length)/8));const evidence=Math.min(94,55+(thesis?.sources?.length||0)*10+(String(thesis?.secondaryReason||'').length>15?12:0));const risk=Math.min(92,riskText.length>18?84:64);const calibration=confidence>80?62:confidence<55?70:86;return{specificity,evidence,risk,calibration,bias:confidence>80?'Overconfidence risk':'No dominant bias detected',question:'Какой факт заставит изменить уверенность минимум на 10 пунктов?',alternative:thesis?.alternative||'Соперник переживает стартовое давление и переводит игру в переходный сценарий.',sourceMode:'offline-rules-engine'};},
    async ask(question){const q=String(question||'').slice(0,600);await new Promise(r=>setTimeout(r,140));if(/увер|confidence/i.test(q))return`Текущая калибровка — ${N.state.calibration.score}%. Главная ошибка находится в диапазоне 80%+: фактическая успешность ниже заявленной.`;if(/похож|ошиб|memory/i.test(q))return'Похожий паттерн был в Inter — Bayern: сильное тактическое чтение, но недостаточный вес стандартов и слишком высокая уверенность.';return'Смотри не только на владение, а на качество продвижения после отбора, структуру rest-defence и пространство за крайними защитниками.';}
  };

  N.health={run(){const checks={state:N.storage.validate(N.state),matches:Array.isArray(N.matches)&&N.matches.length>0,serviceWorker:'serviceWorker'in navigator,storage:(()=>{try{localStorage.setItem('noviq-health','1');localStorage.removeItem('noviq-health');return true;}catch{return false;}})()};return{ok:Object.values(checks).every(Boolean),checks,version:N.config.version,checkedAt:N.util.now()};}};
  N.pwa={prompt:null,init(){if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Service worker registration failed',error)));window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();this.prompt=event;if(!N.state.installDismissed){const b=document.querySelector('#installBanner');if(b)b.hidden=false;}});}};
})();