// Snazzify service worker: makes the app installable and fast.
// Prices, deals and orders (/api) always come fresh from the network; only the app shell and photos are cached.
const V = 'snz-v2';
const SHELL = ['/', '/snazzify-logo.svg', '/snazzify-icon.svg', '/icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/admin')) return;
  if (u.pathname.startsWith('/img/') || /\.(png|svg|jpg|jpeg|webp)$/.test(u.pathname)) {   // photos: cache first
    e.respondWith(caches.open(V).then(async c => (await c.match(e.request)) || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; })));
    return;
  }
  if (e.request.mode === 'navigate') {   // pages: network first, cached shell when offline
    e.respondWith(fetch(e.request).then(r => { if (u.pathname === '/' && r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put('/', cp)); } return r; }).catch(() => caches.match('/')));
  }
});
