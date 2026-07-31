window.NOVIQ = window.NOVIQ || {};
window.NOVIQ.demo = {
  matches: [
    {
      id: 'mci-rma', bucket: ['for-you', 'thesis'], date: 'today', status: 'upcoming', minute: null,
      tournament: 'Champions League · Demo fixture', kickoff: '21:45', intelligence: 94,
      home: 'Manchester City', away: 'Real Madrid', homeCode: 'MCI', awayCode: 'RMA',
      homeStyle: 'Control & overloads', awayStyle: 'Transitions & depth',
      score: null, favorite: true,
      signals: ['68% territorial-control signal', 'High transition risk', 'Lineup uncertainty'],
      briefing: {
        updatedAt: 'Demo snapshot',
        facts: [
          'This fixture is a fictional demonstration used to test the NOVIQ decision loop.',
          'No live provider or official lineup feed is connected in this build.'
        ],
        signals: [
          'City control is most valuable when possession reaches the half-spaces rather than remaining sterile.',
          'Madrid’s first forward pass after recovery is the key transition signal.'
        ],
        unknowns: ['Final starting lineups', 'Late fitness decisions', 'Actual weather and pitch conditions'],
        changes: [
          { title: 'Possible midfield rotation', impact: -4, type: 'Analyst inference', detail: 'Could reduce the stability of territorial control.' },
          { title: 'Transition scenario remains central', impact: 0, type: 'Stable signal', detail: 'The quality of the first pass after recovery matters more than total possession.' }
        ]
      }
    },
    {
      id: 'ars-bar', bucket: ['for-you', 'live'], date: 'today', status: 'live', minute: 67,
      tournament: 'Champions League · Demo live', kickoff: '20:00', intelligence: 89,
      home: 'Arsenal', away: 'Barcelona', homeCode: 'ARS', awayCode: 'BAR',
      homeStyle: 'Half-space pressure', awayStyle: 'Positional circulation',
      score: '1–1', favorite: false,
      signals: ['Thesis holds 72%', 'Right-side risk rising', '2 assumptions confirmed'],
      timeline: [
        { minute: 8, type: 'signal', title: 'Arsenal entered the left half-space repeatedly', effect: 'Supports the territorial-control thesis.' },
        { minute: 24, type: 'goal', title: 'Arsenal goal · demo event', effect: 'Outcome improved, but the underlying reason still needs validation.' },
        { minute: 39, type: 'warning', title: 'Barcelona found transition space twice', effect: 'Main risk became visible.' },
        { minute: 52, type: 'goal', title: 'Barcelona equalised · demo event', effect: 'The risk affected the score.' },
        { minute: 63, type: 'change', title: 'Right-back substitution', effect: 'Raises uncertainty on Arsenal’s defensive rest structure.' }
      ]
    },
    {
      id: 'int-bay', bucket: ['for-you', 'replay'], date: 'yesterday', status: 'finished', minute: null,
      tournament: 'Champions League · Historical demo', kickoff: 'FT', intelligence: 91,
      home: 'Inter', away: 'Bayern', homeCode: 'INT', awayCode: 'BAY',
      homeStyle: 'Compact transitions', awayStyle: 'High territorial pressure',
      score: '2–1', favorite: false,
      signals: ['Replay ready', 'Tactical thesis strong', 'Confidence overestimated']
    },
    {
      id: 'pol-dyn', bucket: ['for-you', 'favorites', 'thesis'], date: 'tomorrow', status: 'upcoming', minute: null,
      tournament: 'Ukraine · Demo fixture', kickoff: '17:00', intelligence: 86,
      home: 'Polissya', away: 'Dynamo Kyiv', homeCode: 'POL', awayCode: 'DKY',
      homeStyle: 'Direct vertical attacks', awayStyle: 'Positional control',
      score: null, favorite: true,
      signals: ['Local relevance', 'Context IQ training', 'Balanced uncertainty']
    },
    {
      id: 'psg-liv', bucket: ['favorites'], date: 'week', status: 'upcoming', minute: null,
      tournament: 'Club World Cup · Demo fixture', kickoff: '19:00', intelligence: 82,
      home: 'PSG', away: 'Liverpool', homeCode: 'PSG', awayCode: 'LIV',
      homeStyle: 'Individual progression', awayStyle: 'Pressing & transitions',
      score: null, favorite: false,
      signals: ['Data IQ training', 'Press resistance', 'High-variance match']
    }
  ],
  patterns: [
    {
      id: 'lineup-bias', icon: '△', title: 'Lineup bias', skill: 'Decision IQ', severity: 'warning', confidence: 78,
      summary: 'A strong announced lineup raises your confidence about 11 points more than the wider context justifies.',
      evidence: ['Inter — Bayern', 'PSG — Liverpool', 'Arsenal — Barcelona'],
      action: 'Before raising confidence, name one non-lineup factor that can still break the thesis.'
    },
    {
      id: 'transition-reader', icon: '◎', title: 'Transition reader', skill: 'Tactical IQ', severity: 'strength', confidence: 84,
      summary: 'You identify transition danger earlier and more consistently than your other tactical signals.',
      evidence: ['Arsenal — Barcelona', 'Manchester City — Real Madrid'],
      action: 'Convert this strength into a falsifiable pre-match trigger.'
    },
    {
      id: 'playoff-uncertainty', icon: '◇', title: 'Playoff uncertainty', skill: 'Context IQ', severity: 'warning', confidence: 66,
      summary: 'Your confidence calibration is weaker in high-stakes knockout matches.',
      evidence: ['9 archived demo decisions'],
      action: 'Reduce confidence when the scenario depends on one fragile assumption.'
    }
  ],
  recommendations: [
    { id: 'rec-pol-dyn', type: 'match', title: 'Polissya — Dynamo Kyiv', label: 'MATCH · TOMORROW', reason: 'Selected to train Context IQ in a locally relevant, balanced match.', action: 'open-match-card', matchId: 'pol-dyn' },
    { id: 'rec-old-replay', type: 'memory', title: 'Revisit Inter — Bayern', label: 'SPORTS MEMORY', reason: 'The old mistake closely matches your current lineup-bias pattern.', action: 'open-replay', matchId: 'int-bay' },
    { id: 'rec-lesson', type: 'lesson', title: 'Unknown lineups and confidence', label: 'MICRO LESSON · 3 MIN', reason: 'Your 80%+ confidence band remains materially overconfident.', action: 'open-lesson' }
  ],
  skills: {
    tactical: { label: 'Tactical IQ', score: 89, trust: 82, delta: 3 },
    context: { label: 'Context IQ', score: 74, trust: 69, delta: 1 },
    data: { label: 'Data IQ', score: 78, trust: 72, delta: 2 },
    decision: { label: 'Decision IQ', score: 81, trust: 77, delta: -1 },
    learning: { label: 'Learning IQ', score: 86, trust: 80, delta: 4 }
  },
  calibrationBins: [
    { label: '50–59%', predicted: 55, actual: 58 },
    { label: '60–69%', predicted: 65, actual: 67 },
    { label: '70–79%', predicted: 75, actual: 69 },
    { label: '80–89%', predicted: 85, actual: 68 }
  ],
  decisions: [
    { id: 'int-bay', match: 'Inter — Bayern', score: 82, date: '29 Jul', lesson: 'Strong tactical scenario; standards and confidence were misjudged.' },
    { id: 'psg-liv-old', match: 'PSG — Liverpool', score: 76, date: '26 Jul', lesson: 'Context was useful; the set-piece risk was missing.' },
    { id: 'ars-bar-old', match: 'Arsenal — Barcelona', score: 88, date: '22 Jul', lesson: 'Best tactical breakdown of the month.' }
  ]
};
