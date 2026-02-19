/// <reference lib="webworker" />

const CACHE_NAME = 'abasan-municipality-v1';
const OFFLINE_URL = '/offline.html';

// Static assets to pre-cache
const PRECACHE_ASSETS = [
    OFFLINE_URL,
    '/favicon.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Install: pre-cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: network-first for pages, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API routes and auth
    if (url.pathname.startsWith('/api/')) return;

    // Static assets: cache-first
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf)$/) ||
        url.pathname.startsWith('/_next/static/')
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Pages: network-first with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match(OFFLINE_URL).then((cached) => {
                    return cached || new Response('Offline', { status: 503 });
                });
            })
        );
        return;
    }
});
