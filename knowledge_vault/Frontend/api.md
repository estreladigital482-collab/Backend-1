---
category: Frontend
source: src/lib/api.ts
created: 2026-05-05T19:45:45.745168
size: 623 bytes
hash: e14e27f33eaf427b6a102400731a8bd3
headers:
---

# api.ts

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/lib/api.ts`
- **Tamanho**: 623 bytes

## Conteúdo

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


## Tags
#categoria/frontend
