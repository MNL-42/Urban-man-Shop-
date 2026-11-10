// Urban Man Shop 2243 : garde les photos en mémoire sur le téléphone du client
// (moins de données mobiles consommées, affichage plus rapide aux visites suivantes).
const CACHE = 'ums-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;                 // Firebase et CDN : jamais touchés
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(u.pathname)) {   // photos : cache d'abord, mise à jour en arrière-plan
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(r);
      const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  e.respondWith(fetch(r).then(res => {                      // pages : réseau d'abord, cache si hors ligne
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r)));
});
