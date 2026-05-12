"""
Sistema Consolidado de Memória - Integra lógica de memória entre frontend, backend e IA
Usa busca semântica e cache local para economizar tokens
"""

from typing import List, Dict, Optional
from datetime import datetime
import json
from ..utils.data_sanitizer import sanitize_memory_export

class ConsolidatedMemorySystem:
    """Sistema central de memória que integra todas as camadas"""
    
    def __init__(self):
        self.memories = []
        self.search_cache = {}
        self.memory_index = {}  # Índice semântico
        
    def store_memory(self, content: str, memory_type: str, category: str, 
                     metadata: dict = None, pin: bool = False) -> Dict:
        """Armazenar memória com metadados"""
        memory = {
            'id': f"mem_{datetime.now().timestamp()}",
            'content': content,
            'type': memory_type,  # user, assistant, system, category
            'category': category,  # project, task, note, context
            'metadata': metadata or {},
            'created_at': datetime.now().isoformat(),
            'pinned': pin,
            'relevance_score': 1.0,
            'access_count': 0
        }
        self.memories.append(memory)
        self.update_index(memory)
        return memory

    def update_index(self, memory: Dict):
        """Atualizar índice semântico para buscas rápidas"""
        # Usar keywords para indexação eficiente
        keywords = memory['content'].split()[:10]  # Top 10 words
        for keyword in keywords:
            if keyword not in self.memory_index:
                self.memory_index[keyword] = []
            self.memory_index[keyword].append(memory['id'])

    def search_memories(self, query: str, filters: Dict = None) -> List[Dict]:
        """Buscar memórias com filtros (economiza tokens)"""
        cache_key = f"{query}_{json.dumps(filters or {})}"
        
        if cache_key in self.search_cache:
            return self.search_cache[cache_key]
        
        results = []
        
        # Busca por índice
        query_words = query.split()
        matching_ids = set()
        
        for word in query_words:
            if word in self.memory_index:
                matching_ids.update(self.memory_index[word])
        
        # Filtrar e ordenar
        for mem_id in matching_ids:
            memory = next((m for m in self.memories if m['id'] == mem_id), None)
            if memory:
                # Aplicar filtros
                if filters:
                    if filters.get('type') and memory['type'] != filters['type']:
                        continue
                    if filters.get('category') and memory['category'] != filters['category']:
                        continue
                    if filters.get('pinned') and not memory['pinned']:
                        continue
                
                results.append(memory)
        
        # Ordenar por relevância e pinned
        results.sort(key=lambda x: (-x['pinned'], -x['access_count'], -x['relevance_score']))
        
        self.search_cache[cache_key] = results
        return results

    def get_context_for_conversation(self, topic: str, limit: int = 5) -> List[Dict]:
        """Obter contexto relevante para uma conversa"""
        relevant = self.search_memories(query=topic)
        
        # Atualizar access count
        for mem in relevant[:limit]:
            mem['access_count'] += 1
        
        return relevant[:limit]

    def consolidate_related_memories(self, theme: str) -> Dict:
        """Consolidar memórias relacionadas em um tema"""
        related = self.search_memories(theme)
        
        return {
            'theme': theme,
            'total_memories': len(related),
            'pinned_count': sum(1 for m in related if m['pinned']),
            'memories_summary': [
                {
                    'id': m['id'],
                    'preview': m['content'][:100],
                    'type': m['type'],
                    'category': m['category']
                }
                for m in related
            ],
            'last_updated': datetime.now().isoformat()
        }

    def delete_memory(self, memory_id: str):
        """Deletar memória"""
        self.memories = [m for m in self.memories if m['id'] != memory_id]
        self.search_cache.clear()  # Invalidar cache

    def pin_memory(self, memory_id: str, pinned: bool = True):
        """Fixar/desafixar memória"""
        memory = next((m for m in self.memories if m['id'] == memory_id), None)
        if memory:
            memory['pinned'] = pinned
            self.search_cache.clear()

    def export_memories_for_prompt(self, conversation_topic: str, max_tokens: int = 1000) -> str:
        """Exportar memórias relevantes para usar no prompt (economiza tokens)"""
        relevant = self.get_context_for_conversation(conversation_topic, limit=10)
        
        # Construir contexto compacto
        context = f"## Contexto de Memória para: {conversation_topic}\n\n"
        tokens_used = len(context.split())
        
        for mem in relevant:
            if tokens_used >= max_tokens:
                break
            
            # Sanitizar conteúdo antes de incluir no prompt
            sanitized_content = sanitize_memory_export(mem['content'])
            mem_text = f"- [{mem['type']}] {sanitized_content}\n"
            tokens_used += len(mem_text.split())
            context += mem_text
        
        return context


# Exemplo de integração
memory_system = ConsolidatedMemorySystem()

def chatbot_with_memory(user_message: str, conversation_id: str):
    """Integração de memória no chatbot"""
    
    # 1. Guardar mensagem do usuário como memória
    memory_system.store_memory(
        content=user_message,
        memory_type='user',
        category='conversation',
        metadata={'conversation_id': conversation_id}
    )
    
    # 2. Buscar contexto relevante (economiza tokens!)
    context_memories = memory_system.export_memories_for_prompt(
        conversation_topic=user_message,
        max_tokens=500
    )
    
    # 3. Usar contexto na resposta da IA
    prompt = f"{context_memories}\n\nUsuário: {user_message}\n\nAssistente:"
    
    # 4. (Aqui chamaria o LLM com o prompt otimizado)
    
    return prompt
