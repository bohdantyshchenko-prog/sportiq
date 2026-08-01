const CACHE='noviq-1.4.1-premium-2026-08-01';
const ASSETS=['./','./index.html','./styles.css','./styles-core.css','./styles-components.css','./styles-premium.css','./runtime-config.js','./config.js','./api-client.js','./data.js','./services.js','./compat.js','./ui-part-1.js','./ui-part-2.js','./ui-part-3.js','./ui-mount.js','./app-core.js','./app-thesis.js','./app-live.js','./app-intelligence.js','./app-shell.js','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request;
  const url=new URL(request.url);
  const isApi=url.pathname.includes('/v1/');
  const isRemoteMedia=url.origin!==self.location.origin;
  if(isApi||isRemoteMedia){
    event.respondWith(fetch(request).catch(()=>new Response('',{status:503,statusText:'Unavailable'})));
    return;
  }
  event.respondWith(
    fetch(request)
      .then(response=>{
        if(response&&response.ok&&response.type!=='opaque'){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
        }
        return response;
      })
      .catch(async()=>{
        const cached=await caches.match(request);
        if(cached)return cached;
        if(request.mode==='navigate')return caches.match('./index.html');
        return new Response('',{status:503,statusText:'Offline'});
      })
  );
});
