const CACHE='typequest-v10';
const DATA_VERSION='10';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  `./data/yr3-au.json?v=${DATA_VERSION}`,
  `./data/yr4-au.json?v=${DATA_VERSION}`,
  `./data/yr5-au.json?v=${DATA_VERSION}`,
  `./data/yr6-au.json?v=${DATA_VERSION}`
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isData=url.pathname.includes('/data/') && url.pathname.endsWith('.json');
  const isAppShell=url.pathname.endsWith('/index.html') || url.pathname.endsWith('/TypeQuest-Yr3/') || url.pathname.endsWith('/TypeQuest-Yr3');
  if(isData || isAppShell){
    e.respondWith(
      fetch(e.request).then(res=>{
        if(res && res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
        }
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const net=fetch(e.request).then(res=>{
        if(res && res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
        }
        return res;
      }).catch(()=>cached);
      return cached || net;
    })
  );
});
