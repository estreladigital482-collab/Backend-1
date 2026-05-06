---
category: Planejamento
source: scripts/task_manager.py
created: 2026-05-05T19:45:45.745168
size: 11996 bytes
hash: 86b92d1bd0d2048d7ad272d2ed1206fa
headers:
---

# task_manager.py

## Metadados
- **Categoria**: Planejamento
- **Caminho Original**: `scripts/task_manager.py`
- **Tamanho**: 11996 bytes

## Conteúdo

#!/usr/bin/env python3
"""
Task Manager - Gerenciador Avançado de Tarefas do Sistema de Evolução IA

Funcionalidades:
- Atualizar tarefas concluídas
- Listar tarefas pendentes por prioridade
- Gerar relatórios de progresso
- Sugerir próximas tarefas baseado em dependências
- Integrar com git para commits automáticos
"""

import os
import re
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Set, Optional, Tuple

class TaskManager:
    """Gerenciador de tarefas do sistema de evolução"""

    def __init__(self, tasks_file: str = None):
        self.project_root = Path(__file__).parent.parent
        self.tasks_file = tasks_file or self.project_root / "SYSTEM_EVOLUTION_TASKS.md"
        self.tasks = {}
        self.dependencies = {}
        self.completed_tasks = set()
        self.load_tasks()

    def load_tasks(self) -> None:
        """Carregar tarefas do arquivo markdown"""
        if not self.tasks_file.exists():
            print(f"❌ Arquivo de tarefas não encontrado: {self.tasks_file}")
            return

        current_task = None
        with open(self.tasks_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()

                # Detectar início de tarefa
                task_match = re.match(r'^## (\d+)\. (.+)$', line)
                if task_match:
                    task_num = int(task_match.group(1))
                    task_title = task_match.group(2)
                    current_task = task_num
                    self.tasks[task_num] = {
                        'title': task_title,
                        'line': line_num,
                        'items': [],
                        'completed': 0,
                        'total': 0,
                        'status': 'pending'
                    }
                    continue

                # Processar itens da tarefa
                if current_task and line.startswith('- ['):
                    self.tasks[current_task]['total'] += 1

                    if line.startswith('- [x]'):
                        self.tasks[current_task]['completed'] += 1
                        self.completed_tasks.add(current_task)
                    elif line.startswith('- [ ]'):
                        pass  # Ainda pendente

                    # Extrair texto do item
                    item_text = re.sub(r'^- \[[ x]\] ', '', line)
                    self.tasks[current_task]['items'].append({
                        'text': item_text,
                        'completed': line.startswith('- [x]'),
                        'line': line_num
                    })

        # Calcular status das tarefas
        for task_num, task_data in self.tasks.items():
            if task_data['completed'] == task_data['total'] and task_data['total'] > 0:
                task_data['status'] = 'completed'
            elif task_data['completed'] > 0:
                task_data['status'] = 'in_progress'
            else:
                task_data['status'] = 'pending'

    def mark_tasks_completed(self, task_numbers: List[int], description: str = "") -> None:
        """Marcar tarefas como concluídas"""
        updated_lines = []
        current_task = None

        with open(self.tasks_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        for i, line in enumerate(lines):
            line = line.rstrip('\n')

            # Detectar tarefa
            task_match = re.match(r'^## (\d+)\.', line)
            if task_match:
                current_task = int(task_match.group(1))

            # Se estamos na tarefa que queremos marcar
            if current_task in task_numbers and line.startswith('- [ ]'):
                line = line.replace('- [ ]', '- [x]', 1) + ' ✅ IMPLEMENTADO'

            updated_lines.append(line)

        # Escrever arquivo atualizado
        with open(self.tasks_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(updated_lines) + '\n')

        # Adicionar changelog
        if description:
            with open(self.tasks_file, 'a', encoding='utf-8') as f:
                f.write(f"\n## 📋 Sessão {datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}\n")
                f.write(f"- ✅ {description}\n")
                f.write(f"- 📊 Tarefas concluídas: {', '.join(map(str, task_numbers))}\n")

        print(f"✅ Tarefas {task_numbers} marcadas como concluídas!")

    def get_pending_tasks(self, priority_filter: str = None) -> List[Dict]:
        """Obter tarefas pendentes"""
        pending = []

        for task_num, task_data in self.tasks.items():
            if task_data['status'] != 'completed':
                task_info = {
                    'number': task_num,
                    'title': task_data['title'],
                    'status': task_data['status'],
                    'completed': task_data['completed'],
                    'total': task_data['total'],
                    'progress': f"{task_data['completed']}/{task_data['total']}",
                    'priority': self._calculate_priority(task_num, task_data)
                }
                pending.append(task_info)

        # Ordenar por prioridade
        pending.sort(key=lambda x: x['priority'], reverse=True)

        if priority_filter:
            if priority_filter == 'high':
                pending = [t for t in pending if t['priority'] >= 8]
            elif priority_filter == 'medium':
                pending = [t for t in pending if 4 <= t['priority'] < 8]
            elif priority_filter == 'low':
                pending = [t for t in pending if t['priority'] < 4]

        return pending

    def _calculate_priority(self, task_num: int, task_data: Dict) -> int:
        """Calcular prioridade da tarefa"""
        priority = 5  # Base

        # Tarefas iniciais têm maior prioridade
        if task_num <= 10:
            priority += 3

        # Tarefas de segurança têm prioridade máxima
        if any(keyword in task_data['title'].lower() for keyword in
               ['segurança', 'security', 'sandbox', 'core', 'permiss']):
            priority += 5

        # Tarefas parcialmente completas têm prioridade média
        if task_data['status'] == 'in_progress':
            priority += 2

        # Tarefas críticas do sistema
        critical_tasks = {1, 2, 3, 4, 5, 51, 52, 53}
        if task_num in critical_tasks:
            priority += 3

        return min(priority, 10)

    def generate_progress_report(self) -> str:
        """Gerar relatório de progresso"""
        total_tasks = len(self.tasks)
        completed_tasks = len(self.completed_tasks)
        in_progress = sum(1 for t in self.tasks.values() if t['status'] == 'in_progress')

        report = []
        report.append("# 📊 Relatório de Progresso - Sistema de Evolução IA")
        report.append(f"**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")

        # Estatísticas gerais
        report.append("## 📈 Estatísticas Gerais")
        report.append(f"- **Total de Tarefas:** {total_tasks}")
        report.append(f"- **Concluídas:** {completed_tasks} ({completed_tasks/total_tasks*100:.1f}%)")
        report.append(f"- **Em Andamento:** {in_progress}")
        report.append(f"- **Pendentes:** {total_tasks - completed_tasks - in_progress}")
        report.append("")

        # Progresso por categoria
        report.append("## 🎯 Progresso por Categoria")
        categories = {
            'Core/Segurança': [1, 2, 3, 4, 5, 51, 52, 53],
            'Agent/IA': [6, 7, 8, 9, 10],
            'Runtime/Execução': [11, 12, 13, 14, 15],
            'Multimodal': [221, 222, 223, 224, 225],
            'Governança': [16, 17, 18, 19, 20]
        }

        for cat_name, cat_tasks in categories.items():
            cat_completed = len([t for t in cat_tasks if t in self.completed_tasks])
            cat_total = len(cat_tasks)
            if cat_total > 0:
                percentage = cat_completed / cat_total * 100
                report.append(f"- **{cat_name}:** {cat_completed}/{cat_total} ({percentage:.1f}%)")

        report.append("")

        # Próximas tarefas prioritárias
        report.append("## 🎯 Próximas Tarefas Prioritárias")
        pending = self.get_pending_tasks()[:5]
        for task in pending:
            report.append(f"- **#{task['number']}** {task['title']} (Prioridade: {task['priority']})")

        return "\n".join(report)

    def suggest_next_tasks(self, count: int = 3) -> List[Dict]:
        """Sugerir próximas tarefas baseado em dependências e prioridade"""
        suggestions = []

        # Tarefas críticas que devem vir primeiro
        critical_sequence = [
            (4, "Sistema de logs e auditoria"),  # Depende do core
            (6, "IA principal (agent)"),        # Depende das permissões
            (11, "Segurança de execução"),       # Depende do sandbox
            (16, "Sistema de detecção de anomalias"),  # Depende dos logs
        ]

        for task_num, reason in critical_sequence:
            if task_num not in self.completed_tasks and task_num in self.tasks:
                suggestions.append({
                    'task': self.tasks[task_num],
                    'number': task_num,
                    'reason': reason,
                    'priority': 'critical'
                })

        # Preencher com tarefas de alta prioridade
        pending = self.get_pending_tasks('high')
        for task in pending:
            if len(suggestions) >= count:
                break
            if not any(s['number'] == task['number'] for s in suggestions):
                suggestions.append({
                    'task': self.tasks[task['number']],
                    'number': task['number'],
                    'reason': f"Alta prioridade ({task['priority']})",
                    'priority': 'high'
                })

        return suggestions[:count]

def main():
    parser = argparse.ArgumentParser(description="Gerenciador de Tarefas do Sistema IA")
    parser.add_argument('action', choices=['complete', 'list', 'report', 'suggest'],
                       help='Ação a executar')
    parser.add_argument('--tasks', '-t', help='Números das tarefas (separados por vírgula)')
    parser.add_argument('--description', '-d', help='Descrição do trabalho realizado')
    parser.add_argument('--priority', '-p', choices=['high', 'medium', 'low'],
                       help='Filtrar por prioridade')
    parser.add_argument('--count', '-c', type=int, default=5,
                       help='Número de itens para mostrar')

    args = parser.parse_args()

    manager = TaskManager()

    if args.action == 'complete':
        if not args.tasks:
            print("❌ Especifique as tarefas com --tasks")
            return

        task_nums = [int(x.strip()) for x in args.tasks.split(',')]
        manager.mark_tasks_completed(task_nums, args.description or "")

    elif args.action == 'list':
        pending = manager.get_pending_tasks(args.priority)
        print(f"📋 Tarefas Pendentes ({len(pending)}):")
        for task in pending[:args.count]:
            status_icon = {'pending': '⏳', 'in_progress': '🔄'}.get(task['status'], '❓')
            print(f"{status_icon} #{task['number']}: {task['title']}")
            print(f"   Progresso: {task['progress']} | Prioridade: {task['priority']}")

    elif args.action == 'report':
        report = manager.generate_progress_report()
        print(report)

    elif args.action == 'suggest':
        suggestions = manager.suggest_next_tasks(args.count)
        print("🎯 Sugestões de Próximas Tarefas:")
        for i, suggestion in enumerate(suggestions, 1):
            task = suggestion['task']
            print(f"{i}. #{suggestion['number']}: {task['title']}")
            print(f"   Motivo: {suggestion['reason']}")
            print(f"   Status: {task['completed']}/{task['total']} concluídos")

if __name__ == '__main__':
    main()

## Tags
#categoria/planejamento
