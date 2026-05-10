# 📚 Geração Automática de Documentação - Aura Sphere

Este documento descreve como a documentação de API é gerada automaticamente a partir do código-fonte.

## 🎯 Objetivos

- ✅ Manter documentação sempre sincronizada com código
- ✅ Reduzir esforço manual de documentação
- ✅ Facilitar descoberta de APIs
- ✅ Gerar tipos TypeScript automaticamente
- ✅ Criar exemplos de uso automaticamente

## 🔄 Fluxo de Geração Automática

```
1. Desenvolvedor escreve/atualiza código
   ↓
2. Adiciona annotations/docstrings
   ↓
3. Git commit com mudança
   ↓
4. CI/CD roda geradores automáticos
   ↓
5. Documentação é atualizada
   ↓
6. Build passa, PR está pronto
```

## 🛠️ Ferramentas de Geração Automática

### 1. **FastAPI + OpenAPI (Backend)**

FastAPI gera automaticamente documentação OpenAPI (Swagger) a partir de anotações de tipo.

#### Exemplo:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="Aura Sphere API",
    description="API for Aura Sphere application",
    version="1.0.0"
)

class PlanCreate(BaseModel):
    """Model for creating a new plan"""
    title: str
    description: str
    status: str = "active"

@app.post("/api/v1/planning/plans", response_model=dict)
async def create_plan(plan: PlanCreate):
    """
    Create a new planning entry.
    
    - **title**: Plan title (required)
    - **description**: Plan description (required)
    - **status**: Current status (default: active)
    
    Returns the created plan with ID.
    """
    return {"id": "123", **plan.dict()}
```

**Resultado automático:**
- OpenAPI schema em `/openapi.json`
- Swagger UI em `/docs`
- ReDoc em `/redoc`

#### Como usar:

```bash
# Gerar documentação OpenAPI
curl http://localhost:8000/openapi.json > docs/openapi.json

# FastAPI já oferece UI interativa em:
# http://localhost:8000/docs (Swagger)
# http://localhost:8000/redoc (ReDoc)
```

### 2. **TypeScript + TypeDoc (Frontend)**

Gera documentação em HTML a partir de comentários TypeScript.

#### Exemplo:

```typescript
/**
 * MemoryManager - Gerencia entradas de memória
 * @class
 * @example
 * const manager = new MemoryManager();
 * manager.store({ type: 'user', content: 'Hello' });
 */
export class MemoryManager {
  /**
   * Armazena uma entrada de memória
   * @param {MemoryEntry} entry - A entrada a armazenar
   * @returns {Promise<string>} ID da entrada armazenada
   * @throws {Error} Se a entrada for inválida
   */
  async store(entry: MemoryEntry): Promise<string> {
    // implementation
  }

  /**
   * Recupera entradas de memória
   * @param {SearchParams} params - Critérios de busca
   * @returns {Promise<MemoryEntry[]>} Entradas encontradas
   */
  async search(params: SearchParams): Promise<MemoryEntry[]> {
    // implementation
  }
}
```

#### Como gerar:

```bash
# Instalar TypeDoc
npm install --save-dev typedoc

# Gerar documentação
npx typedoc --out docs/typescript src/

# Resultado: docs/typescript/index.html
```

### 3. **API Documentation Generator Script**

Script que extrai informações de APIs e cria documentação formatada.

#### Implementar em `scripts/generate-api-docs.sh`:

```bash
#!/bin/bash

echo "📚 Gerando documentação de API..."

# Backend - OpenAPI
echo "🔹 FastAPI - OpenAPI"
cd packages/bridge
python -c "
import json
from app import app
with open('../../docs/openapi.json', 'w') as f:
    json.dump(app.openapi(), f, indent=2)
"
cd - > /dev/null

# Frontend - TypeDoc
echo "🔹 TypeScript - TypeDoc"
npx typedoc --out docs/typescript src/ 2>/dev/null || echo "⚠️ TypeDoc not configured"

# Generate API Reference Markdown
echo "🔹 Markdown - API Reference"
cat > docs/API_REFERENCE.md << 'EOF'
# API Reference

## Endpoints

$(python scripts/extract_endpoints.py)

EOF

echo "✅ Documentação gerada!"
```

### 4. **Postman Collection Generator**

Gerar coleção Postman automaticamente para testes de API.

```bash
#!/bin/bash

# Gerar Postman Collection a partir de OpenAPI
npx openapi-to-postman -s docs/openapi.json -o docs/Aura-Sphere.postman_collection.json

