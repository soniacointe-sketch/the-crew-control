/* ELOAH mobile: cache only public shell assets; never cache user data or authenticated responses. */
const CACHE='eloah-shell-v1';
const OFFLINE='/the-crew-control/eloah-hors-connexion.html';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([OFFLINE,'/the-crew-control/eloah-app-icon.svg'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('eloah-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{const r=event.request;if(r.mode!=='navigate'||r.method!=='GET')return;if(new URL(r.url).origin!==self.location.origin)return;event.respondWith(fetch(r).catch(async()=>{return await caches.match(OFFLINE)||Response.error()}));});