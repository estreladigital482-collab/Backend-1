---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/platform.md
filename: platform.md
---

# platform.md

---
category: Frontend
source: src/lib/platform.ts
created: 2026-05-05T19:45:45.746168
size: 1008 bytes
hash: aa12b6b546b270d698a6019586b46182
headers:
---

# platform.ts

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/lib/platform.ts`
- **Tamanho**: 1008 bytes

## Conteúdo

import { Capacitor } from "@capacitor/core";

export type PlatformType = "android" | "ios" | "desktop" | "web";

export function getPlatform(): PlatformType {
  if (typeof window === "undefined") {
    return "web";
  }

  const ua = window.navigator.userAgent || "";

  if (ua.includes("Electron")) {
    return "desktop";
  }

  if (ua.includes("Android")) {
    return "android";
  }

  if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")) {
    return "ios";
  }

  try {
    if (typeof Capacitor !== "undefined" && typeof Capacitor.getPlatform === "function") {
      const platform = Capacitor.getPlatform();
      if (platform === "android" || platform === "ios") {
        return platform;
      }
      if (platform === "electron") {
        return "desktop";
      }
    }
  } catch {
    // Fallback to user agent detection.
  }

  return "web";
}

export function isMobilePlatform() {
  const platform = getPlatform();
  return platform === "android" || platform === "ios";
}


## Tags
#categoria/frontend

