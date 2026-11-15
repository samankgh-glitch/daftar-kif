/* Service worker: app shell works offline; fonts are cached the first time they load. */
const VER='dk-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER&&k!=='dk-fonts').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open('dk-fonts').then(c=>c.match(r).then(m=>{
      const f=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque'))c.put(r,x.clone());return x}).catch(()=>m);
      return m||f;
    })));return;
  }
  if(u.origin!==location.origin)return;
  /* network first so updates arrive when online; cache when offline */
  e.respondWith(fetch(r).then(x=>{if(x.ok){const k=x.clone();caches.open(VER).then(c=>c.put(r,k))}return x}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
});
