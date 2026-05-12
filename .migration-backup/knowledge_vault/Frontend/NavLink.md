---
category: Frontend
source: src/components/NavLink.tsx
created: 2026-05-05T19:45:45.746168
size: 751 bytes
hash: 8f7c178b4776787e58e1011855ca28f6
headers:
---

# NavLink.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/NavLink.tsx`
- **Tamanho**: 751 bytes

## Conteúdo

import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };


## Tags
#categoria/frontend
