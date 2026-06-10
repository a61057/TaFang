const CACHE_NAME = 'tower-defense-v1';
const ASSETS = [
  'index.html',
  'css/main.css',
  'js/index.js',
  'fonts/Zpix.woff2',
  'icon.png',
  'icons/icon.svg',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    }).catch(() => {
      return caches.match('index.html');
    })
  );
});
