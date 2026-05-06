---
category: Frontend
source: src/components/ui/textarea.tsx
created: 2026-05-05T19:45:45.746168
size: 682 bytes
hash: c7cc36300ed736d97459557a5d6e5928
headers:
---

# textarea.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/textarea.tsx`
- **Tamanho**: 682 bytes

## Conteúdo

import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";


## Tags
#categoria/frontend
