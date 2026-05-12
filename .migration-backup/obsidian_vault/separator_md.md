---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/separator.md
filename: separator.md
---

# separator.md

---
category: Frontend
source: src/components/ui/separator.tsx
created: 2026-05-05T19:45:45.746168
size: 698 bytes
hash: ed1101f185e9dc801712593e3330a75d
headers:
---

# separator.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/separator.tsx`
- **Tamanho**: 698 bytes

## Conteúdo

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };


## Tags
#categoria/frontend

