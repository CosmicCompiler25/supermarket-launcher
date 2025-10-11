// Define a cache name specific to this app/version
// Changing this version number (e.g., to v4) forces the browser to re-cache
const CACHE_NAME = 'unit-price-comparator-v4'; // CHANGED TO V4 FOR FINAL RESET

// List the files that should be cached on installation
// This list MUST include the main HTML file and the Service Worker itself.
const urlsToCache = [
    './unit-price-comparison_2.html',
    './sw.js',
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
                console.log('SW: Opened cache and adding critical files.');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('SW: Failed to cache critical files:', err);
            })
    );
});

// Fetch: Intercepts network requests and serves from cache first
self.addEventListener('fetch', (event) => {
    // CRITICAL FIX: If the request URL is for the root of the app scope, force it to serve the HTML file.
    // This resolves the conflict where the browser serves sw.js instead of the HTML file.
    const rootPath = '/supermarket-launcher/';
    const isRootRequest = (event.request.url.endsWith(rootPath) || event.request.url.endsWith(rootPath.slice(0, -1)));

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 1. If we have a direct match (e.g., for sw.js or the HTML file name), return it.
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
                    // Delete old caches not in the whitelist (i.e., v1, v2, v3)
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
