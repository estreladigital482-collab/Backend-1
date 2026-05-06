---
category: Backend
source: scripts/create_rag_base.py
created: 2026-05-06T02:16:47.464341
size: 4363 bytes
hash: e7c59a4e95e36291bbbe1ce93a899325
headers:
  - Configurações
  - Arquivos e pastas a incluir (documentação e código relevante)
  - {filename}
---

# create_rag_base.py

## Metadados
- **Categoria**: Backend
- **Caminho Original**: `scripts/create_rag_base.py`
- **Tamanho**: 4363 bytes

## Conteúdo

#!/usr/bin/env python3
"""
Script para criar uma base de conhecimento RAG do projeto Aura-sphere-
Este script coleta todos os arquivos de documentação e código relevantes,
cria embeddings usando OpenAI, e salva um vector store para uso futuro.
Também exporta uma estrutura similar ao Obsidian com notas em Markdown.
"""

import os
import shutil
from pathlib import Path
from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
import openai

# Configurações
PROJECT_ROOT = "/workspaces/Aura-sphere-"
OBSIDIAN_VAULT = "/workspaces/Aura-sphere-/obsidian_vault"
VECTOR_STORE_PATH = "/workspaces/Aura-sphere-/vector_store"

# Arquivos e pastas a incluir (documentação e código relevante)
INCLUDE_PATTERNS = [
    "*.md", "*.txt", "*.json", "*.py", "*.ts", "*.tsx", "*.js", "*.jsx",
    "*.html", "*.css", "*.yml", "*.yaml"
]
EXCLUDE_DIRS = [
    "node_modules", ".git", "android", "gradle", "public", "dist", "build",
    "obsidian_vault", "vector_store"
]

def collect_documents():
    """Coleta documentos do projeto."""
    documents = []
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Excluir diretórios
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]

        for file in files:
            if any(file.endswith(ext[1:]) for ext in INCLUDE_PATTERNS):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        documents.append({
                            'content': content,
                            'metadata': {
                                'source': file_path,
                                'filename': file
                            }
                        })
                except Exception as e:
                    print(f"Erro ao ler {file_path}: {e}")
    return documents

def create_obsidian_vault(documents):
    """Cria uma vault Obsidian-like com as informações."""
    if os.path.exists(OBSIDIAN_VAULT):
        shutil.rmtree(OBSIDIAN_VAULT)
    os.makedirs(OBSIDIAN_VAULT)

    for doc in documents:
        filename = doc['metadata']['filename']
        content = doc['content']

        # Criar nome de arquivo markdown
        md_filename = filename.replace('.', '_').replace(' ', '_') + '.md'
        md_path = os.path.join(OBSIDIAN_VAULT, md_filename)

        # Adicionar metadados e conteúdo
        md_content = f"""---
source: {doc['metadata']['source']}
filename: {filename}
---

# {filename}

{content}
"""

        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)

    print(f"Vault Obsidian criada em {OBSIDIAN_VAULT}")

def create_rag_base(documents):
    """Cria a base RAG com embeddings e vector store."""
    # Preparar documentos para LangChain
    langchain_docs = []
    for doc in documents:
        from langchain.schema import Document
        langchain_docs.append(Document(
            page_content=doc['content'],
            metadata=doc['metadata']
        ))

    # Dividir texto
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(langchain_docs)

    # Criar embeddings (requer OPENAI_API_KEY)
    embeddings = OpenAIEmbeddings()

    # Criar vector store
    vectorstore = FAISS.from_documents(splits, embeddings)

    # Salvar vector store
    vectorstore.save_local(VECTOR_STORE_PATH)

    print(f"Base RAG criada e salva em {VECTOR_STORE_PATH}")
    return vectorstore

def main():
    print("Coletando documentos do projeto...")
    documents = collect_documents()
    print(f"Encontrados {len(documents)} documentos.")

    print("Criando vault Obsidian...")
    create_obsidian_vault(documents)

    print("Criando base RAG...")
    try:
        vectorstore = create_rag_base(documents)
        print("Base RAG criada com sucesso!")
    except Exception as e:
        print(f"Erro ao criar base RAG: {e}")
        print("Certifique-se de que OPENAI_API_KEY está definida.")

if __name__ == "__main__":
    main()

## Tags
#categoria/backend
