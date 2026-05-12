---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/slider.md
filename: slider.md
---

# slider.md

---
category: Frontend
source: src/components/ui/slider.tsx
created: 2026-05-05T19:45:45.746168
size: 1065 bytes
hash: e3bf7b6116ddbdbe8c7b3597d07daee0
headers:
---

# slider.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/slider.tsx`
- **Tamanho**: 1065 bytes

## Conteúdo

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };


## Tags
#categoria/frontend

