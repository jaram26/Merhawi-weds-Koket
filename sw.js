/* Merhawi & Koket — minimal service worker for PWA install + light offline shell */
const CACHE_NAME = 'mk-wedding-v2';

function scopeUrl(path) {
  return new URL(path, self.registration.scope).href;
}

const PRECACHE_URLS = [
  scopeUrl('index.html'),
  scopeUrl('manifest.json'),
  scopeUrl('css/style.css'),
  scopeUrl('js/main.js'),
  scopeUrl('songs.html'),
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const path = new URL(event.request.url).pathname;
          if (!/\.(jpg|jpeg|png|gif|webp|mp3|mp4|woff2?)(\?|$)/i.test(path)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return caches.match(scopeUrl('index.html'));
        })
      )
  );
});
