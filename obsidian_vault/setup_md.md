---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/setup.md
filename: setup.md
---

# setup.md

---
category: Frontend
source: src/test/setup.ts
created: 2026-05-05T19:45:45.746168
size: 353 bytes
hash: 3ed816a7adf0e76610ce76bd32744ea0
headers:
---

# setup.ts

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/test/setup.ts`
- **Tamanho**: 353 bytes

## Conteúdo

import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});


## Tags
#categoria/frontend

