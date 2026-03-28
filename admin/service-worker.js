const CACHE_NAME = "conecta2-admin-v4";
const ADMIN_BASE = "/conecta2/admin/";

const URLS_TO_CACHE = [
  ADMIN_BASE,
  ADMIN_BASE + "index.html",
  ADMIN_BASE + "panel.html",
  ADMIN_BASE + "manifest.json",
  ADMIN_BASE + "icon-192.png",
  ADMIN_BASE + "icon-512.png"
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
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function isAdminHtmlRequest(request) {
  if (request.method !== "GET") return false;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return false;

  return (
    url.pathname === ADMIN_BASE ||
    url.pathname === ADMIN_BASE + "index.html" ||
    url.pathname === ADMIN_BASE + "panel.html"
  );
}

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  if (isAdminHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then(networkResponse => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});