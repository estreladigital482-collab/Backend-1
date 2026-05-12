# Guia Rápido - Base de Conhecimento

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

- Total de documentos: 389
- Tamanho total: 2.72 MB
- Tamanho médio: 7343.0 bytes

### Por Categoria:
- Arquitetura: 1 documentos
- Backend: 5 documentos
- Configuração: 19 documentos
- Dados: 1 documentos
- Diversos: 23 documentos
- Documentação: 5 documentos
- Frontend: 156 documentos
- Integração: 168 documentos
- Planejamento: 11 documentos
