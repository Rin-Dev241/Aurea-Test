/* ============================================
   AUREA — Service Worker (Offline Support)
   ============================================ */

const CACHE_NAME = 'aurea-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/aurea.png',
  '/pages/dashboard.html',
  '/pages/emotion.html',
  '/pages/memory.html',
  '/pages/games.html',
  '/pages/reminders.html',
  '/pages/alerts.html',
  '/pages/profile.html',
  '/assets/css/style.css',
  '/assets/css/dashboard.css',
  '/assets/css/components.css',
  '/assets/css/emotions.css',
  '/assets/css/memory.css',
  '/assets/css/games.css',
  '/assets/css/reminders.css',
  '/assets/js/firebase-config.js',
  '/assets/js/app.js',
  '/assets/js/auth.js',
  '/assets/js/automation.js',
  '/assets/js/emotion.js',
  '/assets/js/memory.js',
  '/assets/js/games.js',
  '/assets/js/reminders.js',
  '/assets/js/caregiver-alert.js'
];

// Install — cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache first, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET, external, and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache new resources dynamically
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/pages/dashboard.html');
        }
      });
    })
  );
});
