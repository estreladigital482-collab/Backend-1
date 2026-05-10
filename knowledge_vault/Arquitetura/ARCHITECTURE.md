---
category: Arquitetura
source: ARCHITECTURE.md
created: 2026-05-05T19:45:45.745168
size: 10034 bytes
hash: ea773cd81a09191c01995fb64744f13e
headers:
  - Arquitetura do Aura Sphere - Guia Completo
  - Visão Geral
  - Componentes Principais
  - 1. Frontend (React/Vite)
  - 2. Backend Bridge (FastAPI)
---

# ARCHITECTURE.md

## Metadados
- **Categoria**: Arquitetura
- **Caminho Original**: `ARCHITECTURE.md`
- **Tamanho**: 10034 bytes

## Conteúdo

# Arquitetura do Aura Sphere - Guia Completo

## Visão Geral

O Aura Sphere é um aplicativo de IA conversacional com suporte a múltiplos provedores de LLM, memória inteligente com busca semântica e histórico de conversas persistente.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Vite)                    │
│  - Chat Interface com ParticleSphere                            │
│  - Modes: Chat, Código, Projetos, Memória, Imagem, Voz, etc    │
│  - Múltiplas conversas/sessões                                  │
└──────────┬────────────────────────────────────────────────────┘
           │ HTTP / JSON / Server-Sent Events
┌──────────▼────────────────────────────────────────────────────┐
│                  Backend Bridge (FastAPI/Python)               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ LLM Service: OpenAI, Anthropic, Lovable, Fallback      │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Embedding Service: sentence-transformers               │  │
│  │ (Busca semântica com vetores)                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Memory Engine: MemPalace Integration                    │  │
│  │ (Context-aware memory management)                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Database Layer: SQLAlchemy + PostgreSQL/SQLite         │  │
│  │ (Users, ChatMessages, MemoryEntries, Conversations)    │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
           │
           ├─────────────────────┬────────────────────────┐
           │                     │                        │
    ┌──────▼─────┐    ┌──────────▼─────┐    ┌──────────▼──────┐
    │ PostgreSQL  │    │    Redis       │    │   File Storage  │
    │ (Primary)   │    │   (Cache)      │    │   (Embeddings)  │
    └─────────────┘    └────────────────┘    └─────────────────┘
```

## Componentes Principais

### 1. Frontend (React/Vite)

**Localização**: `/` root e `packages/frontend/`

**Componentes principais**:
- `App.tsx` - Configuração de rotas e providers
- `pages/Index.tsx` - Entrada principal, onboarding
- `pages/Chat.tsx` - Interface de chat com streaming
- `components/AIOnShell.tsx` - Shell principal com sidebar de modos
- `components/ParticleSphere.tsx` - Visualização de estado da IA
- `lib/api.ts` - Cliente HTTP para comunicação com backend

**Features**:
- Múltiplos modos: Chat, Código, Projetos, Memória, Imagem, Voz, Automação
- Busca de memória com resultados em tempo real
- Autenticação com Supabase
- Suporte a múltiplas conversas
- Seleção de prompt types
- Streaming de respostas SSE

### 2. Backend Bridge (FastAPI)

**Localização**: `packages/bridge/`

**Arquivos principais**:
- `app.py` - Aplicação FastAPI principal com rotas
- `llm_service.py` - Integração com provedores de LLM
- `embedding_service.py` - Serviço de embeddings semânticos
- `database.py` - Modelos SQLAlchemy
- `schemas.py` - Validação de dados Pydantic
- `test_api.py` - Testes E2E

**Endpoints**:

#### Health & Setup
- `GET /api/v1/health` - Health check

#### Conversas
- `POST /api/v1/conversations` - Criar nova conversa
- `GET /api/v1/conversations` - Listar conversas do usuário
- `DELETE /api/v1/conversations/{id}` - Deletar conversa

#### Chat
- `POST /api/v1/chat` - Endpoint de chat com streaming SSE
  ```json
  {
    "user_id": "user123",
    "conversation_id": 1,
    "ai_name": "Aurora",
    "prompt_type": "assistant",
    "messages": [
      {"role": "user", "content": "Olá"},
      {"role": "assistant", "content": "Oi! Como vai?"}
    ]
  }
  ```

#### Memória
- `POST /api/v1/memory` - Salvar item de memória
  ```json
  {
    "user_id": "user123",
    "role": "user",
    "content": "Lembrar isso depois",
    "category": "important"
  }
  ```

- `GET /api/v1/history?user_id=...` - Buscar histórico de chat

#### Busca
- `GET /api/v1/search?user_id=...&q=...&semantic=true` - Busca semântica de memória

### 3. LLM Service

**Arquivo**: `packages/bridge/llm_service.py`

**Provedores suportados**:

1. **OpenAI**
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini  # ou gpt-4o, gpt-3.5-turbo
   ```

2. **Anthropic (Claude)**
   ```env
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
   ```

3. **Lovable**
   ```env
   AI_PROVIDER=lovable
   LOVABLE_API_KEY=...
   ```

4. **Local/Fallback** (para desenvolvimento)
   - Simula streaming de respostas
   - Não requer chave de API
   - Útil para testes sem internet

**Features**:
- Streaming de respostas
- Prompts dinâmicos por tipo
- Fallback automático em caso de erro
- Configuração de temperatura e max_tokens

### 4. Embedding Service

**Arquivo**: `packages/bridge/embedding_service.py`

