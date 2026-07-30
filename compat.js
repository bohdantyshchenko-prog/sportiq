(() => {
  'use strict';
  const currentKey = 'noviq-v1.1-state';
  const legacyKey = 'noviq-v1-state';
  if (localStorage.getItem(currentKey)) return;
  try {
    const legacy = JSON.parse(localStorage.getItem(legacyKey));
    if (!legacy) return;
    const thesisDefaults = { mode:'expert', outcome:'mci', scenario:'', reason:'', secondaryReason:'', keyPlayer:'', risk:'', alternative:'', changeMind:'', confidence:68, sources:['briefing'], customFactors:[], versions:[], locked:false, review:null };
    const thesis = legacy.thesis ? { ...thesisDefaults, ...legacy.thesis, sources: legacy.thesis.sources || ['briefing'], versions: legacy.thesis.versions || [] } : null;
    const decisions = Array.isArray(legacy.decisions) ? legacy.decisions.map((decision, index) => ({ id: decision.id || `legacy-${index}`, completed: decision.completed ?? true, ...decision })) : undefined;
    localStorage.setItem(currentKey, JSON.stringify({ ...legacy, version:'1.1', thesis, ...(decisions ? { decisions } : {}) }));
  } catch (error) {
    console.warn('NOVIQ 1.0 migration skipped', error);
  }
})();
