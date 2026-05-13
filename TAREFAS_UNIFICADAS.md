# Tarefas Unificadas do Projeto CAOS

> Arquivo consolidado de checklists extraídos de `CAOS_TAREFAS.md`, `TESTING_GUIDE.md`, `INDICE_CONTINUIDADE.md` e `CONTINUITY_QUICK_START.md`.

## Fonte: CAOS_TAREFAS.md — 101 itens

[ ] `lib/db/src/schema/aura-sphere.ts` — Renomear tabelas para `caos_profiles`, `caos_messages` (requer migration)
[ ] `lib/db/src/schema/nexus.ts` — Renomear tabelas `nexus_skills` → `caos_nexus_skills`, `nexus_conversations` → `caos_nexus_conversations`, etc. (requer migration)
[ ] Verificar que as rotas `/api/items`, `/api/themes`, `/api/agents`, `/api/skills`, `/api/projects` estão registradas sem conflito em `artifacts/api-server/src/routes/index.ts`
[ ] Confirmar que a rota `/api/skills` do creator-hub não conflita com a `/skills` do nexus-ai (mover hub skills para `/api/hub/skills` se necessário)
[ ] Testar end-to-end: criar item no CAOS Studio → aparecer no banco → aparecer no Arsenal
[ ] As habilidades do Nexus (`nexus_skills`) devem aparecer como Protocolos no CAOS Studio
[ ] Criar endpoint unificado `GET /api/caos/capacidades` que retorna habilidades do nexus + protocolos do hub
[ ] Atualizar CAOS Shell para usar o sistema de Protocolos do Studio
[ ] Criar rota `GET /api/caos/status` que retorna estado de todos os subsistemas (itens, entidades, protocolos, missões, conversas)
[ ] Este endpoint é o "coração" do dashboard Central CAOS
[ ] Criar `artifacts/api-server/src/security/lobos.ts` — middleware de rate limiting reutilizável
[ ] Rate limit por **IP** (atual, manter)
[ ] Rate limit por **rota** (endpoints críticos têm limites diferentes)
[ ] Rate limit por **user_id** para usuários autenticados (mais generoso)
[ ] Limite progressivo: 1ª violação = aviso, 2ª = delay 5s, 3ª = bloqueio 1h
[ ] Persistir estado de bloqueio no banco (tabela `caos_security_blocks`)
[ ] Endpoint `GET /api/caos/security/blocks` para visualização no dashboard
[ ] Criar `artifacts/api-server/src/security/formigas.ts` — sistema de detecção de padrões
[ ] Log de todas as requisições em tabela `caos_audit_log` (ip, rota, user, timestamp, payload_size, status)
[ ] Detectar padrões suspeitos:
[ ] Implementar `GET /api/caos/security/issues` com dados REAIS (substituir stub)
[ ] Implementar `POST /api/caos/security/audit` com análise real de código (ou heurística básica)
[ ] Tabela: `caos_security_issues` (id, severity, description, component, ip, user_id, detected_at, status)
[ ] Criar `artifacts/api-server/src/security/abelhas.ts` — sistema de resposta a ameaças
[ ] Quando as Formigas detectam ameaça → Abelhas executam ação:
[ ] Dashboard de ameaças ativas: `GET /api/caos/security/threats`
[ ] Sistema de whitelist/blacklist: `POST /api/caos/security/whitelist`, `POST /api/caos/security/blacklist`
[ ] Quarentena de IPs suspeitos (resposta 429 com mensagem genérica)
[ ] Endpoint de revisão manual de bloqueios (para o admin desbloquear)
[ ] `artifacts/aura-sphere/src/components/SecurityDashboard.tsx` já existe com UI completa
[ ] Substituir os stubs em `stub-v1.ts` com implementações reais
[ ] Conectar `GET /api/v1/security/issues` → tabela `caos_security_issues`
[ ] Conectar `POST /api/v1/security/audit` → lógica das Formigas
[ ] Conectar `PATCH /api/v1/security/issues/:id/status` → atualizar banco
[ ] Adicionar no StatusDashboard o status dos Lobos (bloqueios ativos), Formigas (padrões detectados) e Abelhas (ameaças em quarentena)
[ ] Traduzir labels ingleses restantes no SecurityDashboard (Open → Aberto, Resolved → Resolvido, Ignored → Ignorado)
[ ] Criar `lib/db/src/schema/security.ts` com as tabelas:
[ ] Rodar `pnpm --filter @workspace/db run push` para aplicar
[ ] Criar endpoint `POST /api/items/fusao` que recebe dois `item_id` e gera um novo item Épico ou Lendário
[ ] Lógica: raridade resultado = raridade superior + 1 tier (ou Lendário se já Épico)
[ ] Nome e descrição gerados por IA (opcional — pode ser mock por ora)
[ ] UI: botão "Fundir" no Arsenal que abre seletor de dois itens
[ ] Registrar fusão no audit log
[ ] Ao visualizar uma Entidade, permitir selecionar Protocolos para "plugar" nela
[ ] Chamar `POST /api/hub-skills/:id/plug` ao plugar
[ ] Exibir lista de protocolos plugados no card da Entidade
[ ] Ao criar Missão, permitir selecionar Fragmento (tema), Entidades e Protocolos
[ ] Botão "Construir Missão" chama `POST /api/projects/:id/build`
[ ] Mostrar status de progresso: Rascunho → Construindo → Concluída
[ ] Animação de loading durante "Construindo" (3 segundos atual → pode ser estendido)
[ ] Na página `/itens/:id` — botão "Clonar" ainda não tem função (apenas UI)
[ ] Implementar chamada `POST /api/items/:id/clone` no botão Clonar
[ ] Redirecionar para o novo item após clonar
[ ] Adicionar campo de busca por nome no Arsenal
[ ] Filtro por data (mais recentes / mais antigos)
[ ] Ordenação por raridade (Lendários primeiro)
[ ] Paginação (atualmente carrega tudo)
[ ] Criar tabela `caos_memories` no banco para armazenar contexto de conversas
[ ] Endpoint `POST /api/caos/memory` para salvar memória
[ ] Endpoint `GET /api/caos/memory/busca?q=...` para busca semântica (pode ser busca por texto simples inicialmente)
[ ] Conectar memória ao chat principal do CAOS Shell
[ ] CAOS Shell já tem lógica de localStorage, mas sync com backend é incompleta
[ ] Implementar fila de mensagens offline: ao reconectar, enviar mensagens pendentes
[ ] Indicador visual de modo offline no header do CAOS Shell
[ ] Implementar rastreamento real de chamadas para OpenAI em `chat.ts`
[ ] Registrar em tabela `caos_api_usage` (provider, endpoint, tokens, custo_estimado, timestamp)
[ ] Substituir stub `GET /api/v1/costs/summary` com dados reais
[ ] Mostrar custo estimado no dashboard Central CAOS
[ ] `/v1/abilities/*` → conectar com sistema de Protocolos do CAOS Studio
[ ] `/v1/actions/*` → implementar fila de ações pendentes (Action Queue real)
[ ] `/v1/device/profile` → detectar device do usuário (User-Agent parsing)
[ ] `/v1/memory/*` → conectar com sistema HER-001
[ ] `/v1/planning/*` → conectar com sistema de Missões do CAOS Studio
[ ] `/v1/social/*` → manter como stub (baixa prioridade)
[ ] Verificar conflito entre `/api/skills` (nexus) e `/api/hub-skills` (creator-hub)
[ ] Mover toda lógica do nexus para prefixo `/api/nexus/` para separar dos módulos hub
[ ] Documentar todas as rotas em comentário no `index.ts`
[ ] Criar migration para renomear tabelas `hub_*` → `caos_*` (ou manter como está e documentar)
[ ] Criar migration para renomear `nexus_*` → `caos_nexus_*`
[ ] Criar migration para renomear `aura_sphere_*` → `caos_shell_*`
[ ] Atualizar `replit.md` — mudar "Aura Sphere" → "CAOS" em toda documentação
[ ] Documentar a arquitetura completa do CAOS (quais artifacts existem e para que servem)
[ ] Criar `ARQUITETURA.md` explicando fluxo de dados entre os módulos
[ ] Criar testes de smoke para rotas principais do creator-hub (items, themes, agents, skills, projects)
[ ] Testar rate limiter dos Lobos com cenário de abuso
[ ] Testar fluxo completo: criar item → ver no Arsenal → detalhar → clonar → destruir
[x] `artifacts/aura-sphere/public/manifest.json` — Alterar `name: "Aura Sphere"` → `"CAOS"` e `short_name: "AuraSphere"` → `"CAOS"`
[x] `artifacts/aura-sphere/public/sw.js` — Renomear `CACHE_NAME = 'aura-sphere-cache-v1'` → `'caos-cache-v1'`
[x] `artifacts/aura-sphere/src/lib/localProfile.ts` — `STORAGE_KEY_PREFIX = "aura-sphere-profile"` → `"caos-profile"`
[x] `artifacts/aura-sphere/src/lib/projects.ts` — `STORAGE_KEY_PREFIX = "aura-sphere-projects"` → `"caos-projects"`
[x] `artifacts/aura-sphere/src/hooks/useVisualCustomization.ts` — `'aura-sphere-visual-state'` → `'caos-visual-state'`
[x] `replit.md` — Atualizar referências de "Aura Sphere" → "CAOS"
[x] `artifacts/nexus-ai/` — Pacote já renomeado para `@workspace/caos-nexus`
[x] `artifacts/api-server/src/routes/nexus-ai.ts` — Renomear arquivo e variável `nexusAiRouter` → `caosNexusRouter`
[x] `artifacts/api-server/src/routes/index.ts` — Atualizar import e registro do router
[x] `artifacts/creator-hub-rpg/src/pages/projects.tsx` linha 100 — Alterar placeholder `"ex: Operação Nexus V2"` → `"ex: Operação CAOS V2"`
[x] `artifacts/mockup-sandbox/src/components/mockups/nexus-themes/` — Renomear pasta para `caos-themes/`
[x] `artifacts/aura-sphere/src/components/AIOnShell.tsx` → `CaosShell.tsx` (renomear arquivo e componente)
[x] `artifacts/aura-sphere/src/components/AIOnShellTabs.tsx` → `CaosShellTabs.tsx`
[x] `artifacts/aura-sphere/src/pages/Index.tsx` — Atualizar import de `<AIOnShell>` → `<CaosShell>`
[x] `artifacts/aura-sphere/src/App.tsx` — Atualizar rotas que usam `AIOnShellTabs`

