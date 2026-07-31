window.NOVIQ = window.NOVIQ || {};
(() => {
  'use strict';
  const N = window.NOVIQ;
  const app = N.app;
  const $ = app.$, esc = app.escapeHtml;

  function openLive(matchId = 'ars-bar') {
    const match = app.getMatch(matchId);
    if (!match) return;
    const notes = app.state.liveNotes[matchId] || [];
    app.openModal({ title: `${match.home} ${match.score || ''} ${match.away}`, kicker: `LIVE INTELLIGENCE · DEMO · ${match.minute || ''}′`, html: `
      <div class="truth-banner"><b>Simulated live mode</b><p>Events below are static demo events for testing the interaction model.</p></div>
      <div class="live-status-card"><span>THESIS STATUS</span><b>STILL HOLDS · 72%</b><div class="live-meter"><i style="--progress:72%"></i></div><p>Two assumptions are confirmed. One structural risk is rising.</p></div>
      <div class="timeline-list">${(match.timeline || []).map((event) => `<div class="timeline-event ${event.type}"><span>${event.minute}′</span><div><b>${esc(event.title)}</b><p>${esc(event.effect)}</p></div></div>`).join('')}</div>
      <div class="form-group"><label for="liveNote">Private live observation</label><textarea class="textarea short" id="liveNote" placeholder="Record what changed without editing the original thesis."></textarea></div>
      <div class="modal-actions"><button class="secondary-button" data-action="save-live-note" data-match-id="${matchId}">Save observation</button><button class="primary-button" data-action="open-replay" data-match-id="int-bay">Open completed replay →</button></div>
      ${notes.length ? `<div class="info-card"><h3>Saved observations</h3>${notes.map((note) => `<p>• ${esc(note.text)} <small>${new Date(note.at).toLocaleTimeString()}</small></p>`).join('')}</div>` : ''}` });
  }

  function saveLiveNote(matchId) {
    const text = $('#liveNote')?.value.trim() || '';
    if (text.length < 8) return app.toast('Write a more specific observation');
    app.state.liveNotes[matchId] = [...(app.state.liveNotes[matchId] || []), { text, at: new Date().toISOString() }];
    app.save();
    openLive(matchId);
    app.toast('Live observation saved separately from Thesis');
  }

  function openReplay(matchId = 'int-bay') {
    const match = app.getMatch(matchId) || app.getMatch('int-bay');
    const completed = app.state.completedReplays.includes(matchId);
    app.openModal({ title: `${match.home} ${match.score || ''} ${match.away}`, kicker: 'DECISION REPLAY V2 · DEMO', html: `
      <div class="replay-hero"><span>OVERALL DECISION SCORE</span><strong>82</strong><p>The exact score was not predicted, but the main tactical conflict and transition scenario were identified correctly.</p></div>
      <div class="score-breakdown">${[['Thesis Quality',88],['Tactical IQ',91],['Context IQ',76],['Data IQ',78],['Risk Management',72],['Calibration',69]].map(([label,score]) => `<div class="score-row"><span>${label}</span><i><b style="width:${score}%"></b></i><strong>${score}</strong></div>`).join('')}</div>
      <div class="replay-card"><h3>Confirmed assumptions</h3><p>Inter created vertical exits after inviting Bayern into wide pressure. The expected transition space appeared repeatedly.</p></div>
      <div class="replay-card warning"><h3>Broken assumptions</h3><p>Set pieces mattered more than expected, and confidence was 11 points above the reasonable band.</p></div>
      <div class="replay-card"><h3>Foreseeable vs random</h3><p><b>Foreseeable:</b> set-piece vulnerability and the high-variance playoff context. <b>Random:</b> one deflection in the second half.</p></div>
      <div class="form-group"><label for="replayReflection">What will you do differently next time?</label><textarea class="textarea short" id="replayReflection" placeholder="Write one reusable decision rule.">${completed ? 'Reduce confidence when the thesis depends on one fragile assumption.' : ''}</textarea></div>
      <div class="modal-actions one"><button class="primary-button" data-action="complete-replay" data-match-id="${matchId}" ${completed ? 'disabled' : ''}>${completed ? 'Replay completed' : 'Save lesson · +24 IQ'}</button></div>` });
  }

  function completeReplay(matchId) {
    if (app.state.completedReplays.includes(matchId)) return;
    const reflection = $('#replayReflection')?.value.trim() || '';
    if (reflection.length < 20) return app.toast('Write one specific reusable lesson');
    app.state.completedReplays.push(matchId);
    app.state.sportsIQ += 24;
    app.state.calibration.score = Math.min(100, app.state.calibration.score + 1);
    app.state.decisions.unshift({ id: `${matchId}-${Date.now()}`, match: 'Inter — Bayern', score: 82, date: 'Today', lesson: reflection });
    app.save(); app.applyState();
    app.closeModal(); app.toast('+24 Sports IQ · Sports Memory updated');
  }

  N.live = { openLive, saveLiveNote, openReplay, completeReplay };
})();
