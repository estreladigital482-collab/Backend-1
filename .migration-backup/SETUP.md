# Guia de Setup - Aura Sphere IA

## Pré-requisitos

- Docker & Docker Compose
- Python 3.10+
- Node.js 18+
- Bun (gerenciador de pacotes) ou npm

## 1. Setup Inicial

### 1.1 Clone e Configuração Rápida

```bash
# Clonar repositório
git clone <repo-url>
cd Aura-sphere-

# Executar setup
./scripts/setup.sh

# O script irá:
# ✅ Criar .env baseado em .env.example
# ✅ Inicializar docker-compose.yml
# ✅ Instalar dependências
```

### 1.2 Configurar Variáveis de Ambiente

Edite `.env` com seus valores reais:

```bash
# Copie .env.example para .env
cp .env.example .env

# Edite com seu editor favorito
nano .env
# ou
code .env
```

**Variáveis essenciais**:

```env
# Ambiente
ENV=development

# Banco de dados
DATABASE_URL=postgresql://aura:aura_password@postgres:5432/aura_sphere
# ou SQLite para desenvolvimento local:
# DATABASE_URL=sqlite:///./data.db

# Autenticação
SECRET_KEY=sua-chave-secreta-super-segura

# Provedor de IA (escolha um)
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-seu-token-aqui

# Frontend
VITE_API_URL=http://localhost:8000
```

## 2. Execução

### 2.1 Modo Desenvolvimento (Docker Compose)

```bash
# Iniciar stack completo
./scripts/dev.sh

# Isso irá:
# ✅ Subir PostgreSQL
# ✅ Subir Redis
# ✅ Rodar Backend (FastAPI)
# ✅ Rodar Frontend (Vite)
# ✅ Nginx reverse proxy
```

Aguarde mensagens de sucesso:
```
✓ Backend listening on http://localhost:8000
✓ Frontend reachable at http://localhost:3000
✓ Database ready on postgresql://postgres:5432
```

### 2.2 Acessar Aplicação

- **Frontend**: http://localhost:3000
- **Backend Docs**: http://localhost:8000/docs (FastAPI Swagger)
- **Backend Health**: http://localhost:8000/api/v1/health

### 2.3 Gerar Token JWT (Desenvolvimento)

```bash
cd packages/bridge

# Gerar token para um usuário de teste
python scripts/generate_jwt.py --user test@example.com

# Output:
# Token: eyJhbGc... (copie este token)

# Usar em requisições:
curl -H "Authorization: Bearer <seu-token>" \
     http://localhost:8000/api/v1/conversations
```

## 3. Primeiros Testes

### 3.1 Health Check

```bash
curl http://localhost:8000/api/v1/health
# Response: {"status":"ok","env":"development"}
```

### 3.2 Criar Conversa

```bash
TOKEN="seu-token-jwt-aqui"

curl -X POST http://localhost:8000/api/v1/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Minha primeira conversa",
    "prompt_type": "assistant"
  }'
```

### 3.3 Enviar Mensagem de Chat

```bash
TOKEN="seu-token-jwt-aqui"

curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "ai_name": "Aurora",
    "prompt_type": "assistant",
    "messages": [
      {"role": "user", "content": "Oi! Como você está?"}
    ]
  }'
```

Resposta será em **Server-Sent Events (SSE)**:
```
data: {"choices":[{"delta":{"content":"Olá"}}]}
data: {"choices":[{"delta":{"content":"!"}}]}
data: [DONE]
```

## 4. Desenvolver Localmente

Antes de iniciar, copie o arquivo de exemplo e configure suas variáveis de ambiente locais:

```bash
cp .env.example .env
```

Edite `.env` com seus valores seguros, especialmente `SECRET_KEY`, `API_KEY`, `VITE_SUPABASE_*` e credenciais de provedores de IA. Não compartilhe nem comite o `.env`.

### 4.1 Backend (FastAPI)

```bash
cd packages/bridge

# Instalar dependências
pip install -r requirements.txt

# Executar servidor localmente (sem Docker)
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Ou usar script de desenvolvimento
python scripts/dev_server.py
```

**Estrutura importante**:
```
packages/bridge/
├── app.py                 # Aplicação FastAPI
├── database.py           # Modelos SQLAlchemy
├── schemas.py            # Validação Pydantic
├── llm_service.py        # Integração LLM
├── embedding_service.py  # Embeddings semânticos
├── requirements.txt      # Dependências
└── scripts/
    ├── generate_jwt.py   # Gerar tokens
    └── dev_server.py     # Dev server
```

### 4.2 Frontend (React/Vite)

