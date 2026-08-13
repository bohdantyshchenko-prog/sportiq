(() => {
  'use strict';
  const N=window.NOVIQ=window.NOVIQ||{};
  const runtime=window.NOVIQ_RUNTIME_CONFIG||{};
  const PREVIEW_KEY='noviq-local-preview-v1';
  let cloudMemory=[];
  let busy=false;
  const $=(s,r=document)=>r.querySelector(s);
  const esc=value=>N.util?.escape?.(value)??String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const configured=()=>Boolean(N.auth?.configured?.());
  const cloudReady=()=>Boolean(configured()&&N.api?.configured?.());
  const localPreview=()=>localStorage.getItem(PREVIEW_KEY)==='1';
  const user=()=>N.auth?.user?.()||null;
  const initials=name=>String(name||'Sports Analyst').trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'SA';
  const defaultName=()=>{const current=String(N.state?.account?.displayName||'').trim();return !current||current==='Богдан Тищенко'?'Sports Analyst':current;};
  const copy={
    ru:{welcome:'Добро пожаловать в NOVIQ',sub:'Твой спортивный интеллект, решения и память — в одном профиле.',signIn:'Войти',signUp:'Создать аккаунт',email:'Email',password:'Пароль',name:'Имя',forgot:'Забыли пароль?',recover:'Отправить ссылку восстановления',local:'Продолжить локальную beta',localNote:'Без аккаунта данные остаются только на этом устройстве.',cloudOff:'Cloud login появится после настройки Supabase.',confirm:'Проверь email и подтверди аккаунт.',invalid:'Проверь email и пароль.',profile:'Профиль аналитика',protected:'Cloud account',preview:'Local preview',synced:'Синхронизировано',notSynced:'Только на устройстве',edit:'Редактировать профиль',favorite:'Любимая команда',save:'Сохранить',memory:'Sports Memory',memoryEmpty:'Заверши Replay — здесь появятся проверенные уроки.',signOut:'Выйти',cloudDelete:'Удалить cloud-данные',deleteTitle:'Удалить данные аккаунта?',deleteBody:'Thesis, Replay, Memory и профиль в базе будут удалены. Supabase-аккаунт останется активным.',delete:'Удалить данные',cancel:'Отмена',syncNow:'Синхронизировать',syncError:'Синхронизация недоступна. Локальные данные сохранены.',accountReady:'Аккаунт готов.'},
    uk:{welcome:'Ласкаво просимо до NOVIQ',sub:'Твій спортивний інтелект, рішення та памʼять — в одному профілі.',signIn:'Увійти',signUp:'Створити акаунт',email:'Email',password:'Пароль',name:'Імʼя',forgot:'Забули пароль?',recover:'Надіслати посилання відновлення',local:'Продовжити локальну beta',localNote:'Без акаунта дані залишаються лише на цьому пристрої.',cloudOff:'Cloud login зʼявиться після налаштування Supabase.',confirm:'Перевір email і підтвердь акаунт.',invalid:'Перевір email і пароль.',profile:'Профіль аналітика',protected:'Cloud account',preview:'Local preview',synced:'Синхронізовано',notSynced:'Лише на пристрої',edit:'Редагувати профіль',favorite:'Улюблена команда',save:'Зберегти',memory:'Sports Memory',memoryEmpty:'Заверши Replay — тут зʼявляться перевірені уроки.',signOut:'Вийти',cloudDelete:'Видалити cloud-дані',deleteTitle:'Видалити дані акаунта?',deleteBody:'Thesis, Replay, Memory і профіль у базі буде видалено. Supabase-акаунт залишиться активним.',delete:'Видалити дані',cancel:'Скасувати',syncNow:'Синхронізувати',syncError:'Синхронізація недоступна. Локальні дані збережено.',accountReady:'Акаунт готовий.'},
    en:{welcome:'Welcome to NOVIQ',sub:'Your sports intelligence, decisions and memory in one profile.',signIn:'Sign in',signUp:'Create account',email:'Email',password:'Password',name:'Name',forgot:'Forgot password?',recover:'Send recovery link',local:'Continue local beta',localNote:'Without an account, data stays on this device only.',cloudOff:'Cloud login becomes available after Supabase is configured.',confirm:'Check your email to confirm the account.',invalid:'Check your email and password.',profile:'Analyst profile',protected:'Cloud account',preview:'Local preview',synced:'Synced',notSynced:'On this device',edit:'Edit profile',favorite:'Favorite team',save:'Save',memory:'Sports Memory',memoryEmpty:'Complete a Replay to build verified memory.',signOut:'Sign out',cloudDelete:'Delete cloud data',deleteTitle:'Delete account data?',deleteBody:'Thesis, Replay, Memory and the database profile will be deleted. The Supabase login remains active.',delete:'Delete data',cancel:'Cancel',syncNow:'Sync now',syncError:'Sync unavailable. Local data is safe.',accountReady:'Account ready.'}
  };
  const t=key=>(copy[N.state?.language]||copy.ru)[key]||key;

  function authMarkup(){
    const canCloud=configured();
    return `<section class="identity-gate" role="dialog" aria-modal="true" aria-labelledby="identityTitle"><div class="identity-panel"><div class="identity-brand"><span class="identity-mark">N</span><div><b>NOVIQ</b><small>SPORTS DECISION INTELLIGENCE</small></div></div><div class="identity-copy"><span class="identity-kicker">CLOSED BETA</span><h1 id="identityTitle">${esc(t('welcome'))}</h1><p>${esc(t('sub'))}</p></div>${canCloud?`<div class="identity-tabs"><button class="active" data-auth-tab="signin">${esc(t('signIn'))}</button><button data-auth-tab="signup">${esc(t('signUp'))}</button></div><form id="identityForm" data-mode="signin" novalidate><label class="identity-name" hidden>${esc(t('name'))}<input name="name" autocomplete="name" maxlength="80"></label><label>${esc(t('email'))}<input name="email" type="email" autocomplete="email" inputmode="email" required></label><label>${esc(t('password'))}<input name="password" type="password" autocomplete="current-password" minlength="8" required></label><button class="identity-primary" type="submit">${esc(t('signIn'))}</button><button class="identity-link" type="button" data-auth-recover>${esc(t('forgot'))}</button><p class="identity-status" role="status" aria-live="polite"></p></form>`:`<div class="identity-offline"><b>${esc(t('cloudOff'))}</b><p>${esc(t('localNote'))}</p></div>`}${runtime.allowLocalPreview!==false?`<button class="identity-local" data-auth-local>${esc(t('local'))}</button>`:''}</div></section>`;
  }

  function openGate(force=false){
    if($('#identityGate'))return;
    if(!force&&(N.session||localPreview()))return;
    const wrap=document.createElement('div');wrap.id='identityGate';wrap.innerHTML=authMarkup();document.body.append(wrap);document.body.classList.add('identity-locked');
    const first=$('#identityGate input,#identityGate [data-auth-local]');setTimeout(()=>first?.focus(),0);
  }
  function closeGate(){document.body.classList.remove('identity-locked');$('#identityGate')?.remove();}

  async function authSubmit(form){
    if(busy)return;busy=true;const status=$('.identity-status',form);status.textContent='';
    try{const data=new FormData(form),email=String(data.get('email')||''),password=String(data.get('password')||''),mode=form.dataset.mode;
      if(mode==='signup'){const result=await N.auth.signUp(email,password,String(data.get('name')||''));if(result.pendingConfirmation){status.textContent=t('confirm');return;}}
      else await N.auth.signIn(email,password);
      localStorage.removeItem(PREVIEW_KEY);closeGate();await afterIdentity();
    }catch(error){status.textContent=error?.code==='PASSWORD_TOO_SHORT'?t('invalid'):t('invalid');N.platform?.capture?.(error,{area:'auth'});}finally{busy=false;}
  }
  async function recover(form){const email=String(new FormData(form).get('email')||'');const status=$('.identity-status',form);try{await N.auth.recover(email);status.textContent=t('recover');}catch{status.textContent=t('invalid');}}

  function syncPayload(){
    const account=N.state.account||{};
    return {
      profile:{displayName:defaultName(),favoriteTeam:account.favoriteTeam||null,locale:N.state.language,theme:N.state.theme,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',sportsIQ:Number(N.state.sportsIQ||0)},
      matches:(N.matches||[]).map(m=>({id:m.id,tournament:m.tournament,home:m.home,away:m.away,status:m.status,startsAt:new Date().toISOString(),payload:{demo:true,signals:m.signals||[],score:m.score||null,time:m.time||null}})),
      theses:(N.state.theses||[]).map(x=>({clientId:x.id,matchId:x.matchId,scenario:x.scenario,reason:x.reason,risk:x.risk,alternative:x.alternative||undefined,confidence:Number(x.confidence||65),createdAt:x.createdAt||undefined})),
      replays:(N.state.replays||[]).map(x=>({clientId:x.id,thesisClientId:x.thesisId,reflection:x.reflection||'Reviewed decision quality.',delta:Number(x.delta||0),evidence:x.score||{},createdAt:x.completedAt||x.createdAt||undefined}))
    };
  }
  async function syncCloud(){
    if(!N.session||!cloudReady())return false;
    try{const result=await N.api.sync(syncPayload());const boot=await N.api.bootstrap();cloudMemory=Array.isArray(boot.memories)?boot.memories:[];N.state.account={...(N.state.account||{}),mode:'cloud',displayName:boot.profile?.displayName||defaultName(),favoriteTeam:boot.profile?.favoriteTeam||N.state.account?.favoriteTeam||null,email:user()?.email||boot.profile?.email||null,userId:user()?.id||boot.profile?.id||null,synced:true,cloudLastSyncAt:new Date().toISOString()};N.storage.save();N.platform?.track?.('cloud_sync',{theses:result.synced?.theses||0,replays:result.synced?.replays||0});return true;}catch(error){N.state.account={...(N.state.account||{}),mode:'cloud',email:user()?.email||null,synced:false};N.storage.save({backup:false});N.platform?.capture?.(error,{area:'cloud-sync'});return false;}
  }

  function memoryRows(){
    const local=(N.state.replays||[]).slice(-5).reverse().map(r=>({id:r.id,title:'Decision Replay',summary:r.reflection||'Decision reviewed.',confidence:Math.max(0,Math.min(100,50+Number(r.delta||0))),createdAt:r.completedAt||r.createdAt}));
    const seen=new Set(local.map(x=>x.id));return [...cloudMemory.filter(x=>!seen.has(x.sourceReplayId)),...local].slice(0,6);
  }
  function renderProfileEnhancements(){
    const screen=$('[data-screen="profile"]');if(!screen)return;
    screen.querySelector('.prelaunch-profile')?.remove();screen.querySelector('.prelaunch-memory')?.remove();
    const base=screen.querySelector('.profile-card');if(!base)return;base.hidden=true;
    const account=N.state.account||{};const cloud=Boolean(N.session);const name=defaultName();
    const profile=document.createElement('section');profile.className='prelaunch-profile';profile.innerHTML=`<div class="profile-identity"><div class="profile-avatar">${esc(initials(name))}</div><div><span class="account-pill ${cloud?'cloud':'local'}">${esc(cloud?t('protected'):t('preview'))}</span><h2>${esc(name)}</h2><p>${esc(cloud?(user()?.email||account.email||''):t('localNote'))}</p></div></div><div class="profile-score"><small>SPORTS IQ</small><strong>${esc(N.util.format(N.state.sportsIQ))}</strong><span>${esc(cloud&&account.synced?t('synced'):t('notSynced'))}</span></div><div class="profile-actions"><button data-prelaunch-edit>${esc(t('edit'))}</button>${cloud?`<button data-prelaunch-sync>${esc(t('syncNow'))}</button><button data-prelaunch-signout>${esc(t('signOut'))}</button>`:configured()?`<button data-prelaunch-signin>${esc(t('signIn'))}</button>`:''}</div>`;
    base.insertAdjacentElement('beforebegin',profile);
    const rows=memoryRows();const memory=document.createElement('section');memory.className='prelaunch-memory';memory.innerHTML=`<div class="prelaunch-head"><div><small>DECISION HISTORY</small><h3>${esc(t('memory'))}</h3></div><span>${rows.length}</span></div>${rows.length?`<div class="memory-list">${rows.map(x=>`<article><div><b>${esc(x.title||'Decision Replay')}</b><time>${esc(x.createdAt?new Date(x.createdAt).toLocaleDateString(): '')}</time></div><p>${esc(x.summary)}</p><span>${esc(x.confidence)}% confidence</span></article>`).join('')}</div>`:`<p class="memory-empty">${esc(t('memoryEmpty'))}</p>`}`;
    profile.insertAdjacentElement('afterend',memory);
  }

  function profileDialog(){
    let d=$('#prelaunchProfileDialog');if(d)return d;d=document.createElement('dialog');d.id='prelaunchProfileDialog';d.className='prelaunch-dialog';d.innerHTML=`<form><header><h2>${esc(t('edit'))}</h2><button type="button" data-close>×</button></header><label>${esc(t('name'))}<input name="displayName" maxlength="80"></label><label>${esc(t('favorite'))}<input name="favoriteTeam" maxlength="100"></label><button class="identity-primary" type="submit">${esc(t('save'))}</button><p role="status"></p></form>`;document.body.append(d);d.querySelector('[data-close]').onclick=()=>d.close();d.querySelector('form').onsubmit=async e=>{e.preventDefault();const data=new FormData(e.currentTarget),displayName=String(data.get('displayName')||'').trim(),favoriteTeam=String(data.get('favoriteTeam')||'').trim();if(!displayName)return;N.state.account={...(N.state.account||{}),displayName,favoriteTeam};N.storage.save();if(N.session&&N.api?.configured?.()){try{await N.api.updateProfile({displayName,favoriteTeam:favoriteTeam||null,locale:N.state.language,theme:N.state.theme,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',sportsIQ:Number(N.state.sportsIQ||0)});N.state.account.synced=true;N.storage.save({backup:false});}catch(error){N.platform?.capture?.(error,{area:'profile-save'});}}d.close();renderProfileEnhancements();};return d;
  }
  function editProfile(){const d=profileDialog();d.querySelector('[name="displayName"]').value=defaultName();d.querySelector('[name="favoriteTeam"]').value=N.state.account?.favoriteTeam||'';d.showModal();}
  async function deleteCloudData(){if(!N.session||!N.api?.configured?.())return;let d=$('#prelaunchDeleteDialog');if(!d){d=document.createElement('dialog');d.id='prelaunchDeleteDialog';d.className='prelaunch-dialog';d.innerHTML=`<div class="delete-copy"><h2>${esc(t('deleteTitle'))}</h2><p>${esc(t('deleteBody'))}</p><div><button data-cancel>${esc(t('cancel'))}</button><button class="danger" data-delete>${esc(t('delete'))}</button></div></div>`;document.body.append(d);d.querySelector('[data-cancel]').onclick=()=>d.close();d.querySelector('[data-delete]').onclick=async()=>{try{await N.api.deleteMyData();cloudMemory=[];N.state.account={mode:'cloud',displayName:defaultName(),email:user()?.email||null,synced:false};N.storage.save();d.close();renderProfileEnhancements();}catch(error){N.platform?.capture?.(error,{area:'delete-cloud-data'});}};}d.showModal();}

  async function afterIdentity(){
    if(N.session){N.state.account={...(N.state.account||{}),mode:'cloud',email:user()?.email||null,userId:user()?.id||null};N.storage.save({backup:false});await syncCloud();}
    else {N.state.account={...(N.state.account||{}),mode:'local',displayName:defaultName(),synced:false};N.storage.save({backup:false});}
    renderProfileEnhancements();
  }

  document.addEventListener('submit',event=>{if(event.target?.id==='identityForm'){event.preventDefault();void authSubmit(event.target);}},true);
  document.addEventListener('click',event=>{const target=event.target.closest?.('[data-auth-tab],[data-auth-local],[data-auth-recover],[data-prelaunch-edit],[data-prelaunch-sync],[data-prelaunch-signout],[data-prelaunch-signin],[data-prelaunch-delete]');if(!target)return;if(target.dataset.authTab){const form=$('#identityForm');form.dataset.mode=target.dataset.authTab;$('#identityGate [data-auth-tab="signin"]')?.classList.toggle('active',target.dataset.authTab==='signin');$('#identityGate [data-auth-tab="signup"]')?.classList.toggle('active',target.dataset.authTab==='signup');const signUp=target.dataset.authTab==='signup';$('.identity-name',form).hidden=!signUp;form.password.autocomplete=signUp?'new-password':'current-password';$('.identity-primary',form).textContent=t(signUp?'signUp':'signIn');return;}if(target.hasAttribute('data-auth-local')){localStorage.setItem(PREVIEW_KEY,'1');closeGate();void afterIdentity();return;}if(target.hasAttribute('data-auth-recover')){const form=$('#identityForm');if(form)void recover(form);return;}if(target.hasAttribute('data-prelaunch-edit'))editProfile();if(target.hasAttribute('data-prelaunch-sync'))void syncCloud().then(renderProfileEnhancements);if(target.hasAttribute('data-prelaunch-signout'))void N.auth.signOut().then(()=>{localStorage.removeItem(PREVIEW_KEY);openGate(true);renderProfileEnhancements();});if(target.hasAttribute('data-prelaunch-signin')){localStorage.removeItem(PREVIEW_KEY);openGate(true);}if(target.hasAttribute('data-prelaunch-delete'))void deleteCloudData();},true);
  window.addEventListener('noviq:auth',()=>setTimeout(()=>void afterIdentity(),0));
  document.addEventListener('click',()=>setTimeout(renderProfileEnhancements,0),true);
  window.addEventListener('DOMContentLoaded',()=>setTimeout(async()=>{if(N.state?.account?.displayName==='Богдан Тищенко'){N.state.account.displayName='Sports Analyst';N.storage.save({backup:false});}openGate(Boolean(runtime.requireAccount)&&!N.session);await afterIdentity();},0));
  N.identity={sync:syncCloud,openLogin:()=>openGate(true),deleteCloudData};
})();
