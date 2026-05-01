const version = "1";
const StaticCacheName = `s-app-v${version}`;
const DynamicCacheName = `d-app-v${version}`;

const StaticUrls = [
  "/",
  "/offline.html",
  "/Моя%20первая%20страница.html", // или переименовать без пробелов/кириллицы
  "/styles/styles.css",
  "/img/logo1.png",
  "/icon/icon-192x192.png",
  "/javaScript/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(StaticCacheName)
      .then(cache => cache.addAll(StaticUrls))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] install failed', err))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name => name !== StaticCacheName && name !== DynamicCacheName)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached ?? fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(DynamicCacheName);
  try {
    const response = await fetch(request);
    // клонируем перед кэшированием
    await cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return cached ?? (await caches.match('/offline.html'));
  }
}