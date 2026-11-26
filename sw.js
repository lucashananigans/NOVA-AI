const CACHE = "nova-shell-v4";
const SHELL = ["./", "./index.html", "./manifest.webmanifest"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.origin === self.location.origin) {
    // Always check the network first for the app shell so GitHub Pages updates appear promptly.
    if (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
      event.respondWith(fetch(event.request).then(response => {
        if (response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); }
        return response;
      }).catch(()=>caches.match(event.request).then(hit=>hit || caches.match("./index.html"))));
      return;
    }
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      if (response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); }
      return response;
    }).catch(()=>caches.match("./index.html"))));
  } else if (url.hostname === "esm.run") {
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      if (response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); }
      return response;
    })));
  }
});