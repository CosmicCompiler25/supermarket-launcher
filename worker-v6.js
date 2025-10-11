const CACHE_NAME = 'unit-price-comparator-v6';
const FILES_TO_CACHE = [
    // Cache the main HTML file itself
    'unit-price-comparison_2.html',
    // Cache the Service Worker file itself
    'worker-v6.js',
    // Cache the root directory path (critical for home screen shortcut functionality)
    './', 
];

// --- Installation: Caching initial resources ---
self.addEventListener('install', (event) => {
    console.log('[Service Worker V6] Installing and caching all essential files.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(error => {
                console.error('[Service Worker V6] Failed to cache files:', error);
            })
    );
    // Force the new Service Worker to activate immediately
    self.skipWaiting();
});

// --- Activation: Cleaning up old caches ---
self.addEventListener('activate', (event) => {
    console.log('[Service Worker V6] Activating and cleaning up old caches.');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete all caches that are NOT the current version (v6)
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(`[Service Worker V6] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Ensures the Service Worker takes control of the page immediately
    return self.clients.claim();
});

// --- Fetching: Serving content from cache first ---
self.addEventListener('fetch', (event) => {
    // We only intercept requests for the files we are interested in
    if (event.request.url.includes(location.origin)) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Cache hit - return the response from cache
                    if (response) {
                        return response;
                    }
                    
                    // Critical Fix: If the request is for the root (e.g., the home screen shortcut), 
                    // ensure it serves the main HTML file from the network or cache.
                    if (event.request.url === location.origin + '/') {
                        return caches.match('unit-price-comparison_2.html');
                    }

                    // No cache hit: try the network, then cache the new response
                    return fetch(event.request).then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream and can only be consumed once.
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
                })
                .catch((error) => {
                    console.error('[Service Worker V6] Fetch failed, returning fallback:', error);
                    // This is the true "offline" fallback: if network and cache fail, 
                    // try to serve the main HTML file as a final safety measure.
                    return caches.match('unit-price-comparison_2.html');
                })
        );
    }
});
