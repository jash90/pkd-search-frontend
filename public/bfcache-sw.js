// Service worker to help with bfcache
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Intercept navigation requests to ensure bfcache works with URL parameters
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle navigation requests to pages with serviceDescription parameter
  if (event.request.mode === 'navigate' && url.searchParams.has('serviceDescription')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response so we can modify headers
          const newResponse = new Response(response.body, response);
          
          // Add headers that encourage bfcache
          newResponse.headers.set('Cache-Control', 'max-age=0, must-revalidate');
          
          return newResponse;
        })
        .catch(error => {
          console.error('Service worker fetch failed:', error);
          // Fall back to normal fetch
          return fetch(event.request);
        })
    );
  }
}); 