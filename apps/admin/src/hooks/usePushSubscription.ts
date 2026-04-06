"use client";

import { useState, useEffect, useCallback } from "react";

type PushState = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed";

/**
 * Hook to manage Web Push notification subscription.
 *
 * Flow:
 * 1. Check browser support + existing permission
 * 2. If already subscribed, sync state
 * 3. `subscribe()` → requestPermission → PushManager.subscribe → save to server
 * 4. `unsubscribe()` → PushManager.unsubscribe → delete from server
 */
export function usePushSubscription() {
  const [state, setState] = useState<PushState>("loading");
  const [loading, setLoading] = useState(false);

  // Check current state on mount
  useEffect(() => {
    async function check() {
      // Feature detection
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("unsupported");
        return;
      }

      // Check permission
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }

      // Check if already subscribed
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "subscribed" : "unsubscribed");
      } catch {
        setState("unsubscribed");
      }
    }

    check();
  }, []);

  const subscribe = useCallback(async () => {
    if (state === "unsupported" || state === "denied") return false;

    setLoading(true);
    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return false;
      }

      // 2. Subscribe via PushManager
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("VAPID public key not configured");
        return false;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // 3. Save to server
      const subJson = sub.toJSON();
      const res = await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          },
          deviceName: getDeviceName(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save subscription");
      }

      setState("subscribed");
      return true;
    } catch (err) {
      console.error("Push subscribe failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [state]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        // Delete from server first
        await fetch("/api/push-subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });

        // Then unsubscribe locally
        await sub.unsubscribe();
      }

      setState("unsubscribed");
      return true;
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { state, loading, subscribe, unsubscribe };
}

/**
 * Convert VAPID public key from base64url to Uint8Array.
 * Required by PushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

/**
 * Best-effort device name for identifying subscriptions.
 */
function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return "Unknown";
}
