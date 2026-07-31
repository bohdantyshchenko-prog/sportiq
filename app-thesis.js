window.NOVIQ = window.NOVIQ || {};
(() => {
  'use strict';
  const N = window.NOVIQ;
  const app = N.app;
  const $ = app.$, $$ = app.$$, esc = app.escapeHtml;

  function currentMatchId(element) { return element?.dataset.matchId || 'mci-rma'; }
  function outcomeLabel(match, outcome) {
    if (outcome === 'home') return match.home;
    if (outcome === 'away') return match.away;
    return 'Draw';
  }
  function thesisDefaults(matchId) {
    return {
      matchId, mode: 'expert', outcome: 'draw', scenario: '', reason: '', secondaryReason: '', keyPlayer: '', risk: '', alternative: '',
      changeMind: '', confidence: 64, sources: ['briefing'], versions: [], locked: false, lockedAt: null, review: null
    };
  }
  function readForm(matchId) {
    const existing = app.getThesis(matchId) || thesisDefaults(matchId);
    return {
      ...existing, matchId,
      mode: $('#modalContent').dataset.mode || existing.mode,
      outcome: $('#modalContent').dataset.outcome || existing.outcome,
      scenario: $('#thesisScenario')?.value.trim() || '', reason: $('#thesisReason')?.value.trim() || '',
      secondaryReason: $('#thesisSecondary')?.value.trim() || '', keyPlayer: $('#thesisKeyPlayer')?.value.trim() || '',
      risk: $('#thesisRisk')?.value.trim() || '', alternative: $('#thesisAlternative')?.value.trim() || '',
      changeMind: $('#thesisChangeMind')?.value.trim() || '', confidence: Number($('#confidenceRange')?.value || 64),
      sources: JSON.parse($('#modalContent').dataset.sources || '[]'), updatedAt: new Date().toISOString(), locked: false
    };
  }
  function formHtml(match, thesis) {
    return `<p class="modal-copy">Build a falsifiable football hypothesis. The score alone is not enough.</p>
      <div class="mode-switch"><button class="option-button ${thesis.mode === 'quick' ? 'selected' : ''}" data-mode="quick">Quick</button><button class="option-button ${thesis.mode === 'expert' ? 'selected' : ''}" data-mode="expert">Expert</button></div>
      <div class="form-group"><label>Expected result</label><div class="option-grid"><button class="option-button ${thesis.outcome === 'home' ? 'selected' : ''}" data-outcome="home">${esc(match.home)}</button><button class="option-button ${thesis.outcome === 'draw' ? 'selected' : ''}" data-outcome="draw">Draw</button><button class="option-button ${thesis.outcome === 'away' ? 'selected' : ''}" data-outcome="away">${esc(match.away)}</button></div></div>
      <div class="form-group"><label for="thesisScenario">Match scenario <small>what should happen</small></label><textarea class="textarea" id="thesisScenario" placeholder="Territory, pressing, transitions, game state...">${esc(thesis.scenario)}</textarea></div>
      <div class="form-group"><label for="thesisReason">Primary reason <small>why the scenario should happen</small></label><textarea class="textarea" id="thesisReason" placeholder="Connect a tactical or contextual cause to the outcome.">${esc(thesis.reason)}</textarea></div>
      <div class="form-group expert-only"><label for="thesisSecondary">Independent second reason</label><textarea class="textarea" id="thesisSecondary" placeholder="Use a different evidence category.">${esc(thesis.secondaryReason)}</textarea></div>
      <div class="form-group expert-only"><label for="thesisKeyPlayer">Key player or tactical zone</label><input class="input" id="thesisKeyPlayer" value="${esc(thesis.keyPlayer)}" placeholder="Player, flank, half-space or set piece" /></div>
      <div class="form-group"><label>Sources used</label><div class="source-grid">${[['briefing','AI Briefing'],['stats','Statistics'],['lineups','Lineups'],['memory','Sports Memory']].map(([id,label]) => `<button class="source-button ${(thesis.sources || []).includes(id) ? 'selected' : ''}" data-source="${id}">${label}</button>`).join('')}</div></div>
      <div class="form-group"><label for="thesisRisk">Main risk <small>what can break the thesis</small></label><textarea class="textarea short" id="thesisRisk" placeholder="Name a concrete failure condition.">${esc(thesis.risk)}</textarea></div>
      <div class="form-group expert-only"><label for="thesisAlternative">Alternative scenario</label><textarea class="textarea short" id="thesisAlternative" placeholder="Describe a materially different path.">${esc(thesis.alternative)}</textarea></div>
      <div class="form-group"><label for="thesisChangeMind">What would change your mind?</label><input class="input" id="thesisChangeMind" value="${esc(thesis.changeMind)}" placeholder="One observable trigger before kickoff" /></div>
      <div class="form-group"><label>Confidence <small>honest probability, not enthusiasm</small></label><div class="range-wrap"><input id="confidenceRange" type="range" min="40" max="95" value="${thesis.confidence}" /><span id="confidenceValue">${thesis.confidence}%</span></div></div>
      ${thesis.versions?.length ? `<div class="version-note">Draft versions: ${thesis.versions.length}</div>` : ''}
      <div class="modal-actions"><button class="secondary-button" data-action="save-thesis-draft" data-match-id="${match.id}">Save draft</button><button class="primary-button" data-action="review-thesis" data-match-id="${match.id}">AI Review →</button></div>`;
  }

  function openBriefing(matchId = 'mci-rma') {
    const match = app.getMatch(matchId);
    if (!match) return;
    const b = match.briefing || app.getMatch('mci-rma').briefing;
    app.openModal({ title: `${match.home} — ${match.away}`, kicker: 'DYNAMIC AI BRIEFING · DEMO', html: `
      <div class="truth-banner"><b>Demo analysis</b><p>This briefing is generated from the static NOVIQ test dataset. It is not an official or live match feed.</p></div>
      <div class="briefing-section"><span>CONFIRMED FACTS</span>${b.facts.map((x) => `<p>✓ ${esc(x)}</p>`).join('')}</div>
      <div class="briefing-section"><span>ANALYTICAL SIGNALS</span>${b.signals.map((x) => `<p>◎ ${esc(x)}</p>`).join('')}</div>
      <div class="briefing-section warning"><span>UNKNOWNS</span>${b.unknowns.map((x) => `<p>△ ${esc(x)}</p>`).join('')}</div>
      <div class="briefing-section"><span>WHAT CHANGED</span>${b.changes.map((x) => `<div class="brief-change"><b>${esc(x.title)}</b><i>${x.impact ? `${x.impact}%` : 'STABLE'}</i><p>${esc(x.detail)} · ${esc(x.type)}</p></div>`).join('')}</div>
      <div class="modal-actions one"><button class="primary-button" data-action="open-thesis" data-match-id="${match.id}">Create Match Thesis →</button></div>` });
  }

  function openThesis(matchId = 'mci-rma') {
    const match = app.getMatch(matchId);
    if (!match) return;
    const thesis = app.getThesis(matchId) || thesisDefaults(matchId);
    if (thesis.locked) return openLockedThesis(match, thesis);
    app.openModal({ title: 'Match Thesis V2', kicker: `${match.home} — ${match.away}`, html: formHtml(match, thesis) });
    $('#modalContent').dataset.mode = thesis.mode;
    $('#modalContent').dataset.outcome = thesis.outcome;
    $('#modalContent').dataset.sources = JSON.stringify(thesis.sources || []);
    $$('.expert-only', $('#modalContent')).forEach((node) => { node.hidden = thesis.mode === 'quick'; });
  }

  function saveDraft(matchId) {
    const thesis = readForm(matchId);
    const previous = app.getThesis(matchId);
    thesis.versions = [...(previous?.versions || [])];
    if (previous) thesis.versions.push({ savedAt: new Date().toISOString(), outcome: previous.outcome, confidence: previous.confidence, scenario: previous.scenario });
    app.setThesis(matchId, thesis);
    app.applyState();
    app.toast('Thesis draft saved');
  }

  async function reviewThesis(matchId) {
    const thesis = readForm(matchId);
    const missing = [];
    if (thesis.scenario.length < 25) missing.push('scenario');
    if (thesis.reason.length < 25) missing.push('primary reason');
    if (thesis.risk.length < 15) missing.push('main risk');
    if (thesis.changeMind.length < 12) missing.push('change trigger');
    if (thesis.mode === 'expert' && thesis.alternative.length < 20) missing.push('alternative scenario');
    if (missing.length) return app.toast(`Add: ${missing.join(', ')}`);
    app.setThesis(matchId, thesis);
    $('#modalTitle').textContent = 'AI Thesis Review V2';
    $('#modalKicker').textContent = 'ANALYSING CAUSALITY · DEMO';
    $('#modalContent').innerHTML = '<div class="loading-card"><i></i><b>NOVIQ is reviewing the decision…</b><p>Specificity, causality, evidence, risk and confidence.</p></div>';
    const review = await N.services.ai.reviewThesis(thesis);
    thesis.review = review;
    app.setThesis(matchId, thesis);
    $('#modalContent').innerHTML = `<div class="review-score-grid">${[['Specificity',review.specificity],['Causality',review.causality],['Evidence',review.evidence],['Risk',review.risk],['Calibration',review.calibration]].map(([label,value]) => `<div class="review-score"><span>${label}</span><b>${value}</b></div>`).join('')}</div>
      <div class="review-card success"><h3>Strong signal</h3><p>Your decision links a predicted game state to an explicit reason rather than only choosing a winner.</p></div>
      <div class="review-card warning"><h3>Blind spot</h3><p>${esc(review.blindSpot)}</p></div>
      <div class="review-card purple"><h3>Bias scan</h3><p>${esc(review.bias)}</p></div>
      <div class="info-card"><h3>Alternative scenario</h3><p>${esc(review.alternative)}</p></div>
      <div class="info-card"><h3>NOVIQ challenge</h3><p>${esc(review.challenge)}</p></div>
      <div class="modal-actions"><button class="secondary-button" data-action="edit-thesis" data-match-id="${matchId}">Improve Thesis</button><button class="primary-button" data-action="lock-thesis" data-match-id="${matchId}">Decision Lock →</button></div>`;
  }

  function lockThesis(matchId) {
    const thesis = app.getThesis(matchId);
    if (!thesis?.review) return app.toast('Complete AI Review first');
    thesis.locked = true;
    thesis.lockedAt = new Date().toISOString();
    app.setThesis(matchId, thesis);
    app.state.sportsIQ += 8;
    if (thesis.alternative?.length > 20) app.state.mission.progress = app.state.mission.target;
    app.save(); app.applyState();
    openLockedThesis(app.getMatch(matchId), thesis);
    app.toast('Decision locked · hidden editing disabled');
  }

  function openLockedThesis(match, thesis) {
    app.openModal({ title: 'Decision locked', kicker: `${match.home} — ${match.away}`, html: `<div class="review-card success"><h3>Immutable timestamp</h3><p>${new Date(thesis.lockedAt).toLocaleString()}</p></div>
      <div class="info-card"><h3>${esc(outcomeLabel(match, thesis.outcome))} · ${thesis.confidence}%</h3><p>${esc(thesis.scenario)}</p></div>
      <div class="info-card"><h3>Reasoning</h3><p>${esc(thesis.reason)}</p>${thesis.secondaryReason ? `<p>${esc(thesis.secondaryReason)}</p>` : ''}</div>
      <div class="info-card"><h3>Risk & falsification</h3><p>${esc(thesis.risk)}</p><p><b>Change trigger:</b> ${esc(thesis.changeMind)}</p></div>
      <div class="modal-actions one"><button class="primary-button" data-action="open-live" data-match-id="ars-bar">Open demo Live Tracking →</button></div>` });
  }

  N.thesis = { openBriefing, openThesis, saveDraft, reviewThesis, lockThesis, thesisDefaults };
})();
