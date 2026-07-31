window.NOVIQ = window.NOVIQ || {};
(() => {
  'use strict';
  const { config, demo } = window.NOVIQ;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  class DemoSportsDataAdapter {
    async listMatches() {
      await delay(120);
      return typeof structuredClone === 'function' ? structuredClone(demo.matches) : JSON.parse(JSON.stringify(demo.matches));
    }
    async getMatch(id) {
      await delay(80);
      const match = demo.matches.find((item) => item.id === id);
      if (!match) throw new Error('Match not found');
      return JSON.parse(JSON.stringify(match));
    }
    async getLiveTimeline(id) {
      const match = await this.getMatch(id);
      return match.timeline || [];
    }
    status() {
      return {
        mode: 'demo', connected: true, provider: 'NOVIQ Demo Adapter', freshness: 'Static test dataset',
        limitations: ['Not official', 'Not live', 'No commercial data rights implied']
      };
    }
  }

  class HttpSportsDataAdapter {
    constructor(baseUrl) { this.baseUrl = baseUrl; }
    async request(path) {
      const response = await fetch(`${this.baseUrl}${path}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Sports API error ${response.status}`);
      return response.json();
    }
    listMatches() { return this.request('/matches'); }
    getMatch(id) { return this.request(`/matches/${encodeURIComponent(id)}`); }
    getLiveTimeline(id) { return this.request(`/matches/${encodeURIComponent(id)}/timeline`); }
    status() { return { mode: 'live', connected: true, provider: this.baseUrl, freshness: 'Server managed' }; }
  }

  class DemoAIService {
    async reviewThesis(thesis) {
      await delay(260);
      const textLength = [thesis.scenario, thesis.reason, thesis.secondaryReason, thesis.risk, thesis.alternative]
        .filter(Boolean).join(' ').length;
      const sourceCount = (thesis.sources || []).length;
      const specificity = Math.min(96, 54 + Math.round(textLength / 16));
      const evidence = Math.min(94, 48 + sourceCount * 12 + (thesis.secondaryReason?.length > 20 ? 12 : 0));
      const risk = thesis.risk?.length > 18 && thesis.changeMind?.length > 14 ? 88 : 66;
      const calibration = thesis.confidence > 79 ? 64 : thesis.confidence < 52 ? 70 : 84;
      const causality = thesis.reason?.length > 28 && thesis.scenario?.length > 28 ? 86 : 68;
      return {
        specificity, evidence, risk, calibration, causality,
        bias: thesis.confidence > 80 ? 'Possible overconfidence: the decision still depends on unconfirmed conditions.' : 'No severe confidence distortion detected.',
        blindSpot: thesis.risk?.length > 18 ? 'Explain how the risk changes the match structure, not only the result.' : 'The main risk is not developed enough.',
        challenge: 'What one pre-match fact would make you reduce confidence by at least 8 points?',
        alternative: thesis.alternative || 'The opponent survives the first pressure phase and turns the match into a transition contest.'
      };
    }
    async answer(question, state) {
      await delay(340);
      const q = question.toLowerCase();
      if (/confidence|увер|впевнен/.test(q)) {
        return `Your current calibration score is ${state.calibration.score}%. The weakest band is 80–89%, where stated confidence is materially above observed success.`;
      }
      if (/memory|ошиб|помил|pattern/.test(q)) {
        return 'The closest repeated pattern is lineup bias: a strong starting XI raises your confidence before context and fatigue are checked.';
      }
      return 'The main analytical question is whether possession becomes territorial progression. Track the first forward pass after turnovers and the space behind advanced full-backs.';
    }
  }

  const sports = config.dataMode === 'live' && config.sportsApiBaseUrl
    ? new HttpSportsDataAdapter(config.sportsApiBaseUrl)
    : new DemoSportsDataAdapter();

  window.NOVIQ.services = { sports, ai: new DemoAIService() };
})();
