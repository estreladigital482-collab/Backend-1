---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/skeleton.md
filename: skeleton.md
---

# skeleton.md

---
category: Frontend
source: src/components/ui/skeleton.tsx
created: 2026-05-05T19:45:45.746168
size: 234 bytes
hash: c55f76f4faa1d6e888dbc51d41eaa586
headers:
---

# skeleton.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/skeleton.tsx`
- **Tamanho**: 234 bytes

## Conteúdo

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };


## Tags
#categoria/frontend

