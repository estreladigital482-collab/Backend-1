---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/localProfile.md
filename: localProfile.md
---

# localProfile.md

---
category: Frontend
source: src/lib/localProfile.ts
created: 2026-05-05T19:45:45.745168
size: 1029 bytes
hash: a0350aa328fd26c36d0e615c679cd2a3
headers:
---

# localProfile.ts

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/lib/localProfile.ts`
- **Tamanho**: 1029 bytes

## Conteúdo

import type { LocalProfile } from "@/lib/types";

const STORAGE_KEY_PREFIX = "aura-sphere-profile";

export function getProfileStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

export function loadLocalProfile(userId: string): LocalProfile {
  if (typeof window === "undefined") {
    return {
      tone: "friendly",
      interests: "",
      personality: "",
      autoMode: true,
    };
  }

  try {
    const raw = window.localStorage.getItem(getProfileStorageKey(userId));
    if (!raw) {
      return {
        tone: "friendly",
        interests: "",
        personality: "",
        autoMode: true,
      };
    }
    return JSON.parse(raw) as LocalProfile;
  } catch {
    return {
      tone: "friendly",
      interests: "",
      personality: "",
      autoMode: true,
    };
  }
}

export function saveLocalProfile(userId: string, profile: LocalProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getProfileStorageKey(userId), JSON.stringify(profile));
}


## Tags
#categoria/frontend

