---
category: Frontend
source: src/components/ui/input.tsx
created: 2026-05-05T19:45:45.746168
size: 799 bytes
hash: b8279d768c2a1ce78a05a369a0502877
headers:
---

# input.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/input.tsx`
- **Tamanho**: 799 bytes

## Conteúdo

import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };


## Tags
#categoria/frontend
