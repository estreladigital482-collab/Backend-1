# 🧪 Guia de Testes e Validação - Aura Sphere

**Última Atualização:** Maio 2026  
**Status:** ✅ Pronto para uso

---

## 📋 Sumário Executivo

Este guia documenta como testar e validar o Aura Sphere em todas as suas camadas:
- **Frontend**: React components, hooks, integração
- **Backend**: APIs, serialização de dados
- **Sistema**: Sincronização, cache, offline/online
- **Fluxos de Usuário**: Social Media, Planejamento, Ações

---

## 🚀 Quick Start - Validação Rápida (5 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Rodar testes unitários
npm test

# 3. Type checking
npm run type-check

# 4. Linting
npm run lint:fix

# 5. Build
npm run build

# Script automático (recomendado)
scripts/validate.sh
```

**Esperado:** Todos os testes passam, sem erros de tipo, sem warnings

---

## 📦 Testes Unitários

### Localização dos Testes
```
src/test/
├── ChatMessage.test.tsx              # Componente de chat
├── ConflictResolutionModal.test.tsx  # Resolução de conflitos
├── SyncPanel.test.tsx                # Painel de sincronização
├── useOfflineChat.test.tsx           # Hook de chat offline
├── useSyncService.integration.test.tsx # Sincronização
├── cache.pagination.test.ts          # Cache e paginação
├── pwa.test.ts                       # Progressive Web App
├── utils.sanitizer.test.ts           # Sanitização de dados
└── SocialMediaFlow.e2e.test.tsx      # ✨ NOVO - Social Media
```

### Executar Testes Específicos

```bash
# Apenas Social Media
npm test -- SocialMediaFlow.e2e.test.tsx

# Apenas sincronização
npm test -- useSyncService.integration.test.tsx

# Watch mode para desenvolvimento
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### O que é Testado

#### 1. **Social Media Flow** ✅
- [x] Login no Instagram com credenciais
- [x] Suporte a 2FA (two-factor authentication)
- [x] Carregamento de contas conectadas
- [x] Sincronização de saves
- [x] Sistema de like/favoritos
- [x] Compartilhamento com Web Share API
- [x] Tratamento de erros de rede
- [x] Validação de contexto de usuário

#### 2. **Offline/Online Sync**
- [x] Detecção de conexão online/offline
- [x] Fila de mensagens pendentes
- [x] Sincronização automática ao conectar
- [x] Resolução de conflitos
- [x] Persistência em localStorage

#### 3. **Cache & Performance**
- [x] Paginação de histórico
- [x] Cache de memórias
- [x] Índice semântico
- [x] Compressão de dados

#### 4. **PWA Features**
- [x] Service Worker installation
- [x] Offline support
- [x] Push notifications
- [x] Install prompt

---

## 🔍 Testes de Integração

### Backend API Validation

```bash
# Iniciar backend
python packages/bridge/app.py

# Em outro terminal, testar endpoints
## Planning
curl -X POST http://localhost:5000/api/v1/planning/plans \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-user","title":"Projeto Test"}'

## Social Media
curl -X GET "http://localhost:5000/api/v1/social/instagram/collections?user_id=test-user"

## Actions
curl -X GET http://localhost:5000/api/v1/actions/pending
```

### Frontend + Backend Integration

```bash
# Terminal 1: Backend
python packages/bridge/app.py

# Terminal 2: Frontend
npm run dev

# Terminal 3: Testes
npm test -- SocialMediaFlow.e2e.test.tsx
```

**Esperado:**
- ✅ Componentes carregam corretamente
- ✅ APIs retornam dados esperados
- ✅ Erros são tratados graciosamente
- ✅ Estados locais sincronizam com servidor

---

## 🎯 Testes Manuais - Fluxos de Usuário

### Fluxo 1: Login e Conexão Social (15 min)

**Pré-requisitos:**
- Conta Instagram real (ou test)
- Navegador moderno

**Passos:**

1. Abrir http://localhost:3000
2. Clicar em "Começar agora" (modo local)
3. Ir para aba "Redes Sociais"
4. Clicar em "Conectar Instagram"
5. Inserir credenciais (ou simulada em dev)
6. Completar 2FA se necessário
7. **Validar:** Conta aparece na lista

**Pontos de Verificação:**
- [ ] Modal abre corretamente
- [ ] Validação de campos funciona
- [ ] Carregamento mostra feedback visual
- [ ] Erro é capturado e mostrado
- [ ] 2FA é solicitado se necessário
- [ ] Conta é listada após sucesso
- [ ] User ID vem do useLocalAuth()

---

### Fluxo 2: Offline→Online Sync (20 min)

**Pré-requisitos:**
- Navegador com DevTools (F12)

**Passos:**

1. Abrir DevTools → Network
2. Abrir http://localhost:3000
3. Enviar algumas mensagens
4. Desabilitar Internet (DevTools → Throttling: Offline)
5. Enviar mais mensagens (devem ficar em "pending")
6. Verificar SyncPanel mostrando mensagens pendentes
7. Re-abilitar Internet
8. **Validar:** Sincronização automática ocorre

**Pontos de Verificação:**
- [ ] SyncPanel aparece quando offline
- [ ] Mensagens entram em fila
- [ ] Indicador visual de pendente é claro
- [ ] Sincronização começar automaticamente
- [ ] Mensagens mudam para "sent"
- [ ] Histórico permanece consistente
- [ ] Conflitos são resolvidos (se necessário)

---

### Fluxo 3: Adicionar Projeto (10 min)

**Pré-requisitos:**
- Estar no modo local ou autenticado

**Passos:**

