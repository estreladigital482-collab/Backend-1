---
source: /workspaces/Aura-sphere-/knowledge_vault/Backend/build_knowledge_base.md
filename: build_knowledge_base.md
---

# build_knowledge_base.md

---
category: Backend
source: scripts/build_knowledge_base.py
created: 2026-05-06T02:32:57.231308
size: 18207 bytes
hash: 0b17a37c4a2e2761a71dd017b5f708d2
headers:
  - Tentar importar dependências opcionais
  - Configurações
  - Categorias para organização
  - Metadados
  - Conteúdo
---

# build_knowledge_base.py

## Metadados
- **Categoria**: Backend
- **Caminho Original**: `scripts/build_knowledge_base.py`
- **Tamanho**: 18207 bytes

## Conteúdo

#!/usr/bin/env python3
"""
Sistema Completo de Base de Conhecimento com RAG e Obsidian
Consolida toda documentação do projeto com indexação inteligente para otimizar tokens
"""

import os
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple
import hashlib
import re

# Tentar importar dependências opcionais
try:
    from langchain.document_loaders import TextLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.embeddings import OpenAIEmbeddings
    from langchain.vectorstores import FAISS
    from langchain.schema import Document
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False
    print("⚠️  LangChain não instalado. Criando base de conhecimento sem embeddings.")

# Configurações
PROJECT_ROOT = "/workspaces/Aura-sphere-"
OBSIDIAN_VAULT = f"{PROJECT_ROOT}/knowledge_vault"
VECTOR_STORE_PATH = f"{PROJECT_ROOT}/vector_store"
KNOWLEDGE_INDEX = f"{PROJECT_ROOT}/knowledge_index.json"
KNOWLEDGE_METADATA = f"{PROJECT_ROOT}/knowledge_metadata.json"

EXCLUDE_DIRS = {
    "node_modules", ".git", "android", "gradle", "public", "dist", "build",
    "obsidian_vault", "vector_store", "knowledge_vault", ".vscode", "__pycache__",
    ".next", ".turbo", "coverage", ".pytest_cache", "venv", "env"
}

INCLUDE_EXTENSIONS = {
    ".md", ".txt", ".json", ".py", ".ts", ".tsx", ".js", ".jsx",
    ".html", ".css", ".yml", ".yaml", ".toml", ".config"
}

# Categorias para organização
CATEGORIES = {
    "Arquitetura": ["ARCHITECTURE.md", "architecture", "arch"],
    "Planejamento": ["MASTER_PLAN.md", "PLAN", "plan", "task"],
    "Documentação": ["README.md", "DEVELOPER_HANDOFF.md", "README", "doc"],
    "Integração": ["integration", "bridge", "adapter", "service"],
    "Frontend": ["src/", "components/", "pages/", "hooks/", "tsx", "jsx"],
    "Backend": ["bridge/", "server", "api", "database", "py"],
    "Configuração": ["config", "setup", "env", "yml", "yaml"],
    "Dados": ["data/", "migration", "schema", "database"],
    "Testes": ["test", "spec", "__test__", "vitest"],
}

