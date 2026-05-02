#!/usr/bin/env python3
"""
🤖 Auto-Commit & Push Script para Aura Sphere
Automaticamente commita e pusha mudanças para evitar perda de código
Use: python scripts/auto_commit.py ou ./scripts/auto_commit.sh
"""

import subprocess
import sys
import os
from datetime import datetime
from pathlib import Path
import json

# Cores para terminal
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def run_command(cmd, capture=False):
    """Executar comando shell"""
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=True, check=True)
            return True
    except subprocess.CalledProcessError as e:
        print(f"{Colors.RED}❌ Erro: {e}{Colors.RESET}")
        return None

def get_changed_files():
    """Obter arquivos modificados"""
    output = run_command("git status --porcelain", capture=True)
    if not output:
        return []
    
    files = []
    for line in output.split('\n'):
        if line.strip():
            status = line[:2]
            filepath = line[3:]
            files.append({'status': status, 'file': filepath})
    return files

def get_branch_name():
    """Obter nome da branch atual"""
    return run_command("git rev-parse --abbrev-ref HEAD", capture=True)

def generate_commit_message(files):
    """Gerar mensagem de commit inteligente"""
    if not files:
        return None
    
    branch = get_branch_name()
    timestamp = datetime.now().strftime("%H:%M:%S")
    
    # Categorizar arquivos por tipo
    categories = {
        'frontend': [],
        'backend': [],
        'database': [],
        'config': [],
        'docs': [],
        'other': []
    }
    
    for f in files:
        path = f['file'].lower()
        if any(x in path for x in ['src/', 'components/', 'pages/', 'hooks/', 'package.json']):
            categories['frontend'].append(f['file'])
        elif any(x in path for x in ['bridge/', 'llm_', 'embedding_']):
            categories['backend'].append(f['file'])
        elif any(x in path for x in ['database.py', 'migrations/']):
            categories['database'].append(f['file'])
        elif any(x in path for x in ['.env', 'docker', 'config', 'dockerfile']):
            categories['config'].append(f['file'])
        elif any(x in path for x in ['.md', 'readme', 'doc']):
            categories['docs'].append(f['file'])
        else:
            categories['other'].append(f['file'])
    
    # Construir mensagem
    msg_parts = []
    
    if categories['frontend']:
        msg_parts.append(f"✨ Frontend: {len(categories['frontend'])} files")
    if categories['backend']:
        msg_parts.append(f"🔧 Backend: {len(categories['backend'])} files")
    if categories['database']:
        msg_parts.append(f"🗄️ Database: {len(categories['database'])} files")
    if categories['config']:
        msg_parts.append(f"⚙️ Config: {len(categories['config'])} files")
    if categories['docs']:
        msg_parts.append(f"📚 Docs: {len(categories['docs'])} files")
    if categories['other']:
        msg_parts.append(f"📝 Other: {len(categories['other'])} files")
    
    message = " | ".join(msg_parts) if msg_parts else "📝 Auto-commit: Aura Sphere updates"
    message += f" [{timestamp}]"
    
    return message

def check_git_config():
    """Verificar se git está configurado"""
    user_name = run_command("git config user.name", capture=True)
    user_email = run_command("git config user.email", capture=True)
    
    if not user_name or not user_email:
        print(f"{Colors.YELLOW}⚠️  Git não está configurado globalmente{Colors.RESET}")
        print(f"{Colors.BLUE}Configurando localmente para este repositório...{Colors.RESET}")
        
        run_command('git config user.name "Aura Sphere Dev"')
        run_command('git config user.email "dev@aura-sphere.local"')
        
        print(f"{Colors.GREEN}✓ Git configurado!{Colors.RESET}")

def main():
    """Main function"""
    print(f"\n{Colors.BOLD}🤖 Aura Sphere Auto-Commit & Push{Colors.RESET}")
    print(f"{Colors.BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.RESET}\n")
    
    # Verificar se está em repositório git
    if not Path('.git').exists():
        print(f"{Colors.RED}❌ Não é um repositório git!{Colors.RESET}")
        sys.exit(1)
    
    # Verificar git config
    check_git_config()
    
    # Obter branch
    branch = get_branch_name()
    print(f"{Colors.BLUE}📍 Branch: {branch}{Colors.RESET}")
    
    # Obter arquivos mudados
    files = get_changed_files()
    
    if not files:
        print(f"{Colors.YELLOW}ℹ️  Nenhuma mudança detectada{Colors.RESET}\n")
        return
    
    print(f"{Colors.GREEN}✓ {len(files)} arquivo(s) modificado(s):{Colors.RESET}")
    for f in files:
        emoji = "✏️ " if f['status'].startswith('M') else "➕" if f['status'].startswith('A') else "❌"
        print(f"  {emoji} {f['file']}")
    
    # Gerar mensagem de commit
    commit_msg = generate_commit_message(files)
    
    if not commit_msg:
        print(f"{Colors.RED}❌ Erro ao gerar mensagem de commit{Colors.RESET}\n")
        return
    
    print(f"\n{Colors.BLUE}📌 Mensagem de commit:{Colors.RESET}")
    print(f"  {Colors.BOLD}{commit_msg}{Colors.RESET}")
    
    # Confirmar com usuário
    response = input(f"\n{Colors.YELLOW}Continuar com commit e push? (s/n): {Colors.RESET}")
    
    if response.lower() not in ['s', 'y', 'sim', 'yes']:
        print(f"{Colors.YELLOW}⏭️  Cancelado pelo usuário{Colors.RESET}\n")
        return
    
    # Stage all changes
    print(f"\n{Colors.BLUE}📦 Staging files...{Colors.RESET}")
    run_command("git add -A")
    print(f"{Colors.GREEN}✓ Files staged{Colors.RESET}")
    
    # Commit
    print(f"{Colors.BLUE}💾 Committing...{Colors.RESET}")
    if not run_command(f'git commit -m "{commit_msg}"'):
        print(f"{Colors.RED}❌ Erro ao fazer commit{Colors.RESET}\n")
        return
    print(f"{Colors.GREEN}✓ Committed!{Colors.RESET}")
    
    # Push
    print(f"{Colors.BLUE}🚀 Pushing para {branch}...{Colors.RESET}")
    if run_command(f"git push origin {branch}"):
        print(f"{Colors.GREEN}✓ Pushed com sucesso!{Colors.RESET}")
        print(f"\n{Colors.BOLD}{Colors.GREEN}✅ Tudo sincronizado com sucesso! {Colors.RESET}\n")
    else:
        print(f"{Colors.RED}❌ Erro ao fazer push{Colors.RESET}")
        print(f"{Colors.YELLOW}Dica: Verifique sua conexão ou se tem permissão{Colors.RESET}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}⏹️  Cancelado pelo usuário{Colors.RESET}\n")
        sys.exit(0)
    except Exception as e:
        print(f"{Colors.RED}❌ Erro: {e}{Colors.RESET}\n")
        sys.exit(1)
