const CACHE_NAME = 'devpulse-ai-pwa-v1';

// Core App Shell & Client-Side Offline Developer Tools (JSON Formatter, JWT Decoder, Regex Tester, Cron Builder)
const OFFLINE_APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/tools/ai-ui-generator',
  '/tools/json-to-typescript',
  '/tools/jwt-decoder',
  '/tools/regex-generator',
  '/tools/cron-expression',
  '/tools/svg-optimizer',
  '/tools/roi-calculator',
  '/tools/free-templates',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_APP_SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass API proxy calls so live AI generation is never stale-cached
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigation requests for /tools/* or root: Network-first with App Shell fallback for offline usage
  if (request.mode === 'navigate' || url.pathname.startsWith('/tools/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
          return networkResponse;
        })
        .catch(async () => {
          const cachedExact = await caches.match(request);
          if (cachedExact) return cachedExact;
          const cachedRoot = await caches.match('/index.html');
          if (cachedRoot) return cachedRoot;
          return caches.match('/');
        })
    );
    return;
  }

  // Static assets (JS, CSS, SVG, fonts): Stale-While-Revalidate for instant offline reload
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
