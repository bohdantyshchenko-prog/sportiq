(() => {
  'use strict';
  const N = window.NOVIQ;
  if (localStorage.getItem(N.config.storageKey)) return;
  for (const key of N.config.legacyKeys) {
    try {
      const raw=localStorage.getItem(key); if(!raw) continue;
      const old=JSON.parse(raw); if(!old) continue;
      const migrated={...N.util.clone(N.defaultState),...old,version:'1.2'};
      if(old.thesis){migrated.thesis={matchId:'mci-rma',mode:'expert',outcome:'mci',scenario:'',reason:'',secondaryReason:'',risk:'',alternative:'',changeMind:'',confidence:68,sources:['briefing'],versions:[],locked:false,...old.thesis};}
      if(Array.isArray(old.decisions))migrated.decisions=old.decisions.map((d,i)=>({id:d.id||`legacy-${i}`,match:d.match||'Legacy decision',score:d.score||'—',date:d.date||'Earlier',lesson:d.lesson||'',...d}));
      localStorage.setItem(N.config.storageKey,JSON.stringify(migrated));
      break;
    } catch(error){console.warn('NOVIQ migration skipped',key,error);}
  }
})();
