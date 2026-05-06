---
category: Frontend
source: src/components/ui/badge.tsx
created: 2026-05-05T19:45:45.746168
size: 1074 bytes
hash: 2c4aaddb74ab8aa8231e4f0b066902e0
headers:
---

# badge.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/badge.tsx`
- **Tamanho**: 1074 bytes

## Conteúdo

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };


## Tags
#categoria/frontend
