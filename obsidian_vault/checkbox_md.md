---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/checkbox.md
filename: checkbox.md
---

# checkbox.md

---
category: Frontend
source: src/components/ui/checkbox.tsx
created: 2026-05-05T19:45:45.746168
size: 1053 bytes
hash: cb12d2f3410761f7a678add95c90ac5d
headers:
---

# checkbox.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/checkbox.tsx`
- **Tamanho**: 1053 bytes

## Conteúdo

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };


## Tags
#categoria/frontend

