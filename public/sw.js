// Ecvaultz Service Worker — Offline-First PWA
const CACHE_NAME = 'ecvaultz-v2';
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/login',
    '/offline',
    '/build/assets/app-DeUcg0VJ.css',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {
                // Fail gracefully if some assets aren't available
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and API calls
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;
    if (event.request.url.includes('/secure/')) return;
    if (event.request.url.includes('/2fa/')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cached) => {
                    return cached || caches.match('/offline');
                });
            })
    );
});

// Push notification support
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'New notification from Ecvaultz',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: data.url || '/notifications',
        tag: data.tag || 'ecvaultz',
        requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || 'Ecvaultz',
            options
        )
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data || '/notifications';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientsArr) => {
            const existing = clientsArr.find((c) => c.url.includes(self.location.origin));
            if (existing) {
                existing.focus();
                existing.postMessage({ type: 'navigate', url });
            } else {
                clients.openWindow(url);
            }
        })
    );
});
