const CACHE_NAME = 'fuelnav-pro-v2';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/ol@v8.2.0/ol.css',
  'https://cdn.jsdelivr.net/npm/ol@v8.2.0/dist/ol.js'
];

// Tahap Install: Simpan aset dasar ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Tahap Aktifasi: Hapus cache lama jika ada pembaruan versi
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

// Strategi Fetch: Ambil dari cache jika offline, ambil dari network jika online
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Simpan hasil fetch baru ke cache (untuk aset dinamis)
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http')) {
             cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Opsi fallback jika benar-benar tidak ada internet dan cache kosong
      return caches.match('./index.html');
    })
  );
});
