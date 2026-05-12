---
source: /workspaces/Aura-sphere-/knowledge_vault/Documentação/docker-compose.md
filename: docker-compose.md
---

# docker-compose.md

---
category: Documentação
source: docker-compose.yml
created: 2026-05-05T19:45:45.745168
size: 1632 bytes
hash: 359cfc5de8f7a59502a2fa49b10f786e
headers:
---

# docker-compose.yml

## Metadados
- **Categoria**: Documentação
- **Caminho Original**: `docker-compose.yml`
- **Tamanho**: 1632 bytes

## Conteúdo

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: aura_sphere
      POSTGRES_USER: aura_user
      POSTGRES_PASSWORD: aura_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aura_user -d aura_sphere"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  bridge:
    build:
      context: ./packages/bridge
      dockerfile: Dockerfile
    environment:
      - ENV=development
      - SECRET_KEY=dev-secret-key-change-in-production
      - DATABASE_URL=postgresql://aura_user:aura_pass@postgres:5432/aura_sphere
      - REDIS_URL=redis://redis:6379
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./packages/mempalace:/app/packages/mempalace
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      bridge:
        condition: service_healthy
    environment:
      - VITE_API_URL=http://localhost:8000

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - bridge

volumes:
  postgres_data:

## Tags
#categoria/documentação

