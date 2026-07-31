window.NOVIQ = window.NOVIQ || {};
(() => {
  'use strict';
  const N = window.NOVIQ;
  const app = N.app;
  const $ = app.$, esc = app.escapeHtml;

  function openCalibration() {
    app.openModal({ title: 'Confidence Lab V2', kicker: 'CALIBRATION', html: `<div class="replay-hero"><span>CALIBRATION SCORE</span><strong>${app.state.calibration.score}%</strong><p>Your 60–69% band is close to reality. The 80–89% band remains substantially overconfident.</p></div>
      <div class="calibration-table modal-table">${app.state.calibration.bins.map((bin) => `<div class="calibration-row"><span>${bin.label}</span><i><b style="width:${bin.predicted}%"></b><em style="left:${bin.actual}%"></em></i><strong>${bin.predicted}% / ${bin.actual}%</strong></div>`).join('')}</div>
      <div class="info-card"><h3>Reading the chart</h3><p>The first number is stated confidence. The second is observed success in the demo history. A smaller gap means better calibration.</p></div>
      <div class="review-card warning"><h3>Current rule</h3><p>Do not use 80%+ before lineups and key availability are confirmed.</p></div>` });
  }

  function openPattern(id) {
    const pattern = app.state.patterns.find((item) => item.id === id);
    if (!pattern) return;
    app.openModal({ title: pattern.title, kicker: 'SPORTS MEMORY V3', html: `<div class="review-card ${pattern.severity === 'strength' ? 'success' : 'warning'}"><h3>${esc(pattern.skill)} · ${pattern.confidence}% confidence</h3><p>${esc(pattern.summary)}</p></div>
      <div class="info-card"><h3>Evidence</h3><div class="evidence-row">${pattern.evidence.map((item) => `<i>${esc(item)}</i>`).join('')}</div></div>
      <div class="info-card"><h3>Action rule</h3><p>${esc(pattern.action)}</p></div>
      <div class="modal-actions"><button class="secondary-button" data-action="dispute-pattern" data-pattern="${id}">Dispute pattern</button><button class="primary-button" data-action="open-mission">Open mission</button></div>` });
  }

  function openMission() {
    const m = app.state.mission;
    app.openModal({ title: m.title, kicker: 'PERSONAL MISSION', html: `<p class="modal-copy">This mission is selected from an evidence-backed Sports Memory pattern.</p>
      <div class="mission-big-progress"><i style="--progress:${Math.min(100, m.progress / m.target * 100)}%"></i></div>
      <div class="review-score-grid"><div class="review-score"><span>Progress</span><b>${m.progress}/${m.target}</b></div><div class="review-score"><span>Reward</span><b>+12 IQ</b></div></div>
      <div class="info-card"><h3>Condition</h3><p>${esc(m.copy)}</p></div>
      <div class="modal-actions one"><button class="primary-button" data-action="open-thesis" data-match-id="mci-rma">Apply in Match Thesis →</button></div>` });
  }

  function openLesson() {
    const completed = app.state.completedLessons.includes('unknown-confidence');
    app.openModal({ title: 'Unknown conditions and confidence', kicker: 'LEARNING LOOP · 3 MIN', html: `<p class="modal-copy">Confidence should reflect uncertainty, not only the strength of the favourite.</p>
      <div class="info-card"><h3>Example</h3><p>A team can have a strong expected lineup while fatigue, tactical fit and late availability remain uncertain.</p></div>
      <div class="lesson-quiz"><h3>Best decision before lineups?</h3><button class="quiz-option" data-action="answer-lesson" data-correct="false">Raise confidence because the squad is stronger</button><button class="quiz-option" data-action="answer-lesson" data-correct="true">Keep a wider probability range until key conditions are confirmed</button><button class="quiz-option" data-action="answer-lesson" data-correct="false">Ignore lineups completely</button></div><div id="lessonFeedback"></div>
      ${completed ? '<div class="review-card success"><h3>Lesson completed</h3><p>Stored in Sports Memory.</p></div>' : ''}` });
  }

  function answerLesson(button) {
    const correct = button.dataset.correct === 'true';
    app.$$('.quiz-option', $('#modalContent')).forEach((item) => { item.disabled = true; });
    $('#lessonFeedback').innerHTML = `<div class="review-card ${correct ? 'success' : 'warning'}"><h3>${correct ? 'Correct' : 'Review the principle'}</h3><p>${correct ? 'You separated squad strength from the uncertainty around the decision.' : 'Confidence must include what is still unknown.'}</p></div>${correct ? '<div class="modal-actions one"><button class="primary-button" data-action="complete-lesson">Save lesson · +8 IQ</button></div>' : ''}`;
  }

  function completeLesson() {
    if (!app.state.completedLessons.includes('unknown-confidence')) {
      app.state.completedLessons.push('unknown-confidence');
      app.state.sportsIQ += 8;
      app.state.skills.learning.score = Math.min(99, app.state.skills.learning.score + 1);
      app.save(); app.applyState();
    }
    app.closeModal(); app.toast('+8 Sports IQ · lesson saved');
  }

  function openWeeklyReport() {
    app.openModal({ title: 'Weekly Intelligence Report V2', kicker: 'YOUR WEEK', html: `<div class="replay-hero"><span>WEEKLY SPORTS IQ</span><strong>+86</strong><p>You became more accurate in match scenarios, but not more cautious when information was incomplete.</p></div>
      <div class="weekly-report-grid"><div><span>Completed loops</span><b>4</b></div><div><span>Scenario quality</span><b>+9%</b></div><div><span>Calibration</span><b>−2%</b></div><div><span>New patterns</span><b>1</b></div></div>
      <div class="review-card success"><h3>Best decision</h3><p>Arsenal — Barcelona: the half-space scenario was specific and falsifiable.</p></div>
      <div class="review-card warning"><h3>Most useful mistake</h3><p>Inter — Bayern: set-piece risk was available before the match but underweighted.</p></div>
      <div class="info-card"><h3>Next week</h3><p>Complete one thesis with an explicit alternative scenario and stay below 75% confidence until lineups are confirmed.</p></div>` });
  }

  function openRecommendations() {
    app.openModal({ title: 'Why these recommendations?', kicker: 'RECOMMENDATION ENGINE V1', html: N.demo.recommendations.map((item) => `<div class="info-card"><h3>${esc(item.title)}</h3><p>${esc(item.reason)}</p></div>`).join('') + '<div class="truth-banner"><b>Explainable selection</b><p>Recommendations use favourite teams, active patterns, weak skills and unfinished loops. No paid placement is used in this demo.</p></div>' });
  }

  function openRecommendation(type) {
    if (type === 'match') {
      const match = app.getMatch('pol-dyn');
      app.openModal({ title: `${match.home} — ${match.away}`, kicker: 'PERSONAL RECOMMENDATION', html: `<div class="info-card"><h3>Why this match</h3><p>It trains Context IQ without the extreme uncertainty of a knockout game and matches your local interests.</p></div><div class="info-card"><h3>Focus</h3><p>Separate emotional preference from evidence about calendar, roles and match state.</p></div><div class="modal-actions one"><button class="primary-button" data-action="open-thesis" data-match-id="pol-dyn">Create Thesis →</button></div>` });
    }
  }

  function openSkill(key) {
    const skill = app.state.skills[key];
    if (!skill) return;
    app.openModal({ title: skill.label, kicker: 'SKILL EVIDENCE', html: `<div class="replay-hero"><span>${esc(skill.label.toUpperCase())}</span><strong>${skill.score}</strong><p>Evidence confidence ${skill.trust}%. The score is not treated as fully stable until more decisions exist across different match types.</p></div><div class="info-card"><h3>Latest evidence</h3><p>Inter — Bayern Decision Replay connected the pre-match thesis, actual match scenario and post-match lesson.</p></div><div class="review-card warning"><h3>Limitation</h3><p>This prototype uses demo decisions. Real confidence requires server-stored, timestamped decisions.</p></div>` });
  }

  N.intelligence = { openCalibration, openPattern, openMission, openLesson, answerLesson, completeLesson, openWeeklyReport, openRecommendations, openRecommendation, openSkill };
})();
