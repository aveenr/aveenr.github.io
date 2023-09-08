const cacheName = "ushaka-autocomplete-v1";
const cacheAssets = [
  "/",
  "index.html",
  "data.json",  // Cache the external JSON data file
  "styles.css", // Cache the external CSS file
  "script.js",  // If you have an external JavaScript file
];

// Install event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("Service Worker: Caching Files");
        cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return (
        response ||
        fetch(e.request).then((response) => {
          // Make a copy of the response to cache
          const responseClone = response.clone();

          // Open cache and add the response to cache
          caches.open(cacheName).then((cache) => {
            cache.put(e.request, responseClone);
          });

          return response;
        })
      );
    })
  );
});