## Fonte: /.migration-backup/docs/TESTING_GUIDE.md — 73 itens

[ ] Modal abre corretamente
[ ] Validação de campos funciona
[ ] Carregamento mostra feedback visual
[ ] Erro é capturado e mostrado
[ ] 2FA é solicitado se necessário
[ ] Conta é listada após sucesso
[ ] User ID vem do useLocalAuth()
[ ] SyncPanel aparece quando offline
[ ] Mensagens entram em fila
[ ] Indicador visual de pendente é claro
[ ] Sincronização começar automaticamente
[ ] Mensagens mudam para "sent"
[ ] Histórico permanece consistente
[ ] Conflitos são resolvidos (se necessário)
[ ] Campo aceita texto
[ ] Botão é desabilido se vazio
[ ] Toast de sucesso aparece
[ ] Projeto é criado no backend (verificar logs)
[ ] User ID é enviado corretamente
[ ] Recomendações carregam para cada tema
[ ] Like muda cor e persiste (local)
[ ] Share abre Web Share ou copia link
[ ] Erro é tratado se API falhar
[ ] User ID está correto na request
[ ] `npm test` passa 100%
[ ] `npm run build` sem warnings/errors
[ ] `npm run type-check` sem erros
[ ] `npm run lint` sem erros críticos
[ ] Todos os TODOs foram resolvidos
[ ] Testes e2e do Social Media passam
[ ] Performance está dentro dos limites
[ ] Modo offline funciona
[ ] `python -m pytest` passa
[ ] Endpoints retornam dados corretos
[ ] Validação de entrada funciona
[ ] Tratamento de erro é apropriado
[ ] Database migrations executaram
[ ] Variáveis de ambiente estão configuradas
[ ] Logs estão adequados
[ ] Frontend + Backend comunicam
[ ] Sincronização funciona (online/offline)
[ ] Segurança de usuário está ok
[ ] Tokens são refresh automático
[ ] Dados sensíveis são encriptados
[ ] Rate limiting funciona
[ ] Docker build sem erros
[ ] docker-compose up funciona
[ ] CORS está corretamente configurado
[ ] HTTPS está habilitado
[ ] Health checks passam
[ ] Logs podem ser acessados
[ ] Rollback strategy definido
[x] Login no Instagram com credenciais
[x] Suporte a 2FA (two-factor authentication)
[x] Carregamento de contas conectadas
[x] Sincronização de saves
[x] Sistema de like/favoritos
[x] Compartilhamento com Web Share API
[x] Tratamento de erros de rede
[x] Validação de contexto de usuário
[x] Detecção de conexão online/offline
[x] Fila de mensagens pendentes
[x] Sincronização automática ao conectar
[x] Resolução de conflitos
[x] Persistência em localStorage
[x] Paginação de histórico
[x] Cache de memórias
[x] Índice semântico
[x] Compressão de dados
[x] Service Worker installation
[x] Offline support
[x] Push notifications
[x] Install prompt

