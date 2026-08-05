(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const RELEASE = Object.freeze({ version:'6.0.0', channel:'offline-production', schema:'5.2-compatible', buildDate:'2026-08-05' });
  const FLAGS = Object.freeze({ weeklyReport:true, decisionMemory:true, localTelemetry:true, crashRecovery:true, installPrompt:true });
  const MAX_EVENTS = 200;
  const MAX_ERRORS = 50;
  const key = 'noviq-v6-platform';
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
  const write = value => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  const state = { release:RELEASE, flags:FLAGS, sessionId:crypto.randomUUID?.() || `session-${Date.now()}`, startedAt:new Date().toISOString(), events:[], errors:[], ...read() };
  state.release = RELEASE;
  state.flags = FLAGS;
  state.events = Array.isArray(state.events) ? state.events.slice(-MAX_EVENTS) : [];
  state.errors = Array.isArray(state.errors) ? state.errors.slice(-MAX_ERRORS) : [];
  const persist = () => write({ ...state, events:state.events.slice(-MAX_EVENTS), errors:state.errors.slice(-MAX_ERRORS) });
  const redact = value => String(value ?? '').replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[email]').slice(0,500);
  N.platform = {
    release:RELEASE,
    flags:FLAGS,
    enabled:name=>Boolean(FLAGS[name]),
    track(name,properties={}){
      const event={ id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`, name:redact(name), properties:Object.fromEntries(Object.entries(properties).map(([k,v])=>[k,typeof v==='string'?redact(v):v])), at:new Date().toISOString(), sessionId:state.sessionId };
      state.events.push(event);
      persist();
      window.dispatchEvent(new CustomEvent('noviq:telemetry',{detail:event}));
      return event;
    },
    capture(error,context={}){
      const item={ message:redact(error?.message||error), stack:redact(error?.stack||''), context, at:new Date().toISOString(), sessionId:state.sessionId };
      state.errors.push(item);
      persist();
      return item;
    },
    snapshot(){ return structuredClone({ release:RELEASE, flags:FLAGS, startedAt:state.startedAt, events:state.events, errors:state.errors }); },
    clearDiagnostics(){ state.events=[]; state.errors=[]; persist(); },
    mark(name){ performance.mark(`noviq:${name}`); },
    measure(name,start,end){ try { performance.measure(`noviq:${name}`,`noviq:${start}`,`noviq:${end}`); return performance.getEntriesByName(`noviq:${name}`).at(-1)?.duration||0; } catch { return 0; } }
  };
  N.platform.mark('platform-ready');
  window.addEventListener('error',event=>N.platform.capture(event.error||event.message,{type:'error'}));
  window.addEventListener('unhandledrejection',event=>N.platform.capture(event.reason,{type:'unhandledrejection'}));
  document.addEventListener('visibilitychange',()=>N.platform.track('visibility_change',{state:document.visibilityState}));
  document.addEventListener('click',event=>{
    const target=event.target.closest?.('[data-action],[data-nav],[data-filter]');
    if(!target)return;
    N.platform.track('product_action',{action:target.dataset.action||target.dataset.nav||target.dataset.filter||'unknown'});
  },{capture:true});
  window.addEventListener('DOMContentLoaded',()=>{
    N.platform.mark('dom-ready');
    requestAnimationFrame(()=>{
      const version=document.querySelector('.brand span');
      if(version)version.textContent='6.0';
      document.documentElement.dataset.release='6.0.0';
      N.platform.mark('first-frame');
      N.platform.track('session_ready',{firstFrameMs:Math.round(N.platform.measure('first-frame','platform-ready','first-frame')),release:RELEASE.version});
    });
  });
  window.addEventListener('online',()=>N.platform.track('network_change',{online:true}));
  window.addEventListener('offline',()=>N.platform.track('network_change',{online:false}));
})();
