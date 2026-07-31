window.NOVIQ = window.NOVIQ || {};
(() => {
  'use strict';
  const { config } = window.NOVIQ;
  try { if (localStorage.getItem(config.storageKey)) return; } catch (error) { console.warn('NOVIQ migration unavailable', error); return; }
  for (const key of config.legacyKeys) {
    try {
      const legacy = JSON.parse(localStorage.getItem(key));
      if (!legacy) continue;
      const migrated = {
        version: '1.2.0',
        language: legacy.language || 'ru',
        theme: legacy.theme || 'dark',
        sportsIQ: Number(legacy.sportsIQ) || 8542,
        skills: legacy.skills || undefined,
        calibration: legacy.calibration || undefined,
        thesisByMatch: {},
        decisions: Array.isArray(legacy.decisions) ? legacy.decisions : undefined,
        patterns: legacy.patterns || undefined,
        notifications: legacy.notifications || undefined,
        favorites: legacy.favorites || undefined,
        account: legacy.account || { mode: 'guest' },
        migration: { from: key, at: new Date().toISOString() }
      };
      if (legacy.thesis) {
        const matchId = legacy.thesis.matchId || 'mci-rma';
        migrated.thesisByMatch[matchId] = {
          mode: 'expert', outcome: legacy.thesis.outcome || 'draw', scenario: '', reason: '', secondaryReason: '',
          keyPlayer: '', risk: '', alternative: '', changeMind: '', confidence: 68, sources: ['briefing'], versions: [],
          ...legacy.thesis, matchId
        };
      }
      localStorage.setItem(config.storageKey, JSON.stringify(migrated));
      break;
    } catch (error) {
      console.warn(`NOVIQ migration skipped for ${key}`, error);
    }
  }
})();
