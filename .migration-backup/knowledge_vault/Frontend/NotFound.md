---
category: Frontend
source: src/pages/NotFound.tsx
created: 2026-05-05T19:45:45.745168
size: 727 bytes
hash: 233617e24ded7876ea905f003f0f2889
headers:
---

# NotFound.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/pages/NotFound.tsx`
- **Tamanho**: 727 bytes

## Conteúdo

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;


## Tags
#categoria/frontend
