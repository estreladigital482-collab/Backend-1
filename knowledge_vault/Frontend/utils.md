---
category: Frontend
source: src/lib/utils.ts
created: 2026-05-05T19:45:45.745168
size: 169 bytes
hash: d9837f38cc05303254571985e3164050
headers:
---

# utils.ts

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/lib/utils.ts`
- **Tamanho**: 169 bytes

## Conteúdo

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


## Tags
#categoria/frontend
