window.NOVIQ = window.NOVIQ || {};
window.NOVIQ.config = Object.freeze({
  version: '1.2.0',
  storageKey: 'noviq-v1.2-state',
  legacyKeys: ['noviq-v1.1-state', 'noviq-v1-state'],
  dataMode: 'demo',
  sportsApiBaseUrl: '',
  aiApiBaseUrl: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  features: {
    dynamicBriefing: true,
    liveTracking: true,
    recommendationEngine: true,
    weeklyReport: true,
    accountShell: true,
    cloudSync: false,
    realSportsFeed: false,
    serverAI: false,
    pushNotifications: false
  }
});
