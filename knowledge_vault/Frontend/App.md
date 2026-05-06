---
category: Frontend
source: src/App.tsx
created: 2026-05-05T19:45:45.745168
size: 1203 bytes
hash: d60d4bd54e25c5f7e483fdfc4e434ab9
headers:
---

# App.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/App.tsx`
- **Tamanho**: 1203 bytes

## Conteúdo

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useDynamicStyles } from "@/hooks/useVisualCustomization";

const queryClient = new QueryClient();

// Componente para aplicar estilos dinâmicos
const DynamicStylesProvider = ({ children }: { children: React.ReactNode }) => {
  useDynamicStyles();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DynamicStylesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DynamicStylesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


## Tags
#categoria/frontend
