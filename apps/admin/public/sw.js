/**
 * Service Worker — Push Notifications only.
 * No caching strategy (PWA not used offline).
 * Bump version to force update on existing installs.
 */
const SW_VERSION = "v4";

// Install: skip waiting immediately (no precache)
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: clean up ALL old caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// No fetch handler — let all requests go directly to the network.
// This eliminates duplicate requests caused by stale-while-revalidate.

// ─── Push notification handler ──────────────────────────────────────

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
    actions: (data.actions || []).slice(0, 2).map((a) => ({
      action: a.action,
      title: a.title,
    })),
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      if (data.badgeCount !== undefined && navigator.setAppBadge) {
        navigator.setAppBadge(data.badgeCount);
      }
    })
  );
});

// ─── Notification click handler ─────────────────────────────────────

function openOrFocusWindow(targetUrl) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const clickedAction = event.action;

  if (clickedAction && notifData.actions) {
    const actionDef = notifData.actions.find((a) => a.action === clickedAction);
    if (actionDef && actionDef.url) {
      event.waitUntil(openOrFocusWindow(actionDef.url));
      return;
    }
  }

  event.waitUntil(openOrFocusWindow(notifData.url || "/dashboard"));
});
