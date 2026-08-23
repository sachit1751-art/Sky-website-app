/**
 * SKY Ecosystem - Advanced Workbox Service Worker
 * 
 * Offline-first caching strategies for:
 * 1. App shell & static assets (Cache-first / Stale-while-revalidate)
 * 2. ROM Metadata & API responses (Stale-while-revalidate with Network fallback)
 * 3. ROM Screenshots & Device Images (Cache-first with Expiration & Range cache)
 * 4. Google Fonts & CDN resources (Stale-while-revalidate)
 * 5. Offline navigation fallback (/offline.html)
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  const { core, routing, strategies, expiration, cacheableResponse, precaching } = workbox;

  // Configure custom cache names
  core.setCacheNameDetails({
    prefix: 'sky',
    suffix: 'v3',
    precache: 'precache',
    runtime: 'runtime'
  });

  // Skip waiting and claim clients immediately on update
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  // ---------------------------------------------------------------------------
  // 1. Navigation Route & Offline Fallback (HTML Documents)
  // ---------------------------------------------------------------------------
  routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new strategies.NetworkFirst({
      cacheName: 'sky-pages-cache',
      networkTimeoutSeconds: 3,
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 Days
        })
      ]
    })
  );

  // ---------------------------------------------------------------------------
  // 2. ROM Metadata & REST API Endpoints (/api/*)
  // StaleWhileRevalidate ensures instant offline load + background sync
  // ---------------------------------------------------------------------------
  routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new strategies.StaleWhileRevalidate({
      cacheName: 'sky-rom-api-metadata-cache',
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 3 * 24 * 60 * 60, // 3 Days cache for offline viewing
          purgeOnQuotaError: true
        })
      ]
    })
  );

  // ---------------------------------------------------------------------------
  // 3. Supabase REST & Storage Caching
  // ---------------------------------------------------------------------------
  routing.registerRoute(
    ({ url }) => url.hostname.includes('supabase.co') || url.pathname.includes('/rest/v1/'),
    new strategies.StaleWhileRevalidate({
      cacheName: 'sky-supabase-data-cache',
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 150,
          maxAgeSeconds: 4 * 24 * 60 * 60, // 4 Days
          purgeOnQuotaError: true
        })
      ]
    })
  );

  // ---------------------------------------------------------------------------
  // 4. ROM Screenshots & Media Images (Unsplash, GitHub, Supabase Storage, Local)
  // Cache-First strategy to minimize data consumption and support offline galleries
  // ---------------------------------------------------------------------------
  routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'image' ||
      url.pathname.match(/\.(?:png|jpg|jpeg|svg|webp|gif|avif|ico)$/i) ||
      url.hostname.includes('images.unsplash.com') ||
      url.hostname.includes('githubusercontent.com') ||
      url.hostname.includes('raw.githubusercontent.com') ||
      url.pathname.includes('/storage/v1/object/public/'),
    new strategies.CacheFirst({
      cacheName: 'sky-rom-images-cache',
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 250, // Generous image cache for all ROM screenshots
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          purgeOnQuotaError: true
        })
      ]
    })
  );

  // ---------------------------------------------------------------------------
  // 5. JavaScript, CSS & Web Worker Static Assets
  // ---------------------------------------------------------------------------
  routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'worker' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css'),
    new strategies.StaleWhileRevalidate({
      cacheName: 'sky-static-resources-cache',
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 14 * 24 * 60 * 60 // 14 Days
        })
      ]
    })
  );

  // ---------------------------------------------------------------------------
  // 6. Google Fonts Web Fonts & Stylesheets
  // ---------------------------------------------------------------------------
  routing.registerRoute(
    ({ url }) =>
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com',
    new strategies.CacheFirst({
      cacheName: 'sky-google-fonts-cache',
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 Year
        })
      ]
    })
  );

  // ---------------------------------------------------------------------------
  // 7. Global Catch Handler for Offline Navigation
  // ---------------------------------------------------------------------------
  routing.setCatchHandler(async ({ event }) => {
    if (event.request.destination === 'document' || event.request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
      const indexPage = await caches.match('/');
      if (indexPage) return indexPage;
    }
    return Response.error();
  });

  // ---------------------------------------------------------------------------
  // 8. Push Notification Click & Deep Link Navigation Handler
  // ---------------------------------------------------------------------------
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const deepLinkUrl = event.notification.data?.url || event.notification.data?.route || '/';

    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If an app window is already open, focus it and post a navigate message
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NAVIGATE',
              url: deepLinkUrl
            });
            return;
          }
        }
        // Otherwise open a new window with the deep link URL
        if (self.clients.openWindow) {
          return self.clients.openWindow(deepLinkUrl);
        }
      })
    );
  });

  // ---------------------------------------------------------------------------
  // 9. Background Sync & Custom Message Handler
  // ---------------------------------------------------------------------------
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_OLD_CACHES') {
      event.waitUntil(
        caches.keys().then((keys) =>
          Promise.all(
            keys
              .filter((k) => !k.includes('sky-') || k.includes('-v1') || k.includes('-v2'))
              .map((k) => caches.delete(k))
          )
        )
      );
    }
  });

} else {
  console.warn('[Workbox] Failed to load Workbox CDN in service worker.');
}