**Modelo padrão**: `sentence-transformers/all-MiniLM-L6-v2`

**Features**:
- Geração de embeddings vetoriais
- Busca semântica com similaridade cosseno
- Batch processing para múltiplos textos
- Cache de resultados

**Configuração**:
```env
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
SEMANTIC_SEARCH_ENABLED=true
```

### 5. Database

**Localização**: `packages/bridge/database.py`

**Tabelas**:

1. **users** - Usuários do sistema
   - `id` (PK)
   - `email`
   - `created_at`

2. **chat_messages** - Histórico de mensagens
   - `id` (PK)
   - `user_id` (FK)
   - `role` (user/assistant/system)
   - `content`
   - `created_at`

3. **memory_entries** - Entradas de memória para busca
   - `id` (PK)
   - `user_id` (FK)
   - `role`
   - `content`
   - `category` (important, chat, code, etc)
   - `created_at`

4. **message_embeddings** - Vetores de embedding para busca semântica
   - `id` (PK)
   - `message_id`
   - `user_id` (FK)
   - `content`
   - `embedding` (Array de floats)
   - `embedding_model`
   - `created_at`

5. **conversations** - Histórico de conversas/sessões
   - `id` (PK)
   - `user_id` (FK)
   - `title`
   - `system_prompt`
   - `prompt_type`
   - `created_at`
   - `updated_at`

## Fluxo de Dados

### 1. Conversa Típica

```
User Input (Frontend)
       ↓
Fetch POST /api/v1/chat
       ↓
Backend: Validar autenticação
       ↓
Backend: Salvar mensagem do usuário em ChatMessage
       ↓
Backend: Buscar contexto (últimas mensagens + memória relevante)
       ↓
Backend: LLMService.stream_chat_completion()
       ↓
Backend: Stream chunks via SSE
       ↓
Frontend: Renderizar streaming response
       ↓
Backend: Salvar resposta em ChatMessage e MemoryEntry
       ↓
Backend: Gerar embedding da resposta
```

### 2. Busca de Memória

```
User Query (Frontend)
       ↓
Fetch GET /api/v1/search?q=...
       ↓
Backend: Gerar embedding da query
       ↓
Backend: Comparar com embeddings existentes
       ↓
Backend: Rankear por similaridade cosseno
       ↓
Backend: Retornar Top-K resultados
       ↓
Fallback: Se busca semântica falhar, usar text search (ILIKE)
```

## Prompts Dinâmicos

O sistema suporta diferentes tipos de prompt (`prompt_type`):

1. **assistant** (padrão)
   - Respostas úteis, claras e objetivas
   - Melhor para conversas gerais

2. **developer**
   - Foco em código e explicações técnicas
   - Melhor para programação

3. **creative**
   - Geração de ideias
   - Melhor para brainstorming

4. **analytical**
   - Análise profunda
   - Melhor para pesquisa

5. **formal**
   - Tom profissional
   - Melhor para documentos

6. **summarizer**
   - Sintetizar informações
   - Melhor para resumos

Cada tipo gera um `system_prompt` customizado automaticamente.

## Autenticação & Segurança

### JWT Tokens
- Algoritmo: HS256
- Header: `Authorization: Bearer <token>`
- Payload: `{"sub": "user_id", "email": "user@example.com"}`

### Dev Mode
Em desenvolvimento (ENV != production):
- Sem token: Usa `dev-user` como fallback
- Facilita testes sem token válido

### Geração de Token (Dev)
```bash
python packages/bridge/scripts/generate_jwt.py --user admin@example.com
```

### Segurança em Produção
- ✅ CORS restrito
- ✅ Rate limiting (slowapi)
- ✅ Validação de payload (Pydantic)
- ✅ Isolamento de dados por user_id
- ❌ TODO: CSP headers
- ❌ TODO: HSTS headers
- ❌ TODO: Input sanitization

## Implantação

### Local (Docker Compose)

```bash
./scripts/setup.sh       # Gera .env
./scripts/dev.sh         # Leva docker-compose up
```

Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Variáveis de Ambiente Critical

```env
# Obrigatório em produção
ENV=production
SECRET_KEY=<gere-uma-chave-segura>
DATABASE_URL=postgresql://user:pass@host/db

# Escolha um provedor
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Recomendado
CORS_ORIGIN=https://seu-dominio.com
SEMANTIC_SEARCH_ENABLED=true
```

## Próximas Melhorias

### P1: Críticas
- [x] Integrar MemPalace completamente ✅ concluído
- [x] Testar com banco PostgreSQL real ✅ concluído
- [x] Implementar CI/CD (GitHub Actions) ✅ concluído
- [x] Validar segurança antes de deployment ✅ concluído

### P2: Importantes
- [x] User profiles com avatar e preferences ✅ concluído
- [x] Rate limiting por usuário ✅ concluído
- [x] Analytics de uso ✅ concluído
- [x] Exportar histórico (JSON/Markdown) ✅ concluído
- [x] Modo offline com cache local ✅ concluído

### P3: Nice-to-Have
- [x] Multi-language support ✅ concluído
- [x] Voice input/output aprimorado ✅ concluído
- [x] Integração com aplicativos externos ✅ concluído
- [x] Custom LLM finetuning ✅ concluído
- [x] Modo de agente multi-step (AutoGPT-like) ✅ concluído

## Referências

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Sentence Transformers](https://www.sbert.net/)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)


## Tags
#categoria/arquitetura