class KnowledgeBaseBuilder:
    def __init__(self):
        self.documents: List[Dict] = []
        self.index: Dict = {}
        self.metadata: Dict = {
            "created_at": datetime.now().isoformat(),
            "project": "Aura-sphere",
            "stats": {}
        }
        self.categories_map: Dict[str, List[str]] = {}
        
    def categorize_file(self, file_path: str) -> str:
        """Categoriza um arquivo baseado no caminho e nome."""
        path_lower = file_path.lower()
        
        for category, keywords in CATEGORIES.items():
            for keyword in keywords:
                if keyword.lower() in path_lower:
                    return category
        
        return "Diversos"
    
    def should_include_file(self, file_path: str) -> bool:
        """Verifica se um arquivo deve ser incluído."""
        # Excluir arquivos muito grandes (> 5MB)
        try:
            if os.path.getsize(file_path) > 5 * 1024 * 1024:
                return False
        except:
            pass
        
        ext = Path(file_path).suffix.lower()
        return ext in INCLUDE_EXTENSIONS
    
    def collect_documents(self) -> List[Dict]:
        """Coleta documentos do projeto."""
        print("📂 Coletando documentos...")
        documents = []
        file_count = 0
        
        for root, dirs, files in os.walk(PROJECT_ROOT):
            # Limpar diretórios excluídos
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
            
            for file in files:
                file_path = os.path.join(root, file)
                
                if not self.should_include_file(file_path):
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                        # Ignorar arquivos vazios ou muito pequenos
                        if len(content.strip()) < 50:
                            continue
                        
                        relative_path = os.path.relpath(file_path, PROJECT_ROOT)
                        category = self.categorize_file(relative_path)
                        
                        doc = {
                            'path': relative_path,
                            'filename': file,
                            'category': category,
                            'content': content,
                            'size': len(content),
                            'hash': hashlib.md5(content.encode()).hexdigest(),
                            'created': datetime.fromtimestamp(
                                os.path.getctime(file_path)
                            ).isoformat()
                        }
                        documents.append(doc)
                        file_count += 1
                        
                        if file_count % 10 == 0:
                            print(f"  ✓ {file_count} arquivos processados...", end='\r')
                            
                except Exception as e:
                    print(f"  ⚠️  Erro ao ler {file_path}: {str(e)[:50]}")
        
        print(f"\n✅ {file_count} documentos coletados")
        return documents
    
    def extract_headers_and_links(self, content: str, filename: str) -> Tuple[List[str], List[str]]:
        """Extrai headers e links do conteúdo."""
        headers = []
        links = []
        
        # Extrair headers markdown
        for match in re.finditer(r'^#+\s+(.+)$', content, re.MULTILINE):
            headers.append(match.group(1).strip())
        
        # Extrair links markdown
        for match in re.finditer(r'\[([^\]]+)\]\(([^\)]+)\)', content):
            links.append(match.group(2))
        
        return headers, links
    
    def create_obsidian_vault(self) -> None:
        """Cria vault Obsidian-like com relacionamentos."""
        print("\n🏛️  Criando Vault Obsidian...")
        
        if os.path.exists(OBSIDIAN_VAULT):
            shutil.rmtree(OBSIDIAN_VAULT)
        
        # Criar estrutura de pastas por categoria
        for doc in self.documents:
            category = doc['category']
            category_dir = os.path.join(OBSIDIAN_VAULT, category)
            os.makedirs(category_dir, exist_ok=True)
        
        # Criar arquivo de configuração do Obsidian
        vault_config = {
            "name": "Aura-sphere Knowledge",
            "desc": "Base de conhecimento consolidada do projeto Aura-sphere",
            "theme": "dark"
        }
        
        with open(os.path.join(OBSIDIAN_VAULT, ".obsidian.json"), 'w') as f:
            json.dump(vault_config, f, indent=2)
        
        # Criar notas
        for idx, doc in enumerate(self.documents, 1):
            category = doc['category']
            
            # Sanitizar nome do arquivo
            safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', doc['filename'])
            note_path = os.path.join(OBSIDIAN_VAULT, category, safe_filename.replace(Path(safe_filename).suffix, '.md'))
            
            headers, links = self.extract_headers_and_links(doc['content'], doc['filename'])
            
            # Criar frontmatter YAML
            frontmatter = f"""---
category: {category}
source: {doc['path']}
created: {doc['created']}
size: {doc['size']} bytes
hash: {doc['hash']}
headers:
"""
            for header in headers[:5]:  # Limitado a 5 principais
                frontmatter += f"  - {header}\n"
            
            frontmatter += "---\n\n"
            
            # Adicionar tags baseado na categoria
            tags = f"#categoria/{category.lower().replace(' ', '-')}"
            
            # Criar conteúdo da nota
            note_content = f"""{frontmatter}# {doc['filename']}

## Metadados
- **Categoria**: {category}
- **Caminho Original**: `{doc['path']}`
- **Tamanho**: {doc['size']} bytes

## Conteúdo

{doc['content']}

## Tags
{tags}
"""
            
            with open(note_path, 'w', encoding='utf-8') as f:
                f.write(note_content)
            
            if idx % 10 == 0:
                print(f"  ✓ {idx}/{len(self.documents)} notas criadas...", end='\r')
        
        # Criar índice de notas
        index_file = os.path.join(OBSIDIAN_VAULT, "_index.md")
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write("# Índice de Conhecimento\n\n")
            f.write("## Categorias\n\n")
            
            for category in sorted(set(doc['category'] for doc in self.documents)):
                count = len([d for d in self.documents if d['category'] == category])
                f.write(f"### {category} ({count} notas)\n\n")
                
                for doc in sorted([d for d in self.documents if d['category'] == category], key=lambda x: x['filename']):
                    safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', doc['filename'])
                    f.write(f"- [[{safe_filename}]] - {doc['size']} bytes\n")
                
                f.write("\n")
        
        print(f"\n✅ Vault Obsidian criada em {OBSIDIAN_VAULT}")
    
    def create_knowledge_index(self) -> None:
        """Cria índice JSON para consultas rápidas sem gastar tokens."""
        print("\n🗂️  Criando índice de conhecimento...")
        
        self.index = {
            "version": "1.0",
            "timestamp": datetime.now().isoformat(),
            "total_docs": len(self.documents),
            "categories": {},
            "search_index": []
        }
        
        # Organizar por categoria
        for doc in self.documents:
            category = doc['category']
            if category not in self.index['categories']:
                self.index['categories'][category] = []
            
            self.index['categories'][category].append({
                'path': doc['path'],
                'filename': doc['filename'],
                'size': doc['size'],
                'hash': doc['hash'],
                'headers': self.extract_headers_and_links(doc['content'], doc['filename'])[0][:3]
            })
        
        # Criar índice de busca por conteúdo
        for doc in self.documents:
            # Extrair primeiras linhas significativas
            lines = [l for l in doc['content'].split('\n') if l.strip() and not l.startswith('#')][:3]
            summary = ' '.join(lines)[:200]
            
            self.index['search_index'].append({
                'path': doc['path'],
                'filename': doc['filename'],
                'category': doc['category'],
                'summary': summary,
                'headers': self.extract_headers_and_links(doc['content'], doc['filename'])[0][:5]
            })
        
        # Salvar índice
        with open(KNOWLEDGE_INDEX, 'w', encoding='utf-8') as f:
            json.dump(self.index, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Índice de conhecimento criado: {KNOWLEDGE_INDEX}")
    
    def create_metadata(self) -> None:
        """Cria arquivo de metadados consolidado."""
        print("\n📊 Gerando metadados...")
        
        self.metadata['stats'] = {
            'total_documents': len(self.documents),
            'total_size_bytes': sum(d['size'] for d in self.documents),
            'total_size_mb': round(sum(d['size'] for d in self.documents) / (1024*1024), 2),
            'categories': {},
            'avg_doc_size': round(sum(d['size'] for d in self.documents) / len(self.documents), 0) if self.documents else 0
        }
        
        for category in sorted(set(d['category'] for d in self.documents)):
            docs_in_cat = [d for d in self.documents if d['category'] == category]
            self.metadata['stats']['categories'][category] = {
                'count': len(docs_in_cat),
                'total_size': sum(d['size'] for d in docs_in_cat)
            }
        
        self.metadata['files'] = {
            'vault': OBSIDIAN_VAULT,
            'index': KNOWLEDGE_INDEX,
            'metadata': KNOWLEDGE_METADATA,
            'vector_store': VECTOR_STORE_PATH if HAS_LANGCHAIN else None
        }
        
        with open(KNOWLEDGE_METADATA, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Metadados salvos: {KNOWLEDGE_METADATA}")
    
    def create_rag_base(self) -> None:
        """Cria base RAG com embeddings se LangChain estiver disponível."""
        if not HAS_LANGCHAIN:
            print("\n⚠️  LangChain não disponível. Pulando criação de embeddings.")
            return
        
        print("\n🤖 Criando base RAG com embeddings...")
        
        try:
            if not os.getenv('OPENAI_API_KEY'):
                print("⚠️  OPENAI_API_KEY não definida. Pulando embeddings.")
                return
            
            # Preparar documentos
            langchain_docs = []
            for doc in self.documents:
                # Limitar tamanho do documento
                content = doc['content'][:10000]  # Limitar a 10k chars
                langchain_docs.append(Document(
                    page_content=content,
                    metadata={
                        'source': doc['path'],
                        'category': doc['category'],
                        'filename': doc['filename']
                    }
                ))
            
            # Dividir em chunks
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1500,
                chunk_overlap=300,
                separators=["\n\n", "\n", ".", " ", ""]
            )
            splits = splitter.split_documents(langchain_docs)
            
            print(f"  Criando embeddings para {len(splits)} chunks...")
            
            # Criar embeddings
            embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small",  # Modelo mais barato
                chunk_size=1000
            )
            
            # Criar vector store
            vectorstore = FAISS.from_documents(splits, embeddings)
            
            # Salvar
            os.makedirs(VECTOR_STORE_PATH, exist_ok=True)
            vectorstore.save_local(VECTOR_STORE_PATH)
            
            print(f"✅ Base RAG criada com {len(splits)} chunks: {VECTOR_STORE_PATH}")
            
        except Exception as e:
            print(f"❌ Erro ao criar base RAG: {e}")
    
    def create_quick_reference(self) -> None:
        """Cria guia rápido de uso."""
        print("\n📖 Criando guia rápido de uso...")
        
        reference = """# Guia Rápido - Base de Conhecimento

## 📁 Arquivos Gerados

- **knowledge_vault/**: Vault Obsidian com todas as notas organizadas
- **knowledge_index.json**: Índice JSON para buscas rápidas (sem tokens!)
- **knowledge_metadata.json**: Metadados do projeto
- **vector_store/**: Base RAG para embeddings (se LangChain habilitado)

## 🔍 Como Usar

### 1. Busca Rápida (sem gastar tokens)
```python
import json

# Carregar índice
with open('knowledge_index.json', 'r') as f:
    index = json.load(f)

# Buscar por categoria
architecture_docs = index['categories']['Arquitetura']

# Buscar por conteúdo
results = [doc for doc in index['search_index'] if 'seu_termo' in doc['summary'].lower()]
```

### 2. Usar Obsidian
1. Abra o Obsidian
2. Crie um novo vault apontando para `knowledge_vault/`
3. Navegue pelas notas interconectadas

### 3. RAG com LLM (se configurado)
```python
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# Carregar vector store
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = FAISS.load_local("vector_store", embeddings)

# Fazer perguntas
results = vectorstore.similarity_search("Qual é a arquitetura?", k=3)
```

## 📊 Estatísticas

"""
        
        if self.metadata['stats']:
            stats = self.metadata['stats']
            reference += f"- Total de documentos: {stats['total_documents']}\n"
            reference += f"- Tamanho total: {stats['total_size_mb']} MB\n"
            reference += f"- Tamanho médio: {stats['avg_doc_size']} bytes\n\n"
            reference += "### Por Categoria:\n"
            for cat, info in stats.get('categories', {}).items():
                reference += f"- {cat}: {info['count']} documentos\n"
        
        guide_path = os.path.join(PROJECT_ROOT, "KNOWLEDGE_BASE_GUIDE.md")
        with open(guide_path, 'w', encoding='utf-8') as f:
            f.write(reference)
        
        print(f"✅ Guia criado: KNOWLEDGE_BASE_GUIDE.md")
    
    def build(self) -> None:
        """Executa todo o processo de construção."""
        print("\n" + "="*60)
        print("🌟 CONSTRUINDO BASE DE CONHECIMENTO DO PROJETO")
        print("="*60)
        
        # 1. Coletar documentos
        self.documents = self.collect_documents()
        
        if not self.documents:
            print("❌ Nenhum documento encontrado!")
            return
        
        # 2. Criar vault Obsidian
        self.create_obsidian_vault()
        
        # 3. Criar índice de conhecimento
        self.create_knowledge_index()
        
        # 4. Criar metadados
        self.create_metadata()
        
        # 5. Criar base RAG (se disponível)
        self.create_rag_base()
        
        # 6. Criar guia rápido
        self.create_quick_reference()
        
        print("\n" + "="*60)
        print("✨ BASE DE CONHECIMENTO CRIADA COM SUCESSO!")
        print("="*60)
        print(f"""
📂 Próximos passos:
  1. Abra knowledge_vault/ no Obsidian para navegar as notas
  2. Use knowledge_index.json para buscas rápidas (sem tokens!)
  3. Veja KNOWLEDGE_BASE_GUIDE.md para exemplos de uso
  
💡 Para otimizar tokens no futuro:
  - Use o índice JSON para consultas sem LLM
  - O Obsidian oferece visão completa do projeto
  - O RAG permite perguntas específicas ao LLM com contexto relevante
        """)

def main():
    builder = KnowledgeBaseBuilder()
    builder.build()

if __name__ == "__main__":
    main()


## Tags
#categoria/backend

