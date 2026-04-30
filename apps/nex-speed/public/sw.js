// NexSpeed Driver PWA — Service Worker v1.2
// Strategy: Cache-First for static assets, Network-First for API

const CACHE_NAME = 'nexspeed-driver-v1.2';
const API_CACHE  = 'nexspeed-api-v1.2';

// Assets to precache on install
const PRECACHE_ASSETS = [
    '/driver',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    // Leaflet (CDN — cache at runtime on first use)
];

// API endpoints to cache (for offline fallback)
const CACHEABLE_API = [
    '/api/v1/trips',
    '/api/v1/drivers',
    '/api/v1/vehicles',
    '/api/v1/epod',
];

// ── Install: precache static shell ──────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Precaching driver app shell');
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('[SW] Precache partial fail:', err);
            });
        })
    );
    self.skipWaiting();
});

// ── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
                    .map((k) => {
                        console.log('[SW] Deleting old cache:', k);
                        return caches.delete(k);
                    })
            )
        )
    );
    self.clients.claim();
});

// ── Background Sync: retry failed ePOD submissions ──────────────────────────
self.addEventListener('sync', (event) => {
    if (event.tag === 'epod-sync') {
        event.waitUntil(replayPendingEPODs());
    }
});

async function replayPendingEPODs() {
    try {
        const pending = await getFromIDB('pending-epods') || [];
        for (const item of pending) {
            try {
                const res = await fetch('/api/v1/epod', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                });
                if (res.ok) {
                    await removeFromIDB('pending-epods', item.localId);
                    console.log('[SW] Background sync ePOD success:', item.localId);
                    // Notify clients
                    const clients = await self.clients.matchAll();
                    clients.forEach(c => c.postMessage({ type: 'epod-synced', id: item.localId }));
                }
            } catch (err) {
                console.warn('[SW] ePOD sync failed, will retry:', err);
            }
        }
    } catch (err) {
        console.warn('[SW] replayPendingEPODs error:', err);
    }
}

// IDB helpers (minimal, no dependency)
function openIDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('nexspeed-sw', 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('pending-epods')) {
                db.createObjectStore('pending-epods', { keyPath: 'localId' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

async function getFromIDB(storeName) {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

async function removeFromIDB(storeName, key) {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).delete(key);
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
    });
}

// ── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    const data = event.data?.json?.() || {};
    const title = data.title || 'NexSpeed Driver';
    const options = {
        body: data.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag || 'nexspeed-notif',
        renotify: true,
        data: { url: data.url || '/driver' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/driver';
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            const existing = clients.find((c) => c.url.includes('/driver'));
            if (existing) {
                existing.focus();
                existing.navigate(url);
            } else {
                self.clients.openWindow(url);
            }
        })
    );
});

// ── Fetch: routing strategy ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET, chrome-extension, and WS
    if (request.method !== 'GET') return;
    if (url.protocol === 'chrome-extension:') return;
    if (url.protocol === 'ws:' || url.protocol === 'wss:') return;

    // API calls — Network-First with cache fallback
    if (url.pathname.includes('/api/v1/') && CACHEABLE_API.some(p => url.pathname.includes(p))) {
        event.respondWith(networkFirstWithCache(request, API_CACHE));
        return;
    }

    // Leaflet CDN tiles & assets — Cache-First
    if (url.hostname.includes('tile.openstreetmap.org') ||
        url.hostname.includes('unpkg.com') ||
        url.hostname.includes('cdn.jsdelivr.net')) {
        event.respondWith(cacheFirst(request, CACHE_NAME));
        return;
    }

    // OSRM routing API — Network only (no offline fallback)
    if (url.hostname.includes('router.project-osrm.org')) {
        return; // let browser handle natively
    }

    // Next.js static assets & pages — Cache-First for /_next/static, Network-First for pages
    if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(cacheFirst(request, CACHE_NAME));
        return;
    }

    // Page navigations — Network-First, fallback to cached driver shell
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match('/driver') || caches.match('/')
            )
        );
        return;
    }

    // Default: Network-First
    event.respondWith(networkFirstWithCache(request, CACHE_NAME));
});

// ── Strategy helpers ─────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline — ไม่มีสัญญาณอินเทอร์เน็ต', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}

async function networkFirstWithCache(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ success: false, offline: true, data: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
