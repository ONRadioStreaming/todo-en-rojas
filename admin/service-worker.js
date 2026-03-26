const CACHE_NAME = "conecta2-admin-v3";
const URLS_TO_CACHE = [
  "/conecta2/admin/",
  "/conecta2/admin/index.html",
  "/conecta2/admin/panel.html",
  "/conecta2/admin/manifest.json",
  "/conecta2/admin/icon-192.png",
  "/conecta2/admin/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
