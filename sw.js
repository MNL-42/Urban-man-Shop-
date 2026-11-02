const CACHE_NAME = 'urban-man-shop-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './assets/images/logo.png'
];

// Installation du Service Worker et mise en cache des éléments de base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes réseau (Stratégie: Cache d'abord, puis Réseau)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Optionnel: Mettre en cache dynamiquement les nouvelles images chargées (comme les 1.png à 23.png)
        return response;
      }).catch(() => {
        // Fallback en cas de hors-ligne total si nécessaire
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
