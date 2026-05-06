---
category: Frontend
source: src/components/ui/label.tsx
created: 2026-05-05T19:45:45.746168
size: 696 bytes
hash: cd2b2255bbe519cb0865dfeaa6615797
headers:
---

# label.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/label.tsx`
- **Tamanho**: 696 bytes

## Conteúdo

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };


## Tags
#categoria/frontend
