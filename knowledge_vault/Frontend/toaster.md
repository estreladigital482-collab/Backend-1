---
category: Frontend
source: src/components/ui/toaster.tsx
created: 2026-05-05T19:45:45.746168
size: 730 bytes
hash: 1903846ab268620de6356ef667e3fa21
headers:
---

# toaster.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/components/ui/toaster.tsx`
- **Tamanho**: 730 bytes

## Conteúdo

import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}


## Tags
#categoria/frontend
