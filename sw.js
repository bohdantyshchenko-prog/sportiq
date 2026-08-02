const CACHE='noviq-4.0-offline-production-2026-08-02';
const ASSETS=['./','./index.html','./styles.css','./styles-core.css','./styles-components.css','./styles-premium.css','./styles-assets.css','./styles-editorial.css','./styles-v3.css','./styles-world.css','./runtime-config.js','./config.js','./auth-client.js','./api-client.js','./data.js','./services.js','./compat.js','./ui-part-1.js','./ui-part-2.js','./ui-part-3.js','./ui-mount.js','./experience-v3.js','./world-layout.js','./push-client.js','./app-core.js','./app-thesis.js','./app-live.js','./app-intelligence.js','./app-shell.js','./offline-production.js','./manifest.webmanifest','./icon.svg','./assets/profile-bt.svg','./assets/profile-bogdan.svg','./assets/hero-athlete.svg','./assets/stadium-night.svg','./assets/story-tactics.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request,url=new URL(request.url);
  if(url.origin!==self.location.origin){event.respondWith(fetch(request).catch(()=>new Response('',{status:503,statusText:'Offline'})));return;}
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response;}).catch(()=>caches.match('./index.html')));return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(()=>new Response('',{status:503,statusText:'Offline'}))));
});