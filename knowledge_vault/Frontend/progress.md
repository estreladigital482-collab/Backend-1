---
category: Frontend
source: src/components/ui/progress.tsx
created: 2026-05-05T19:45:45.746168
size: 765 bytes
hash: 9a8b05beca19e008a562a10e489f5968
headers:
---

# progress.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/progress.tsx`
- **Tamanho**: 765 bytes

## Conteúdo

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };


## Tags
#categoria/frontend
