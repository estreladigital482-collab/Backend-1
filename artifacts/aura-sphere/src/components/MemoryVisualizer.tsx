import React, { useState, useEffect } from 'react';
import { Search, Tag, Calendar, Trash2, Pin, Sparkles } from 'lucide-react';

export function MemoryVisualizer() {
  const [memories, setMemories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: 'all', category: 'all' });
  const [pinnedMemories, setPinnedMemories] = useState<Set<string>>(new Set());

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

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = m.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || m.type === filters.type;
    const matchesCategory = filters.category === 'all' || m.category === filters.category;
    return matchesSearch && matchesType && matchesCategory;
  });

  const togglePin = (id: string) => {
    const newPinned = new Set(pinnedMemories);
    if (newPinned.has(id)) newPinned.delete(id);
    else newPinned.add(id);
    setPinnedMemories(newPinned);
  };

  const deleteMemory = async (id: string) => {
    try {
      await fetch(`/api/v1/memory/${id}`, { method: 'DELETE' });
      fetchMemories();
    } catch (error) {
      console.error('Erro ao deletar memória:', error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="glass-panel border border-white/10 p-6 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Grimório de Memórias</p>
            <h2 className="text-3xl font-bold text-white">Memórias Armazenadas</h2>
            <p className="mt-3 text-slate-300 max-w-2xl">Navegue pelas suas memórias como cartas mágicas e fixe as mais importantes para invocação instantânea.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Memórias</p>
            <p className="text-3xl font-semibold text-white mt-2">{memories.length}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel border border-white/10 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.5fr]">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar memórias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-12 py-3 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
            >
              <option value="all">Todos os tipos</option>
              <option value="user">Usuário</option>
              <option value="assistant">Assistente</option>
              <option value="system">Sistema</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
            >
              <option value="all">Todas as categorias</option>
              <option value="project">Projeto</option>
              <option value="task">Tarefa</option>
              <option value="note">Nota</option>
            </select>
          </div>
        </div>
      </div>

      {filteredMemories.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 text-center text-slate-400 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
          Nenhuma memória encontrada. Refine a busca ou adicione novas memórias ao grimório.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              isPinned={pinnedMemories.has(memory.id)}
              onPin={togglePin}
              onDelete={deleteMemory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryCard({ memory, isPinned, onPin, onDelete }: any) {
  return (
    <div className={`rounded-[2rem] border border-white/10 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)] transition ${isPinned ? 'bg-amber-500/10 border-amber-400/20' : 'bg-slate-950/80'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-full bg-violet-600/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">{memory.type || 'Memória'}</span>
            <span className="text-xs text-slate-400">{memory.category || 'Sem categoria'}</span>
          </div>
          <h4 className="text-xl font-semibold text-white">{memory.title || 'Memória sem título'}</h4>
          <p className="mt-3 text-slate-300">{memory.content}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1"><Tag size={14} /> {memory.category || 'Geral'}</span>
            <span className="inline-flex items-center gap-1"><Calendar size={14} /> {memory.created_at ? new Date(memory.created_at).toLocaleDateString('pt-BR') : 'Data desconhecida'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onPin(memory.id)}
            className={`rounded-3xl px-3 py-3 transition ${isPinned ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'}`}
            title={isPinned ? 'Desafixar memória' : 'Fixar memória'}
          >
            <Pin size={18} className={isPinned ? 'text-amber-300' : 'text-slate-300'} />
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="rounded-3xl bg-rose-600/15 px-3 py-3 text-rose-200 hover:bg-rose-600/25 transition"
            title="Deletar memória"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
