/* DMRX Calculator - Service Worker (Offline Support) */
var CACHE_NAME = 'dmrx-v3';

var FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',

  /* Font Awesome 6.4.0 CSS */
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',

  /* Font Awesome 6.4.0 Fonts */
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2'
];

/* ── INSTALL: saari files cache karo ── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.allSettled(
        FILES_TO_CACHE.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('Cache miss (skip):', url, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

/* ── ACTIVATE: purane caches delete karo ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== CACHE_NAME; })
          .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* ── FETCH: cache-first, network fallback ── */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;

      return fetch(e.request).then(function(response) {
        /* Sirf valid responses cache karo */
        if (
          response &&
          response.status === 200 &&
          response.type !== 'opaque'
        ) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      });
    }).catch(function() {
      /* Offline fallback */
      return caches.match('./index.html');
    })
  );
});
