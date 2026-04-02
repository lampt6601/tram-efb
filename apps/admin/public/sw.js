const CACHE_NAME = "thc-admin-v1";
const PRECACHE_URLS = ["/", "/login"];

// Install: precache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for pages/API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API requests
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Pages: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "THC Admin";
  const options = {
    body: data.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: { url: data.url || "/dashboard" },
    tag: data.tag || "default",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // Update badge count if supported
      if (data.badgeCount !== undefined && navigator.setAppBadge) {
        navigator.setAppBadge(data.badgeCount);
      }
    })
  );
});

// Notification click: open the relevant page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window and navigate to the deep-link URL
        const target = new URL(targetUrl, self.location.origin);
        for (const client of clients) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === target.pathname && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open new window
        return self.clients.openWindow(targetUrl);
      })
  );
});