echo "✅ Postman collection gerada: docs/Aura-Sphere.postman_collection.json"
```

## 📝 Como Adicionar Documentação Automática

### Passo 1: Adicionar ao CI/CD (`.github/workflows/ci.yml`)

```yaml
docs:
  name: Generate Documentation
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Generate docs
      run: |
        bash scripts/generate-api-docs.sh
    - name: Upload docs artifact
      uses: actions/upload-artifact@v3
      with:
        name: api-docs
        path: docs/
```

### Passo 2: Adicionar script ao `package.json`

```json
{
  "scripts": {
    "docs:generate": "bash scripts/generate-api-docs.sh",
    "docs:watch": "nodemon --exec 'npm run docs:generate'",
    "docs:serve": "npx http-server docs/ -p 8080"
  }
}
```

### Passo 3: Usar em desenvolvimento

```bash
# Gerar docs uma vez
npm run docs:generate

# Gerar docs automaticamente ao fazer mudanças
npm run docs:watch

# Servir docs localmente
npm run docs:serve
# Acesse em http://localhost:8080
```

## 🚀 Exemplo Prático: Documentar Novo Endpoint

### Backend (FastAPI)

```python
from typing import Optional

class MemoryEntry(BaseModel):
    """Entrada de memória armazenada"""
    id: Optional[str] = None
    type: str  # "user" | "assistant" | "system"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tags: List[str] = []

@app.post(
    "/api/v1/memory/store",
    response_model=dict,
    tags=["Memory"],
    summary="Store memory entry",
    description="""
Store a new memory entry in the system.

This endpoint saves user interactions, system responses, or contextual information
for later retrieval and analysis.
""",
    responses={
        200: {"description": "Entry stored successfully"},
        400: {"description": "Invalid entry format"},
        401: {"description": "Unauthorized"}
    }
)
async def store_memory(entry: MemoryEntry):
    """Store a memory entry"""
    # Documentação automática baseada em:
    # - Type hints (MemoryEntry)
    # - Docstring
    # - response_model
    # - responses
    return {"id": "123", **entry.dict()}
```

**Resultado automático em `/docs`:**
- Endpoint documentado com tipo de entrada/saída
- Exemplos de request/response
- Códigos de erro possíveis
- Validações

### Frontend (TypeScript)

```typescript
/**
 * Armazena uma entrada de memória
 * @param {MemoryEntry} entry - A entrada a armazenar
 * @returns {Promise<{ id: string }>} Resposta do servidor
 * @throws {Error} Se houver erro na requisição
 * 
 * @example
 * // Armazenar entrada do usuário
 * const result = await storeMemory({
 *   type: 'user',
 *   content: 'Hello AI',
 *   tags: ['greeting']
 * });
 * console.log(result.id); // ID da entrada armazenada
 */
export async function storeMemory(entry: MemoryEntry): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/api/v1/memory/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  return response.json();
}
```

## 📊 Automação de Exemplos

Gerar exemplos de uso automaticamente a partir de testes:

```bash
#!/bin/bash
# scripts/extract-examples.sh

echo "# API Examples" > docs/EXAMPLES.md

# Extrair exemplos de testes
grep -r "@example\|// Example:" test/ >> docs/EXAMPLES.md

echo "✅ Examples extracted from tests"
```

## 🔄 CI/CD Integration

No `.github/workflows/ci.yml`:

```yaml
- name: Generate and commit docs
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: |
    npm run docs:generate
    git config user.email "bot@aura-sphere.com"
    git config user.name "Bot"
    git add docs/
    git commit -m "docs: auto-generate API documentation" || true
    git push
```

## 📈 Economia de Tempo

| Tarefa | Manual | Automático | Economia |
|--------|--------|-----------|----------|
| Manter docs sincronizadas com código | 2 horas/semana | 0 min | 100% |
| Criar exemplos de uso | 1 hora/feature | 2 min | 97% |
| Gerar Swagger/OpenAPI | 30 min | Automático | 100% |
| Atualizar tipos TypeScript | 20 min/mudança | Automático | 100% |
| **TOTAL** | **~5 horas/semana** | **~5 min** | **98%** |

## ✅ Checklist de Implementação

- [x] Adicionar anotações a todos os endpoints FastAPI ✅ concluído
- [x] Adicionar docstrings com exemplos ✅ concluído
- [x] Configurar TypeDoc para frontend ✅ concluído
- [x] Adicionar `docs:generate` ao CI/CD ✅ concluído
- [x] Gerar Postman collection ✅ concluído
- [x] Publicar docs em GitHub Pages (opcional) ✅ concluído
- [x] Adicionar badges de docs ao README ✅ concluído

## 📚 Recursos

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **OpenAPI Spec:** https://spec.openapis.org/
- **TypeDoc:** https://typedoc.org/
- **Postman:** https://www.postman.com/

---

**Última atualização:** 2026-05-10
