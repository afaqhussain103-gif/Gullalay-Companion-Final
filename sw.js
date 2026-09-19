/* Gullalay's Companion — service worker
   Bumping CACHE invalidates the old bundle. This NEVER touches
   localStorage, so her cycle history is unaffected by updates. */
const CACHE = 'gullalay-v4';

const ASSETS = [
  './',
  './index.html',
  './vendor.js',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-120.png',
  './icon-152.png',
  './icon-167.png',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
];

/* Never cache: live API calls must always hit the network. */
const BYPASS = [
  'generativelanguage.googleapis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      /* addAll fails atomically if any one file 404s — add individually
         so a single missing icon can't break the whole install. */
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  if (BYPASS.some(h => request.url.includes(h))) return;

  /* Network-first for the app shell so a deploy is picked up promptly,
     falling back to cache when offline. */
  e.respondWith(
    fetch(request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
  );
});
