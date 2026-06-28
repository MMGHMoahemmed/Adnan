const CACHE_NAME = 'baraah-prep-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/storage.js',
  './js/gemini.js',
  './js/pdf.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install Event: Cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching offline assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning up old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Ignore non-http(s) schemes (like chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  // Special handling for Gemini API requests (Network Only)
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return a customized JSON error response when API is unreachable offline
        return new Response(
          JSON.stringify({
            error: {
              message: "أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالشبكة لإنشاء دروس جديدة."
            }
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          }
        );
      })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((response) => {
        // Cache runtime files if they are static assets
        if (response.status === 200 && (
          event.request.url.includes(self.location.origin) ||
          event.request.url.includes('cdnjs.cloudflare.com')
        )) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch((err) => {
        console.error('[Service Worker] Network fetch failed:', err);
      });
    })
  );
});
