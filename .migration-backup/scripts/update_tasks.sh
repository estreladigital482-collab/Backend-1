#!/bin/bash

# Script para atualizar tarefas concluídas no SYSTEM_EVOLUTION_TASKS.md
# Uso: ./update_tasks.sh "1,2,3" "Descrição do que foi feito"

set -e

if [ $# -lt 1 ]; then
    echo "Uso: $0 <tarefas> [descrição]"
    echo "Exemplo: $0 \"1,2,3\" \"Implementei arquitetura core\""
    exit 1
fi

TASKS=$1
DESCRIPTION=${2:-"Tarefas concluídas"}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TASKS_FILE="$PROJECT_ROOT/SYSTEM_EVOLUTION_TASKS.md"

if [ ! -f "$TASKS_FILE" ]; then
    echo "Erro: Arquivo SYSTEM_EVOLUTION_TASKS.md não encontrado em $TASKS_FILE"
    exit 1
fi

echo "🔄 Atualizando tarefas concluídas: $TASKS"
echo "📝 Descrição: $DESCRIPTION"

# Backup do arquivo original
cp "$TASKS_FILE" "${TASKS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Função para marcar tarefa como concluída
mark_task_done() {
    local task_num=$1
    local file=$2

    # Procurar pela tarefa e marcar como concluída
    sed -i "s|^\([[:space:]]*\)- \[ \] \([^:]*\)\(## ${task_num}\)|## ${task_num}\n- [x] \2 ✅ IMPLEMENTADO|" "$file"

    # Se não encontrou o padrão acima, tentar outro padrão
    if ! grep -q "## ${task_num}" "$file"; then
        # Procurar por "## X." onde X é o número da tarefa
        sed -i "s|^\([[:space:]]*\)- \[ \] \(.*\)|\- [x] \2 ✅ IMPLEMENTADO|" "$file"
    fi
}

# Processar cada tarefa
IFS=',' read -ra TASK_ARRAY <<< "$TASKS"
for task in "${TASK_ARRAY[@]}"; do
    task=$(echo "$task" | xargs)  # Remove espaços
    echo "✅ Marcando tarefa $task como concluída..."

    # Criar backup antes de modificar
    cp "$TASKS_FILE" "${TASKS_FILE}.tmp"

    # Usar awk para processar o arquivo de forma mais precisa
    awk -v task_num="$task" '
    BEGIN { in_task = 0; task_found = 0 }
    /^## [0-9]+\./ {
        # Verificar se é a tarefa que queremos marcar
        match($0, /^## ([0-9]+)\./, arr)
        if (arr[1] == task_num) {
            in_task = 1
            task_found = 1
            print $0
            next
        } else {
            in_task = 0
        }
    }
    in_task && /^- \[ \]/ {
        # Marcar como concluída
        sub(/^- \[ \]/, "- [x]")
        print $0 " ✅ IMPLEMENTADO"
        next
    }
    { print }
    END {
        if (!task_found) {
            print "⚠️  Tarefa " task_num " não encontrada!" > "/dev/stderr"
        }
    }
    ' "${TASKS_FILE}.tmp" > "$TASKS_FILE"

    rm "${TASKS_FILE}.tmp"
done

# Adicionar entrada no changelog se descrição fornecida
if [ -n "$DESCRIPTION" ] && [ "$DESCRIPTION" != "Tarefas concluídas" ]; then
    echo "" >> "$TASKS_FILE"
    echo "## 📋 Sessão $(date +%Y-%m-%d_%H-%M-%S)" >> "$TASKS_FILE"
    echo "- ✅ $DESCRIPTION" >> "$TASKS_FILE"
    echo "- 📊 Tarefas concluídas: $TASKS" >> "$TASKS_FILE"
fi

echo "🎉 Atualização concluída!"
echo "📁 Arquivo atualizado: $TASKS_FILE"
echo "💾 Backup criado em: ${TASKS_FILE}.backup.*"

# Verificar se o arquivo está válido
if head -5 "$TASKS_FILE" | grep -q "^# Backlog"; then
    echo "✅ Arquivo parece válido"
else
    echo "⚠️  Arquivo pode ter sido corrompido, verifique o backup!"
fi