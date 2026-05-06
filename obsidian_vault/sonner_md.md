---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/sonner.md
filename: sonner.md
---

# sonner.md

---
category: Frontend
source: src/components/ui/sonner.tsx
created: 2026-05-05T19:45:45.746168
size: 870 bytes
hash: 700b1ffb909fc4323b0191296ad9c54b
headers:
---

# sonner.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/sonner.tsx`
- **Tamanho**: 870 bytes

## Conteúdo

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };


## Tags
#categoria/frontend

