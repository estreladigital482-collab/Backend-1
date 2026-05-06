---
category: Frontend
source: src/components/ui/toggle.tsx
created: 2026-05-05T19:45:45.746168
size: 679 bytes
hash: b66ca5f1a558c31083ace59cb0871f32
headers:
---

# toggle.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/toggle.tsx`
- **Tamanho**: 679 bytes

## Conteúdo

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle-variants";

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };


## Tags
#categoria/frontend
