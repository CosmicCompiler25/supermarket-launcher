// Define a cache name specific to this app/version
// Changing this version number (e.g., to v2) forces the browser to re-cache
const CACHE_NAME = 'unit-price-comparator-v1';

// List the files that should be cached on installation
// This MUST include the HTML file you want to use offline.
const urlsToCache = [
    './unit-price-comparison_2.html',
];

// Installation: Caches the essential files
self.addEventListener('install', (event) => {
    // Force the service worker to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and adding critical files.');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to cache critical files:', err);
            })
    );
});

// Fetch: Intercepts network requests and serves from cache first
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // If not in cache, try network
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
                    // Delete old caches not in the whitelist
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