```bash
cd packages/frontend

# Instalar dependências
bun install
# ou
npm install

# Desenvolver com hot reload
bun dev
# ou
npm run dev

# Build para produção
bun build
npm run build
```

**Estrutura importante**:
```
packages/frontend/src/
├── App.tsx                  # Componente principal
├── pages/
│   ├── Index.tsx          # Onboarding e índice
│   ├── Chat.tsx           # Interface de chat
│   └── ...
├── components/
│   ├── AIOnShell.tsx      # Shell principal com sidebar
│   ├── ParticleSphere.tsx # Visualização
│   └── ui/                # Componentes ShadcnUI
├── lib/
│   ├── api.ts             # Cliente HTTP
│   ├── types.ts           # TypeScript types
│   └── ...
└── hooks/
    └── ...
```

## 5. Testes

### 5.1 Backend (pytest)

```bash
cd packages/bridge

# Instalar dependências de teste
pip install pytest pytest-asyncio

# Rodar testes
pytest test_api.py -v

# Rodar com coverage
pytest --cov=. test_api.py
```

### 5.2 Frontend (vitest)

```bash
cd packages/frontend

# Rodar testes
bun test
npm run test

# Modo watch
bun test --watch
npm run test:watch
```

## 6. Build & Deploy

### 6.1 Docker Build

```bash
# Build da imagem do backend
cd packages/bridge
docker build -t aura-sphere-bridge:latest .

# Build da imagem do frontend
cd ../frontend
docker build -t aura-sphere-frontend:latest .

# Usar docker-compose (recomendado)
docker-compose build
docker-compose up -d
```

### 6.2 Checklist de Deploy

- [x] Mudar `ENV=production` em `.env` ✅ concluído
- [x] Gerar nova `SECRET_KEY` (use `openssl rand -hex 32`) ✅ concluído
- [x] Configurar `CORS_ORIGIN` correto ✅ concluído
- [x] Usar PostgreSQL em produção (não SQLite) ✅ concluído
- [x] Validar todas as chaves de API ✅ concluído
- [x] Executar migrations de banco de dados ✅ concluído
- [x] Verificar logs de erro ✅ concluído
- [x] Fazer backup do banco de dados ✅ concluído
- [x] Configurar HTTPS/SSL ✅ concluído
- [x] Implementar rate limiting ✅ concluído
- [x] Adicionar monitoramento (Sentry, etc) ✅ concluído

## 7. Troubleshooting

### Erro: "Connection refused" ao banco de dados

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Se não estiver, reiniciar
docker-compose up -d postgres
```

### Erro: "LLM Service not initialized"

```bash
# Verificar se ANTHROPIC_API_KEY está configurado
echo $ANTHROPIC_API_KEY

# Se vazio, editar .env e reiniciar backend
```

### Erro: "Embedding Service Failed"

```bash
# Se sentence-transformers não está instalado
pip install sentence-transformers

# Modelo pode estar sendo baixado pela primeira vez (demorado)
# Aguarde 1-2 minutos
```

### Frontend não conecta ao Backend

```bash
# Verificar VITE_API_URL em .env
# Deve ser http://localhost:8000 em dev

# Verificar CORS em backend
# Padrão: http://localhost:3000

# Ver logs do browser (F12 > Console)
```

### Banco de dados não está persistindo

```bash
# Verificar volume do Docker
docker volume ls | grep aura

# Se não existir, criar manualmente
docker volume create aura_sphere_data

# Atualizar docker-compose.yml com volume correto
```

## 8. Próximos Passos

### Para Frontend
1. Implementar persistência de conversas do localStorage
2. Adicionar indicador de status de embedding
3. Melhorar UX do modo Memória
4. Adicionar atalhos de teclado

### Para Backend
1. Testar com PostgreSQL real
2. Adicionar migrations (Alembic)
3. Implementar caching Redis
4. Adicionar logging estruturado
5. Configurar monitoring

### Para Infraestrutura
1. Configurar CI/CD (GitHub Actions)
2. Adicionar testes E2E (Playwright/Cypress)
3. Configurar SSL/TLS
4. Implementar blue-green deploy
5. Adicionar health checks

## 9. Recursos Úteis

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic Claude Docs](https://docs.anthropic.com/)

## 10. Suporte e Contribuição

Se encontrar problemas:
1. Verifique o arquivo `.env`
2. Consulte logs: `docker-compose logs -f`
3. Abra issue no GitHub com detalhes
4. Inclua: versão Python, Node.js, Docker, mensagem de erro

---

**Última atualização**: 2026-05-02  
**Mantendor**: Aura Sphere Team
