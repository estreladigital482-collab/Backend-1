---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/use-mobile.md
filename: use-mobile.md
---

# use-mobile.md

---
category: Frontend
source: src/hooks/use-mobile.tsx
created: 2026-05-05T19:45:45.745168
size: 576 bytes
hash: c0a0bdd4638c391a1dd06ac82074e60b
headers:
---

# use-mobile.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/hooks/use-mobile.tsx`
- **Tamanho**: 576 bytes

## Conteúdo

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}


## Tags
#categoria/frontend

