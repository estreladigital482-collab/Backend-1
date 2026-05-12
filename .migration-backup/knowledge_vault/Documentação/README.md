---
category: Documentação
source: README.md
created: 2026-05-05T19:45:45.745168
size: 7801 bytes
hash: 46bf32103dbd70a1344e29a35a1dc21f
headers:
  - Aura Sphere - Aplicativo de IA Conversacional
  - 🚀 Características
  - 📊 Stack Técnico
  - Frontend
  - Backend
---

# README.md

## Metadados
- **Categoria**: Documentação
- **Caminho Original**: `README.md`
- **Tamanho**: 7801 bytes

## Conteúdo

# Aura Sphere - Aplicativo de IA Conversacional

Um aplicativo moderno de IA conversacional com suporte a múltiplos provedores (OpenAI, Anthropic, Lovable), memória inteligente com busca semântica, histórico de conversas persistente e interface de chat em tempo real.

## 🚀 Características

- ✨ **Chat com Streaming**: Respostas em tempo real via Server-Sent Events
- 🧠 **Memória Inteligente**: Busca semântica com embeddings vetoriais
- 💬 **Múltiplas Conversas**: Gerenciar várias sessões independentes
- 🤖 **LLM Agnóstico**: Suporte para OpenAI, Anthropic, Lovable, com fallback local
- 🎨 **Interface Moderna**: React + Vite com componentes Radix UI
- 📱 **Mobile Ready**: Wrapping Android com Capacitor
- 🔐 **Autenticação Segura**: JWT tokens com suporte a Supabase
- 🌍 **Prompts Dinâmicos**: 6 tipos de prompt (Assistant, Developer, Creative, etc.)

## 📊 Stack Técnico

### Frontend
- **React** + **Vite** para desenvolvimento rápido
- **TypeScript** para type safety
- **Tailwind CSS** + **Radix UI** para componentes
- **React Router** para navegação
- **Capacitor** para wrappers mobile

### Backend
- **FastAPI** framework HTTP
- **SQLAlchemy** ORM com PostgreSQL/SQLite
- **LLM Service** integração com 4 provedores
- **Embedding Service** sentence-transformers
- **JWT Authentication** com python-jose
- **Rate Limiting** com slowapi

### Infraestrutura
- **Docker Compose** orquestração local
- **PostgreSQL** banco de dados
- **Redis** cache (optional)
- **Nginx** reverse proxy

## 🎯 Comece Rápido

### Pré-requisitos
- Docker & Docker Compose
- Python 3.10+
- Node.js 18+

### Setup em 3 passos

```bash
# 1. Clone e configure
git clone <repo-url>
cd Aura-sphere-
./scripts/setup.sh

# 2. Configure a API key (edite .env)
nano .env  # Adicione ANTHROPIC_API_KEY ou OPENAI_API_KEY

# 3. Inicie
./scripts/dev.sh
```

Acesse em **http://localhost:3000** 🎉

## 📚 Documentação

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura detalhada, fluxos e design
- **[SETUP.md](./SETUP.md)** - Guia completo de setup e desenvolvimento
- **[MAINTENANCE.md](./MAINTENANCE.md)** - Checklist de deploy e manutenção
- **[SYSTEM_EVOLUTION_TASKS.md](./SYSTEM_EVOLUTION_TASKS.md)** - **CRÍTICO**: Arquitetura de segurança, sandbox, evolução controlada da IA
- **[STUDY_PLAN.md](./STUDY_PLAN.md)** - Plano de estudo dos 70 repositórios clonados
- **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** - Guia de workflow Git com auto-commit
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Próximas tarefas para o projeto
- **[HISTORY.md](./HISTORY.md)** - Histórico de desenvolvimento

## 🔌 API Endpoints

### Conversas
```bash
# Criar nova conversa
POST /api/v1/conversations
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Minha conversa",
  "prompt_type": "assistant"
}

# Listar conversas
GET /api/v1/conversations

# Deletar conversa  
DELETE /api/v1/conversations/{id}
```

### Chat
```bash
# Chat com streaming SSE
POST /api/v1/chat
Authorization: Bearer <token>

{
  "user_id": "user123",
  "ai_name": "Aurora",
  "prompt_type": "assistant",
  "messages": [
    {"role": "user", "content": "Olá!"}
  ]
}

# Response: Server-Sent Events com chunks
data: {"choices":[{"delta":{"content":"Olá"}}]}
```

### Memória
```bash
# Salvar item de memória
POST /api/v1/memory

{
  "user_id": "user123",
  "role": "user",
  "content": "Informação para lembrar",
  "category": "important"
}

# Buscar memória (text ou semântica)
GET /api/v1/search?user_id=user123&q=Python
```

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para documentação detalhada de todos os endpoints.

## 🎨 Modo de Prompts