1. Ir para aba "Planejamento"
2. Clicar em "Novo Projeto"
3. Digitar nome: "Teste E2E"
4. Clicar "Criar"
5. **Validar:** Projeto aparece na lista

**Pontos de Verificação:**
- [ ] Campo aceita texto
- [ ] Botão é desabilido se vazio
- [ ] Toast de sucesso aparece
- [ ] Projeto é criado no backend (verificar logs)
- [ ] User ID é enviado corretamente

---

### Fluxo 4: Social Media Collection (15 min)

**Pré-requisitos:**
- Estar autenticado
- Mock de recomendações (se necessário)

**Passos:**

1. Ir para aba "Redes Sociais"
2. Ver "Recomendações" (parte inferior)
3. Clicar em "Anime"/"Mangá"/"Jogos"
4. Verificar que recomendações carregam
5. Clicar ❤️ em um item (deve ficar vermelho)
6. Clicar 🔗 para compartilhar
7. **Validar:** Like persiste, share funciona

**Pontos de Verificação:**
- [ ] Recomendações carregam para cada tema
- [ ] Like muda cor e persiste (local)
- [ ] Share abre Web Share ou copia link
- [ ] Erro é tratado se API falhar
- [ ] User ID está correto na request

---

## 🔧 Testes de Performance

### Métrica 1: Tempo de Carregamento Inicial

```bash
# Usar Lighthouse (built-in no Chrome DevTools)
# ou npm script
npm run lighthouse

# Esperado:
# - First Contentful Paint: < 2s
# - Largest Contentful Paint: < 3.5s
# - Cumulative Layout Shift: < 0.1
```

### Métrica 2: Sincronização

```bash
# Medir tempo de sync de 100 mensagens
# Ver console no devtools ou logs do backend

# Esperado:
# - Upload: < 1s
# - Download: < 500ms
```

### Métrica 3: Memória

```bash
# Chrome DevTools → Memory
# Tirar heap snapshot antes/depois
# Verificar não há memory leaks

# Esperado:
# - Janela: < 150MB
# - Crescimento após sync: < 10MB
```

---

## 🐛 Testes de Erro

### Cenário 1: Sem Conexão de Internet

```
Ação: Desabilitar internet
Esperado:
- ✅ Modo offline ativa automaticamente
- ✅ Mensagens entram em fila
- ✅ SyncPanel mostra status
- ✅ Sem crashes ou brancos na tela
```

### Cenário 2: API Retorna 500

```
Ação: Forçar erro na API (via Network DevTools ou mock)
Esperado:
- ✅ Toast com mensagem de erro
- ✅ Retry automático (se implementado)
- ✅ Fallback para dados locais (se existirem)
```

### Cenário 3: localStorage Cheio

```
Ação: Simular localStorage cheio
Esperado:
- ✅ Mensagem clara ao usuário
- ✅ Opção de limpeza de cache
- ✅ Sem crash do app
```

### Cenário 4: Credenciais Inválidas

```
Ação: Login com senha errada
Esperado:
- ✅ Mensagem: "Credenciais inválidas"
- ✅ Usuário pode tentar novamente
- ✅ Sem envio de erro para servidor
```

---

## 📊 Checklist Pré-Deploy

Use este checklist antes de fazer deploy em produção:

### Frontend ✅
- [ ] `npm test` passa 100%
- [ ] `npm run build` sem warnings/errors
- [ ] `npm run type-check` sem erros
- [ ] `npm run lint` sem erros críticos
- [ ] Todos os TODOs foram resolvidos
- [ ] Testes e2e do Social Media passam
- [ ] Performance está dentro dos limites
- [ ] Modo offline funciona

### Backend ✅
- [ ] `python -m pytest` passa
- [ ] Endpoints retornam dados corretos
- [ ] Validação de entrada funciona
- [ ] Tratamento de erro é apropriado
- [ ] Database migrations executaram
- [ ] Variáveis de ambiente estão configuradas
- [ ] Logs estão adequados

### Integração ✅
- [ ] Frontend + Backend comunicam
- [ ] Sincronização funciona (online/offline)
- [ ] Segurança de usuário está ok
- [ ] Tokens são refresh automático
- [ ] Dados sensíveis são encriptados
- [ ] Rate limiting funciona

### Deployment ✅
- [ ] Docker build sem erros
- [ ] docker-compose up funciona
- [ ] CORS está corretamente configurado
- [ ] HTTPS está habilitado
- [ ] Health checks passam
- [ ] Logs podem ser acessados
- [ ] Rollback strategy definido

---

## 🚨 Troubleshooting

### Problema: "useLocalAuth is not defined"
**Solução:** Verificar se o hook está importado no componente
```tsx
import { useLocalAuth } from '@/hooks/useLocalAuth';
```

### Problema: "API call fails with CORS error"
**Solução:** Verificar CORS no backend (`app.py`)
```python
origins = [
    "http://localhost:3000",
    "http://localhost:5000"
]
app.add_middleware(CORSMiddleware, ...)
```

### Problema: "localStorage is full"
**Solução:** Limpar cache
```bash
npm run cleanup
# ou no navegador
localStorage.clear()
```

### Problema: "Testes flakies (inconsistentes)"
**Solução:** Aumentar timeout em `vitest.config.ts`
```ts
testTimeout: 10000 // 10 segundos
```

---

## 📚 Referências

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright for E2E](https://playwright.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 📞 Contato & Suporte

Para dúvidas ou problemas com testes, consulte:
- `SYSTEM_EVOLUTION_TASKS.md` - Tarefas de sistema
- `docs/AUTOMATION_DOCS.md` - Automação de testes
- Console do navegador (F12) para debugging real-time
