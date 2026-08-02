(() => {
  'use strict';
  const N=window.NOVIQ;
  const $=selector=>document.querySelector(selector);

  N.openDataStatus=()=>{
    const report=N.health.run();
    const rows=Object.entries(report.checks).map(([name,ok])=>`<div class="setting-row"><span class="setting-icon">${ok?'✓':'!'}</span><span><b>${N.util.escape(name)}</b><small>${ok?'Готово':'Требует внимания'}</small></span></div>`).join('');
    N.openModal({title:'Состояние NOVIQ',kicker:'OFFLINE PRODUCTION CHECK',html:`<div class="truth-banner"><b>${report.ok?'APP HEALTHY':'CHECK REQUIRED'}</b><p>Версия ${N.config.version}. Все основные функции работают локально и не зависят от внешних сервисов.</p></div><div class="integration-grid">${rows}</div><div class="info-card"><h3>Источник данных</h3><p>Встроенный curated dataset. Матчи и аналитические сигналы являются демонстрационными и явно обозначены.</p></div><div class="info-card"><h3>Хранение</h3><p>Основное состояние и автоматическая резервная копия находятся в браузере этого устройства. Для переноса используй экспорт.</p></div>`});
  };

  N.openAccount=()=>N.openModal({title:'Локальный профиль',kicker:'NO ACCOUNT REQUIRED',html:`<div class="account-demo-card"><span>OFFLINE PRODUCTION</span><h3>${N.util.escape(N.state.account.displayName||'Local Analyst')}</h3><p>Все возможности доступны без регистрации. Данные не отправляются на сервер.</p></div><div class="info-card"><h3>Что сохраняется</h3><p>Sports IQ, Thesis, Replay, Sports Memory, миссии, темы, язык и персональные настройки.</p></div><div class="truth-banner"><b>Контроль у пользователя</b><p>Экспортируй резервную копию перед очисткой браузера или переносом на другое устройство.</p></div>`});

  N.exportData=()=>{
    const blob=new Blob([N.storage.export()],{type:'application/json'});
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download=`noviq-${N.config.version}-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    N.state.dataControl.lastExportAt=N.util.now();N.storage.save();N.toast('Резервная копия создана');
  };

  N.importData=()=>{
    const input=document.createElement('input');input.type='file';input.accept='application/json,.json';
    input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;try{N.storage.import(await file.text());N.applyState();N.toast('Данные восстановлены');}catch(error){console.error(error);N.toast('Файл не является резервной копией NOVIQ');}});
    input.click();
  };

  const originalReset=N.resetDemo;
  N.resetDemo=()=>N.openModal({title:'Сбросить локальный прогресс?',kicker:'IRREVERSIBLE ACTION',html:`<div class="review-card warning"><h3>Сначала создай резервную копию</h3><p>Будут удалены Thesis, Replay, Sports Memory, миссии и настройки на этом устройстве.</p></div><div class="modal-actions"><button class="secondary-button" data-action="export-data">Создать копию</button><button class="primary-button" data-action="confirm-reset-v4">Сбросить</button></div>`});

  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='import-data'){event.preventDefault();N.importData();}
    if(action==='confirm-reset-v4'){event.preventDefault();N.storage.reset();N.applyState();N.closeModal();N.toast('Локальный прогресс сброшен');}
  },true);

  window.addEventListener('error',event=>{N.state.runtime.healthy=false;N.state.runtime.lastError=String(event.error?.message||event.message||'RUNTIME_ERROR').slice(0,200);N.storage.save();});
  window.addEventListener('unhandledrejection',event=>{N.state.runtime.healthy=false;N.state.runtime.lastError=String(event.reason?.message||event.reason||'PROMISE_REJECTION').slice(0,200);N.storage.save();});

  document.addEventListener('DOMContentLoaded',()=>{const report=N.health.run();N.state.runtime.healthy=report.ok;N.state.runtime.checkedAt=report.checkedAt;N.storage.save();});
})();