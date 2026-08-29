"use client";

import { useEffect, useRef } from "react";

type SessionIdleMonitorProps = {
  idleTimeoutSeconds: number;
  keepaliveIntervalSeconds: number;
  keepaliveUrl: string;
  expiredUrl: string;
};

const IDLE_CHECK_MS = 5_000;

export function SessionIdleMonitor({
  idleTimeoutSeconds,
  keepaliveIntervalSeconds,
  keepaliveUrl,
  expiredUrl,
}: SessionIdleMonitorProps) {
  const idleMs = idleTimeoutSeconds * 1000;
  const keepaliveMs = keepaliveIntervalSeconds * 1000;
  const lastActivityRef = useRef(Date.now());
  const lastKeepaliveRef = useRef(0);
  const keepaliveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function redirectToSessionExpired() {
      window.location.href = expiredUrl;
    }

    async function sendKeepalive() {
      lastKeepaliveRef.current = Date.now();
      try {
        const response = await fetch(keepaliveUrl, {
          method: "POST",
          credentials: "same-origin",
        });
        if (response.status === 401) {
          redirectToSessionExpired();
        }
      } catch {
        // Ignore transient network errors; server-side checks still apply on navigation.
      }
    }

    function scheduleKeepalive() {
      if (keepaliveTimerRef.current) return;

      const elapsed = Date.now() - lastKeepaliveRef.current;
      const delay = Math.max(0, keepaliveMs - elapsed);

      keepaliveTimerRef.current = setTimeout(() => {
        keepaliveTimerRef.current = null;
        if (Date.now() - lastActivityRef.current >= idleMs) return;
        void sendKeepalive();
        scheduleKeepalive();
      }, delay);
    }

    function markActive() {
      lastActivityRef.current = Date.now();
      scheduleKeepalive();
    }

    const events: Array<keyof WindowEventMap> = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ];

    for (const event of events) {
      window.addEventListener(event, markActive, { passive: true });
    }

    markActive();

    const idleCheck = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current >= idleMs) {
        redirectToSessionExpired();
      }
    }, IDLE_CHECK_MS);

    return () => {
      for (const event of events) {
        window.removeEventListener(event, markActive);
      }
      window.clearInterval(idleCheck);
      if (keepaliveTimerRef.current) {
        clearTimeout(keepaliveTimerRef.current);
      }
    };
  }, [expiredUrl, idleMs, keepaliveMs, keepaliveUrl]);

  return null;
}
