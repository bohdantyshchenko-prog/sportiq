(() => {
  'use strict';
  const N=window.NOVIQ;
  N.config.version='5.1.0';
  N.config.storageKey='noviq-v5.1-state';
  N.config.legacyKeys=['noviq-v5-state','noviq-v4.1-state',...(N.config.legacyKeys||[])].filter((v,i,a)=>a.indexOf(v)===i);
  N.config.buildDate='2026-08-03';
  N.defaultState.version='5.1.0';
  N.defaultState.schemaVersion=6;
})();