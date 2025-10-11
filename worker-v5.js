// Define a cache name specific to this app/version
// This is a new, completely unique name to ensure no conflicts.
const CACHE_NAME = 'unit-price-comparator-v5-final';

// List the files that should be cached on installation
const urlsToCache = [
    './unit-price-comparison_2.html',
    './worker-v5.js', // IMPORTANT: Reference the new file name here
    // We add the root path to the cache list for robust offline loading on GitHub Pages
    '/supermarket-launcher/', 
];

// Installation: Caches the essential files
self.addEventListener('install', (event) => {
    // Force the service worker to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW V5: Opened cache and adding critical files.');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('SW V5: Failed to cache critical files:', err);
            })
    );
});

// Fetch: Intercepts network requests and serves from cache first
self.addEventListener('fetch', (event) => {
    // CRITICAL FIX: If the request URL is for the root of the app scope, force it to serve the HTML file.
    const rootPath = '/supermarket-launcher/';
    const isRootRequest = (event.request.url.endsWith(rootPath) || event.request.url.endsWith(rootPath.slice(0, -1)));

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 1. If we have a direct match (e.g., for worker-v5.js), return it.
                if (response) {
                    return response;
                }
                
                // 2. If this is a root request (e.g., from the PWA shortcut) and we didn't find a direct match,
                // force the serving of the cached HTML page.
                if (isRootRequest) {
                     return caches.match('./unit-price-comparison_2.html');
                }

                // 3. Otherwise, go to the network.
                return fetch(event.request);
            })
    );
});

// Activation: Cleans up old caches (important for versioning)
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete all old caches (v1, v2, v3, v4)
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