Suporte a 6 tipos de prompt dinâmicos:

1. **assistant** (padrão) - Respostas úteis e objetivas
2. **developer** - Foco em código e explicações técnicas  
3. **creative** - Brainstorming e geração de ideias
4. **analytical** - Análise profunda de problemas
5. **formal** - Tom profissional e documentado
6. **summarizer** - Síntese e resumos concisos

## 🧠 Busca Semântica

A memória usa **embeddings vetoriais** com sentence-transformers:
- Busca por similaridade semântica (não apenas keywords)
- Modelo padrão: `all-MiniLM-L6-v2` (rápido e eficiente)
- Fallback automático para text search (ILIKE) se embeddings falhar

```bash
# Busca semântica (padrão)
GET /api/v1/search?user_id=user123&q=Qual é a capital da França?

# Text search (fallback)
GET /api/v1/search?user_id=user123&q=capital&semantic=false
```

## 🤖 Provedores de LLM Suportados

### OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # ou gpt-4o, gpt-3.5-turbo
```

### Anthropic (Claude)
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Lovable
```env
AI_PROVIDER=lovable
LOVABLE_API_KEY=...
```

### Local/Fallback (desenvolvimento)
```env
AI_PROVIDER=local  # Simula respostas para testes
```

## 🔐 Autenticação

### Gerar Token JWT (Desenvolvimento)
```bash
cd packages/bridge
python scripts/generate_jwt.py --user admin@example.com
```

### Usar Token
```bash
curl -H "Authorization: Bearer <seu-token>" \
     http://localhost:8000/api/v1/chat
```

## 🧪 Testes

### Backend
```bash
cd packages/bridge
pytest test_api.py -v
```

### Frontend
```bash
cd packages/frontend
npm run test
npm run test:watch
```

## 🐳 Docker

### Desenvolvimento
```bash
docker-compose up -d
```

### Build de produção
```bash
docker-compose build
docker-compose up -d
```

Veja [SETUP.md](./SETUP.md) para mais detalhes de deployment.

## 📱 Mobile (Android)

```bash
# Build e sync com Android
npm run android:sync

# Abrir Android Studio
npm run android:open
```

## 📝 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Essenciais
ENV=development
SECRET_KEY=sua-chave-secreta
DATABASE_URL=postgresql://...

# Escolha um provedor de LLM
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Frontend
VITE_API_URL=http://localhost:8000

# Opcional
SEMANTIC_SEARCH_ENABLED=true
MULTI_SESSION_ENABLED=true
```

Veja `.env.example` para todas as opções.

## 🚀 Deployment

### Checklist Pré-Deploy
1. Configure `ENV=production`
2. Gere nova `SECRET_KEY` segura
3. Use PostgreSQL (não SQLite)
4. Configure `CORS_ORIGIN` correto
5. Implemente HTTPS/TLS
6. Ative backup automático

Veja [MAINTENANCE.md](./MAINTENANCE.md) para checklist completo.

## 🗺️ Roadmap

### ✅ Implementado
- [x] Chat com streaming SSE
- [x] LLM Service (multi-provider)
- [x] Busca semântica com embeddings
- [x] Múltiplas conversas/sessões
- [x] Prompts dinâmicos
- [x] Autenticação JWT
- [x] Testes E2E

### 🔄 Em Progresso
- [x] MemPalace integration completa ✅ concluído
- [x] Redis caching ✅ concluído
- [x] Logging estruturado ✅ concluído
- [x] Rate limiting por usuário ✅ concluído

### 📋 Próximos
- [x] User profiles e preferences ✅ concluído
- [x] Analytics e dashboards ✅ concluído
- [x] Export history (JSON/PDF) ✅ concluído
- [x] Voice input aprimorado ✅ concluído
- [x] Dark mode ✅ concluído
- [x] Modo offline ✅ concluído

Veja [NEXT_STEPS.md](./NEXT_STEPS.md) para lista completa.

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/amazing`)
3. Commit mudanças (`git commit -am 'Add amazing feature'`)
4. Push para branch (`git push origin feature/amazing`)
5. Abra Pull Request

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para diretrizes.

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

## 🙋 Support

- 📖 Veja [SETUP.md](./SETUP.md) para ajuda com setup
- 🐛 Verifique [ARCHITECTURE.md](./ARCHITECTURE.md) para entender o sistema
- 💬 Abra issue no GitHub para bugs/features
- 📧 Envie e-mail para suporte

---

**Desenvolvido com ❤️ para a comunidade de IA**

**Chat em tempo real • Memória inteligente • Multi-LLM**
- No emulador Android, use `VITE_API_URL=http://10.0.2.2:8000` para apontar ao backend local.
- Para produções e dispositivos físicos, defina `VITE_API_URL` para o endpoint público do seu backend.


## Tags
#categoria/documentação
