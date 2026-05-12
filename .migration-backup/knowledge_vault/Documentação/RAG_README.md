---
category: Documentação
source: RAG_README.md
created: 2026-05-06T02:17:38.910339
size: 2186 bytes
hash: 89219c89c237d0d6c3652b4a9037204e
headers:
  - Base de Conhecimento RAG para Aura-sphere-
  - Funcionalidades
  - Pré-requisitos
  - Instalação
  - Uso
---

# RAG_README.md

## Metadados
- **Categoria**: Documentação
- **Caminho Original**: `RAG_README.md`
- **Tamanho**: 2186 bytes

## Conteúdo

# Base de Conhecimento RAG para Aura-sphere-

Este projeto cria uma base sólida de conhecimento usando Retrieval-Augmented Generation (RAG) para o projeto Aura-sphere-. Isso permite consultas mais eficientes e redução no gasto de tokens em interações futuras com LLMs.

## Funcionalidades

- **Coleta de Documentos**: Reúne todos os arquivos relevantes de documentação e código.
- **Vault Obsidian-like**: Cria uma estrutura de notas em Markdown similar ao Obsidian.
- **Base RAG**: Gera embeddings e um vector store para consultas inteligentes.

## Pré-requisitos

- Python 3.8+
- Chave da API OpenAI (OPENAI_API_KEY)

## Instalação

1. Instale as dependências:
   ```bash
   pip install -r requirements_rag.txt
   ```

2. Configure sua chave da API OpenAI:
   ```bash
   export OPENAI_API_KEY="sua-chave-aqui"
   ```

## Uso

Execute o script principal:
```bash
python scripts/create_rag_base.py
```

Isso irá:
1. Coletar todos os documentos relevantes.
2. Criar uma vault Obsidian em `obsidian_vault/`.
3. Gerar a base RAG em `vector_store/`.

## Estrutura Gerada

- `obsidian_vault/`: Notas em Markdown com metadados.
- `vector_store/`: Vector store FAISS para RAG.

## Uso Futuro

Para consultas, você pode carregar o vector store e usar RetrievalQA:

```python
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

# Carregar vector store
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.load_local("vector_store", embeddings)

# Criar chain de QA
qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# Fazer perguntas
resposta = qa.run("Qual é a arquitetura do projeto?")
```

## Troubleshooting

- **Erro de API**: Verifique se OPENAI_API_KEY está definida.
- **Arquivos não lidos**: Alguns arquivos binários são ignorados automaticamente.
- **Memória**: Para projetos grandes, considere ajustar chunk_size.

## Benefícios

- Redução de tokens em consultas futuras ao fornecer contexto relevante.
- Organização estruturada da documentação.
- Capacidade de perguntas inteligentes sobre o projeto.

## Tags
#categoria/documentação
