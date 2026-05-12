---
source: /workspaces/Aura-sphere-/knowledge_vault/Configuração/vitest.config.md
filename: vitest.config.md
---

# vitest.config.md

---
category: Configuração
source: packages/frontend/vitest.config.ts
created: 2026-05-05T19:45:45.739168
size: 395 bytes
hash: 9285ab80c07d5cd1a71aa20c1687352a
headers:
---

# vitest.config.ts

## Metadados
- **Categoria**: Configuração
- **Caminho Original**: `packages/frontend/vitest.config.ts`
- **Tamanho**: 395 bytes

## Conteúdo

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});


## Tags
#categoria/configuração

