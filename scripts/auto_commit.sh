#!/bin/bash

# 🤖 Auto-Commit & Push Script para Aura Sphere
# Uso: ./scripts/auto_commit.sh

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Funções
print_header() {
    echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}🤖 Aura Sphere Auto-Commit & Push${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

check_git_repo() {
    if [ ! -d .git ]; then
        echo -e "${RED}❌ Não é um repositório git!${NC}"
        exit 1
    fi
}

get_branch() {
    git rev-parse --abbrev-ref HEAD
}

check_git_config() {
    local user_name=$(git config user.name || echo "")
    local user_email=$(git config user.email || echo "")
    
    if [ -z "$user_name" ] || [ -z "$user_email" ]; then
        echo -e "${YELLOW}⚠️  Git não está configurado localmente${NC}"
        git config user.name "Aura Sphere Dev"
        git config user.email "dev@aura-sphere.local"
        echo -e "${GREEN}✓ Git configurado!${NC}"
    fi
}

get_staged_count() {
    git diff --cached --numstat | wc -l
}

get_unstaged_count() {
    git diff --numstat | wc -l
}

count_changes() {
    git status --porcelain | wc -l
}

get_file_categories() {
    local files=$(git diff --name-only --cached)
    local frontend=0
    local backend=0
    local docs=0
    local config=0
    
    while IFS= read -r file; do
        case "$file" in
            src/*|components/*|pages/*|hooks/*|package.json)
                ((frontend++))
                ;;
            packages/bridge/*|llm_*|embedding_*)
                ((backend++))
                ;;
            *.md|README*)
                ((docs++))
                ;;
            .env*|docker*|config*)
                ((config++))
                ;;
        esac
    done <<< "$files"
    
    echo "$frontend:$backend:$docs:$config"
}

generate_message() {
    local categories=$(get_file_categories)
    local frontend=$(echo $categories | cut -d: -f1)
    local backend=$(echo $categories | cut -d: -f2)
    local docs=$(echo $categories | cut -d: -f3)
    local config=$(echo $categories | cut -d: -f4)
    local timestamp=$(date +"%H:%M:%S")
    
    local message=""
    
    [ "$frontend" -gt 0 ] && message="$message✨ Frontend: $frontend files | "
    [ "$backend" -gt 0 ] && message="$message🔧 Backend: $backend files | "
    [ "$docs" -gt 0 ] && message="$message📚 Docs: $docs files | "
    [ "$config" -gt 0 ] && message="$message⚙️ Config: $config files | "
    
    # Remove trailing " | "
    message="${message% | }"
    message="${message:=📝 Auto-commit}" 
    
    message="$message [$timestamp]"
    echo "$message"
}

# Main
main() {
    print_header
    
    # Verificações
    check_git_repo
    check_git_config
    
    local branch=$(get_branch)
    echo -e "${BLUE}📍 Branch: ${BOLD}$branch${NC}"
    
    # Verificar mudanças
    local total_changes=$(count_changes)
    
    if [ "$total_changes" -eq 0 ]; then
        echo -e "${YELLOW}ℹ️  Nenhuma mudança detectada${NC}\n"
        exit 0
    fi
    
    # Mostrar mudanças
    echo -e "${GREEN}✓ $total_changes arquivo(s) modificado(s):${NC}"
    git status --porcelain | sed 's/^/  /'
    
    # Stage all
    echo -e "\n${BLUE}📦 Staging all files...${NC}"
    git add -A
    echo -e "${GREEN}✓ Files staged${NC}"
    
    # Generate message
    local commit_msg=$(generate_message)
    echo -e "\n${BLUE}📌 Mensagem de commit:${NC}"
    echo -e "  ${BOLD}$commit_msg${NC}"
    
    # Confirm
    echo -e "\n${YELLOW}Continuar com commit e push? (s/n):${NC} "
    read -r response
    
    if [[ ! "$response" =~ ^[SsYy] ]]; then
        echo -e "${YELLOW}⏭️  Cancelado pelo usuário${NC}\n"
        exit 0
    fi
    
    # Commit
    echo -e "\n${BLUE}💾 Committing...${NC}"
    git commit -m "$commit_msg" || {
        echo -e "${RED}❌ Erro ao fazer commit${NC}\n"
        exit 1
    }
    echo -e "${GREEN}✓ Committed!${NC}"
    
    # Push
    echo -e "${BLUE}🚀 Pushing para $branch...${NC}"
    if git push origin "$branch"; then
        echo -e "${GREEN}✓ Pushed com sucesso!${NC}"
        echo -e "\n${BOLD}${GREEN}✅ Tudo sincronizado com sucesso!${NC}\n"
    else
        echo -e "${RED}❌ Erro ao fazer push${NC}"
        echo -e "${YELLOW}Dica: Verifique sua conexão ou se tem permissão${NC}\n"
        exit 1
    fi
}

# Trap para Ctrl+C
trap 'echo -e "\n${YELLOW}⏹️  Cancelado pelo usuário${NC}\n"; exit 0' INT

# Executar
main "$@"
