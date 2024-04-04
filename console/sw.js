var cacheName = "console-v0";
var assets = [
  "/console/",
  "/console/index.html",
  "/console/favicon.ico",
  "https://cdn.jsdelivr.net/npm/iuai@0.6.0/iuai.js",
  "/console/index.js",
  "/console/test.js",
];

addEventListener("install", function (e) {
  console.log("[ServiceWorker] install event fired");
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      cache.addAll(assets);
    })
  );
});

addEventListener("activate", function () {
  console.log("[ServiceWorker] activate event fired");
});

addEventListener("fetch", function (e) {
  e.respondWith(
    fetch(e.request)
      .then(function (response) {
        var clone = response.clone();
        caches.open(cacheName).then(function (cache) {
          cache.match(e.request).then(function (cached) {
            if (cached) cache.put(e.request, clone);
          });
        });

        return response;
      })
      .catch(function (err) {
        return caches.open(cacheName).then(function (cache) {
          return cache.match(e.request).then(function (cached) {
            if (!cached) throw err;

            console.log("[ServiceWorker] fetched from cache", e.request.url);
            return cached;
          });
        });
      })
  );
});
