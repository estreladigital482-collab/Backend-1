---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/switch.md
filename: switch.md
---

# switch.md

---
category: Frontend
source: src/components/ui/switch.tsx
created: 2026-05-05T19:45:45.746168
size: 1147 bytes
hash: eccd8c41c46e782eaaa1f8be0111e089
headers:
---

# switch.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/switch.tsx`
- **Tamanho**: 1147 bytes

## Conteúdo

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };


## Tags
#categoria/frontend

