# 🤖 Guia: Auto-Commit & Auto-Push para Aura Sphere

## O Problema

Ao trabalhar com múltiplos arquivos e mudanças extensas (850+ tarefas!), é fácil perder código se:
- Você esquecer de fazer commit
- Sistema crashear antes do push
- Você trabalhar em múltiplas branches simultaneamente

## A Solução

Criamos **3 ferramentas** para automatizar git workflow:

1. **auto_commit.sh** - Script interativo (shell)
2. **auto_commit.py** - Script Python (mais rico, 30+ categorias)
3. **setup_git_hooks.sh** - Setup automático de git hooks

---

## 🚀 Uso Rápido

### Opção 1: Manual com Script Shell (Recomendado para Quem Começa)

```bash
# Tornar executável (primeira vez)
chmod +x scripts/auto_commit.sh

# Usar após cada mudança importante
./scripts/auto_commit.sh
```

**O que faz:**
1. ✅ Verifica mudanças
2. ✅ Mostra lista de arquivos
3. ✅ Gera mensagem de commit inteligente
4. ✅ Pede confirmação
5. ✅ Faz commit
6. ✅ Faz push para branch principal

---

### Opção 2: Python Version (Mais Detalhado)

```bash
# Tornar executável
chmod +x scripts/auto_commit.py

# Usar
python scripts/auto_commit.py
# ou
./scripts/auto_commit.py
```

**Vantagens:**
- Categorização avançada (45+ tipos de arquivo)
- Melhor formatting de mensagens
- Cores ANSI mais legíveis
- Melhor tratamento de erros

---

### Opção 3: Git Hooks (Automático)

```bash
# Setup uma vez
./scripts/setup_git_hooks.sh

# Depois, todo push automático rodará validações
git push origin branch-name
```

**O que configura:**
- `post-commit` - Auto-push (DESATIVADO por padrão, muito agressivo)
- `pre-push` - Validações antes de push
- `prepare-commit-msg` - Adiciona branch info automaticamente

---

## 📝 Workflow Recomendado

### Por Sessão de Trabalho

```bash
# 1. Abrir terminal
cd /workspaces/Aura-sphere-

# 2. Estudar um repositório & implementar feature
# ... (você edita arquivos)

# 3. Depois de mudanças importantes, rodar:
./scripts/auto_commit.sh

# Responder às prompts (s para continuar)

# 4. Repetir passo 2-3 para cada feature

# 5. Ao final do dia, verificar logs
git log --oneline -10
```

### Múltiplas Features em Paralelo

```bash
# Feature 1: Voice Integration
git checkout -b feature/voice-integration
# ... editar arquivos ...
./scripts/auto_commit.sh

# Feature 2: Memory Improvements
git checkout -b feature/memory-improvements
# ... editar arquivos ...
./scripts/auto_commit.sh

# Feature 3: Semantic Search
git checkout -b feature/semantic-search
# ... editar arquivos ...
./scripts/auto_commit.sh

# Depois, merge para main via PR
```

---

## 🎯 Exemplos Práticos

### Exemplo 1: Estude LibreChat e Implement

```bash
# 1. Estudar repositório clonado
cd external-repos/
# ... explorar estrutura de LibreChat ...
cd ..

# 2. Implement feature no Aura Sphere
vim src/components/AIOnShell.tsx
# ... edita componente ...

# 3. Commit automático
./scripts/auto_commit.sh
# Output:
#   ✨ Frontend: 1 files | [14:23:45]
#   Continuar? (s/n): s
#   ✓ Committed! ✓ Pushed com sucesso!
```

### Exemplo 2: Múltiplas Mudanças

```bash
# 1. Editar múltiplos arquivos
vim packages/bridge/llm_service.py      # Backend
vim packages/bridge/embedding_service.py # Backend  
vim packages/bridge/database.py         # Backend

# 2. Commit
./scripts/auto_commit.sh
# Output:
#   🔧 Backend: 3 files | [14:25:30]
#   Continuar? (s/n): s
#   ✓ Committed! ✓ Pushed com sucesso!
```

### Exemplo 3: Frontend + Backend + Docs

```bash
# 1. Editar em diferentes áreas
vim src/pages/Chat.tsx                  # Frontend
vim packages/bridge/app.py              # Backend
vim STUDY_PLAN.md                       # Docs

# 2. Commit automático (categoriza tudo)
./scripts/auto_commit.sh
# Output:
#   ✨ Frontend: 1 files | 🔧 Backend: 1 files | 📚 Docs: 1 files | [14:27:15]
#   Continuar? (s/n): s
#   ✓ Committed! ✓ Pushed com sucesso!
```

---

## 🔧 Configuração Avançada

### Ativar Auto-Push (Muito Agressivo!)

Se quiser que TODA mudança seja automaticamente pusheada:

```bash
# 1. Editar hook
nano .git/hooks/post-commit

# 2. Descomente a linha:
# BRANCH=$(git rev-parse --abbrev-ref HEAD)
# git push origin $BRANCH &> /dev/null &

# 3. Salve e saia (Ctrl+X, Y, Enter)

# Agora todo commit automaticamente fará push!
```

⚠️ **Cuidado**: Isso pode causar múltiplos pushes de repositórios remotos grandes

