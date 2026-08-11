(() => {
  'use strict';

  const N = window.NOVIQ = window.NOVIQ || {};
  const FEEDBACK_KEY = 'noviq-mvp-feedback';
  const METRICS_KEY = 'noviq-mvp-metrics';
  const REPORT_VERSION = 1;

  const copy = {
    ru: { beta:'Закрытая beta', mission:'Цель на сегодня', missionText:'Заверши один полный цикл Briefing → Thesis → Replay.', missionDone:'Сегодняшний intelligence-цикл завершён.', briefingStep:'Briefing', thesisStep:'Thesis', replayStep:'Replay', feedback:'Оставить отзыв', exportReport:'Экспорт beta-отчёта', about:'О NOVIQ', privacy:'Конфиденциальность', terms:'Условия', title:'Помоги улучшить NOVIQ', value:'Насколько понятна ценность приложения?', return:'Открыл бы ты NOVIQ завтра?', problem:'Что было непонятно или раздражало?', send:'Сохранить отзыв', thanks:'Отзыв сохранён на этом устройстве.', close:'Закрыть', yes:'Да', maybe:'Возможно', no:'Нет', sessions:'Сессии', activeDays:'Активные дни', feedbackCount:'Отзывы', localOnly:'Данные beta остаются на устройстве до ручного экспорта.' },
    uk: { beta:'Закрита beta', mission:'Ціль на сьогодні', missionText:'Заверши один повний цикл Briefing → Thesis → Replay.', missionDone:'Сьогоднішній intelligence-цикл завершено.', briefingStep:'Briefing', thesisStep:'Thesis', replayStep:'Replay', feedback:'Залишити відгук', exportReport:'Експорт beta-звіту', about:'Про NOVIQ', privacy:'Конфіденційність', terms:'Умови', title:'Допоможи покращити NOVIQ', value:'Наскільки зрозуміла цінність застосунку?', return:'Чи відкрив би ти NOVIQ завтра?', problem:'Що було незрозумілим або дратувало?', send:'Зберегти відгук', thanks:'Відгук збережено на цьому пристрої.', close:'Закрити', yes:'Так', maybe:'Можливо', no:'Ні', sessions:'Сесії', activeDays:'Активні дні', feedbackCount:'Відгуки', localOnly:'Beta-дані залишаються на пристрої до ручного експорту.' },
    en: { beta:'Closed beta', mission:"Today's goal", missionText:'Complete one full Briefing → Thesis → Replay loop.', missionDone:"Today's intelligence loop is complete.", briefingStep:'Briefing', thesisStep:'Thesis', replayStep:'Replay', feedback:'Leave feedback', exportReport:'Export beta report', about:'About NOVIQ', privacy:'Privacy', terms:'Terms', title:'Help improve NOVIQ', value:'How clear is the product value?', return:'Would you open NOVIQ tomorrow?', problem:'What felt unclear or frustrating?', send:'Save feedback', thanks:'Feedback saved on this device.', close:'Close', yes:'Yes', maybe:'Maybe', no:'No', sessions:'Sessions', activeDays:'Active days', feedbackCount:'Feedback', localOnly:'Beta data stays on this device until you export it manually.' }
  };

  const lang = () => N.state?.language || 'ru';
  const t = key => (copy[lang()] || copy.ru)[key] || key;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
  const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const writeJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  const today = () => new Date().toISOString().slice(0, 10);
  const now = () => new Date().toISOString();

  const feedbackRows = () => { const rows = readJson(FEEDBACK_KEY, []); return Array.isArray(rows) ? rows.slice(-50) : []; };

  function loadMetrics() {
    const raw = readJson(METRICS_KEY, {});
    return {
      version: REPORT_VERSION,
      firstSeenAt: raw.firstSeenAt || now(),
      lastSeenAt: raw.lastSeenAt || now(),
      sessions: Number(raw.sessions || 0),
      activeDays: Array.isArray(raw.activeDays) ? raw.activeDays.slice(-90) : [],
      briefingDays: Array.isArray(raw.briefingDays) ? raw.briefingDays.slice(-90) : [],
      thesisDays: Array.isArray(raw.thesisDays) ? raw.thesisDays.slice(-90) : [],
      replayDays: Array.isArray(raw.replayDays) ? raw.replayDays.slice(-90) : [],
      firstLoopAt: raw.firstLoopAt || null,
      lastLoopAt: raw.lastLoopAt || null
    };
  }

  let metrics = loadMetrics();
  function persistMetrics() { metrics.lastSeenAt = now(); writeJson(METRICS_KEY, metrics); }
  function markDay(field) { const day=today(); const values=Array.isArray(metrics[field])?metrics[field]:[]; if(!values.includes(day)) values.push(day); metrics[field]=values.slice(-90); persistMetrics(); }
  function beginSession() { metrics.sessions += 1; markDay('activeDays'); N.platform?.track?.('beta_session_started',{sessions:metrics.sessions,activeDays:metrics.activeDays.length}); }
  function saveFeedback(item) { const rows=feedbackRows(); rows.push(item); writeJson(FEEDBACK_KEY,rows.slice(-50)); }
  function loopProgress() { const day=today(); return { briefing:metrics.briefingDays.includes(day), thesis:metrics.thesisDays.includes(day), replay:metrics.replayDays.includes(day) }; }
  function markProductProgress(action) {
    if(action==='briefing') markDay('briefingDays');
    if(action==='thesis') markDay('thesisDays');
    if(action==='replay'){ markDay('replayDays'); metrics.firstLoopAt ||= now(); metrics.lastLoopAt=now(); persistMetrics(); }
  }

  function addMission() {
    const home=document.querySelector('[data-screen="home"]'); if(!home)return;
    home.querySelector('.mvp-mission')?.remove();
    const hero=home.querySelector('.hero'); if(!hero)return;
    const progress=loopProgress(); const complete=progress.briefing&&progress.thesis&&progress.replay;
    const card=document.createElement('section'); card.className=`mvp-mission${complete?' complete':''}`;
    card.innerHTML=`<div><span class="mvp-badge">${escapeHtml(t('beta'))}</span><h2>${escapeHtml(t('mission'))}</h2><p>${escapeHtml(complete?t('missionDone'):t('missionText'))}</p></div><div class="mvp-progress" aria-label="${escapeHtml(t('mission'))}">${[['briefing',t('briefingStep')],['thesis',t('thesisStep')],['replay',t('replayStep')]].map(([key,label])=>`<span class="mvp-progress-step ${progress[key]?'done':''}" title="${escapeHtml(label)}"><i aria-hidden="true"></i><b>${escapeHtml(label)}</b></span>`).join('')}</div>`;
    hero.insertAdjacentElement('afterend',card);
  }

  function betaSummaryMarkup(){ return `<section class="mvp-beta-summary" aria-label="${escapeHtml(t('beta'))}"><div><small>${escapeHtml(t('sessions'))}</small><strong>${metrics.sessions}</strong></div><div><small>${escapeHtml(t('activeDays'))}</small><strong>${metrics.activeDays.length}</strong></div><div><small>${escapeHtml(t('feedbackCount'))}</small><strong>${feedbackRows().length}</strong></div><p>${escapeHtml(t('localOnly'))}</p></section>`; }

  function addProfileLinks() {
    const screen=document.querySelector('[data-screen="profile"]'); const settings=screen?.querySelector('.settings'); if(!screen||!settings)return;
    screen.querySelector('.mvp-beta-summary')?.remove(); settings.insertAdjacentHTML('beforebegin',betaSummaryMarkup());
    settings.querySelectorAll('[data-mvp-control],.mvp-setting-link').forEach(node=>node.remove());
    const controls=[
      {key:'feedback',label:t('feedback'),action:openFeedback,suffix:'↗'},
      {key:'export-report',label:t('exportReport'),action:exportBetaReport,suffix:'JSON'}
    ];
    for(const control of controls){ const button=document.createElement('button'); button.dataset.mvpControl='true'; button.dataset.mvpAction=control.key; button.innerHTML=`${escapeHtml(control.label)}<b>${escapeHtml(control.suffix)}</b>`; button.addEventListener('click',control.action); settings.append(button); }
    for(const [label,href] of [[t('about'),'about.html'],[t('privacy'),'privacy.html'],[t('terms'),'terms.html']]){ const a=document.createElement('a'); a.className='mvp-setting-link'; a.href=href; a.textContent=label; a.target='_blank'; a.rel='noopener'; settings.append(a); }
  }

  function syncBrand(){ const version=document.querySelector('.brand span'); if(version)version.textContent='6 MVP'; }

  function buildReport() {
    const platform=N.platform?.snapshot?.()||null; const state=N.state||{};
    return {
      reportVersion:REPORT_VERSION, generatedAt:now(), release:N.platform?.release||{version:'6.0.0'},
      beta:{ metrics:{...metrics,activeDays:[...metrics.activeDays],briefingDays:[...metrics.briefingDays],thesisDays:[...metrics.thesisDays],replayDays:[...metrics.replayDays]}, feedback:feedbackRows() },
      product:{ sportsIQ:state.sportsIQ??null, completedLoops:state.completedLoops??null, theses:Array.isArray(state.theses)?state.theses.length:0, replays:Array.isArray(state.replays)?state.replays.length:0, language:state.language||null, theme:state.theme||null },
      diagnostics:platform?{eventCount:platform.events?.length||0,errorCount:platform.errors?.length||0,errors:platform.errors||[]}:null
    };
  }

  function downloadJson(filename,value){ const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),600); }
  function exportBetaReport(){ downloadJson(`noviq-beta-report-${today()}.json`,buildReport()); N.platform?.track?.('beta_report_exported',{feedback:feedbackRows().length,activeDays:metrics.activeDays.length}); }

  function openFeedback() {
    let dialog=document.getElementById('mvpFeedbackDialog');
    if(!dialog){
      dialog=document.createElement('dialog'); dialog.id='mvpFeedbackDialog'; dialog.className='mvp-dialog'; dialog.setAttribute('aria-labelledby','mvpFeedbackTitle');
      dialog.innerHTML=`<form id="mvpFeedbackForm"><header><h2 id="mvpFeedbackTitle">${escapeHtml(t('title'))}</h2><button type="button" data-close aria-label="${escapeHtml(t('close'))}">×</button></header><label>${escapeHtml(t('value'))}<input name="value" type="range" min="1" max="5" value="4"><output>4/5</output></label><fieldset><legend>${escapeHtml(t('return'))}</legend>${[['yes',t('yes')],['maybe',t('maybe')],['no',t('no')]].map(([v,l])=>`<label class="choice"><input type="radio" name="returnIntent" value="${v}" ${v==='yes'?'checked':''}>${escapeHtml(l)}</label>`).join('')}</fieldset><label>${escapeHtml(t('problem'))}<textarea name="problem" maxlength="700"></textarea></label><button class="primary wide" type="submit">${escapeHtml(t('send'))}</button><p id="mvpFeedbackStatus" role="status" aria-live="polite"></p></form>`;
      document.body.append(dialog);
      const form=dialog.querySelector('form'); const range=form.querySelector('input[type="range"]');
      range.addEventListener('input',()=>form.querySelector('output').textContent=`${range.value}/5`); dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
      form.addEventListener('submit',event=>{ event.preventDefault(); const data=new FormData(form); const score=Number(data.get('value')); const returnIntent=data.get('returnIntent'); saveFeedback({value:score,returnIntent,problem:String(data.get('problem')||'').trim(),at:now(),release:N.platform?.release?.version||'6.0.0',activeDays:metrics.activeDays.length,completedLoops:N.state?.completedLoops||0}); N.platform?.track?.('beta_feedback_saved',{score,returnIntent}); const status=form.querySelector('#mvpFeedbackStatus'); status.textContent=t('thanks'); addProfileLinks(); setTimeout(()=>{dialog.close();status.textContent='';form.reset();form.querySelector('output').textContent='4/5';},900); });
    }
    dialog.showModal();
  }

  function inferProgressFromClick(event) {
    const target=event.target.closest?.('[data-action],[data-testid]'); if(!target)return;
    const action=target.dataset.action||target.dataset.testid||'';
    if(action==='briefing') markProductProgress('briefing');
    if(action==='continue'&&N.state?.diagnostic?.completed&&!N.state?.activeThesisId) markProductProgress('briefing');
    if(action==='save-thesis'){ const before=N.state?.theses?.length||0; setTimeout(()=>{ if((N.state?.theses?.length||0)>before){markProductProgress('thesis');addMission();} },0); }
    if(action==='complete-replay'){ const before=N.state?.replays?.length||0; setTimeout(()=>{ if((N.state?.replays?.length||0)>before){markProductProgress('replay');addMission();} },0); }
  }

  function refresh(){ syncBrand(); addMission(); addProfileLinks(); }

  beginSession();
  window.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,0));
  document.addEventListener('click',event=>{ inferProgressFromClick(event); setTimeout(refresh,0); },true);
  window.addEventListener('noviq:language-changed',refresh);
  window.addEventListener('pagehide',persistMetrics);

  N.beta={ feedback:feedbackRows, metrics:()=>({...metrics}), report:buildReport, refresh };
})();
