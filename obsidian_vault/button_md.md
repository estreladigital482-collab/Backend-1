---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/button.md
filename: button.md
---

# button.md

---
category: Frontend
source: src/components/ui/button.tsx
created: 2026-05-05T19:45:45.746168
size: 734 bytes
hash: 4260817ea3f5c5e1258b6ec5112b1d0f
headers:
---

# button.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/button.tsx`
- **Tamanho**: 734 bytes

## Conteúdo

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button };


## Tags
#categoria/frontend