### Aliases Personalizados

Adicione ao `.git/config` ou `~/.gitconfig`:

```bash
[alias]
    acp = !bash scripts/auto_commit.sh
    sync = !python scripts/auto_commit.py
```

**Uso:**
```bash
# Em vez de ./scripts/auto_commit.sh
git acp

# Em vez de python scripts/auto_commit.py
git sync
```

---

## 📊 Mensagens de Commit Geradas

### Auto-Detect Baseado em Arquivo

```bash
# Se editar frontend:
✨ Frontend: 3 files | [14:30:45]

# Se editar backend:
🔧 Backend: 2 files | [14:31:20]

# Se editar docs:
📚 Docs: 1 files | [14:32:15]

# Se editar config:
⚙️ Config: 2 files | [14:33:40]

# Múltipla categorias:
✨ Frontend: 2 files | 🔧 Backend: 1 files | 📚 Docs: 1 files | [14:34:00]
```

### Estrutura da Mensagem

```
<EMOJI><CATEGORIA>: <N°> files | [TIMESTAMP]
```

**Exemplos reais:**
- `✨ Frontend: 5 files | [09:30:00]`
- `🔧 Backend: 3 files | [10:15:30]`
- `🗄️ Database: 2 files | [11:45:15]`
- `⚙️ Config: 1 files | [12:20:45]`
- `📚 Docs: 4 files | [14:50:20]`
- `📝 Other: 2 files | [15:30:00]`
- `✨ Frontend: 2 files | 🔧 Backend: 1 files | 📚 Docs: 1 files | [16:15:30]`

---

## ✅ Checklist de Setup

- [x] Tornar scripts executáveis: ✅ concluído
  ```bash
  chmod +x scripts/auto_commit.sh scripts/auto_commit.py scripts/setup_git_hooks.sh
  ```

- [x] Configurar git localmente (se necessário): ✅ concluído
  ```bash
  git config user.name "Seu Nome"
  git config user.email "seu.email@example.com"
  ```

- [x] Opcionalmente, setup git hooks: ✅ concluído
  ```bash
  ./scripts/setup_git_hooks.sh
  ```

- [x] Testar com primeiro commit: ✅ concluído
  ```bash
  echo "test" > temp.txt
  ./scripts/auto_commit.sh
  # (escolha 's' para confirmar)
  rm temp.txt
  ```

- [x] Verificar que funcionou: ✅ concluído
  ```bash
  git log --oneline -1
  # Deve mostrar seu commit
  ```

---

## 🆘 Troubleshooting

### Erro: "Permission denied" ao executar script

```bash
chmod +x scripts/auto_commit.sh
./scripts/auto_commit.sh
```

### Erro: "git: command not found"

```bash
# Instalar git
sudo apt install git  # Ubuntu/Debian
brew install git      # macOS
```

### Erro: "Not a git repository"

```bash
# Você está no diretório certo?
cd /workspaces/Aura-sphere-
ls -la | grep ".git"
# Deve existir diretório .git
```

### Erro: "fatal: could not read Username"

```bash
# Configure credenciais (uma vez)
git config credential.helper store
# Próximo push vai pedir username/password, depois salva
```

### Script não faz push mas faz commit

```bash
# Verificar se você tem permissão
git push origin main

# Se tiver erro de autenticação:
# 1. Use SSH: ssh-keygen -t ed25519
# 2. Adicionar chave ao GitHub
# 3. Usar git@github.com:... em vez de https://...
```

---

## 💡 Dicas & Boas Práticas

### 1. Commit Frequentemente
```bash
# ✅ Bom: Commit após cada feature pequena
./scripts/auto_commit.sh  # a cada 30% de mudança

# ❌ Ruim: Deixa para o final do dia
# (risco de perder tudo em crash)
```

### 2. Mensagens Descritivas
- Scripts já geram automático
- Mas você pode editar antes de push:
```bash
git commit --amend  # editar última mensagem
```

### 3. Revisar Antes de Commitar
```bash
git status          # Ver quais arquivos vão ser comitados
git diff            # Ver mudanças específicas
./scripts/auto_commit.sh  # Confirmar antes de push
```

### 4. Branch por Feature
```bash
git checkout -b feature/voice-integration
# ... trabalhar na feature ...
./scripts/auto_commit.sh
git push origin feature/voice-integration

# Depois fazer PR no GitHub
```

### 5. Manter Main Limpo
```bash
# Nunca commita direto em main
git checkout -b seu-branch
./scripts/auto_commit.sh

# Push e abra PR
git push origin seu-branch
# PR → Review → Merge em main
```

---

## 📚 Recursos Adicionais

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🎓 Próximos Passos

1. **Hoje**: Familiarize com `./scripts/auto_commit.sh`
2. **Amanhã**: Estude primeiro repositório clonado
3. **Esta semana**: Implemente 3-5 features usando os scripts
4. **Próxima semana**: Configure git hooks para automação

---

**Última atualização**: 2026-05-02  
**Versão**: 1.0  
**Mantido por**: Aura Sphere Dev Team

---

## 📞 Suporte

Se tiver problemas:
1. Verifique [Troubleshooting](#-troubleshooting) acima
2. Rode `git status` e `git log` para debugar
3. Abra issue no GitHub com error message
