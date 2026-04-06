const CACHE_NAME = "thc-admin-v3";
const PRECACHE_URLS = ["/dashboard", "/login"];

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
    data: {
      url: data.url || "/dashboard",
      actions: data.actions || [],
    },
    tag: data.tag || "default",
    renotify: true,
    // Web Push action buttons (max 2, ignored on Safari)
    actions: (data.actions || []).slice(0, 2).map((a) => ({
      action: a.action,
      title: a.title,
    })),
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

// Helper: open or focus an existing window
function openOrFocusWindow(targetUrl) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      // External URL — always open new tab
      if (targetUrl.startsWith("http")) {
        return self.clients.openWindow(targetUrl);
      }
      const target = new URL(targetUrl, self.location.origin);
      for (const client of clients) {
        const clientUrl = new URL(client.url);
        if (clientUrl.pathname === target.pathname && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    });
}

// Notification click: route to the relevant page based on action
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const clickedAction = event.action; // empty string if notification body clicked

  // If an action button was clicked, find its URL
  if (clickedAction && notifData.actions) {
    const actionDef = notifData.actions.find((a) => a.action === clickedAction);
    if (actionDef && actionDef.url) {
      event.waitUntil(openOrFocusWindow(actionDef.url));
      return;
    }
  }

  // Default: navigate to the main URL
  event.waitUntil(openOrFocusWindow(notifData.url || "/dashboard"));
});
