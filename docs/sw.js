const CACHE = "wedding-steward-v4";
const BASE = new URL("./", self.location.href).pathname;
const APP_SHELL = [`${BASE}manifest.webmanifest`, `${BASE}app-icon-192.png`, `${BASE}app-icon-512.png`, `${BASE}apple-touch-icon.png`, `${BASE}vendor/html2canvas.min.js`, `${BASE}update.html`];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(APP_SHELL);
    const page = await fetch(BASE, { cache: "reload" });
    if (!page.ok) throw new Error("App shell unavailable");
    await cache.put(BASE, page.clone());
    const html = await page.text();
    const paths = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g))
      .map((match) => new URL(match[1], self.location.origin + BASE))
      .filter((url) => url.origin === self.location.origin)
      .map((url) => url.pathname);
    await Promise.allSettled(paths.map((path) => cache.add(path)));
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/")) return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) (await caches.open(CACHE)).put(BASE, response.clone());
          return response.ok ? response : (await caches.match(BASE)) || response;
        })
        .catch(async () => (await caches.match(BASE)) || Response.error())
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    }))
  );
});
