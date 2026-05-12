---
category: Configuração
source: packages/frontend/tsconfig.app.json
created: 2026-05-05T19:45:45.739168
size: 665 bytes
hash: ba5729c7405efe54f489c8134bb19b9e
headers:
---

# tsconfig.app.json

## Metadados
- **Categoria**: Configuração
- **Caminho Original**: `packages/frontend/tsconfig.app.json`
- **Tamanho**: 665 bytes

## Conteúdo

{
  "compilerOptions": {
    "types": ["vitest/globals"],
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false,
    "noFallthroughCasesInSwitch": false,

    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}


## Tags
#categoria/configuração
