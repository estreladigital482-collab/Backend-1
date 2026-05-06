---
source: /workspaces/Aura-sphere-/knowledge_vault/Configuração/vite.config.md
filename: vite.config.md
---

# vite.config.md

---
category: Configuração
source: packages/frontend/vite.config.ts
created: 2026-05-05T19:45:45.738168
size: 625 bytes
hash: 9b0e06c88c24cd440aac4cc574fc3bbf
headers:
---

# vite.config.ts

## Metadados
- **Categoria**: Configuração
- **Caminho Original**: `packages/frontend/vite.config.ts`
- **Tamanho**: 625 bytes

## Conteúdo

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));


## Tags
#categoria/configuração

