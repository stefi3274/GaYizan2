// Service Worker Ga-izan — version simple
// Permet l'installation de l'app et un chargement plus rapide

var CACHE_NAME = 'ga-izan-v1';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // On laisse passer les requetes vers Supabase et les CDN sans interferer
  if (event.request.url.indexOf('supabase') !== -1 ||
      event.request.url.indexOf('cdn.jsdelivr') !== -1) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
