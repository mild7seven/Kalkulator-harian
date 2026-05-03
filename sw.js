const CACHE_NAME = 'fuelnav-pro-v3';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/ol@v8.2.0/ol.css',
  'https://cdn.jsdelivr.net/npm/ol@v8.2.0/dist/ol.js'
];

// Install Event: Cache base assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Clear old caches when version updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch Strategy: Cache first, falling back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache dynamic external requests (like maps logic if needed)
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http')) {
             cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Offline fallback
      return caches.match('./index.html');
    })
  );
});
