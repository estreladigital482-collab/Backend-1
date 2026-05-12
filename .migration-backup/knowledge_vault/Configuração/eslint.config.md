---
category: Configuração
source: packages/frontend/eslint.config.js
created: 2026-05-05T19:45:45.739168
size: 765 bytes
hash: 31c0881fdd8500aa4d0aa963079713ae
headers:
---

# eslint.config.js

## Metadados
- **Categoria**: Configuração
- **Caminho Original**: `packages/frontend/eslint.config.js`
- **Tamanho**: 765 bytes

## Conteúdo

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);


## Tags
#categoria/configuração