## Fonte: /.migration-backup/INDICE_CONTINUIDADE.md — 25 itens

[ ] Executar: `npm test`
[ ] Executar: `npm run build`
[ ] Executar: `npm run type-check`
[ ] Ler: `CONTINUITY_QUICK_START.md`
[ ] Ler: `docs/TESTING_GUIDE.md` (Quick Start)
[ ] Seguir `docs/TESTING_GUIDE.md` → "Fluxo 1: Login Social" (15 min)
[ ] Seguir `docs/TESTING_GUIDE.md` → "Fluxo 2: Offline Sync" (20 min)
[ ] Seguir `docs/TESTING_GUIDE.md` → "Fluxo 3: Novo Projeto" (10 min)
[ ] Seguir `docs/TESTING_GUIDE.md` → "Fluxo 4: Social Collections" (15 min)
[ ] Ler: `CONTINUITY_QUICK_START.md` → "3 Coisas Críticas"
[ ] Executar: `docker-compose -f docker-compose.staging.yml up`
[ ] Testar endpoints em staging
[ ] Verificar dados sensíveis
[ ] Executar: `npm run deploy:prod`
[ ] Monitorar logs: `docker logs -f aura-sphere-backend`
[ ] Testar fluxo principal em produção
[ ] Validar por 24 horas
[ ] **Validar em produção:** HTTPS ativo
[ ] **Validar em produção:** Environment vars corretos
[ ] **Validar em produção:** Health checks respondendo
[x] User IDs corretamente atribuídos (useLocalAuth)
[x] Tokens não logados em console
[x] Credenciais Instagram encriptadas
[x] Input sanitization via React
[x] CORS configurado (backend)

## Fonte: /.migration-backup/CONTINUITY_QUICK_START.md — 13 itens

[ ] Validar testes (npm test)
[ ] Deploy staging
[ ] Testes manuais Social Media
[ ] Fix de bugs encontrados
[ ] Integração real Instagram (se necessário)
[ ] Otimizar performance
[ ] Melhorar UX baseado feedback
[ ] Outras redes sociais
[ ] Machine learning
[ ] Analytics dashboard
[x] 7 TODOs no código (Social, Auth, Projetos)
[x] Testes E2E completos para Social Media
[x] Guia de testes e validação

---

Total de itens consolidados: 212
