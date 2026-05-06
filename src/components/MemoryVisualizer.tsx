import React, { useState, useEffect } from 'react';
import { Search, Tag, Calendar, Trash2, Pin } from 'lucide-react';

export function MemoryVisualizer() {
  const [memories, setMemories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: 'all', category: 'all' });
  const [pinnedMemories, setPinnedMemories] = useState(new Set());

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await fetch('/api/v1/memory/list');
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (error) {
      console.error('Erro ao buscar memórias:', error);
    }
  };

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || m.type === filters.type;
    const matchesCategory = filters.category === 'all' || m.category === filters.category;
    return matchesSearch && matchesType && matchesCategory;
  });

  const togglePin = (id) => {
    const newPinned = new Set(pinnedMemories);
    if (newPinned.has(id)) {
      newPinned.delete(id);
    } else {
      newPinned.add(id);
    }
    setPinnedMemories(newPinned);
  };

  const deleteMemory = async (id) => {
    try {
      await fetch(`/api/v1/memory/${id}`, { method: 'DELETE' });
      fetchMemories();
    } catch (error) {
      console.error('Erro ao deletar memória:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Memórias Armazenadas</h2>

      {/* Busca e Filtros */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar memórias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="px-4 py-2 border rounded-lg">
          <option value="all">Todos os tipos</option>
          <option value="user">Usuário</option>
          <option value="assistant">Assistente</option>
          <option value="system">Sistema</option>
        </select>
        <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="px-4 py-2 border rounded-lg">
          <option value="all">Todas as categorias</option>
          <option value="project">Projeto</option>
          <option value="task">Tarefa</option>
          <option value="note">Nota</option>
        </select>
      </div>

      {/* Lista de Memórias */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Nenhuma memória encontrada</div>
        ) : (
          filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              isPinned={pinnedMemories.has(memory.id)}
              onPin={togglePin}
              onDelete={deleteMemory}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MemoryCard({ memory, isPinned, onPin, onDelete }) {
  return (
    <div className={`border rounded-lg p-4 ${isPinned ? 'bg-yellow-50 border-yellow-300' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold">{memory.title || "Memória sem título"}</h4>
          <p className="text-sm text-gray-600 mt-1">{memory.content}</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Tag size={14} /> {memory.category}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(memory.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onPin(memory.id)} className={`p-2 rounded ${isPinned ? 'bg-yellow-200' : 'hover:bg-gray-100'}`}>
            <Pin size={18} className={isPinned ? 'fill-yellow-600 text-yellow-600' : ''} />
          </button>
          <button onClick={() => onDelete(memory.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
