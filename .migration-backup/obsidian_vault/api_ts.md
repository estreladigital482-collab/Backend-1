---
source: /workspaces/Aura-sphere-/src/lib/api.ts
filename: api.ts
---

# api.ts

export const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  const ua = navigator.userAgent || "";
  const isAndroidWebView = /Android/i.test(ua) && /\bwv\b|WebView/i.test(ua);
  if (isAndroidWebView) {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000";
};

export const getAuthHeaders = () => {
  const token = import.meta.env.VITE_API_KEY;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

