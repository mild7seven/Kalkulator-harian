// Ganti versi cache jika ada update pada file HTML/CSS/JS di masa depan
const CACHE_NAME = 'fuelnav-v4-manual';

// Daftar file yang wajib disimpan untuk penggunaan offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Event Install: Menyimpan file ke Cache saat aplikasi pertama kali dibuka
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching Files');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Event Activate: Membersihkan cache versi lama jika ada pembaruan
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Event Fetch: Mengambil data dari Cache jika offline, atau dari Network jika online
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika file ada di cache, gunakan itu. Jika tidak, ambil dari internet.
      return response || fetch(event.request);
    }).catch(() => {
      // Opsi fallback jika offline dan file tidak ada di cache (opsional)
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('./index.html');
      }
    })
  );
});
