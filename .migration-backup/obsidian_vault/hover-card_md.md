---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/hover-card.md
filename: hover-card.md
---

# hover-card.md

---
category: Frontend
source: src/components/ui/hover-card.tsx
created: 2026-05-05T19:45:45.746168
size: 1193 bytes
hash: f77f80ed64ff8f3549e5d7e9d837e08e
headers:
---

# hover-card.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/hover-card.tsx`
- **Tamanho**: 1193 bytes

## Conteúdo

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };


## Tags
#categoria/frontend

