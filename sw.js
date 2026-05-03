const CACHE_NAME = 'fuelnav-pro-v5';

// Core assets to pre-cache for MapLibre implementation
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core MapLibre assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Bypass caching for map tiles (OSM), OSRM routing, and Nominatim search
  // Caching these dynamic endpoints causes autocomplete freezing and routing errors
  if (
    requestUrl.hostname.includes('openstreetmap.org') || 
    requestUrl.hostname.includes('project-osrm.org') ||
    requestUrl.hostname.includes('tile.openstreetmap.org')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Standard Cache-First Strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
