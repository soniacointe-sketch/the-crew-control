/* ELOAH: offline fallback for its pages only. Other applications in the same repository are untouched. */
const CACHE='eloah-shell-v3';
const OFFLINE='/the-crew-control/eloah-hors-connexion.html';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([OFFLINE,'/the-crew-control/eloah-app-icon.svg'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('eloah-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.mode!=='navigate'||r.method!=='GET')return;
 const url=new URL(r.url);if(url.origin!==self.location.origin)return;
 const name=url.pathname.split('/').pop();
 if(name!=='mes-univers.html'&&!name.startsWith('eloah-'))return;
 e.respondWith(fetch(r,{cache:'no-store'}).catch(async()=>await caches.match(OFFLINE)||Response.error()));
});
