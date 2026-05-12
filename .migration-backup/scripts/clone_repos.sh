#!/bin/bash

# Script para clonar repositórios relevantes para implementação das tarefas
# Foca nos repositórios mais úteis para as próximas tarefas prioritárias

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPOS_DIR="$PROJECT_ROOT/external-repos/repos"

# Criar diretório se não existir
mkdir -p "$REPOS_DIR"
cd "$REPOS_DIR"

echo "🔄 Clonando repositórios relevantes para tarefas prioritárias..."

# Repositórios prioritários para as próximas tarefas:

# 1. Para Sistema de Logs e Auditoria (#4)
echo "📊 Clonando repositórios para logging e auditoria..."
if [ ! -d "autogen" ]; then
    git clone https://github.com/microsoft/autogen.git --depth 1
    echo "✅ autogen clonado"
fi

# 2. Para IA Principal (Agent) (#6)
echo "🤖 Clonando repositórios para agentes IA..."
if [ ! -d "AutoGPT" ]; then
    git clone https://github.com/Significant-Gravitas/AutoGPT.git --depth 1
    echo "✅ AutoGPT clonado"
fi

if [ ! -d "babyagi" ]; then
    git clone https://github.com/yoheinakajima/babyagi.git --depth 1
    echo "✅ babyagi clonado"
fi

if [ ! -d "open-interpreter" ]; then
    git clone https://github.com/OpenInterpreter/open-interpreter.git --depth 1
    echo "✅ open-interpreter clonado"
fi

# 3. Para Segurança de Execução (#11)
echo "🔒 Clonando repositórios para segurança..."
if [ ! -d "OpenDevin" ]; then
    git clone https://github.com/OpenDevin/OpenDevin.git --depth 1
    echo "✅ OpenDevin clonado"
fi

if [ ! -d "SWE-agent" ]; then
    git clone https://github.com/princeton-nlp/SWE-agent.git --depth 1
    echo "✅ SWE-agent clonado"
fi

# 4. Para Sistema de Detecção de Anomalias (#16)
echo "🔍 Clonando repositórios para detecção de anomalias..."
if [ ! -d "aider" ]; then
    git clone https://github.com/paul-gauthier/aider.git --depth 1
    echo "✅ aider clonado"
fi

# Repositórios adicionais úteis
echo "📚 Clonando repositórios adicionais úteis..."

if [ ! -d "langchain" ]; then
    git clone https://github.com/langchain-ai/langchain.git --depth 1
    echo "✅ langchain clonado"
fi

if [ ! -d "browser-use" ]; then
    git clone https://github.com/browser-use/browser-use.git --depth 1
    echo "✅ browser-use clonado"
fi

if [ ! -d "mem0" ]; then
    git clone https://github.com/mem0ai/mem0.git --depth 1
    echo "✅ mem0 clonado"
fi

echo ""
echo "🎉 Clonagem concluída!"
echo "📁 Repositórios salvos em: $REPOS_DIR"
echo ""
echo "📊 Resumo dos repositórios clonados:"
ls -1d */ | wc -l | xargs echo "Total de repositórios:"

echo ""
echo "🔍 Analisando código útil para tarefas..."

# Análise rápida dos repositórios clonados
echo "=== ANÁLISE DE CÓDIGO ÚTIL ==="

# Verificar AutoGPT para arquitetura de agentes
if [ -d "AutoGPT" ]; then
    echo "🤖 AutoGPT - Arquitetura de agentes:"
    find AutoGPT -name "*.py" -path "*/autogpt/*" | head -5 | while read file; do
        echo "  - $file"
    done
fi

# Verificar autogen para multi-agent
if [ -d "autogen" ]; then
    echo "👥 autogen - Sistema multi-agent:"
    find autogen -name "*.py" -path "*/autogen/*" | head -5 | while read file; do
        echo "  - $file"
    done
fi

# Verificar OpenDevin para execução segura
if [ -d "OpenDevin" ]; then
    echo "🔧 OpenDevin - Execução de código:"
    find OpenDevin -name "*.py" -path "*/opendevin/*" | head -3 | while read file; do
        echo "  - $file"
    done
fi

# Verificar mem0 para sistemas de memória
if [ -d "mem0" ]; then
    echo "🧠 mem0 - Sistema de memória:"
    find mem0 -name "*.py" | grep -E "(memory|core)" | head -3 | while read file; do
        echo "  - $file"
    done
fi

echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Analisar código dos repositórios clonados"
echo "2. Extrair padrões e arquiteturas úteis"
echo "3. Implementar tarefas baseadas nos aprendizados"
echo "4. Usar ./scripts/task_manager.py para atualizar progresso"