(() => {
  'use strict';
  const N=window.NOVIQ;
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  N.$=$; N.$$=$$; N.state=N.storage.load(); N.ui={toastTimer:null,filter:N.state.activeFilter||'for-you',date:N.state.activeDate||'today',search:'',activeMatch:'mci-rma'};
  N.openModal=({title,kicker='NOVIQ 1.2',html})=>{ $('#modalTitle').textContent=title;$('#modalKicker').textContent=kicker;$('#modalContent').innerHTML=html;$('#modalLayer').classList.add('open');$('#modalLayer').setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>$('#modalContent button,#modalContent input,#modalContent textarea')?.focus({preventScroll:true}),220);};
  N.closeModal=()=>{$('#modalLayer').classList.remove('open');$('#modalLayer').setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');};
  N.toast=message=>{const t=$('#toast');clearTimeout(N.ui.toastTimer);t.textContent=message;t.classList.add('show');N.ui.toastTimer=setTimeout(()=>t.classList.remove('show'),2100);if(navigator.vibrate)navigator.vibrate(8);};
  N.navigate=page=>{$$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav===page));const sc=$(`.page[data-page="${page}"] .page-scroll`);if(sc)sc.scrollTop=0;};
  N.save=()=>N.storage.save();
  N.skillName=k=>({tactical:'Tactical IQ',context:'Context IQ',data:'Data IQ',decision:'Decision IQ',learning:'Learning IQ'})[k]||k;
  N.renderHome=()=>{
    $('#sportsIqValue').textContent=N.util.format(N.state.sportsIQ);$('#profileIQ').textContent=N.util.format(N.state.sportsIQ);$('#profileLoops').textContent=N.state.completedLoops;$('#profileCalibration').textContent=`${N.state.calibration.score}%`;$('#calibrationValue').textContent=`${N.state.calibration.score}%`;
    const dict=N.i18n[N.state.language]||N.i18n.ru;$$('[data-i18n]').forEach(el=>{if(dict[el.dataset.i18n])el.textContent=dict[el.dataset.i18n];});
    const featured=N.matches.find(m=>m.id==='mci-rma');
    $('#featuredSignals').innerHTML=featured.signals.map(s=>`<span><i>${s[0]}</i>${s[1]}</span>`).join('');
    $('#homeMemoryCards').innerHTML=N.state.patterns.slice(0,3).map(p=>`<button class="memory-card pressable" data-action="open-pattern" data-pattern="${p.id}"><span>${p.icon}</span><small>${p.skill}</small><b>${p.title}</b><p>${N.util.escape(p.summary)}</p><i>${p.confidence}% trust</i></button>`).join('');
    $('#recommendationRail').innerHTML=N.recommendations.map(r=>`<button class="recommendation-card pressable" data-action="open-recommendation" data-recommendation="${r.id}"><span>${r.type} · ${r.score}</span><b>${r.title}</b><p>${r.copy}</p><i>→</i></button>`).join('');
    $('#miniCalibrationChart').innerHTML=N.state.calibration.history.map(v=>`<i style="height:${v}%"></i>`).join('');
    const locale=N.state.language==='en'?'en-US':N.state.language==='ua'?'uk-UA':'ru-RU';
    const now=new Date();
    $('#todayLabel').textContent=new Intl.DateTimeFormat(locale,{weekday:'short',day:'numeric',month:'short'}).format(now).toUpperCase();
    const dateButtons=N.$$('#dateStrip [data-date]');
    const offsets={yesterday:-1,today:0,tomorrow:1};
    dateButtons.forEach(btn=>{const key=btn.dataset.date;if(!(key in offsets))return;const d=new Date(now);d.setDate(now.getDate()+offsets[key]);const small=btn.querySelector('small'),big=btn.querySelector('b');if(small)small.textContent=new Intl.DateTimeFormat('en-US',{weekday:'short'}).format(d).toUpperCase();if(big)big.textContent=String(d.getDate());});
  };
  N.renderMatches=()=>{
    const query=N.ui.search.toLowerCase();
    const visible=N.matches.filter(m=>(N.ui.date==='week'||m.date===N.ui.date)&&m.groups.includes(N.ui.filter)&&(!query||`${m.home} ${m.away} ${m.tournament}`.toLowerCase().includes(query)));
    $('#matchList').innerHTML=visible.length?visible.map(m=>`<article class="match-list-card pressable" data-action="open-match-card" data-match-id="${m.id}"><div class="match-list-top"><span>${m.tournament}</span><span>IQ VALUE ${m.intelligence}</span></div><div class="match-list-teams"><div class="match-list-team"><span class="mini-crest">${m.hc}</span><span><b>${m.home}</b><small>${m.homeStyle}</small></span></div><div class="match-list-center"><b>${m.score||m.time}</b><small>${m.status}</small></div><div class="match-list-team away"><span><b>${m.away}</b><small>${m.awayStyle}</small></span><span class="mini-crest">${m.ac}</span></div></div><div class="match-list-footer"><span>${m.groups.includes('live')?'Live intelligence active':m.groups.includes('replay')?'Replay ready':'Briefing available'}</span><button data-action="open-match-card" data-match-id="${m.id}">Open →</button></div></article>`).join(''):`<div class="empty-state"><b>Матчи не найдены</b><p>Измени дату, фильтр или поисковый запрос.</p></div>`;
  };
  N.renderIntelligence=()=>{
    $('#skillDashboard').innerHTML=Object.entries(N.state.skills).map(([k,v])=>`<button class="skill-card pressable" data-action="open-skill" data-skill="${k}"><span>${N.skillName(k)}</span><b>${v}</b><i style="--progress:${v}%"></i><small>Evidence confidence ${N.state.skillTrust[k]}%</small></button>`).join('');
    $('#trendChart').innerHTML=[62,67,65,72,74,79,83,86].map((v,i)=>`<i style="height:${v}%"><span>${i===7?N.util.format(N.state.sportsIQ):''}</span></i>`).join('');
    $('#calibrationTable').innerHTML=N.state.calibration.bins.map(b=>`<div class="calibration-row"><span>${b.label}</span><i><b style="width:${b.actual}%"></b></i><strong>${b.actual}%</strong><small>expected ${b.predicted}%</small></div>`).join('');
    $('#patternList').innerHTML=N.state.patterns.map(p=>`<button class="pattern-card pressable" data-action="open-pattern" data-pattern="${p.id}"><span class="pattern-icon">${p.icon}</span><span><b>${p.title}</b><small>${N.util.escape(p.summary)}</small></span><i>${p.confidence}%</i></button>`).join('');
    const thesis=N.state.thesis?[{id:'current-thesis',match:'Manchester City — Real Madrid',score:N.state.thesis.locked?'LOCK':'DRAFT',date:'Today',lesson:N.state.thesis.reason||'Thesis сохранён'}]:[];
    $('#decisionList').innerHTML=[...thesis,...N.state.decisions].map(d=>`<button class="decision-card pressable" data-action="open-decision" data-decision="${d.id}"><div><b>${d.match}</b><small>${d.date}</small><p>${N.util.escape(d.lesson)}</p></div><span>${d.score}</span></button>`).join('');
  };
  N.applyState=()=>{
    document.documentElement.dataset.theme=N.state.theme;document.documentElement.lang=N.state.language==='ua'?'uk':N.state.language;$('#currentTheme').textContent=N.state.theme==='dark'?'Dark Elite':'Light Elite';$('#currentLanguage').textContent=N.state.language==='ru'?'Русский':N.state.language==='ua'?'Українська':'English';$('#favoritesSummary').textContent=[...N.state.favorites.teams,...N.state.favorites.tournaments].join(' · ');N.renderHome();N.renderMatches();N.renderIntelligence();
  };
  N.openMatchCard=id=>{const m=N.matches.find(x=>x.id===id);if(!m)return;N.ui.activeMatch=id;N.openModal({title:`${m.home} — ${m.away}`,kicker:`${m.tournament} · INTELLIGENCE ${m.intelligence}`,html:`<div class="match-main modal-match"><div class="team"><span class="crest">${m.hc}</span><b>${m.home}</b></div><div class="match-center"><span>${m.status}</span><b>${m.score||m.time}</b><small>${m.date}</small></div><div class="team"><span class="crest">${m.ac}</span><b>${m.away}</b></div></div><div class="match-signals">${m.signals.map(s=>`<span><i>${s[0]}</i>${s[1]}</span>`).join('')}</div><div class="info-card"><h3>Почему матч выбран</h3><p>${id==='pol-dyn'?'Локальный интерес и проверка твоего паттерна переоценки фаворитов.':'Матч имеет высокую аналитическую ценность для текущего профиля.'}</p></div><div class="modal-actions"><button class="secondary-button" data-action="open-briefing" data-match-id="${id}">AI Briefing</button><button class="primary-button" data-action="${m.groups.includes('live')?'open-live':m.groups.includes('replay')?'open-replay':'open-thesis'}" data-match-id="${id}">${m.groups.includes('live')?'Live Tracking':m.groups.includes('replay')?'Decision Replay':'Create Thesis'}</button></div>`});};
  N.applyState(); N.pwa.init();
})();
